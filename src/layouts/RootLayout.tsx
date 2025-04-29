import { Outlet } from "react-router-dom"
import Sidebar from "../components/sidebar"

export default function RootLayout() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    )
}
