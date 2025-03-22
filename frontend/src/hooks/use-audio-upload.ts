import { useState } from "react"
import { useProject } from "@/providers/project.provider"
import { useToast } from "@/hooks/use-toast"
import type { AudioFile } from "@/types/database.types"

export function useAudioUpload(projectId: string, onFileUploaded: (file: AudioFile) => void) {
  const { addAudioFile } = useProject()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [processedFiles, setProcessedFiles] = useState(0)

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.round(audio.duration));
      });
      audio.addEventListener('error', reject);
      audio.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    console.log(`Uploading file: ${file.name}`)
    
    try {
      const duration = await getAudioDuration(file)
      console.log(`Duration for ${file.name}:`, duration)
      
      const objectUrl = URL.createObjectURL(file)
      
      try {
        const audioFile = await addAudioFile(projectId, file, duration)
        console.log("File uploaded successfully:", audioFile)
        onFileUploaded(audioFile)
        return audioFile
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    } catch (error) {
      console.error("Error uploading file:", file.name, error)
      throw error
    }
  }

  return {
    isUploading,
    uploadProgress,
    totalFiles,
    processedFiles,
    uploadFile,
    setIsUploading,
    setUploadProgress,
    setTotalFiles,
    setProcessedFiles,
  }
} 