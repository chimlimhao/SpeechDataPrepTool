import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { AudioFile } from "@/types/database.types"
import { useProject } from "@/providers/project.provider"

export function useProjectActions() {
  const { toast } = useToast()
  const { triggerProjectProcessing } = useProject()

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

    try {
      await triggerProjectProcessing(projectId)
      
      toast({
        title: "Processing Started",
        description: `Started processing ${pendingFiles.length} files`,
      })
    } catch (error) {
      console.error('Error triggering project processing:', error)
      toast({
        title: "Error",
        description: "Failed to start project processing",
        variant: "destructive",
      })
    }
  }

  return {
    handleProcessFile,
    handleProcessAll,
  }
} 