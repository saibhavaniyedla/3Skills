import { useEffect, useRef } from 'react'

/**
 * useGameLoop — calls `callback` every animation frame while `running` is true.
 * The callback receives a `delta` value (ms since last frame) for frame-rate
 * independent movement if needed.
 */
export function useGameLoop(callback, running) {
  const callbackRef = useRef(callback)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)

  // Keep the callback ref fresh without restarting the loop
  useEffect(() => { callbackRef.current = callback }, [callback])

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
      return
    }

    const loop = (timestamp) => {
      const delta = lastTimeRef.current ? timestamp - lastTimeRef.current : 16
      lastTimeRef.current = timestamp
      callbackRef.current(delta)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])
}
