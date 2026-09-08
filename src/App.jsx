import { useEffect, useState } from 'react'

const TARGET_DATE = new Date(2026, 8, 14, 16, 45, 0)

const pad = (value) => String(value).padStart(2, '0')

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

const UNITS = [
  ['days', 'дней'],
  ['hours', 'часов'],
  ['minutes', 'минут'],
  ['seconds', 'секунд'],
]

function App() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft())
    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className="page">
      <section className="hero" aria-live="polite">
        <h1>
          {timeLeft.total > 0 ? (
            <>До первой баночки <span className="keo">KEO</span> осталось:</>
          ) : (
            <>Время открыть <span className="keo">KEO</span>!</>
          )}
        </h1>

        {timeLeft.total > 0 ? (
          <div className="countdown" aria-label="Время до отпуска">
            {UNITS.map(([key, label], index) => (
              <div className="unit-wrap" key={key}>
                <div className="unit">
                  <span className="number">{pad(timeLeft[key])}</span>
                  <span className="label">{label}</span>
                </div>
                {index < UNITS.length - 1 && <span className="colon" aria-hidden="true">:</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="arrived" aria-hidden="true">✦</div>
        )}
      </section>
    </main>
  )
}

export default App
