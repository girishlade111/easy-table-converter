"use client"

import { Table, Sparkles, ArrowUpDown, Search, Info, Globe } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <TooltipProvider>
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
          <Table className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("subtitle")}</p>

        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t("features.formats")}</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-blue-500 hover:text-blue-600 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                <p>{t("features.formatsDesc")}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
              <ArrowUpDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t("features.sorting")}</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-green-500 hover:text-green-600 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                <p>{t("features.sortingDesc")}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">{t("features.search")}</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-purple-500 hover:text-purple-600 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                <p>{t("features.searchDesc")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
