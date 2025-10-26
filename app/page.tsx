"use client"

import { useState } from "react"
import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Zap, FileText, X } from "lucide-react"

import { Header } from "@/components/Header"
import { StepBar } from "@/components/StepBar"
import { InputPanel } from "@/components/InputPanel"
import { HowToUse } from "@/components/HowToUse"

import { useTableParsers } from "@/hooks/useTableParsers"
import { useTableHistory } from "@/hooks/useTableHistory"
import { useTableSelection } from "@/hooks/useTableSelection"
import { useLanguage } from "@/hooks/useLanguage"

import { sampleData } from "@/lib/constants/sampleData"
import { formats } from "@/lib/constants/formats"
import { generateOutput } from "@/lib/formatGenerators"

// 他のコンポーネントは後続のファイルで定義
import { PreviewPanel } from "@/components/PreviewPanel"
import { OutputPanel } from "@/components/OutputPanel"

type SortDirection = "asc" | "desc" | "none"
type CellPosition = { row: number; col: number }
type SelectionRange = { start: CellPosition; end: CellPosition }

interface HistoryState {
  tableData: string[][]
  inputData: string
  timestamp: number
}

export default function TableConverter() {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const [inputData, setInputData] = useState("")
  const [activeTab, setActiveTab] = useState("input")
  const [filterText, setFilterText] = useState("")
  const [outputFormat, setOutputFormat] = useState("csv")
  const [tableData, setTableData] = useState<string[][]>([])
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("none")
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null)
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)
  const [editingValue, setEditingValue] = useState("")

  // セル選択関連
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastClickedCell, setLastClickedCell] = useState<CellPosition | null>(null)

  // テーブルリサイズ関連
  const [tableScale, setTableScale] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isTableExpanded, setIsTableExpanded] = useState(false)

  const { parseInputData } = useTableParsers()
  const { saveToHistory, handleUndo, handleRedo, clearHistory, historyIndex, history, isUndoRedoOperation } =
    useTableHistory()
  const { clearSelection } = useTableSelection()

  const updateInputData = (data: string[][]) => {
    const newInputData = data.map((row) => row.join(",")).join("\n")
    setInputData(newInputData)
    return newInputData
  }

  const handleSampleData = () => {
    const sample = sampleData[selectedFormat as keyof typeof sampleData] || sampleData.csv
    const newTableData = parseInputData(sample, selectedFormat)
    setInputData(sample)
    setCurrentStep(2)
    setTableData(newTableData)
    saveToHistory(newTableData, sample)
  }

  const handleClear = () => {
    setInputData("")
    setTableData([])
    setCurrentStep(1)
    clearSelection()
    clearHistory()
    setIsTableExpanded(false)
    setSortColumn(null)
    setSortDirection("none")
    setEditingCell(null)
    setSelectedCells(new Set())
    setSelectionRange(null)
    setTableScale(1)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        const newTableData = parseInputData(data, selectedFormat)
        setInputData(data)
        setCurrentStep(2)
        setTableData(newTableData)
        saveToHistory(newTableData, data)
      }
      reader.readAsText(file)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "preview" && inputData) {
      setCurrentStep(3)
    }
  }

  const handleInputChange = (value: string) => {
    const newTableData = value ? parseInputData(value, selectedFormat) : []
    setInputData(value)
    if (value) {
      setCurrentStep(2)
      setTableData(newTableData)
    } else {
      setTableData([])
      setCurrentStep(1)
    }
    if (!isUndoRedoOperation) {
      saveToHistory(newTableData, value)
    }
  }

  // コピー機能
  const handleCopy = async (format: string) => {
    const output = generateOutput(format, tableData)
    try {
      await navigator.clipboard.writeText(output)
      setCopiedFormat(format)
      toast({
        title: t("messages.copied"),
        description: `${formats.find((f) => f.value === format)?.label}${t("messages.copiedDesc")}`,
      })
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch (err) {
      toast({
        title: t("messages.copyFailed"),
        description: t("messages.copyFailedDesc"),
        variant: "destructive",
      })
    }
  }

  // ダウンロード機能
  const handleDownload = (format: string) => {
    const output = generateOutput(format, tableData)
    const formatInfo = formats.find((f) => f.value === format)
    if (!formatInfo) return

    const blob = new Blob([output], { type: formatInfo.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `table_data.${formatInfo.extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: t("messages.downloaded"),
      description: `${formatInfo.label}${t("messages.downloadedDesc")}`,
    })
  }

  const handleTableExpand = () => {
    setIsTableExpanded(!isTableExpanded)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header - 拡大時は隠す */}
            {!isTableExpanded && (
              <>
                <Header />
                <StepBar currentStep={currentStep} />
              </>
            )}

            {/* 拡大時は全画面レイアウト、通常時は2カラムレイアウト */}
            <div className={isTableExpanded ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
              {/* Left Panel - Input/Preview */}
              <Card
                className={`bg-white/90 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 ${
                  isTableExpanded ? "h-[calc(100vh-2rem)]" : ""
                }`}
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    {t("panels.input")}
                    {isTableExpanded && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTableExpand}
                        className="ml-auto bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 hover:from-gray-600 hover:to-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t("buttons.close")}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className={`p-6 ${isTableExpanded ? "h-[calc(100%-5rem)] overflow-hidden" : ""}`}>
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                      <TabsTrigger
                        value="input"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                      >
                        {t("panels.inputTab")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        disabled={!inputData}
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 disabled:opacity-50"
                      >
                        {t("panels.previewTab")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="input" className="space-y-6 mt-6">
                      <InputPanel
                        selectedFormat={selectedFormat}
                        setSelectedFormat={setSelectedFormat}
                        inputData={inputData}
                        onInputChange={handleInputChange}
                        onSampleData={handleSampleData}
                        onClear={handleClear}
                        onFileUpload={handleFileUpload}
                      />
                    </TabsContent>

                    <TabsContent
                      value="preview"
                      className={`space-y-6 mt-6 ${isTableExpanded ? "h-[calc(100%-4rem)]" : ""}`}
                    >
                      <PreviewPanel
                        tableData={tableData}
                        setTableData={setTableData}
                        updateInputData={updateInputData}
                        saveToHistory={saveToHistory}
                        handleUndo={() => {
                          const prevState = handleUndo()
                          if (prevState) {
                            setTableData(prevState.tableData)
                            setInputData(prevState.inputData)
                            clearSelection()
                          }
                        }}
                        handleRedo={() => {
                          const nextState = handleRedo()
                          if (nextState) {
                            setTableData(nextState.tableData)
                            setInputData(nextState.inputData)
                            clearSelection()
                          }
                        }}
                        historyIndex={historyIndex}
                        historyLength={history.length}
                        isTableExpanded={isTableExpanded}
                        onTableExpand={handleTableExpand}
                        inputData={inputData}
                        selectedFormat={selectedFormat}
                        parseInputData={parseInputData}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Right Panel - Output - 拡大時は隠す */}
              {!isTableExpanded && (
                <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      {t("panels.output")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <OutputPanel
                      tableData={tableData}
                      outputFormat={outputFormat}
                      setOutputFormat={setOutputFormat}
                      generateOutput={generateOutput}
                      handleCopy={handleCopy}
                      handleDownload={handleDownload}
                      copiedFormat={copiedFormat}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* How to Use - 拡大時は隠す */}
            {!isTableExpanded && <HowToUse />}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
