"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Grid, List, Play, AlertCircle, X, Maximize2, Minimize2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn, formatDuration, formatFileSize } from "@/lib/utils"
import type { AudioFile } from "@/types/database.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AudioFileDetails } from "./audio-file-details"

interface AudioFileListProps {
  files: AudioFile[]
  onProcessFile: (fileId: string) => void
  onViewModeChange?: (mode: "list" | "grid") => void
  viewMode?: "list" | "grid"
  selectedFile: AudioFile | null
  onSelectFile: (file: AudioFile | null) => void
  isExpanded: boolean
}

export function AudioFileList({ 
  files, 
  onProcessFile, 
  onViewModeChange, 
  viewMode = "list",
  selectedFile,
  onSelectFile,
  isExpanded
}: AudioFileListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileClick = (file: AudioFile) => {
    if (selectedFile && selectedFile.id === file.id && isExpanded) {
      onSelectFile(null);
    } else {
      onSelectFile(file);
    }
  }

  const closeFileDetails = () => {
    onSelectFile(null)
  }

  return (
    <div className="h-full">
      {/* Search and View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange?.("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange?.("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="rounded-md border ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-[48px]">File Name</TableHead>
              <TableHead className="h-[48px]">Duration</TableHead>
              <TableHead className="h-[48px]">Size</TableHead>
              <TableHead className="h-[48px]">Format</TableHead>
              <TableHead className="h-[48px]">Status</TableHead>
              <TableHead className="h-[48px]">Date Added</TableHead>
              <TableHead className="h-[48px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow 
                key={file.id} 
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  selectedFile?.id === file.id && "bg-muted",
                  selectedFile?.id === file.id && isExpanded && "border-l-4 border-l-primary"
                )} 
                onClick={() => handleFileClick(file)}
              >
                <TableCell className="font-medium h-[56px] align-middle">{file.file_name}</TableCell>
                <TableCell className="h-[56px] align-middle">{file.duration ? formatDuration(file.duration) : '-'}</TableCell>
                <TableCell className="h-[56px] align-middle">{formatFileSize(file.file_size)}</TableCell>
                <TableCell className="h-[56px] align-middle">{file.format?.toUpperCase() || '-'}</TableCell>
                <TableCell className="h-[56px] align-middle">
                  <span 
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs inline-flex items-center justify-center",
                      {
                        'bg-green-100 text-green-600': file.transcription_status === 'completed',
                        'bg-orange-100 text-orange-600': file.transcription_status === 'pending',
                        'bg-blue-100 text-blue-600': file.transcription_status === 'processing',
                        'bg-red-100 text-red-600': file.transcription_status === 'failed'
                      }
                    )}
                  >
                    {file.transcription_status.charAt(0).toUpperCase() + file.transcription_status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="h-[56px] align-middle">{new Date(file.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="h-[56px] align-middle">
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onProcessFile(file.id)
                            }}
                            disabled={file.transcription_status === 'processing' || file.transcription_status === 'completed'}
                          >
                            {file.transcription_status === 'failed' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {file.transcription_status === 'completed' 
                            ? 'Already processed'
                            : file.transcription_status === 'processing'
                            ? 'Processing in progress'
                            : file.transcription_status === 'failed'
                            ? 'Retry processing'
                            : 'Process file'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (selectedFile?.id === file.id && isExpanded) {
                                onSelectFile(null)
                              } else {
                                onSelectFile(file)
                              }
                            }}
                          >
                            {selectedFile?.id === file.id && isExpanded ? (
                              <Minimize2 className="h-4 w-4" />
                            ) : (
                              <Maximize2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedFile?.id === file.id && isExpanded ? 'Collapse details' : 'Expand details'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredFiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No files found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AudioFileList

