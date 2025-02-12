"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

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

export function DatasetStats() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dataset Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Audio Files</h3>
          <p className="text-3xl font-bold mt-2">341</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Duration</h3>
          <p className="text-3xl font-bold mt-2">14h 23m</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Transcribed Files</h3>
          <p className="text-3xl font-bold mt-2">287 (84%)</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow">
        <Bar options={options} data={data} />
      </div>
    </div>
  )
}

