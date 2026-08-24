// backend/src/lib/orphanMedia.js
const { extractUploadThingKey } = require('./media');

/**
 * Scans every model that can hold an UploadThing URL and returns the set
 * of file keys still actually in use. Anything in UploadThing not in this
 * set is safe to delete. New media fields added later must be added here
 * too, or they'll be wrongly reported as orphaned.
 */
async function getReferencedKeys(prisma) {
  const [
    users,
    gifts,
    cosmetics,
    events,
    rooms,
    messages,
    stories
  ] = await Promise.all([
    prisma.user.findMany({ select: { profile_photo: true, cover_photo: true } }),
    prisma.giftCatalog.findMany({ select: { image_url: true, animation_url: true, sound_url: true } }),
    prisma.cosmetic.findMany({ select: { image_url: true, animation_url: true } }),
    prisma.event.findMany({ select: { banner_url: true } }),
    prisma.liveRoom.findMany({ select: { thumbnail_url: true } }),
    prisma.message.findMany({ where: { media_urls: { not: null } }, select: { media_urls: true } }),
    prisma.story.findMany({ select: { media_url: true } })
  ]);

  const urls = [
    ...users.flatMap((u) => [u.profile_photo, u.cover_photo]),
    ...gifts.flatMap((g) => [g.image_url, g.animation_url, g.sound_url]),
    ...cosmetics.flatMap((c) => [c.image_url, c.animation_url]),
    ...events.map((e) => e.banner_url),
    ...rooms.map((r) => r.thumbnail_url),
    ...messages.flatMap((m) => (Array.isArray(m.media_urls) ? m.media_urls : [])),
    ...stories.map((s) => s.media_url)
  ];

  const keys = new Set();
  for (const url of urls) {
    const key = extractUploadThingKey(url);
    if (key) keys.add(key);
  }
  return keys;
}

/**
 * Lists every file in UploadThing (paginating through all of them) and
 * flags which ones aren't referenced by any row in the database.
 */
async function findOrphanedFiles(prisma, utapi) {
  if (!utapi) return { orphans: [], totalFiles: 0, referencedCount: 0 };

  const referencedKeys = await getReferencedKeys(prisma);

  const allFiles = [];
  let offset = 0;
  const pageSize = 500;
  // Defensive cap so a runaway file count can't turn this into an
  // unbounded loop against UploadThing's API.
  for (let page = 0; page < 40; page++) {
    const result = await utapi.listFiles({ limit: pageSize, offset });
    const files = result?.files || [];
    allFiles.push(...files);
    if (!result?.hasMore || files.length < pageSize) break;
    offset += pageSize;
  }

  const orphans = allFiles.filter((f) => f.key && !referencedKeys.has(f.key));

  return {
    orphans: orphans.map((f) => ({ key: f.key, name: f.name, size: f.size, uploadedAt: f.uploadedAt, status: f.status })),
    totalFiles: allFiles.length,
    referencedCount: allFiles.length - orphans.length
  };
}

module.exports = { getReferencedKeys, findOrphanedFiles };
