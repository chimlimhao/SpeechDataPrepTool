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
      
      // Only accept WAV files
      const audioFiles = Object.values(contents.files).filter(file => 
        !file.dir && file.name.toLowerCase().endsWith('.wav')
      )

      setTotalFiles(audioFiles.length)

      if (audioFiles.length === 0) {
        toast({
          title: "Error",
          description: "No WAV files found in the zip file. Only WAV files are supported.",
          variant: "destructive",
        })
        return
      }

      let successCount = 0
      let failCount = 0
      let nonWavFilesFound = false

      // Check if there are any non-WAV files in the zip
      const allFiles = Object.values(contents.files).filter(file => !file.dir)
      if (allFiles.length > audioFiles.length) {
        nonWavFilesFound = true
      }

      for (let index = 0; index < audioFiles.length; index++) {
        const zipEntry = audioFiles[index];
        try {
          const blob = await zipEntry.async("blob")
          const file = new File([blob], zipEntry.name, { 
            type: 'audio/wav'
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

      if (nonWavFilesFound) {
        toast({
          title: "Warning",
          description: "Some non-WAV files were found in the zip and were ignored.",
          variant: "default",
        })
      }

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${successCount} files. ${failCount} files failed.`,
        variant: successCount > 0 ? "default" : "destructive",
      })
    } catch (error) {
      console.error('Error processing zip file:', error)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Error",
        description: "Please select a ZIP file",
        variant: "destructive",
      })
      return
    }
    
    handleZipUpload(file)
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
      <p className="text-lg font-medium text-center">Upload a zip file containing audio files</p>
      <p className="text-sm text-muted-foreground text-center">
        Max total size: --
        <br />
        Format: WAV files only (.wav)
      </p>
      {isUploading && (
        <div className="w-full space-y-2">
          {/* <Progress value={uploadProgress} className="w-full" /> */}
          <p className="text-sm text-center text-muted-foreground">
            Processing {Math.round(processedFiles / 2)}
          </p>
        </div>
      )}
      <Button 
        asChild 
        variant="secondary" 
        size="lg" 
        className="mt-4 bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
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