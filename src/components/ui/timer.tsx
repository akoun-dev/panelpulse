import { useState, useEffect } from 'react'

interface TimerProps {
  initialTime: number; // en secondes
}

export function Timer({ initialTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
      <button 
        onClick={() => setIsRunning(!isRunning)}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  )
}
