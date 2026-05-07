import { useMemo, useState } from 'react'

export interface Column<T> {
  key: keyof T
  label: string
}

interface DataTableProps<T extends Record<string, string | number>> {
  title: string
  rows: T[]
  columns: Column<T>[]
}

export function DataTable<T extends Record<string, string | number>>({ title, rows, columns }: DataTableProps<T>) {
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<keyof T>(columns[0].key)

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) =>
        Object.values(row).some((value) => value.toString().toLowerCase().includes(filter.toLowerCase().trim())),
      )
      .sort((a, b) => a[sortBy].toString().localeCompare(b[sortBy].toString(), undefined, { numeric: true }))
  }, [filter, rows, sortBy])

  return (
    <section className="card table-wrap" aria-label={title}>
      <div className="table-head">
        <h3>{title}</h3>
        <input
          aria-label={`Filter ${title}`}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter"
        />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>
                  <button type="button" className="sort-btn" onClick={() => setSortBy(column.key)}>
                    {column.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={`${index}-${String(row[columns[0].key])}`}>
                {columns.map((column) => (
                  <td key={String(column.key)}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>No rows match the filter.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
