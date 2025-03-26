import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  function throttle(fn: () => void, wait?: number) {
    let timeout: number | null = null;

    return () => {
      if (timeout !== null) return 

      fn()

      timeout = setTimeout(() => {timeout = null}, wait)
    }
  }

  const throttledFn = throttle(() => {
    console.log('calling fn', Date.now())
    setCount(prev => prev + 1)
  }, 500)

  return (
    <>
    <p>DUPA</p>
    </>
  )
}

export default App
