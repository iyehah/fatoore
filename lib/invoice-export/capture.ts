export async function waitForRenderableAssets(element: HTMLElement): Promise<void> {
  const imagePromises = Array.from(element.querySelectorAll('img')).map(async (img) => {
    if (img.complete) return
    if (typeof img.decode === 'function') {
      try {
        await img.decode()
        return
      } catch {
        /* fallback */
      }
    }
    await new Promise<void>((resolve) => {
      const timeoutId = window.setTimeout(() => done(), 2500)
      const done = () => {
        window.clearTimeout(timeoutId)
        img.removeEventListener('load', done)
        img.removeEventListener('error', done)
        resolve()
      }
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })
  })

  const fontReady =
    typeof document !== 'undefined'
      ? (document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve())
      : Promise.resolve()

  await Promise.all([fontReady, ...imagePromises])
}

export type DetachedExportRoot = {
  element: HTMLElement
  width: number
  height: number
  cleanup: () => void
}

export function createDetachedExportRoot(source: HTMLElement): DetachedExportRoot {
  const rect = source.getBoundingClientRect()
  const width = Math.max(
    1,
    Math.ceil(rect.width),
    source.scrollWidth,
    source.clientWidth,
    source.offsetWidth,
  )
  const height = Math.max(
    1,
    Math.ceil(rect.height),
    source.scrollHeight,
    source.clientHeight,
    source.offsetHeight,
  )

  const clone = source.cloneNode(true) as HTMLElement
  clone.style.width = `${width}px`
  clone.style.minHeight = `${height}px`
  clone.style.maxWidth = 'none'
  clone.style.margin = '0'
  clone.style.transform = 'none'
  clone.style.opacity = '1'
  clone.style.backgroundColor = '#ffffff'

  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-100000px'
  host.style.top = '0'
  host.style.width = `${width}px`
  host.style.minHeight = `${height}px`
  host.style.overflow = 'visible'
  host.style.pointerEvents = 'none'
  host.style.zIndex = '-1'
  host.style.backgroundColor = '#ffffff'
  host.appendChild(clone)
  document.body.appendChild(host)

  return {
    element: clone,
    width,
    height,
    cleanup: () => {
      if (host.parentNode) host.parentNode.removeChild(host)
    },
  }
}

export async function captureInvoicePngDataUrl(
  element: HTMLElement,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const { toPng } = await import('html-to-image')
  const detached = createDetachedExportRoot(element)
  try {
    await waitForRenderableAssets(detached.element)
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    const dataUrl = await toPng(detached.element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      canvasWidth: detached.width * 2,
      canvasHeight: detached.height * 2,
      skipFonts: false,
    })
    return { dataUrl, width: detached.width, height: detached.height }
  } finally {
    detached.cleanup()
  }
}
