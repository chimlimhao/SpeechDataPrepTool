"use client"

import { useState } from "react"
import { PlusCircle, Folder, MoreVertical, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  name: string
  description: string
  progress: number
  lastUpdated: string
}

interface DashboardProps {
  onSelectProject: (projectId: string) => void
}

const initialProjects: Project[] = [
  {
    id: "Khmer News Transcription",
    name: "Khmer News Transcription",
    description: "Transcribing daily news broadcasts",
    progress: 65,
    lastUpdated: "2023-05-15",
  },
  {
    id: "Folk Tales Collection",
    name: "Folk Tales Collection",
    description: "Collecting and transcribing traditional Khmer folk tales",
    progress: 30,
    lastUpdated: "2023-05-10",
  },
  {
    id: "Medical Terminology",
    name: "Medical Terminology",
    description: "Building a corpus of medical terms in Khmer",
    progress: 80,
    lastUpdated: "2023-05-12",
  },
]

export function Dashboard({ onSelectProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const { toast } = useToast()

  const handleCreateProject = () => {
    const project: Project = {
      id: newProject.name,
      name: newProject.name,
      description: newProject.description,
      progress: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    }
    setProjects([...projects, project])
    setNewProject({ name: "", description: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to your Khmer Speech Tool dashboard.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => onSelectProject(project.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Delete Project</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription>{project.description}</CardDescription>
              <div className="mt-4">
                <Progress value={project.progress} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">{project.progress}% complete</p>
              </div>
              <div className="mt-4 flex items-center">
                <Folder className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">Last updated: {project.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

