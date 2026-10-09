import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageToken = number | 'ellipsis'

function buildPageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, page, totalPages])

  if (page > 1) {
    pages.add(page - 1)
  }

  if (page < totalPages) {
    pages.add(page + 1)
  }

  const tokens: PageToken[] = []
  let previous = 0

  for (const value of [...pages].sort((left, right) => left - right)) {
    if (value - previous > 1) {
      tokens.push('ellipsis')
    }

    tokens.push(value)
    previous = value
  }

  return tokens
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const current = Math.min(Math.max(page, 1), totalPages)
  const atStart = current <= 1
  const atEnd = current >= totalPages
  const tokens = buildPageTokens(current, totalPages)

  function handlePageChange(next: number) {
    if (next < 1 || next > totalPages || next === current) {
      return
    }

    onPageChange(next)
  }

  return (
    <PaginationNav>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={atStart || undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            onClick={atStart ? undefined : () => handlePageChange(current - 1)}
          />
        </PaginationItem>

        {tokens.map((token, index) => {
          if (token === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const isActive = token === current
          const isFar = !isActive && Math.abs(token - current) > 1 && totalPages > 5

          return (
            <PaginationItem key={token} className={cn(isFar && 'hidden sm:block')}>
              <PaginationLink
                isActive={isActive}
                aria-label={`Page ${token}`}
                onClick={() => handlePageChange(token)}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            aria-disabled={atEnd || undefined}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            onClick={atEnd ? undefined : () => handlePageChange(current + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  )
}
