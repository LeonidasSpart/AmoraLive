// backend/src/lib/media.js
//
// Every place that lets someone delete or replace media (stories, profile
// photos) was only ever removing the database reference — the actual file
// stayed in UploadThing forever, orphaned. This is the shared cleanup step
// for all of them.

function extractUploadThingKey(url) {
  if (!url) return null;
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Deletes a file from UploadThing given its stored URL. Safe to call with
 * a null/empty URL or when UploadThing isn't configured — becomes a no-op
 * rather than throwing, since a failed cleanup should never block the
 * actual delete/replace action that triggered it.
 */
async function deleteUploadThingFile(utapi, url) {
  const key = extractUploadThingKey(url);
  if (!key || !utapi) return false;
  try {
    await utapi.deleteFiles(key);
    return true;
  } catch (err) {
    console.error('UploadThing cleanup failed:', err.message);
    return false;
  }
}

module.exports = { extractUploadThingKey, deleteUploadThingFile };
