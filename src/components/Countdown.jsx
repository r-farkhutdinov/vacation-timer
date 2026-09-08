import { COUNTDOWN_UNITS } from '../constants/countdown.js'
import { useCountdown } from '../hooks/useCountdown.js'

const pad = (value) => String(value).padStart(2, '0')

function Countdown() {
  const timeLeft = useCountdown()

  return (
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
          {COUNTDOWN_UNITS.map(([key, label], index) => (
            <div className="unit-wrap" key={key}>
              <div className="unit">
                <span className="number">{pad(timeLeft[key])}</span>
                <span className="label">{label}</span>
              </div>
              {index < COUNTDOWN_UNITS.length - 1 && <span className="colon" aria-hidden="true">:</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="arrived" aria-hidden="true">✦</div>
      )}
    </section>
  )
}

export default Countdown
