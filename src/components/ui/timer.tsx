import { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Card } from './card'
import { Progress } from './progress'
import { Clock, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react'

interface TimerProps {
  speaker: {
    timeUsed: number
    timeAllocated: number
  }
  onTimeUpdate?: (timeUsed: number) => void
  isMainTimer?: boolean
  speakerName?: string
}

export function Timer({ speaker, onTimeUpdate, isMainTimer = false, speakerName }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(speaker.timeAllocated - speaker.timeUsed)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(speaker.timeUsed)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Créer une référence audio pour les alertes
  useEffect(() => {
    audioRef.current = new Audio('/alert.mp3')
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1
          const newElapsedTime = speaker.timeAllocated - newTime
          setElapsedTime(newElapsedTime)
          onTimeUpdate?.(newElapsedTime)

          // Jouer un son d'alerte quand il reste 1 minute ou 10 secondes
          if (newTime === 60 || newTime === 10) {
            audioRef.current?.play()
          }

          return newTime
        })
      }, 1000)
    } else if (timeLeft <= 0) {
      setIsRunning(false)
      // Jouer un son d'alerte quand le temps est écoulé
      audioRef.current?.play()
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, speaker.timeAllocated, onTimeUpdate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const resetTimer = () => {
    setTimeLeft(speaker.timeAllocated)
    setElapsedTime(0)
    setIsRunning(false)
  }

  const progressPercentage = (elapsedTime / speaker.timeAllocated) * 100

  // Style différent pour le chronomètre principal vs les chronomètres individuels
  if (isMainTimer) {
    return (
      <Card className="p-4 border-2 border-primary">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Chronomètre principal</span>
            </div>
            <div className="font-mono text-3xl font-bold">
              {formatTime(timeLeft)}
            </div>
          </div>

          <Progress
            value={progressPercentage}
            className="h-2"
            indicatorClassName={
              progressPercentage > 80 ? "bg-red-500" :
              progressPercentage > 50 ? "bg-yellow-500" :
              "bg-green-500"
            }
          />

          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">
                Temps écoulé: {formatTime(elapsedTime)} / {formatTime(speaker.timeAllocated)}
              </span>
              {timeLeft <= 60 && timeLeft > 0 && (
                <span className="ml-2 text-yellow-500 font-medium text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Moins d'une minute
                </span>
              )}
              {timeLeft <= 0 && (
                <span className="ml-2 text-red-500 font-medium text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Temps écoulé
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={isRunning ? "outline" : "default"}
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isRunning ? 'Pause' : 'Démarrer'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetTimer}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Version compacte pour les panélistes individuels
  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      {speakerName && (
        <span className="text-sm font-medium">{speakerName}</span>
      )}
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
        <Button
          variant={isRunning ? "outline" : "default"}
          size="sm"
          onClick={() => setIsRunning(!isRunning)}
          className="h-8 px-2"
        >
          {isRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        {timeLeft <= 0 && (
          <span className="text-red-500 text-xs">Temps écoulé</span>
        )}
      </div>
      <Progress
        value={progressPercentage}
        className="h-1"
        indicatorClassName={
          progressPercentage > 80 ? "bg-red-500" :
          progressPercentage > 50 ? "bg-yellow-500" :
          "bg-green-500"
        }
      />
    </div>
  )
}
