import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import {
  Gender,
  MatchStatus,
  MessageType,
  RelationshipGoal,
  SubscriptionStatus,
} from "./generated/prisma/client.js";
import { prisma } from "./prisma.js";

const app = express();

const PORT = Number(process.env.PORT) || 8080;

const jwtSecretFromEnv = process.env.JWT_SECRET;

if (!jwtSecretFromEnv) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_SECRET: string = jwtSecretFromEnv;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 30;

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

type AuthRequest = Request & {
  userId: string;
};

function createAccessToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function createRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getUserResponse(user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  isVip: boolean;
  coins: number;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isVip: user.isVip,
    coins: user.coins,
  };
}

async function createSession(userId: string) {
  const refreshToken = createRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return {
    accessToken: createAccessToken(userId),
    refreshToken,
  };
}

async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = header.substring("Bearer ".length);

    const payload = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      type?: string;
    };

    if (!payload.sub || payload.type !== "access") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Account is inactive or unavailable",
      });
    }

    req.userId = user.id;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

/* =========================================================
   SYSTEM
========================================================= */

app.get("/", (_req, res) => {
  res.json({
    name: "AMORA Live API",
    status: "online",
    version: "1.0.0",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to the AMORA Live API",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ok",
      service: "amora-live-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(500).json({
      status: "error",
      service: "amora-live-backend",
      database: "disconnected",
    });
  }
});

/* =========================================================
   AUTH
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().min(3).max(30),
      password: z.string().min(6).max(100),
      displayName: z.string().min(1).max(100),
      avatar: z.string().nullable().optional(),
      bio: z.string().max(500).nullable().optional(),
      dateOfBirth: z.string().nullable().optional(),
      gender: z.nativeEnum(Gender).nullable().optional(),
      goal: z.nativeEnum(RelationshipGoal).nullable().optional(),
    });

    const data = schema.parse(req.body);

    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: data.displayName.trim(),
        avatar: data.avatar ?? null,
        bio: data.bio ?? null,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : null,
        gender: data.gender ?? null,
        goal: data.goal ?? null,
      },
    });

    const tokens = await createSession(user.id);

    return res.status(201).json({
      message: "Account created successfully",
      ...tokens,
      user: getUserResponse(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid registration data",
        errors: error.issues,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to create account",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const schema = z.object({
      account: z.string().min(1),
      password: z.string().min(1),
    });

    const data = schema.parse(req.body);
    const account = data.account.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: account.toLowerCase(),
          },
          {
            username: account,
          },
        ],
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastActiveAt: new Date(),
      },
    });

    const tokens = await createSession(user.id);

    return res.json({
      message: "Login successful",
      ...tokens,
      user: getUserResponse(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid login data",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login",
    });
  }
});

app.get(
  "/api/auth/me",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          isVerified: true,
          isVip: true,
          coins: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Me error:", error);

      return res.status(500).json({
        message: "Unable to load user",
      });
    }
  }
);

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string().min(1),
    });

    const data = schema.parse(req.body);

    const session = await prisma.session.findUnique({
      where: {
        refreshTokenHash: hashToken(data.refreshToken),
      },
      include: {
        user: true,
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive
    ) {
      return res.status(401).json({
        message: "Refresh token is invalid or expired",
      });
    }

    const newRefreshToken = createRefreshToken();

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(
          Date.now() +
            REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    });

    return res.json({
      accessToken: createAccessToken(session.userId),
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);

    return res.status(401).json({
      message: "Unable to refresh session",
    });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const schema = z.object({
      refreshToken: z.string().min(1),
    });

    const data = schema.parse(req.body);

    await prisma.session.updateMany({
      where: {
        refreshTokenHash: hashToken(data.refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.json({
      message: "Logged out successfully",
    });
  } catch {
    return res.status(400).json({
      message: "Unable to logout",
    });
  }
});

/* =========================================================
   USERS
========================================================= */

app.get(
  "/api/users/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.params.id,
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          gender: true,
          goal: true,
          isVerified: true,
          isVip: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Get user error:", error);

      return res.status(500).json({
        message: "Unable to fetch user",
      });
    }
  }
);

app.patch(
  "/api/users/me",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        displayName: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).nullable().optional(),
        avatar: z.string().nullable().optional(),
        gender: z.nativeEnum(Gender).nullable().optional(),
        goal: z.nativeEnum(RelationshipGoal).nullable().optional(),
        dateOfBirth: z.string().nullable().optional(),
      });

      const data = schema.parse(req.body);

      const user = await prisma.user.update({
        where: {
          id: req.userId,
        },
        data: {
          ...(data.displayName !== undefined && {
            displayName: data.displayName.trim(),
          }),
          ...(data.bio !== undefined && {
            bio: data.bio,
          }),
          ...(data.avatar !== undefined && {
            avatar: data.avatar,
          }),
          ...(data.gender !== undefined && {
            gender: data.gender,
          }),
          ...(data.goal !== undefined && {
            goal: data.goal,
          }),
          ...(data.dateOfBirth !== undefined && {
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth)
              : null,
          }),
        },
      });

      return res.json({
        message: "Profile updated",
        user: getUserResponse(user),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid profile data",
          errors: error.issues,
        });
      }

      console.error("Update profile error:", error);

      return res.status(500).json({
        message: "Unable to update profile",
      });
    }
  }
);

/* =========================================================
   PHOTOS
========================================================= */

app.get(
  "/api/users/me/photos",
  authenticate,
  async (req: AuthRequest, res) => {
    const photos = await prisma.photo.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        position: "asc",
      },
    });

    return res.json({
      photos,
    });
  }
);

app.post(
  "/api/users/me/photos",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        url: z.string().url(),
        isPrimary: z.boolean().optional(),
      });

      const data = schema.parse(req.body);

      const count = await prisma.photo.count({
        where: {
          userId: req.userId,
        },
      });

      const photo = await prisma.photo.create({
        data: {
          userId: req.userId,
          url: data.url,
          isPrimary: data.isPrimary ?? count === 0,
          position: count,
        },
      });

      return res.status(201).json({
        photo,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid photo data",
          errors: error.issues,
        });
      }

      console.error("Photo error:", error);

      return res.status(500).json({
        message: "Unable to add photo",
      });
    }
  }
);

app.delete(
  "/api/users/me/photos/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    const photo = await prisma.photo.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found",
      });
    }

    await prisma.photo.delete({
      where: {
        id: photo.id,
      },
    });

    return res.json({
      message: "Photo deleted",
    });
  }
);

/* =========================================================
   PREFERENCES
========================================================= */

app.get(
  "/api/preferences",
  authenticate,
  async (req: AuthRequest, res) => {
    const preferences = await prisma.preference.findUnique({
      where: {
        userId: req.userId,
      },
    });

    return res.json({
      preferences,
    });
  }
);

app.put(
  "/api/preferences",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        minAge: z.number().int().min(18).max(100).nullable().optional(),
        maxAge: z.number().int().min(18).max(100).nullable().optional(),
        preferredGender: z
          .nativeEnum(Gender)
          .nullable()
          .optional(),
        maxDistanceKm: z
          .number()
          .int()
          .min(1)
          .max(10000)
          .nullable()
          .optional(),
        relationshipGoal: z
          .nativeEnum(RelationshipGoal)
          .nullable()
          .optional(),
      });

      const data = schema.parse(req.body);

      const preferences = await prisma.preference.upsert({
        where: {
          userId: req.userId,
        },
        create: {
          userId: req.userId,
          ...data,
        },
        update: {
          ...data,
        },
      });

      return res.json({
        preferences,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid preference data",
          errors: error.issues,
        });
      }

      console.error("Preferences error:", error);

      return res.status(500).json({
        message: "Unable to update preferences",
      });
    }
  }
);

/* =========================================================
   LIKES
========================================================= */

app.post(
  "/api/likes/:userId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === req.params.userId) {
        return res.status(400).json({
          message: "You cannot like yourself",
        });
      }

      const target = await prisma.user.findUnique({
        where: {
          id: req.params.userId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!target || !target.isActive) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            {
              blockerId: req.userId,
              blockedId: req.params.userId,
            },
            {
              blockerId: req.params.userId,
              blockedId: req.userId,
            },
          ],
        },
      });

      if (blocked) {
        return res.status(403).json({
          message: "Interaction unavailable",
        });
      }

      const like = await prisma.like.upsert({
        where: {
          senderId_receiverId: {
            senderId: req.userId,
            receiverId: req.params.userId,
          },
        },
        create: {
          senderId: req.userId,
          receiverId: req.params.userId,
        },
        update: {},
      });

      const reciprocal = await prisma.like.findUnique({
        where: {
          senderId_receiverId: {
            senderId: req.params.userId,
            receiverId: req.userId,
          },
        },
      });

      let match = null;

      if (reciprocal) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              {
                userAId: req.userId,
                userBId: req.params.userId,
              },
              {
                userAId: req.params.userId,
                userBId: req.userId,
              },
            ],
          },
        });

        match =
          existingMatch ??
          (await prisma.match.create({
            data: {
              userAId: req.userId,
              userBId: req.params.userId,
            },
          }));
      }

      return res.status(201).json({
        like,
        matched: Boolean(match),
        match,
      });
    } catch (error) {
      console.error("Like error:", error);

      return res.status(500).json({
        message: "Unable to like user",
      });
    }
  }
);

app.delete(
  "/api/likes/:userId",
  authenticate,
  async (req: AuthRequest, res) => {
    await prisma.like.deleteMany({
      where: {
        senderId: req.userId,
        receiverId: req.params.userId,
      },
    });

    return res.json({
      message: "Like removed",
    });
  }
);

/* =========================================================
   MATCHES
========================================================= */

app.get(
  "/api/matches",
  authenticate,
  async (req: AuthRequest, res) => {
    const matches = await prisma.match.findMany({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [
          {
            userAId: req.userId,
          },
          {
            userBId: req.userId,
          },
        ],
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
            isVip: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
            isVip: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({
      matches,
    });
  }
);

app.delete(
  "/api/matches/:id",
  authenticate,
  async (req: AuthRequest, res) => {
    const match = await prisma.match.findFirst({
      where: {
        id: req.params.id,
        OR: [
          {
            userAId: req.userId,
          },
          {
            userBId: req.userId,
          },
        ],
      },
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    await prisma.match.update({
      where: {
        id: match.id,
      },
      data: {
        status: MatchStatus.UNMATCHED,
      },
    });

    return res.json({
      message: "Match removed",
    });
  }
);

/* =========================================================
   MESSAGES
========================================================= */

app.get(
  "/api/matches/:matchId/messages",
  authenticate,
  async (req: AuthRequest, res) => {
    const match = await prisma.match.findFirst({
      where: {
        id: req.params.matchId,
        OR: [
          {
            userAId: req.userId,
          },
          {
            userBId: req.userId,
          },
        ],
      },
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        matchId: match.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      messages,
    });
  }
);

app.post(
  "/api/matches/:matchId/messages",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        content: z.string().min(1).max(5000),
        type: z.nativeEnum(MessageType).optional(),
      });

      const data = schema.parse(req.body);

      const match = await prisma.match.findFirst({
        where: {
          id: req.params.matchId,
          status: MatchStatus.ACTIVE,
          OR: [
            {
              userAId: req.userId,
            },
            {
              userBId: req.userId,
            },
          ],
        },
      });

      if (!match) {
        return res.status(404).json({
          message: "Match not found",
        });
      }

      const receiverId =
        match.userAId === req.userId
          ? match.userBId
          : match.userAId;

      const message = await prisma.message.create({
        data: {
          matchId: match.id,
          senderId: req.userId,
          receiverId,
          type: data.type ?? MessageType.TEXT,
          content: data.content.trim(),
        },
      });

      return res.status(201).json({
        message,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid message",
          errors: error.issues,
        });
      }

      console.error("Send message error:", error);

      return res.status(500).json({
        message: "Unable to send message",
      });
    }
  }
);

app.patch(
  "/api/messages/:id/read",
  authenticate,
  async (req: AuthRequest, res) => {
    const message = await prisma.message.findFirst({
      where: {
        id: req.params.id,
        receiverId: req.userId,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const updated = await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        readAt: new Date(),
      },
    });

    return res.json({
      message: updated,
    });
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

app.get(
  "/api/notifications",
  authenticate,
  async (req: AuthRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return res.json({
      notifications,
    });
  }
);

app.get(
  "/api/notifications/unread-count",
  authenticate,
  async (req: AuthRequest, res) => {
    const count = await prisma.notification.count({
      where: {
        userId: req.userId,
        readAt: null,
      },
    });

    return res.json({
      count,
    });
  }
);

app.patch(
  "/api/notifications/:id/read",
  authenticate,
  async (req: AuthRequest, res) => {
    const notification = await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json({
      message: "Notification marked as read",
    });
  }
);

app.patch(
  "/api/notifications/read-all",
  authenticate,
  async (req: AuthRequest, res) => {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return res.json({
      message: "Notifications marked as read",
    });
  }
);

/* =========================================================
   BLOCKS
========================================================= */

app.post(
  "/api/blocks/:userId",
  authenticate,
  async (req: AuthRequest, res) => {
    if (req.userId === req.params.userId) {
      return res.status(400).json({
        message: "You cannot block yourself",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.params.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const block = await prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: req.userId,
          blockedId: req.params.userId,
        },
      },
      create: {
        blockerId: req.userId,
        blockedId: req.params.userId,
      },
      update: {},
    });

    await prisma.like.deleteMany({
      where: {
        OR: [
          {
            senderId: req.userId,
            receiverId: req.params.userId,
          },
          {
            senderId: req.params.userId,
            receiverId: req.userId,
          },
        ],
      },
    });

    return res.status(201).json({
      block,
    });
  }
);

app.delete(
  "/api/blocks/:userId",
  authenticate,
  async (req: AuthRequest, res) => {
    await prisma.block.deleteMany({
      where: {
        blockerId: req.userId,
        blockedId: req.params.userId,
      },
    });

    return res.json({
      message: "User unblocked",
    });
  }
);

app.get(
  "/api/blocks",
  authenticate,
  async (req: AuthRequest, res) => {
    const blocks = await prisma.block.findMany({
      where: {
        blockerId: req.userId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      blocks,
    });
  }
);

/* =========================================================
   REPORTS
========================================================= */

app.post(
  "/api/reports/:userId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      if (req.userId === req.params.userId) {
        return res.status(400).json({
          message: "You cannot report yourself",
        });
      }

      const schema = z.object({
        reason: z.string().min(1).max(100),
        details: z.string().max(1000).nullable().optional(),
      });

      const data = schema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: {
          id: req.params.userId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const report = await prisma.report.create({
        data: {
          reporterId: req.userId,
          reportedId: req.params.userId,
          reason: data.reason,
          details: data.details ?? null,
        },
      });

      return res.status(201).json({
        message: "Report submitted",
        report,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid report",
          errors: error.issues,
        });
      }

      console.error("Report error:", error);

      return res.status(500).json({
        message: "Unable to submit report",
      });
    }
  }
);

/* =========================================================
   SUBSCRIPTIONS
========================================================= */

app.get(
  "/api/subscriptions",
  authenticate,
  async (req: AuthRequest, res) => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.json({
      subscriptions,
    });
  }
);

app.get(
  "/api/subscriptions/active",
  authenticate,
  async (req: AuthRequest, res) => {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return res.json({
      subscription,
    });
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("Unhandled API error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
);

/* =========================================================
   START
========================================================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AMORA Live API running on port ${PORT}`);
});
