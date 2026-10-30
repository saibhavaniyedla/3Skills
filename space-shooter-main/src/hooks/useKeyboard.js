import { useEffect, useRef } from 'react'

/**
 * useKeyboard — tracks which keys are currently held down.
 * Returns a ref (not state) so reads inside rAF don't cause re-renders.
 */
export function useKeyboard() {
  const keys = useRef({})

  useEffect(() => {
    const onDown = e => {
      keys.current[e.key] = true
      // prevent page scroll on Space / Arrow keys
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }
    }
    const onUp = e => { keys.current[e.key] = false }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return keys
}
