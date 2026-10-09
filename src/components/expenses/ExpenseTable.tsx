import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { formatDateOnly, formatMoney } from '../../utils/format'

export interface ExpenseTableProps {
  items: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  sumAmount: number
}

const HEAD_CLASS = 'px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground'

export function ExpenseTable({ items, onEdit, onDelete, sumAmount }: ExpenseTableProps) {
  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>Date</TableHead>
            <TableHead className={HEAD_CLASS}>Title</TableHead>
            <TableHead className={HEAD_CLASS}>Category</TableHead>
            <TableHead className={`${HEAD_CLASS} text-right`}>Amount</TableHead>
            <TableHead className={`${HEAD_CLASS} text-right`}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="px-4 py-3 text-muted-foreground">
                {formatDateOnly(expense.date)}
              </TableCell>

              <TableCell className="px-4 py-3">
                <p className="font-medium">{expense.title}</p>

                {expense.description && (
                  <p className="max-w-xs truncate text-xs text-muted-foreground">
                    {expense.description}
                  </p>
                )}
              </TableCell>

              <TableCell className="px-4 py-3">
                <Badge variant="secondary">{expense.category}</Badge>
              </TableCell>

              <TableCell className="px-4 py-3 text-right font-medium tabular-nums">
                {formatMoney(expense.amount)}
              </TableCell>

              <TableCell className="px-4 py-3">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Actions"
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <EllipsisVerticalIcon />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(expense)}>
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className={`${HEAD_CLASS} font-medium`}>
              Total (filtered)
            </TableCell>

            <TableCell className="px-4 py-3 text-right font-semibold tabular-nums">
              {formatMoney(sumAmount)}
            </TableCell>

            <TableCell className="px-4 py-3" />
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}
