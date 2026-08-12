import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function ProviderRoute({ children }) {

  const { user } = useAuth()

  if (!user || user.role !== "provider") {
    return <Navigate to="/login" />
  }

  return children
}

export default ProviderRoute