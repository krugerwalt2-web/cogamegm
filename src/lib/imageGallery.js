// Shared per-campaign image gallery store.
// Uses the SAME localStorage key format Images.js already used
// (cogamegm_images_v1_<campaignId>) so existing saved galleries keep working.
// Session.js (scene image generation) and Images.js (gallery display) both
// read/write through here, and a CustomEvent keeps any mounted Images.js
// instance in sync the moment a new image is generated elsewhere.

const PREFIX = 'cogamegm_images_v1_'
export const GALLERY_EVENT = 'cogamegm:gallery-updated'

function keyFor(campaignId) {
  return campaignId ? PREFIX + campaignId : null
}

export function getGalleryImages(campaignId) {
  const key = keyFor(campaignId)
  if (!key) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeGalleryImages(campaignId, images) {
  const key = keyFor(campaignId)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(images))
  } catch (e) {
    console.warn('Gallery save failed (storage full?):', e)
  }
  window.dispatchEvent(new CustomEvent(GALLERY_EVENT, { detail: { campaignId } }))
}

// image: { url, source: 'url' | 'upload' | 'ai-generated' | 'pinterest', label? }
export function addGalleryImage(campaignId, image) {
  if (!campaignId || !image?.url) return null
  const images = getGalleryImages(campaignId)
  if (images.some(i => i.url === image.url)) return null // skip exact duplicates
  const entry = {
    id: 'i' + Date.now() + Math.random().toString(36).slice(2, 7),
    url: image.url,
    source: image.source || 'url',
    label: image.label || '',
    createdAt: Date.now(),
  }
  writeGalleryImages(campaignId, [...images, entry])
  return entry
}

export function removeGalleryImage(campaignId, id) {
  writeGalleryImages(campaignId, getGalleryImages(campaignId).filter(i => i.id !== id))
}

// Fires the callback whenever any gallery changes (this tab or another).
// Returns an unsubscribe function.
export function subscribeGallery(callback) {
  function handler() { callback() }
  window.addEventListener(GALLERY_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(GALLERY_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
