import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { AudioFile } from "@/types/database.types"
import { useProject } from "@/providers/project.provider"
import { useState } from "react"

export function useProjectActions() {
  const { toast } = useToast()
  const { triggerProjectProcessing } = useProject()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcessFile = async (fileId: string) => {
    try {
      // Update file status to processing
      const { error: updateError } = await supabase
        .from('audio_files')
        .update({ transcription_status: 'processing' })
        .eq('id', fileId)

      if (updateError) throw updateError

      // TODO: Call your transcription service here
      // For now, we'll simulate processing with a timeout
      setTimeout(async () => {
        const { error } = await supabase
          .from('audio_files')
          .update({
            transcription_status: 'completed',
            transcription_content: 'Sample transcription content'
          })
          .eq('id', fileId)

        if (error) {
          console.error('Error updating transcription status:', error)
        }
      }, 3000)

      toast({
        title: "Processing Started",
        description: "The file is being processed",
      })
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      })
    }
  }

  const handleProcessAll = async (audioFiles: AudioFile[], projectId: string) => {
    const pendingFiles = audioFiles.filter(
      file => file.transcription_status === 'pending' || file.transcription_status === 'failed'
    )
    
    if (pendingFiles.length === 0) {
      toast({
        title: "No files to process",
        description: "All files have been processed or are currently processing",
      })
      return
    }

    if (isProcessing) {
      toast({
        title: "Processing in Progress",
        description: "Please wait for the current processing to complete",
      })
      return
    }

    try {
      setIsProcessing(true)
      
      // Update all pending files status to processing
      // await Promise.all(
      //   pendingFiles.map(file =>
      //     supabase
      //       .from('audio_files')
      //       .update({ transcription_status: 'processing' })
      //       .eq('id', file.id)
      //   )
      // )

      // Trigger backend processing
      await triggerProjectProcessing(projectId)
      
      toast({
        title: "Processing Started",
        description: `Started processing ${pendingFiles.length} files`,
      })
    } catch (error) {
      console.error('Error triggering project processing:', error)
      
      // Revert files back to pending status
      await Promise.all(
        pendingFiles.map(file =>
          supabase
            .from('audio_files')
            .update({ transcription_status: 'pending' })
            .eq('id', file.id)
        )
      )

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start project processing",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    handleProcessFile,
    handleProcessAll,
    isProcessing
  }
} 