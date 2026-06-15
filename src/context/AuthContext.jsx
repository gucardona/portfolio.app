import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const CREDENTIALS = { email: 'admin@gupa.dev', password: 'admin' }

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === '1')

  const login = (email, password) => {
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('admin_authed')
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
