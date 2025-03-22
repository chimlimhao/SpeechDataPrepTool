import { Button } from "@/components/ui/button"
import { FolderUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAudioUpload } from "@/hooks/use-audio-upload"
import { Progress } from "@/components/ui/progress"
import type { AudioFile } from "@/types/database.types"
import JSZip from 'jszip'

interface FolderUploadProps {
  projectId: string
  onFileUploaded: (file: AudioFile) => void
}

export function FolderUpload({ projectId, onFileUploaded }: FolderUploadProps) {
  const { 
    isUploading, 
    uploadProgress, 
    totalFiles, 
    processedFiles,
    uploadFile,
    setIsUploading,
    setUploadProgress,
    setTotalFiles,
    setProcessedFiles,
  } = useAudioUpload(projectId, onFileUploaded)
  const { toast } = useToast()

  const handleZipUpload = async (zipFile: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setProcessedFiles(0)
      console.log('Starting zip upload process for file:', zipFile.name)

      const zip = new JSZip()
      console.log('Loading zip file...')
      const contents = await zip.loadAsync(zipFile)
      
      const audioFiles = Object.values(contents.files).filter(file => 
        !file.dir && /\.(mp3|wav|m4a|flac)$/i.test(file.name)
      )

      setTotalFiles(audioFiles.length)

      if (audioFiles.length === 0) {
        toast({
          title: "Error",
          description: "No audio files found in the zip file",
          variant: "destructive",
        })
        return
      }

      let successCount = 0
      let failCount = 0

      for (let index = 0; index < audioFiles.length; index++) {
        const zipEntry = audioFiles[index];
        try {
          const blob = await zipEntry.async("blob")
          const file = new File([blob], zipEntry.name, { 
            type: `audio/${zipEntry.name.split('.').pop()?.toLowerCase()}` 
          })
          
          await uploadFile(file)
          successCount++
        } catch (error) {
          console.error(`Error processing ${zipEntry.name}:`, error)
          failCount++
          toast({
            title: "Error",
            description: `Failed to process ${zipEntry.name}`,
            variant: "destructive",
          })
        } finally {
          setProcessedFiles(prev => prev + 1)
          setUploadProgress(((index + 1) / audioFiles.length) * 100)
        }
      }

      toast({
        title: successCount > 0 ? "Success" : "Complete with Errors",
        description: `Processed ${audioFiles.length} files: ${successCount} succeeded, ${failCount} failed`,
        variant: successCount > 0 ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error processing zip file:", error)
      toast({
        title: "Error",
        description: "Failed to process zip file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setProcessedFiles(0)
      setTotalFiles(0)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Error",
        description: "Please upload a zip file",
        variant: "destructive",
      })
      return
    }
    await handleZipUpload(file)
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
      <p className="text-lg font-medium text-center">Upload a zip file containing audio files</p>
      <p className="text-sm text-muted-foreground text-center">
        Max total size: 500MB
        <br />
        Supported formats inside zip: mp3, wav, m4a, flac
      </p>
      {isUploading && (
        <div className="w-full space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            Processing {processedFiles} of {totalFiles} files ({Math.round(uploadProgress)}%)
          </p>
        </div>
      )}
      <Button 
        asChild 
        variant="secondary" 
        size="lg" 
        className="mt-4"
        disabled={isUploading}
      >
        <label className="cursor-pointer">
          <FolderUp className="mr-2 h-4 w-4" />
          {isUploading ? 'Processing...' : 'Select Zip File'}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".zip"
          />
        </label>
      </Button>
    </div>
  )
} 