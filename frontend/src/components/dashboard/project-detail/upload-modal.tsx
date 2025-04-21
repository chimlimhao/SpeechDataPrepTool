"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadIcon, FolderUp } from "lucide-react"
import type { AudioFile } from "@/types/database.types"
import { IndividualUpload } from "./upload/individual-upload"
import { FolderUpload } from "./upload/folder-upload"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onFileUploaded: (file: AudioFile) => void
}

export function UploadModal({ isOpen, onClose, projectId, onFileUploaded }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState("individual")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upload Audio Files</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="individual" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="folder" className="flex items-center gap-2">
              <FolderUp className="h-4 w-4" />
              Folder
            </TabsTrigger>
            {/* <TabsTrigger value="record" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Record
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="individual" className="mt-6">
            <IndividualUpload projectId={projectId} onFileUploaded={onFileUploaded} />
          </TabsContent>

          <TabsContent value="folder" className="mt-6">
            <FolderUpload projectId={projectId} onFileUploaded={onFileUploaded} />
          </TabsContent>

          <TabsContent value="record" className="mt-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
              <p className="text-lg font-medium text-center">Record audio directly</p>
              <p className="text-sm text-muted-foreground text-center">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted-foreground mt-4">
          I understand that these files will be processed according to the selected settings.
        </p>
      </DialogContent>
    </Dialog>
  )
}

