"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Folder, MoreVertical, AlertCircle, Link } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProject } from "@/providers/project.provider"
import { Separator } from "@/components/ui/separator"
interface DashboardProps {
  onSelectProject: (projectId: string) => void
}

export function Dashboard({ onSelectProject }: DashboardProps) {
  const { projects, loading, error, createProject, updateProject, deleteProject, getProjectById, getUserProjects } = useProject()
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      await getUserProjects()

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      })
    } finally {

    }
  }

  const handleCreateProject = async () => {
    if (projects.length >= 3) {
      toast({
        title: "Project limit reached",
        description: "You can only create up to 3 projects",
        variant: "destructive",
      })
      return
    }

    try {
      const project = await createProject(newProject.name, newProject.description)
      setNewProject({ name: "", description: "" })
      setIsDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Project created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Dashboard</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={projects.length >= 3} className="bg-teal-500 mb-6 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to your Somleng dashboard.</DialogDescription>
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
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject} className="bg-teal-500 mb-6 text-white rounded-md border-2 border-green-700 shadow-md hover:bg-teal-600 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">Create Project</Button>
             
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="border-teal-500"/>

      {projects.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Folder className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground mt-2">Create your first project to get started</p>
        </div>
      ) : (
        <>
          {projects.length >= 3 && (
            <Alert className="border border-red-500 text-black">
              <AlertCircle className="h-4 w-4" style={{ color: 'red' }} />
              <AlertTitle className="text-red-500">Project Limit Reached</AlertTitle>
              <AlertDescription className="text-red-500">
                You have reached the maximum limit of 3 projects. Delete an existing project to create a new one.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-colors hover:bg-accent/50 border border-teal-500"
                onClick={() => onSelectProject(project.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }} 
                        className="text-red-500 focus:text-red-500 focus:bg-red-50"
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <Separator/>
                <CardContent>
                  <CardDescription>{project.description}</CardDescription>
                  <div className="mt-4">
                    <Progress value={project.progress} className="h-2" />
                    <p className="mt-2 text-xs text-muted-foreground ">{project.progress}% complete</p>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Folder className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-xs text-muted-foreground">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

