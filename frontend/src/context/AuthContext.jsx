import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

import socket from "../socket"
import API from "../api/axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  )

  const [loading, setLoading] = useState(true)

  // ========================================
  // LOAD USER FROM LOCAL STORAGE
  // ========================================

  useEffect(() => {

    try {

      const storedUser =
        localStorage.getItem("user")

      if (
        storedUser &&
        storedUser !== "undefined"
      ) {

        const parsedUser =
          JSON.parse(storedUser)

        setUser(parsedUser)

        // REGISTER SOCKET USER
        if (parsedUser?.id) {

          socket.connect()

          socket.emit(
            "register_user",
            parsedUser.id
          )
        }
      }

    } catch (error) {

      console.error(
        "Error parsing stored user:",
        error
      )

      localStorage.removeItem("user")
    }

    setLoading(false)

  }, [])

  // ========================================
  // LOGIN
  // ========================================

  const login = async (formData) => {

    try {

      const res = await API.post(
        "/auth/login",
        formData
      )

      const data = res.data

      // SAVE STATE
      setToken(data.token)

      setUser(data.user)

      // SAVE TO LOCAL STORAGE
      localStorage.setItem(
        "token",
        data.token
      )

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      // CONNECT SOCKET
      socket.connect()

      socket.emit(
        "register_user",
        data.user.id
      )

      return {
        success: true,
      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      )

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed",
      }
    }
  }

  // ========================================
  // REGISTER
  // ========================================

  const register = async (formData) => {

    try {

      const res = await API.post(
        "/auth/register",
        formData
      )

      return {
        success: true,
        message: res.data.message,
      }

    } catch (error) {

      console.error(
        "Register error:",
        error
      )

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Register failed",
      }
    }
  }

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {

    socket.disconnect()

    setUser(null)

    setToken(null)

    localStorage.removeItem("token")

    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}