'use client'
import { useEffect } from 'react'

// Delegated click handler. PhotoSwipe (and the Fullscreen helper) is imported only on the first click,
// so pages nobody clicks never download it. Without JS the anchors are plain links to the full image.
let attached = false

function collect() {
  const seen = new Map()
  document.querySelectorAll('a[data-pswp-width]').forEach((a) => {
    if (!seen.has(a.href)) {
      seen.set(a.href, {
        src: a.href,
        width: Number(a.dataset.pswpWidth),
        height: Number(a.dataset.pswpHeight),
        alt: a.dataset.alt || '',
        caption: a.dataset.caption || '',
        el: a
      })
    }
  })
  return [...seen.values()]
}

async function open(href, first) {
  const { default: PhotoSwipe } = await import('photoswipe')
  const items = collect()
  const index = first ? 0 : Math.max(0, items.findIndex((i) => i.src === href))
  const trigger = items[index]?.el
  const pswp = new PhotoSwipe({
    dataSource: items,
    index,
    bgOpacity: 1,
    paddingFn: (vp) => ({ top: 52, bottom: vp.x < 640 ? 64 : 56, left: vp.x < 640 ? 0 : 56, right: vp.x < 640 ? 0 : 56 }),
    wheelToZoom: true,
    returnFocus: true,
    closeTitle: 'Close (Esc)',
    zoomTitle: 'Zoom in or out',
    arrowPrevTitle: 'Previous screenshot',
    arrowNextTitle: 'Next screenshot',
    errorMsg: 'This screenshot could not be loaded.',
    showHideAnimationType: 'fade',
    // thumbnail bounds for the zoom animation, only when the thumbnail is visible
    getThumbBoundsFn: (i) => {
      const img = items[i]?.el?.querySelector('img')
      if (!img || !img.offsetParent) return undefined
      const r = img.getBoundingClientRect()
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width }
    }
  })

  // caption
  pswp.on('uiRegister', () => {
    pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (el) => {
        el.className = 'pswp__custom-caption'
        pswp.on('change', () => {
          const d = pswp.currSlide?.data
          el.textContent = d?.caption || d?.alt || ''
        })
      }
    })

    // live region so screen readers hear "3 of 22: caption"
    pswp.ui.registerElement({
      name: 'sr-status',
      order: 10,
      isButton: false,
      appendTo: 'root',
      onInit: (el) => {
        el.className = 'pswp__sr-only'
        el.setAttribute('role', 'status')
        el.setAttribute('aria-live', 'polite')
        pswp.on('change', () => {
          const d = pswp.currSlide?.data
          el.textContent = `Screenshot ${pswp.currIndex + 1} of ${pswp.getNumItems()}: ${d?.caption || d?.alt || ''}`
        })
      }
    })

    // fullscreen toggle (Fullscreen API; hidden where unsupported, e.g. iPhone Safari)
    const root = () => pswp.element
    if (document.fullscreenEnabled) {
      pswp.ui.registerElement({
        name: 'fullscreen-toggle',
        title: 'Toggle fullscreen',
        order: 8,
        isButton: true,
        html: {
          isCustomSVG: true,
          inner:
            '<path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 0h2v6h-6v-2h4v-4z" id="pswp__icn-fullscreen"/>',
          outlineID: 'pswp__icn-fullscreen',
          size: 24
        },
        onClick: () => {
          if (document.fullscreenElement) document.exitFullscreen()
          else root()?.requestFullscreen?.().catch(() => {})
        }
      })
    }
  })
  pswp.on('destroy', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    // belt and braces: put focus back on the thumbnail
    trigger?.focus?.({ preventScroll: true })
  })
  pswp.init()
}

export function Lightbox() {
  useEffect(() => {
    if (attached) return
    attached = true
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest?.('a[data-pswp-width], a[data-pswp-open-first]')
      if (!a) return
      e.preventDefault()
      open(a.href, a.hasAttribute('data-pswp-open-first')).catch(() => window.open(a.href, '_blank', 'noopener'))
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      attached = false
    }
  }, [])
  return null
}
