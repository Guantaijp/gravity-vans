import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function VehicleStatusChart() {
    const data = [
        { name: "Week 1", bookings: 12, revenue: 120000 },
        { name: "Week 2", bookings: 19, revenue: 190000 },
        { name: "Week 3", bookings: 15, revenue: 150000 },
        { name: "Week 4", bookings: 22, revenue: 220000 },
    ]

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value / 1000}`} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#e31c39" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
