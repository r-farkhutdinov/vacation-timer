import { useEffect, useState } from 'react'
import { TARGET_DATE } from '../constants/countdown.js'

function getTimeLeft() {
  const difference = Math.max(0, TARGET_DATE.getTime() - Date.now())

  return {
    total: difference,
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  }
}

export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft())
    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [])

  return timeLeft
}
