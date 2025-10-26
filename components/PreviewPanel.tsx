"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Undo, Redo, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { TableView } from "./TableView"
import { useTableSelection } from "@/hooks/useTableSelection"
import { useLanguage } from "@/hooks/useLanguage"

interface PreviewPanelProps {
  tableData: string[][]
  setTableData: (data: string[][]) => void
  updateInputData: (data: string[][]) => string
  saveToHistory: (tableData: string[][], inputData: string) => void
  handleUndo: () => void
  handleRedo: () => void
  historyIndex: number
  historyLength: number
  isTableExpanded: boolean
  onTableExpand: () => void
  inputData: string
  selectedFormat: string
  parseInputData: (data: string, format: string) => string[][]
}

export const PreviewPanel = ({
  tableData,
  setTableData,
  updateInputData,
  saveToHistory,
  handleUndo,
  handleRedo,
  historyIndex,
  historyLength,
  isTableExpanded,
  onTableExpand,
  inputData,
  selectedFormat,
  parseInputData,
}: PreviewPanelProps) => {
  const [filterText, setFilterText] = useState("")
  const [tableScale, setTableScale] = useState(1)
  const { getSelectedCellsInfo } = useTableSelection()
  const { t } = useLanguage()

  const handleTableZoomIn = () => {
    setTableScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  const handleTableZoomOut = () => {
    setTableScale((prev) => Math.max(prev - 0.2, 0.6))
  }

  const filteredData = tableData.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(filterText.toLowerCase())),
  )

  return (
    <>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("placeholders.filter")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          {t("buttons.filter")}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <Undo className="w-4 h-4 mr-2" />
            {t("buttons.undo")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= historyLength - 1}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <Redo className="w-4 h-4 mr-2" />
            {t("buttons.redo")}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{getSelectedCellsInfo()}</div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTableZoomOut}
              disabled={tableScale <= 0.6}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTableZoomIn}
              disabled={tableScale >= 2.0}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTableExpand}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredData.length > 0 && (
        <TableView
          filteredData={filteredData}
          tableData={tableData}
          setTableData={setTableData}
          updateInputData={updateInputData}
          saveToHistory={saveToHistory}
          tableScale={tableScale}
          isTableExpanded={isTableExpanded}
          inputData={inputData}
          selectedFormat={selectedFormat}
          parseInputData={parseInputData}
        />
      )}
    </>
  )
}
