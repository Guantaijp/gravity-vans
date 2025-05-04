"use client"
import type { DashboardData } from "../services/dashboard-service"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface VehicleStatusChartProps {
    bookingOverview?: DashboardData["bookingOverview"]
}

export default function VehicleStatusChart({ bookingOverview = [] }: VehicleStatusChartProps) {
    const chartOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    }

    const chartData = {
        labels: bookingOverview.map((week) => week.period),
        datasets: [
            {
                label: "Bookings",
                data: bookingOverview.map((week) => week.count),
                backgroundColor: "#e31c39",
                borderRadius: 4,
            },
        ],
    }

    return (
        <div className="h-[300px] w-full">
            {bookingOverview.length > 0 ? (
                <Bar options={chartOptions} data={chartData} />
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Loading booking data...</p>
                </div>
            )}
        </div>
    )
}
