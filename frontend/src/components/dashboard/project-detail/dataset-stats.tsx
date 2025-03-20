"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Dataset Statistics",
    },
  },
}

const labels = ["0-30s", "30s-1m", "1m-2m", "2m-5m", "5m+"]

const data = {
  labels,
  datasets: [
    {
      label: "Number of Audio Files",
      data: [65, 59, 80, 81, 56],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
}

interface DatasetStatsProps {
  projectId: string | null
}

export function DatasetStats({ projectId }: DatasetStatsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dataset Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Audio Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">341</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">14h 23m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transcribed Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">287 (84%)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Bar options={options} data={data} />
        </CardContent>
      </Card>
    </div>
  )
}

