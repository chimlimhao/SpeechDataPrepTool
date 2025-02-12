"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileAudio, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface AudioFile {
  id: number
  name: string
  duration: string
  size: string
  project: string
  status: "transcribed" | "in-progress" | "pending"
  dateAdded: string
}

interface AudioFileListProps {
  onSelectFile: (fileName: string) => void
  isGrid?: boolean
  projectId?: string | null
}

// Initial sample data (unchanged)
const initialAudioFiles: AudioFile[] = [
  {
    id: 1,
    name: "KM_NEWS_20240128_001.wav",
    duration: "05:30",
    size: "12.5 MB",
    project: "Khmer News Transcription",
    status: "transcribed",
    dateAdded: "2024-01-28",
  },
  {
    id: 2,
    name: "KM_FOLK_TALE_MONI_MEKHALA.wav",
    duration: "08:15",
    size: "18.8 MB",
    project: "Folk Tales Collection",
    status: "in-progress",
    dateAdded: "2024-01-27",
  },
  {
    id: 3,
    name: "KM_MED_DIABETES_TERMS.wav",
    duration: "03:45",
    size: "8.2 MB",
    project: "Medical Terminology",
    status: "transcribed",
    dateAdded: "2024-01-26",
  },
  {
    id: 4,
    name: "KM_NEWS_20240128_002.wav",
    duration: "04:20",
    size: "10.1 MB",
    project: "Khmer News Transcription",
    status: "pending",
    dateAdded: "2024-01-28",
  },
  {
    id: 5,
    name: "KM_FOLK_TALE_TONSAY.wav",
    duration: "06:50",
    size: "15.7 MB",
    project: "Folk Tales Collection",
    status: "in-progress",
    dateAdded: "2024-01-25",
  },
  {
    id: 6,
    name: "KM_MED_CARDIOLOGY_TERMS.wav",
    duration: "07:30",
    size: "17.2 MB",
    project: "Medical Terminology",
    status: "pending",
    dateAdded: "2024-01-24",
  },
]

const getStatusColor = (status: AudioFile["status"]) => {
  switch (status) {
    case "transcribed":
      return "bg-green-500/10 text-green-700 border-green-500/20"
    case "in-progress":
      return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    case "pending":
      return "bg-orange-500/10 text-orange-700 border-orange-500/20"
    default:
      return ""
  }
}

export function AudioFileList({ onSelectFile, isGrid = false, projectId }: AudioFileListProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>(initialAudioFiles)
  const [filteredFiles, setFilteredFiles] = useState<AudioFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchSize, setBatchSize] = useState(10)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (projectId) {
      setFilteredFiles(audioFiles.filter((file) => file.project === projectId))
    } else {
      setFilteredFiles(audioFiles)
    }
  }, [projectId, audioFiles])

  const startBatchProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)
    const totalBatches = Math.ceil(filteredFiles.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * batchSize
      const batchEnd = Math.min((i + 1) * batchSize, filteredFiles.length)
      const batch = filteredFiles.slice(batchStart, batchEnd)

      // Simulating processing each file in the batch
      for (const file of batch) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulating file processing
        setAudioFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "transcribed" } : f)))
      }

      setProgress(((i + 1) / totalBatches) * 100)
    }

    setIsProcessing(false)
    toast({
      title: "Batch Processing Complete",
      description: `Processed ${filteredFiles.length} files.`,
    })
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <FileAudio className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No audio files</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload audio files to get started.</p>
        </div>
      </div>
    )
  }

  const batchProcessingControls = (
    <div className="space-y-4 mt-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="batch-size">Batch Size:</Label>
        <Input
          id="batch-size"
          type="number"
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
          className="w-20"
        />
        <Button onClick={startBatchProcessing} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Start Batch Processing"}
          {!isProcessing && <Play className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
      )}
    </div>
  )

  if (isGrid) {
    return (
      <div className="space-y-4">
        {batchProcessingControls}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelectFile(file.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <Badge variant="outline" className={cn("ml-2 capitalize", getStatusColor(file.status))}>
                    {file.status}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">Duration: {file.duration}</p>
                  <p className="text-sm text-muted-foreground">Size: {file.size}</p>
                  <p className="text-sm text-muted-foreground">Added: {file.dateAdded}</p>
                  <Badge variant="secondary" className="mt-2">
                    {file.project}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {batchProcessingControls}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow
                key={file.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectFile(file.name)}
              >
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{file.duration}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{file.project}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", getStatusColor(file.status))}>
                    {file.status}
                  </Badge>
                </TableCell>
                <TableCell>{file.dateAdded}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AudioFileList

