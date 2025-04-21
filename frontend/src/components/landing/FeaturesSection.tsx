import { Button } from "@/components/ui/button"
import { Folder, Database, FileAudio, Download } from "lucide-react"
import FeatureCard from "./FeatureCard"

export function FeaturesSection() {
  return (
    <section className="py-8 sm:py-12 md:py-20">
      <div className="flex justify-center">
        <Button
          variant="secondary"
          className="text-center rounded-full focus-visible:ring-2 text-xs sm:text-sm font-medium shadow-md"
        >
          Key Features
        </Button>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Transform with Unrivaled Accuracy & Speed
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-md leading-6 sm:leading-8 text-gray-600">
            Effortlessly transcribe single recordings or process entire libraries of Khmer audio with our advanced AI-powered speech recognition and efficient batch processing capabilities.
          </p>
        </div>
      </div>

      <div className="flex justify-center px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 max-w-4xl w-full">
          <FeatureCard
            icon={<Folder className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-500" />}
            title="Project Management"
            description="Able to manage the project and the audio files"
            delay={0.2}
          />
          <FeatureCard
            icon={<Database className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-500" />}
            title="Bulk Upload"
            description="Able to upload multiple audio files at once"
            delay={0.4}
          />
          <FeatureCard
            icon={<FileAudio className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-500" />}
            title="Dataset Processing"
            description="Able to process the dataset and the audio files by cleaning and transcribing it."
            delay={0.6}
          />
          <FeatureCard
            icon={<Download className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-500" />}
            title="Export Options"
            description="Export transcriptions in multiple formats for easy sharing"
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
} 