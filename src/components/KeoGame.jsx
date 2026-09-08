import { useState } from 'react'
import { GAME_DURATION_SECONDS } from '../game/constants.js'
import { useKeoGame } from '../hooks/useKeoGame.js'

/**
 * @param {{
 *   onStart: () => void,
 *   onReturn: () => void,
 *   globalRecord: {
 *     record: { score: number, player_name: string },
 *     loading: boolean,
 *     error: Error | null,
 *     submitRecord: (score: number, playerName: string) => Promise<Object>
 *   }
 * }} props
 */
function KeoGame({ onStart, onReturn, globalRecord }) {
  const [playerName, setPlayerName] = useState('')
  const [recordStatus, setRecordStatus] = useState('idle')
  const {
    canvasRef,
    catchAlert,
    resultMessage,
    score,
    secondsLeft,
    startGame,
    status,
    returnToTimer,
  } = useKeoGame({ onStart, onReturn })

  const startsGame = () => {
    setPlayerName('')
    setRecordStatus('idle')
    startGame()
  }

  const returnsToTimer = () => {
    setPlayerName('')
    setRecordStatus('idle')
    returnToTimer()
  }

  const isNewRecord = status === 'finished'
    && !globalRecord.loading
    && !globalRecord.error
    && score > globalRecord.record.score
    && recordStatus === 'idle'

  const saveRecord = async (event) => {
    event.preventDefault()
    if (!playerName.trim()) return

    setRecordStatus('saving')
    try {
      const result = await globalRecord.submitRecord(score, playerName.trim())
      setRecordStatus(result.was_updated ? 'saved' : 'beaten')
    } catch {
      setRecordStatus('error')
    }
  }

  return (
    <section className={`game ${status !== 'ready' ? 'game-active' : ''} ${catchAlert ? `game-${catchAlert.type}-hit` : ''}`} aria-label="Игра: поймай банки KEO">
      {status === 'playing' && (
        <div className="game-stats">
          <span>ОЧКИ · {score}</span>
          <span>{secondsLeft} СЕК</span>
        </div>
      )}
      <canvas ref={canvasRef} />
      {catchAlert?.type === 'water' && (
        <div key={catchAlert.id} className="catch-notification fatal-error">
          <strong>ФАТАЛЬНАЯ ОШИБКА · −5</strong>
        </div>
      )}
      {status !== 'playing' && (
        <div className="game-overlay">
          {status === 'finished' ? (
            <>
              <span className="result-label">МОЙ РЕЗУЛЬТАТ</span>
              <strong>{score}</strong>
              <h2 className="result-message">{resultMessage}</h2>
              <p>баночек <span className="keo">KEO</span> за {GAME_DURATION_SECONDS} секунд</p>
              {isNewRecord && (
                <form className="record-form" onSubmit={saveRecord}>
                  <label htmlFor="player-name">Новый общий рекорд! Как тебя зовут?</label>
                  <div>
                    <input
                      id="player-name"
                      maxLength="30"
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value)}
                      placeholder="Имя КЕОзавра"
                      autoComplete="nickname"
                    />
                    <button type="submit">Сохранить рекорд</button>
                  </div>
                </form>
              )}
              {recordStatus === 'saving' && <p className="record-note">Сохраняем рекорд…</p>}
              {recordStatus === 'saved' && <p className="record-note success-note">Ты новый мировой КЕОзавр!</p>}
              {recordStatus === 'beaten' && <p className="record-note">Кто-то успел поставить рекорд выше. Нужен реванш!</p>}
              {recordStatus === 'error' && <p className="record-note error-note">Не получилось сохранить рекорд</p>}
              <div className="result-actions">
                <button type="button" onClick={startsGame}>Сыграть ещё</button>
                <button className="secondary-button" type="button" onClick={returnsToTimer}>Назад к томительному ожиданию</button>
              </div>
            </>
          ) : (
            <>
              <span className="result-label">МИНИ-ИГРА · {GAME_DURATION_SECONDS} СЕКУНД</span>
              <h2>Сделай правильный выбор</h2>
              <div className="rules">
                <span><i className="rule-dot keo-dot" />KEO +1 и замедление</span>
                <span><i className="rule-dot water-dot" />Вода −5 и сброс скорости</span>
              </div>
              {!globalRecord.loading && !globalRecord.error && (
                <p className="global-record">ОБЩИЙ РЕКОРД · {globalRecord.record.score} · {globalRecord.record.player_name}</p>
              )}
              <button type="button" onClick={startsGame}>Начать игру</button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default KeoGame
