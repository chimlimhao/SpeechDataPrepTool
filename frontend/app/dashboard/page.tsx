"use client"

import { Dashboard } from "@/components/dashboard/dashboard"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  const handleSelectProject = (projectId: string) => {
    // Navigate to project details page
    router.push(`/dashboard/projects/${projectId}`)
  }

  return (
    <div className="p-8">
      <Dashboard onSelectProject={handleSelectProject} />
    </div>
  )
}

