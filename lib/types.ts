export type SortDirection = "asc" | "desc" | "none"

export interface CellPosition {
  row: number
  col: number
}

export interface SelectionRange {
  start: CellPosition
  end: CellPosition
}

export interface HistoryState {
  tableData: string[][]
  inputData: string
  timestamp: number
}

export interface Format {
  value: string
  label: string
  icon: string
  extension: string
  mimeType: string
}
