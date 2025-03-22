"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Grid, List, Play, AlertCircle, PlayCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn, formatDuration, formatFileSize } from "@/lib/utils"
import type { AudioFile } from "@/types/database.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AudioFileListProps {
  files: AudioFile[]
  onProcessFile: (fileId: string) => void
  onViewModeChange?: (mode: "list" | "grid") => void
  viewMode?: "list" | "grid"
}

export function AudioFileList({ files, onProcessFile, onViewModeChange, viewMode = "list" }: AudioFileListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{file.file_name}</TableCell>
                <TableCell>{file.duration ? formatDuration(file.duration) : '-'}</TableCell>
                <TableCell>{formatFileSize(file.file_size)}</TableCell>
                <TableCell>{file.format?.toUpperCase() || '-'}</TableCell>
                <TableCell>
                  <span 
                    className={cn(
                      "px-2 py-1 rounded-full text-xs",
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
                <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
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

