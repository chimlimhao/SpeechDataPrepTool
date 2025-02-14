"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Pencil, Keyboard, UploadIcon, BookmarkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: FileList, settings: UploadSettings) => void
}

export interface UploadSettings {
  uploadType: "individual" | "folder"
  transcriptionLanguage: string
  cleanAudio: boolean
  removeBackground: boolean
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState("individual")
  const [cleanAudio, setCleanAudio] = useState(false)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("auto")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      onUpload(files, {
        uploadType: activeTab as "individual" | "folder",
        transcriptionLanguage,
        cleanAudio,
        removeBackground,
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upload Audio Files</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="individual" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="folder" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Folder
            </TabsTrigger>
            <TabsTrigger value="record" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Record
            </TabsTrigger>
            {/* <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4" />
              Saved
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="individual" className="mt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
              <p className="text-lg font-medium text-center">Upload individual audio files</p>
              <p className="text-sm text-muted-foreground text-center">
                Max file size: 50MB
                <br />
                mp3, wav, m4a, flac
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-4">
                <label className="cursor-pointer">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Select Files
                  <input type="file" className="hidden" onChange={handleFileChange} multiple accept="audio/*" />
                </label>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="folder" className="mt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
              <p className="text-lg font-medium text-center">Upload a folder of audio files</p>
              <p className="text-sm text-muted-foreground text-center">
                Max total size: 500MB
                <br />
                All files must be audio format
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-4">
                <label className="cursor-pointer">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Select Folder
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    // webkitdirectory="true"
                    // directory="true"
                  />
                </label>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="record" className="mt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
              <p className="text-lg font-medium text-center">Record audio directly</p>
              <p className="text-sm text-muted-foreground text-center">Click the button below to start recording</p>
              <Button variant="secondary" size="lg" className="mt-4">
                Start Recording
              </Button>
            </div>
          </TabsContent>

          {/* <TabsContent value="saved" className="mt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
              <p className="text-lg font-medium text-center">No saved audio files</p>
              <p className="text-sm text-muted-foreground text-center">Previously uploaded files will appear here</p>
            </div>
          </TabsContent> */}
        </Tabs>

        {/* <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="language">Transcription Language</Label>
            <Select defaultValue="auto" onValueChange={(e: string) => setTranscriptionLanguage(e)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="km">Khmer</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clean-audio"
              checked={cleanAudio}
              onCheckedChange={(checked: boolean) => setCleanAudio(checked)}
            />
            <Label htmlFor="clean-audio">Clean audio and remove noise</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-background"
              checked={removeBackground}
              onCheckedChange={(checked: boolean) => setRemoveBackground(checked)}
            />
            <Label htmlFor="remove-background">Remove background noise</Label>
          </div>
        </div> */}

        <p className="text-sm text-muted-foreground mt-4">
          I understand that these files will be processed according to the selected settings.
        </p>
      </DialogContent>
    </Dialog>
  )
}

