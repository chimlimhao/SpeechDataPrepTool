"use client"

import { useState } from "react"
import { Layout, FileAudio, Settings2, HelpCircle, ChevronLeft, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AudioFileList } from "@/components/audio-file-list"
import { AudioFileDetails } from "@/components/audio-file-details"
import { DatasetStats } from "@/components/dataset-stats"
import { Dashboard } from "@/components/dashboard"
import { cn } from "@/lib/utils"
import { UploadModal, type UploadSettings } from "./upload-modal"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", icon: Layout, href: "dashboard" },
  { name: "Files", icon: FileAudio, href: "files" },
  { name: "Dataset Stats", icon: Settings2, href: "stats" },
  { name: "Help", icon: HelpCircle, href: "help" },
  { name: "Profile", icon: User, href: "profile" },
]

export function KhmerSpeechTool() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab !== "files") {
      setSelectedProject(null)
      setSelectedFile(null)
    }
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId)
    setActiveTab("files")
    setSelectedFile(null)
  }

  const handleFileClick = (fileName: string) => {
    setSelectedFile(selectedFile === fileName ? null : fileName)
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    setActiveTab("dashboard")
    setSelectedFile(null)
  }

  const handleUpload = (files: FileList, settings: UploadSettings) => {
    // Basic file upload logic without backend integration
    const fileNames = Array.from(files).map((file) => file.name)
    toast({
      title: "Files Uploaded",
      description: `Uploaded ${fileNames.length} file(s): ${fileNames.join(", ")}`,
    })
    console.log("Upload settings:", settings)
    // Here you would typically update your state with the new files
    // and start processing them based on the settings
  }

  const handleLogout = () => {
    // Here you would typically handle logout logic
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-56 border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="text-lg font-semibold">Khmer Speech Tool</h1>
        </div>
        <nav className="space-y-1 px-2 py-3">
          {navigation.map((item) => (
            <button
              key={item.href}
              onClick={() => handleTabChange(item.href)}
              className={cn(
                "flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
                activeTab === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-x-4 border-b px-4">
          {activeTab === "files" && selectedProject && (
            <Button variant="ghost" size="sm" onClick={handleBackToProjects} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          )}
          <Input
            type="search"
            placeholder={
              activeTab === "files" ? "Search files..." : activeTab === "dashboard" ? "Search projects..." : "Search..."
            }
            className="w-80"
          />
          {activeTab === "files" && selectedProject && (
            <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)} className="ml-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          )}
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            {activeTab === "dashboard" && <Dashboard onSelectProject={handleSelectProject} />}
            {activeTab === "files" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedProject ? `Files - ${selectedProject}` : "All Files"}</h2>
                  <div className="flex items-center gap-x-2">
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      List View
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      Grid View
                    </Button>
                  </div>
                </div>
                <AudioFileList
                  onSelectFile={handleFileClick}
                  isGrid={viewMode === "grid"}
                  projectId={selectedProject}
                />
              </div>
            )}
            {activeTab === "stats" && <DatasetStats projectId={selectedProject} />}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">User Profile</h2>
                <p>Manage your account settings and preferences here.</p>
                {/* Add more user management features here */}
              </div>
            )}
          </main>

          {/* Right Details Panel */}
          {selectedFile && activeTab === "files" && (
            <aside className="w-80 border-l overflow-y-auto">
              <AudioFileDetails fileName={selectedFile} projectName={selectedProject || undefined} />
            </aside>
          )}
        </div>
      </div>
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
    </div>
  )
}

