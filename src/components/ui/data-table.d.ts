import { ColumnDef } from '@tanstack/react-table'
import { ReactNode } from 'react'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export function DataTable<TData>(props: DataTableProps<TData>): ReactNode
