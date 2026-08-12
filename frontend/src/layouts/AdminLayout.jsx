import { useState } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"
import AdminNavbar from "../components/admin/AdminNavbar"
import "../styles/Admin.css"

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="admin-main-content">
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="admin-main">
          <div className="admin-main-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout