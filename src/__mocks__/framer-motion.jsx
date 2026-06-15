// Lightweight framer-motion mock for tests
// AnimatePresence renders children without deferring removal
import React from 'react'

export const AnimatePresence = ({ children }) => <>{children}</>

export const motion = new Proxy(
  {},
  {
    get: (_, tag) =>
      // eslint-disable-next-line react/display-name
      React.forwardRef(({ children, initial, animate, exit, transition, layout, ...rest }, ref) =>
        React.createElement(tag, { ref, ...rest }, children)
      ),
  }
)

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
})

export const useInView = () => true
export const useMotionValue = (initial) => ({ get: () => initial, set: () => {} })
export const useTransform = () => ({ get: () => 0 })
export const useSpring = (value) => value
export const useScroll = () => ({ scrollY: { get: () => 0 } })
