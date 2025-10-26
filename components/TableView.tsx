"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical, MoreVertical, Plus, X, Edit3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTableSelection } from "@/hooks/useTableSelection"
import type { SortDirection } from "@/lib/types"
import { useLanguage } from "@/hooks/useLanguage"

interface TableViewProps {
  filteredData: string[][]
  tableData: string[][]
  setTableData: (data: string[][]) => void
  updateInputData: (data: string[][]) => string
  saveToHistory: (tableData: string[][], inputData: string) => void
  tableScale: number
  isTableExpanded: boolean
  inputData: string
  selectedFormat: string
  parseInputData: (data: string, format: string) => string[][]
}

export const TableView = ({
  filteredData,
  tableData,
  setTableData,
  updateInputData,
  saveToHistory,
  tableScale,
  isTableExpanded,
  inputData,
  selectedFormat,
  parseInputData,
}: TableViewProps) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("none")
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null)
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editingValue, setEditingValue] = useState("")

  const editInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { isCellSelected, handleCellClick, handleCellMouseDown, handleCellMouseEnter } = useTableSelection()
  const { t } = useLanguage()

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingCell])

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4 text-blue-500" />
    if (sortDirection === "desc") return <ArrowDown className="w-4 h-4 text-blue-500" />
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />
  }

  const handleSort = (columnIndex: number) => {
    if (tableData.length <= 1) return

    let newDirection: SortDirection = "asc"
    if (sortColumn === columnIndex) {
      if (sortDirection === "asc") newDirection = "desc"
      else if (sortDirection === "desc") newDirection = "none"
      else newDirection = "asc"
    }

    setSortColumn(columnIndex)
    setSortDirection(newDirection)

    if (newDirection === "none") {
      const originalData = parseInputData(inputData, selectedFormat)
      setTableData(originalData)
      return
    }

    const headers = tableData[0]
    const dataRows = tableData.slice(1)

    const sortedRows = [...dataRows].sort((a, b) => {
      const aVal = a[columnIndex] || ""
      const bVal = b[columnIndex] || ""

      const aNum = Number.parseFloat(aVal)
      const bNum = Number.parseFloat(bVal)
      const isNumeric = !isNaN(aNum) && !isNaN(bNum)

      if (isNumeric) {
        return newDirection === "asc" ? aNum - bNum : bNum - aNum
      } else {
        return newDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
    })

    const newTableData = [headers, ...sortedRows]
    setTableData(newTableData)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
  }

  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditingValue(tableData[rowIndex][colIndex] || "")
  }

  const handleCellEdit = (value: string) => {
    setEditingValue(value)
  }

  const handleCellEditConfirm = () => {
    if (editingCell) {
      const newTableData = [...tableData]
      newTableData[editingCell.row][editingCell.col] = editingValue
      setTableData(newTableData)
      const newInputData = updateInputData(newTableData)
      saveToHistory(newTableData, newInputData)
      setEditingCell(null)
      toast({
        title: t("messages.cellUpdated"),
        description: t("messages.cellUpdatedDesc"),
      })
    }
  }

  const handleCellEditCancel = () => {
    setEditingCell(null)
    setEditingValue("")
  }

  const handleCellEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellEditConfirm()
    } else if (e.key === "Escape") {
      handleCellEditCancel()
    }
  }

  const addRowAt = (position: number, direction: "above" | "below") => {
    if (tableData.length === 0) return
    const insertIndex = direction === "above" ? position : position + 1
    const newRow = new Array(tableData[0].length).fill("")
    const newTableData = [...tableData]
    newTableData.splice(insertIndex, 0, newRow)
    setTableData(newTableData)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
    toast({
      title: t("messages.rowAdded"),
      description: `${insertIndex + 1}${t("messages.rowAddedDesc")}`,
    })
  }

  const addColumnAt = (position: number, direction: "left" | "right") => {
    if (tableData.length === 0) return
    const insertIndex = direction === "left" ? position : position + 1
    const newTableData = tableData.map((row, rowIndex) => {
      const newRow = [...row]
      newRow.splice(insertIndex, 0, rowIndex === 0 ? t("contextMenu.newColumn") : "")
      return newRow
    })
    setTableData(newTableData)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
    toast({
      title: t("messages.columnAdded"),
      description: `${insertIndex + 1}${t("messages.columnAddedDesc")}`,
    })
  }

  const deleteRow = (rowIndex: number) => {
    if (tableData.length <= 1) {
      toast({
        title: t("messages.cannotDelete"),
        description: t("messages.cannotDeleteHeader"),
        variant: "destructive",
      })
      return
    }
    const newTableData = tableData.filter((_, index) => index !== rowIndex)
    setTableData(newTableData)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
    toast({
      title: t("messages.rowDeleted"),
      description: `${rowIndex + 1}${t("messages.rowDeletedDesc")}`,
    })
  }

  const deleteColumn = (colIndex: number) => {
    if (tableData.length === 0 || tableData[0].length <= 1) {
      toast({
        title: t("messages.cannotDelete"),
        description: t("messages.cannotDeleteLastColumn"),
        variant: "destructive",
      })
      return
    }
    const newTableData = tableData.map((row) => row.filter((_, index) => index !== colIndex))
    setTableData(newTableData)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
    toast({
      title: t("messages.columnDeleted"),
      description: `${colIndex + 1}${t("messages.columnDeletedDesc")}`,
    })
  }

  const handleRowDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRowIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleRowDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedRowIndex === null || draggedRowIndex === dropIndex) return

    const newTableData = [...tableData]
    const draggedRow = newTableData[draggedRowIndex]
    newTableData.splice(draggedRowIndex, 1)
    newTableData.splice(dropIndex, 0, draggedRow)

    setTableData(newTableData)
    setDraggedRowIndex(null)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
  }

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return

    const newTableData = tableData.map((row) => {
      const newRow = [...row]
      const draggedCell = newRow[draggedColumnIndex]
      newRow.splice(draggedColumnIndex, 1)
      newRow.splice(dropIndex, 0, draggedCell)
      return newRow
    })

    setTableData(newTableData)
    setDraggedColumnIndex(null)
    const newInputData = updateInputData(newTableData)
    saveToHistory(newTableData, newInputData)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
      <div
        className={`overflow-auto ${isTableExpanded ? "max-h-[calc(100vh-20rem)]" : "max-h-[400px]"}`}
        style={{
          userSelect: "none",
          transform: `scale(${tableScale})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-in-out",
        }}
      >
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0">
            <tr>
              {filteredData[0]?.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left border-b border-gray-200 cursor-move relative group"
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, index)}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleColumnDrop(e, index)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move hover:text-gray-600 transition-colors" />
                    {editingCell?.row === 0 && editingCell?.col === index ? (
                      <Input
                        ref={editInputRef}
                        value={editingValue}
                        onChange={(e) => handleCellEdit(e.target.value)}
                        onKeyDown={handleCellEditKeyDown}
                        onBlur={handleCellEditConfirm}
                        className="h-6 text-sm font-semibold text-gray-700 bg-white border-blue-300"
                      />
                    ) : (
                      <span
                        className={`font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded ${
                          isCellSelected(0, index) ? "bg-blue-200" : ""
                        }`}
                        onDoubleClick={() => handleCellDoubleClick(0, index)}
                        onClick={(e) => handleCellClick(0, index, e)}
                        onMouseDown={(e) => handleCellMouseDown(0, index, e)}
                        onMouseEnter={() => handleCellMouseEnter(0, index)}
                      >
                        {header}
                      </span>
                    )}
                    <button
                      onClick={() => handleSort(index)}
                      className="cursor-pointer hover:text-blue-500 transition-colors"
                    >
                      {getSortIcon(index)}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => addColumnAt(index, "left")}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("contextMenu.addColumnLeft")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addColumnAt(index, "right")}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("contextMenu.addColumnRight")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteColumn(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t("contextMenu.deleteColumn")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(1).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-blue-50 transition-colors duration-150 cursor-move group"
                draggable
                onDragStart={(e) => handleRowDragStart(e, rowIndex + 1)}
                onDragOver={handleRowDragOver}
                onDrop={(e) => handleRowDrop(e, rowIndex + 1)}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 border-b border-gray-100 text-gray-700 relative">
                    <div className="flex items-center gap-2">
                      {cellIndex === 0 && (
                        <>
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => addRowAt(rowIndex, "above")}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t("contextMenu.addRowAbove")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => addRowAt(rowIndex, "below")}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t("contextMenu.addRowBelow")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteRow(rowIndex + 1)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4 mr-2" />
                                {t("contextMenu.deleteRow")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      {editingCell?.row === rowIndex + 1 && editingCell?.col === cellIndex ? (
                        <Input
                          ref={editInputRef}
                          value={editingValue}
                          onChange={(e) => handleCellEdit(e.target.value)}
                          onKeyDown={handleCellEditKeyDown}
                          onBlur={handleCellEditConfirm}
                          className="h-6 text-sm bg-white border-blue-300"
                        />
                      ) : (
                        <span
                          className={`cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded flex-1 inline-flex items-center gap-1 ${
                            isCellSelected(rowIndex + 1, cellIndex) ? "bg-blue-200" : ""
                          }`}
                          onDoubleClick={() => handleCellDoubleClick(rowIndex + 1, cellIndex)}
                          onClick={(e) => handleCellClick(rowIndex + 1, cellIndex, e)}
                          onMouseDown={(e) => handleCellMouseDown(rowIndex + 1, cellIndex, e)}
                          onMouseEnter={() => handleCellMouseEnter(rowIndex + 1, cellIndex)}
                        >
                          {cell}
                          <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
