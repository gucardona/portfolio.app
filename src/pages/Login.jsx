import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(email, password)) {
      navigate('/admin')
    } else {
      setError(true)
      setTimeout(() => setError(false), 2400)
    }
  }

  return (
    <div className="login">
      <div className="login__bg" aria-hidden />
      <motion.form
        className={`login__form${error ? ' login__form--error' : ''}`}
        onSubmit={handleSubmit}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="login__brand" variants={item}>
          <span className="login__logo">portfolio</span>
          <span className="login__divider" />
          <span className="login__access">admin access</span>
        </motion.div>

        <motion.div className="login__field" variants={item}>
          <label className="login__label" htmlFor="email">Email</label>
          <input
            id="email"
            className="login__input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </motion.div>

        <motion.div className="login__field" variants={item}>
          <label className="login__label" htmlFor="password">Password</label>
          <input
            id="password"
            className="login__input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              className="login__error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              invalid credentials
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button className="login__submit" type="submit" variants={item}>
          Enter
        </motion.button>

        <motion.p className="login__hint" variants={item}>
          admin@gupa.dev · admin
        </motion.p>
      </motion.form>
    </div>
  )
}
