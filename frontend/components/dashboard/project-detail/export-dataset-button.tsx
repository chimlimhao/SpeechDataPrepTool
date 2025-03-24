"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useProject } from "@/providers/project.provider"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportDatasetButtonProps {
  projectId: string
  projectName: string
  disabled?: boolean
}

export function ExportDatasetButton({ 
  projectId,
  projectName,
  disabled = false 
}: ExportDatasetButtonProps) {
  const { exportProjectDataset } = useProject()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (includeProcessed: boolean = true) => {
    try {
      setIsExporting(true)
      const blob = await exportProjectDataset(projectId, includeProcessed)
      
      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const sanitizedName = projectName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      a.href = url
      a.download = `${sanitizedName}_dataset.zip`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Export Complete",
        description: "Your dataset has been exported successfully.",
      })
    } catch (error) {
      console.error('Error exporting dataset:', error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export dataset.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Dataset
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport(true)}
          disabled={isExporting}
        >
          Export Completed Files Only
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport(false)}
          disabled={isExporting}
        >
          Export All Files
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 