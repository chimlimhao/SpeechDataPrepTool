import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAudioUpload } from "@/hooks/use-audio-upload"
import type { AudioFile } from "@/types/database.types"

interface IndividualUploadProps {
  projectId: string
  onFileUploaded: (file: AudioFile) => void
}

export function IndividualUpload({ projectId, onFileUploaded }: IndividualUploadProps) {
  const { uploadFile } = useAudioUpload(projectId, onFileUploaded)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    for (const file of Array.from(files)) {
      try {
        // Check if file is wav
        if (!file.name.toLowerCase().endsWith('.wav')) {
          toast({
            title: "Invalid Format",
            description: `${file.name} is not a WAV file. Only WAV files are supported.`,
            variant: "destructive",
          })
          continue
        }

        await uploadFile(file)
        toast({
          title: "Success",
          description: `Uploaded ${file.name} successfully`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4">
      <p className="text-lg font-medium text-center">Upload individual audio files</p>
      <p className="text-sm text-muted-foreground text-center">
        Max file size: --
        <br />
        Format: WAV only (.wav)
      </p>
      <Button asChild variant="secondary" size="lg" className="mt-4">
        <label className="cursor-pointer bg-teal-500 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 hover:text-black">
          <UploadIcon className="mr-2 h-4 w-4" />
          Select Files
          <input type="file" className="hidden" onChange={handleFileChange} multiple accept=".wav,audio/wav" />
        </label>
      </Button>
    </div>
  )
} 