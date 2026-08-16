// Shared per-campaign custom audio library store.
// Same pattern as lib/imageGallery.js: entries persist to localStorage
// under a per-campaign key, and a CustomEvent keeps any mounted Sounds.js
// instance in sync the moment a clip is added or removed (this tab or
// another). Uploaded files are stored as base64 data URLs, same tradeoff
// as image uploads — fine for short SFX clips, but shares the browser's
// ~5-10MB localStorage quota across the whole app. If you outgrow that
// (long ambient loops, lots of clips), this is the same spot flagged in
// imageGallery.js to migrate to Supabase Storage instead.

const PREFIX = 'cogamegm_audiolib_v1_'
export const AUDIO_LIBRARY_EVENT = 'cogamegm:audiolib-updated'

function keyFor(campaignId) {
  return campaignId ? PREFIX + campaignId : null
}

export function getAudioFiles(campaignId) {
  const key = keyFor(campaignId)
  if (!key) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAudioFiles(campaignId, files) {
  const key = keyFor(campaignId)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(files))
  } catch (e) {
    console.warn('Audio library save failed (storage full?):', e)
    throw e // let the caller surface a message — silent failure here would look like a successful upload
  }
  window.dispatchEvent(new CustomEvent(AUDIO_LIBRARY_EVENT, { detail: { campaignId } }))
}

// file: { url (data URL), name, size }
// Returns the saved entry, or null if it couldn't be saved (e.g. campaignId missing).
export function addAudioFile(campaignId, file) {
  if (!campaignId || !file?.url) return null
  const files = getAudioFiles(campaignId)
  const entry = {
    id: 'a' + Date.now() + Math.random().toString(36).slice(2, 7),
    url: file.url,
    name: file.name || 'Untitled clip',
    size: file.size || 0,
    createdAt: Date.now(),
  }
  writeAudioFiles(campaignId, [...files, entry])
  return entry
}

export function removeAudioFile(campaignId, id) {
  writeAudioFiles(campaignId, getAudioFiles(campaignId).filter(f => f.id !== id))
}

// Fires the callback whenever any campaign's audio library changes (this
// tab or another). Returns an unsubscribe function.
export function subscribeAudioLibrary(callback) {
  function handler() { callback() }
  window.addEventListener(AUDIO_LIBRARY_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(AUDIO_LIBRARY_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
