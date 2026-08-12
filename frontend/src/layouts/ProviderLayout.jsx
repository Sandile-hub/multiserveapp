import { useState } from "react"
import ProviderSidebar from "../components/provider/ProviderSidebar"
import ProviderNavbar from "../components/provider/ProviderNavbar"
import "../../styles/Provider.css"

function ProviderLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="provider-dashboard">
      <ProviderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="provider-main">
        <ProviderNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="provider-main-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ProviderLayout