import { ChevronDownIcon, ChevronUpIcon, CopyIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Expense } from '../../types/expense'
import { formatDateOnly, formatINR } from '../../utils/format'
import { cn } from '@/lib/utils'

export interface ExpenseTableProps {
  items: Expense[]
  onEdit: (expense: Expense) => void
  onDuplicate: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  sumAmount: number
  loading?: boolean
  sortBy: 'date' | 'amount'
  order: 'asc' | 'desc'
  onSortToggle: (column: 'date' | 'amount') => void
}

interface SortHeaderProps {
  label: string
  column: 'date' | 'amount'
  sortBy: 'date' | 'amount'
  order: 'asc' | 'desc'
  align?: 'left' | 'right'
  onSortToggle: (column: 'date' | 'amount') => void
}

function SortHeader({ label, column, sortBy, order, align = 'left', onSortToggle }: SortHeaderProps) {
  const active = sortBy === column
  const ariaSort = active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <TableHead aria-sort={ariaSort} className={cn('h-9', align === 'right' && 'text-right')}>
      <button
        type="button"
        onClick={() => onSortToggle(column)}
        className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-ink-muted transition-colors duration-[var(--duration-fast)] hover:text-ink"
      >
        {label}

        {active &&
          (order === 'asc' ? (
            <ChevronUpIcon aria-hidden="true" className="size-3" />
          ) : (
            <ChevronDownIcon aria-hidden="true" className="size-3" />
          ))}
      </button>
    </TableHead>
  )
}

interface RowActionsProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDuplicate: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

function RowActions({ expense, onEdit, onDuplicate, onDelete }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${expense.title}`}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-sm text-ink-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-ink"
          />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onEdit(expense)}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onDuplicate(expense)}>
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuItem variant="destructive" onClick={() => onDelete(expense)}>
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SKELETON_ROWS = 5

export function ExpenseTable({
  items,
  onEdit,
  onDuplicate,
  onDelete,
  sumAmount,
  loading = false,
  sortBy,
  order,
  onSortToggle,
}: ExpenseTableProps) {
  return (
    <section
      aria-busy={loading}
      className="overflow-hidden rounded-md border border-line bg-surface elevation-1"
    >
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                label="Date"
                column="date"
                sortBy={sortBy}
                order={order}
                onSortToggle={onSortToggle}
              />

              <TableHead className="h-9">Title</TableHead>
              <TableHead className="h-9">Category</TableHead>

              <SortHeader
                label="Amount"
                column="amount"
                sortBy={sortBy}
                order={order}
                align="right"
                onSortToggle={onSortToggle}
              />

              <TableHead className="h-9 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={5} className="p-0">
                    <Skeleton className="h-[52px] w-full rounded-none" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              items.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="tabular-nums text-ink-muted">
                    {formatDateOnly(expense.date)}
                  </TableCell>

                  <TableCell>
                    <div className="flex max-w-[360px] flex-col justify-center py-2 leading-tight">
                      <span className="w-full truncate text-sm font-medium text-ink" title={expense.title}>
                        {expense.title}
                      </span>

                      {expense.description && (
                        <span
                          className="w-full truncate text-xs text-ink-muted"
                          title={expense.description}
                        >
                          {expense.description}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="neutral">{expense.category}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="num text-sm font-medium tabular-nums whitespace-nowrap text-ink">
                      {formatINR(expense.amount)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <RowActions
                        expense={expense}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>

          {!loading && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="h-12 text-sm font-medium text-ink">
                  Total (filtered)
                </TableCell>

                <TableCell className="text-right">
                  <span className="num font-display text-lg text-ink">{formatINR(sumAmount)}</span>
                </TableCell>

                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <ul className="sm:hidden">
        {loading &&
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li
              key={`skeleton-${index}`}
              className="border-t border-line px-4 py-3 first:border-t-0"
            >
              <Skeleton className="h-[52px] w-full" />
            </li>
          ))}

        {!loading &&
          items.map((expense) => (
            <li
              key={expense.id}
              className="border-t border-line px-4 py-3 transition-colors duration-[var(--duration-fast)] first:border-t-0 hover:bg-surface-sunken"
            >
              <div className="flex justify-between gap-3">
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium text-ink"
                  title={expense.title}
                >
                  {expense.title}
                </span>

                <span className="num shrink-0 text-sm font-medium whitespace-nowrap text-ink">
                  {formatINR(expense.amount)}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <Badge variant="neutral">{expense.category}</Badge>

                <span className="text-xs text-ink-muted tabular-nums">{formatDateOnly(expense.date)}</span>

                <div className="ml-auto">
                  <RowActions
                    expense={expense}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </li>
          ))}
      </ul>
    </section>
  )
}
