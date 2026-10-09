import { toast } from '@/components/ui/toast'

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)

  toast.add({ title: 'Report downloaded', description: filename, type: 'success' })
}

export function parseFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) {
    return fallback
  }

  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/.exec(contentDisposition)

  if (!match) {
    return fallback
  }

  try {
    const decoded = decodeURIComponent(match[1])

    return decoded.length > 0 ? decoded : fallback
  } catch {
    return match[1].length > 0 ? match[1] : fallback
  }
}
