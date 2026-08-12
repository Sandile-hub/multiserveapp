import { Navigate } from "react-router-dom"

import { useAuth } from "../context/AuthContext"

function CustomerRoute({ children }) {

  const { user } = useAuth()

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" />
  }

  return children
}

export default CustomerRoute