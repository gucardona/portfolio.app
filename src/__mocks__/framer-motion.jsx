// Lightweight framer-motion mock for tests
// AnimatePresence renders children without deferring removal
import React from 'react'

export const AnimatePresence = ({ children }) => <>{children}</>

// eslint-disable-next-line react-refresh/only-export-components
export const motion = new Proxy(
  {},
  {
    get: (_, tag) =>
      // eslint-disable-next-line react/display-name
      React.forwardRef(({ children, ...rest }, ref) =>
        React.createElement(tag, { ref, ...rest }, children)
      ),
  }
)

// eslint-disable-next-line react-refresh/only-export-components
export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export const useInView = () => true
// eslint-disable-next-line react-refresh/only-export-components
export const useMotionValue = (initial) => ({ get: () => initial, set: () => {} })
// eslint-disable-next-line react-refresh/only-export-components
export const useTransform = () => ({ get: () => 0 })
// eslint-disable-next-line react-refresh/only-export-components
export const useSpring = (value) => value
// eslint-disable-next-line react-refresh/only-export-components
export const useScroll = () => ({ scrollY: { get: () => 0 } })
