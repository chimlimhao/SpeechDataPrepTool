"use client"

// import { Bar } from "react-chartjs-2"
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileAudio } from "lucide-react"
import { formatDuration, formatFileSize } from "@/lib/utils"
import type { Project } from "@/types/database.types"

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: "top" as const,
//     },
//     title: {
//       display: true,
//       text: "Dataset Statistics",
//     },
//   },
// }

// const labels = ["0-30s", "30s-1m", "1m-2m", "2m-5m", "5m+"]

// const data = {
//   labels,
//   datasets: [
//     {
//       label: "Number of Audio Files",
//       data: [65, 59, 80, 81, 56],
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//     },
//   ],
// }

interface DatasetStatsProps {
  project: Project
}

export function DatasetStats({ project }: DatasetStatsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dataset Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-dashed rounded-lg p-4">
        <div className="flex items-center gap-3 p-4 rounded-lg border border-teal-500">
          <FileAudio className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Total Files</p>
            <p className="text-2xl font-bold">{project.total_files}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-teal-500">
          <div>
            <p className="text-sm font-medium">Total Size</p>
            <p className="text-2xl font-bold">{formatFileSize(project.total_size)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-teal-500">
          <div>
            <p className="text-sm font-medium">Total Duration</p>
            <p className="text-2xl font-bold">{project.total_duration ? formatDuration(project.total_duration) : '0:00'}</p>
          </div>
        </div>
      </div>

      {/* <Card>
        <CardContent className="pt-6">
          <Bar options={options} data={data} />
        </CardContent>
      </Card> */}
    </div>
  )
}

