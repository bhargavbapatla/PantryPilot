import { useEffect, useState } from 'react';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ListFilter 
} from 'lucide-react';
// 👇 1. IMPORT FRAMER MOTION
import { motion, AnimatePresence } from 'framer-motion';
import NoData from '../NoData';

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageSize?: number;
  className?: string;
  isLoading?: boolean;
};

function TableSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-50 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div 
                className="h-4 rounded bg-gray-100 animate-pulse" 
                style={{ width: `${Math.random() * 40 + 60}%` }} 
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  className,
  isLoading = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (table.getState().pagination.pageSize !== pageSize) {
      table.setPageSize(pageSize);
    }
  }, [pageSize, table]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="
                          group px-6 py-3 text-left
                          text-[11px] font-semibold text-gray-500 uppercase tracking-wider
                          cursor-pointer select-none
                          transition-colors hover:bg-gray-100/80 hover:text-gray-700
                        "
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 data-[active=true]:opacity-100" data-active={!!isSorted}>
                             {isSorted === 'asc' && <ChevronUp size={12} className="text-indigo-600" strokeWidth={3} />}
                             {isSorted === 'desc' && <ChevronDown size={12} className="text-indigo-600" strokeWidth={3} />}
                             {!isSorted && <ChevronsUpDown size={12} className="text-gray-400" />}
                          </span>
                        </div>
                      </th>
                    );
                  })
                ))}
              </tr>
            </thead>

            {/* 👇 2. USE AnimatePresence for clean exit animations */}
            <tbody className="divide-y divide-gray-100 bg-white">
              <AnimatePresence mode='wait'>
                {isLoading ? (
                  <TableSkeleton rows={pageSize} columns={columns.length} />
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    // 👇 3. REPLACE tr WITH motion.tr
                    <motion.tr
                      key={row.id}
                      layout // 👈 THE MAGIC PROP: Handles sorting animations automatically
                      initial={{ opacity: 0, y: 10 }} // Start slightly down and invisible
                      animate={{ opacity: 1, y: 0 }}  // Slide up to normal position
                      exit={{ opacity: 0, y: -10 }}   // Fade out when deleted
                      transition={{ duration: 0.2, delay: index * 0.05 }} // Stagger effect (rows load one by one)
                      className="
                        group transition-colors duration-200 
                        hover:bg-indigo-50/30 
                        even:bg-gray-50/50 
                      "
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-24 text-center">
                      <NoData
                        message="No records found"
                        description="We couldn't find any data matching your filters."
                      />
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer (No changes needed here, kept for completeness) */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/30 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:inline-block">Rows per page</span>
                <div className="relative">
                    <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="
                        appearance-none cursor-pointer
                        rounded-md border border-gray-200 bg-white 
                        py-1.5 pl-2.5 pr-8 text-xs font-medium text-gray-700 
                        shadow-sm transition-all
                        hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none
                    "
                    >
                    {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                        {size}
                        </option>
                    ))}
                    </select>
                    <ListFilter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="h-4 w-px bg-gray-200 mx-1" />

            <div className="flex gap-1">
                <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="
                    inline-flex items-center justify-center rounded-md p-1.5
                    text-gray-500 transition-all duration-200
                    hover:bg-white hover:text-indigo-600 hover:shadow-sm hover:ring-1 hover:ring-gray-200
                    disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:ring-0
                "
                >
                <ChevronLeft size={16} />
                </button>
                <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="
                    inline-flex items-center justify-center rounded-md p-1.5
                    text-gray-500 transition-all duration-200
                    hover:bg-white hover:text-indigo-600 hover:shadow-sm hover:ring-1 hover:ring-gray-200
                    disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:ring-0
                "
                >
                <ChevronRight size={16} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;