import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

interface ScoredCandidate {
  account: any;
  overallScore: number;
  personalityScore: number;
  interestScore: number;
  lifestyleScore: number;
  valuesScore: number;
  distanceKm: number | null;
  factors: Record<string, number>;
}

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==========================================================
  // RECOMMENDATIONS
  // ==========================================================

  async getRecommendations(userId: string, limit = 10) {
    const me = await this.prisma.account.findUnique({
      where: { id: userId },
      include: { profile: true, preferences: true },
    });

    if (!me || !me.profile) {
      throw new BadRequestException('Complete your profile before browsing matches');
    }
    if (!me.preferences) {
      throw new BadRequestException('Preferences not set');
    }

    // Exclude: self, already liked/passed, already matched, blocked either direction
    const [likedIds, blockedIds, blockedByIds, matchedIds] = await Promise.all([
      this.prisma.like.findMany({ where: { senderId: userId }, select: { receiverId: true } }),
      this.prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
      this.prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
      this.prisma.match.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        select: { user1Id: true, user2Id: true },
      }),
    ]);

    const excludeIds = new Set<string>([
      userId,
      ...likedIds.map((l) => l.receiverId),
      ...blockedIds.map((b) => b.blockedId),
      ...blockedByIds.map((b) => b.blockerId),
      ...matchedIds.flatMap((m) => [m.user1Id, m.user2Id]),
    ]);

    const minDob = this.ageToDob(me.preferences.maxAge);
    const maxDob = this.ageToDob(me.preferences.minAge);

    const candidates = await this.prisma.account.findMany({
      where: {
        id: { notIn: Array.from(excludeIds) },
        status: 'ACTIVE',
        profile: {
          isVisible: true,
          dateOfBirth: { gte: minDob, lte: maxDob },
          ...(me.preferences.showMe.length > 0 && { gender: { in: me.preferences.showMe } }),
        },
      },
      include: { profile: true, preferences: true, photos: { orderBy: { order: 'asc' } }, verification: true },
      take: 250, // candidate pool pulled pre-scoring, then ranked
    });

    // Mutual preference filter: only show people who would also want to see me
    const mutual = candidates.filter((c) => this.passesTheirFilters(c, me));

    const scored: ScoredCandidate[] = mutual.map((candidate) => this.scoreCandidate(me, candidate));

    // Distance filter (post-score, since it needs both lat/lng)
    const inRange = scored.filter(
      (s) => s.distanceKm === null || s.distanceKm <= me.preferences.maxDistance,
    );

    inRange.sort((a, b) => b.overallScore - a.overallScore);

    const top = inRange.slice(0, limit);

    // Persist for analytics / avoid recompute, non-blocking best-effort
    await this.persistRecommendations(userId, top).catch(() => undefined);

    return top.map((s) => ({
      id: s.account.id,
      profile: this.publicProfile(s.account, me.preferences.hideDistance),
      compatibility: {
        overallScore: Math.round(s.overallScore),
        personalityScore: Math.round(s.personalityScore),
        interestScore: Math.round(s.interestScore),
        lifestyleScore: Math.round(s.lifestyleScore),
        valuesScore: Math.round(s.valuesScore),
        factors: s.factors,
      },
      distanceKm: me.preferences.hideDistance ? null : s.distanceKm,
    }));
  }

  private passesTheirFilters(candidate: any, me: any): boolean {
    if (!candidate.preferences || !candidate.profile) return false;
    if (!candidate.preferences.discoverable) return false;

    const myAge = this.ageFromDob(me.profile.dateOfBirth);
    if (myAge !== null) {
      if (myAge < candidate.preferences.minAge || myAge > candidate.preferences.maxAge) return false;
    }
    if (
      candidate.preferences.showMeTo.length > 0 &&
      me.profile.gender &&
      !candidate.preferences.showMeTo.includes(me.profile.gender)
    ) {
      return false;
    }
    return true;
  }

  private scoreCandidate(me: any, candidate: any): ScoredCandidate {
    const myPrefs = me.preferences;
    const myProfile = me.profile;
    const cProfile = candidate.profile;
    const cPrefs = candidate.preferences;

    const factors: Record<string, number> = {};

    // --- Interest overlap (Jaccard similarity) ---
    const myInterests: string[] = myPrefs.interests || [];
    const theirInterests: string[] = cPrefs?.interests || [];
    const interestScore = this.jaccard(myInterests, theirInterests) * 100;
    factors.sharedInterests = this.intersectionCount(myInterests, theirInterests);

    // --- Lifestyle compatibility (smoking/drinking/cannabis alignment) ---
    let lifestylePoints = 0;
    let lifestyleChecks = 0;
    for (const field of ['smoking', 'drinking', 'cannabis'] as const) {
      const mine = myProfile[field];
      const theirs = cProfile[field];
      if (mine && theirs) {
        lifestyleChecks++;
        if (mine === theirs) lifestylePoints++;
        else if (this.lifestyleAdjacent(mine, theirs)) lifestylePoints += 0.5;
      }
    }
    const lifestyleScore = lifestyleChecks > 0 ? (lifestylePoints / lifestyleChecks) * 100 : 60;

    // --- Values / relationship-goal alignment ---
    let valuesScore = 50;
    if (myProfile.relationshipGoal && cProfile.relationshipGoal) {
      valuesScore = myProfile.relationshipGoal === cProfile.relationshipGoal ? 100 : 30;
    }
    factors.sameRelationshipGoal = valuesScore >= 100 ? 1 : 0;
    if (myProfile.religion && cProfile.religion) {
      valuesScore = (valuesScore + (myProfile.religion === cProfile.religion ? 100 : 50)) / 2;
    }

    // --- Personality (love language + zodiac as light-touch signals) ---
    let personalityScore = 50;
    if (myProfile.loveLanguage && cProfile.loveLanguage) {
      personalityScore = myProfile.loveLanguage === cProfile.loveLanguage ? 85 : 55;
    }

    // --- Deal-breakers: hard-exclude by zeroing score ---
    const dealBreakers: string[] = myPrefs.dealBreakers || [];
    let dealBreakerHit = false;
    for (const db of dealBreakers) {
      const key = db.toLowerCase();
      if (key === 'smoking' && cProfile.smoking === 'yes') dealBreakerHit = true;
      if (key === 'no-photos' && candidate.photos.length === 0) dealBreakerHit = true;
    }

    // --- Distance ---
    let distanceKm: number | null = null;
    if (myProfile.latitude != null && myProfile.longitude != null && cProfile.latitude != null && cProfile.longitude != null) {
      distanceKm = this.haversineKm(
        myProfile.latitude,
        myProfile.longitude,
        cProfile.latitude,
        cProfile.longitude,
      );
    }
    const distanceScore = distanceKm === null ? 70 : Math.max(0, 100 - (distanceKm / Math.max(myPrefs.maxDistance, 1)) * 100);

    // --- Weighted overall ---
    const weights = {
      interest: 0.25,
      lifestyle: 0.2,
      values: 0.25,
      personality: 0.15,
      distance: 0.15,
    };
    let overallScore =
      interestScore * weights.interest +
      lifestyleScore * weights.lifestyle +
      valuesScore * weights.values +
      personalityScore * weights.personality +
      distanceScore * weights.distance;

    // Boost / verification / activity signals
    if (cProfile.isBoosted && cProfile.boostExpiresAt && cProfile.boostExpiresAt > new Date()) {
      overallScore = Math.min(100, overallScore * 1.1);
    }
    if (candidate.verification?.photoVerified) {
      overallScore = Math.min(100, overallScore + 3);
    }
    if (dealBreakerHit) {
      overallScore = 0;
    }

    return {
      account: candidate,
      overallScore: Math.max(0, Math.min(100, overallScore)),
      personalityScore,
      interestScore,
      lifestyleScore,
      valuesScore,
      distanceKm,
      factors,
    };
  }

  private async persistRecommendations(userId: string, top: ScoredCandidate[]) {
    if (top.length === 0) return;
    // Recommendation has no composite unique key on (userId, recommendedUserId),
    // so we log a fresh batch each time rather than upserting; expiresAt lets
    // old rows be cleaned up by a scheduled job instead of growing unbounded.
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.recommendation.createMany({
      data: top.map((s) => ({
        userId,
        recommendedUserId: s.account.id,
        score: s.overallScore,
        aiGenerated: true,
        reason: this.explainMatch(s),
        expiresAt,
      })),
    });
  }

  private explainMatch(s: ScoredCandidate): string {
    const reasons: string[] = [];
    if (s.factors.sharedInterests > 0) reasons.push(`${s.factors.sharedInterests} shared interests`);
    if (s.factors.sameRelationshipGoal) reasons.push('same relationship goals');
    if (s.distanceKm !== null && s.distanceKm < 15) reasons.push('nearby');
    return reasons.join(', ') || 'compatible profile';
  }

  // ==========================================================
  // LIKE / PASS / MATCH
  // ==========================================================

  async likeUser(userId: string, targetId: string, type = 'LIKE', message?: string) {
    if (userId === targetId) throw new BadRequestException('Cannot like yourself');

    const target = await this.prisma.account.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('User not found');

    const blocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetId },
          { blockerId: targetId, blockedId: userId },
        ],
      },
    });
    if (blocked) throw new BadRequestException('Unable to interact with this user');

    const likeType = (type?.toUpperCase() as 'LIKE' | 'SUPERLIKE' | 'BOOST') || 'LIKE';

    const like = await this.prisma.like.upsert({
      where: { senderId_receiverId: { senderId: userId, receiverId: targetId } },
      update: { type: likeType, message },
      create: { senderId: userId, receiverId: targetId, type: likeType, message },
    });

    // Check for mutual like -> create match
    const reciprocal = await this.prisma.like.findUnique({
      where: { senderId_receiverId: { senderId: targetId, receiverId: userId } },
    });

    if (!reciprocal) {
      return { liked: true, matched: false, like };
    }

    const [user1Id, user2Id] = [userId, targetId].sort();
    const compat = await this.prisma.compatibilityScore.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    const match = await this.prisma.match.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      update: { isActive: true, unmatchedAt: null, unmatchedBy: null },
      create: {
        user1Id,
        user2Id,
        compatibilityScore: compat?.overallScore ?? null,
      },
    });

    return { liked: true, matched: true, like, match };
  }

  async passUser(userId: string, targetId: string) {
    if (userId === targetId) throw new BadRequestException('Cannot pass on yourself');
    // "Pass" is tracked implicitly by exclusion from future recommendations via Redis cache,
    // since the schema does not define a Pass model — avoids polluting the Like table.
    await this.redis.set(`passed:${userId}:${targetId}`, '1', 60 * 60 * 24 * 30);
    return { passed: true };
  }

  async getMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }], isActive: true },
      include: {
        user1: { include: { profile: true, photos: { where: { isPrimary: true }, take: 1 }, verification: true } },
        user2: { include: { profile: true, photos: { where: { isPrimary: true }, take: 1 }, verification: true } },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    });

    return matches.map((m) => {
      const other = m.user1Id === userId ? m.user2 : m.user1;
      return {
        matchId: m.id,
        compatibilityScore: m.compatibilityScore,
        matchedAt: m.createdAt,
        lastMessageAt: m.lastMessageAt,
        user: this.publicProfile(other, false),
      };
    });
  }

  async getLikes(userId: string) {
    const likes = await this.prisma.like.findMany({
      where: { receiverId: userId },
      include: {
        sender: { include: { profile: true, photos: { where: { isPrimary: true }, take: 1 }, verification: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return likes.map((l) => ({
      likeId: l.id,
      type: l.type,
      message: l.message,
      createdAt: l.createdAt,
      user: this.publicProfile(l.sender, false),
    }));
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  private publicProfile(account: any, hideDistance: boolean) {
    return {
      id: account.id,
      firstName: account.profile?.firstName,
      displayName: account.profile?.displayName,
      bio: account.profile?.bio,
      age: this.ageFromDob(account.profile?.dateOfBirth),
      city: account.profile?.city,
      country: account.profile?.country,
      photos: (account.photos || []).map((p: any) => p.url),
      verified: account.verification?.photoVerified ?? false,
    };
  }

  private ageFromDob(dob: Date | null | undefined): number | null {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  private ageToDob(age: number): Date {
    const d = new Date();
    d.setFullYear(d.getFullYear() - age);
    return d;
  }

  private jaccard(a: string[], b: string[]): number {
    if (a.length === 0 || b.length === 0) return 0.5; // neutral when unknown
    const setA = new Set(a.map((s) => s.toLowerCase()));
    const setB = new Set(b.map((s) => s.toLowerCase()));
    const intersection = [...setA].filter((x) => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private intersectionCount(a: string[], b: string[]): number {
    const setB = new Set(b.map((s) => s.toLowerCase()));
    return a.filter((x) => setB.has(x.toLowerCase())).length;
  }

  private lifestyleAdjacent(a: string, b: string): boolean {
    const adjacency: Record<string, string[]> = {
      sometimes: ['yes', 'no'],
      socially: ['yes', 'no'],
    };
    return adjacency[a]?.includes(b) || adjacency[b]?.includes(a) || false;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
