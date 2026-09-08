import { useEffect, useRef, useState } from 'react'
import { GAME_CONFIG } from '../game/constants.js'
import { useKeoGame } from '../hooks/useKeoGame.js'

/**
 * @param {{
 *   onStart: () => void,
 *   onReturn: () => void,
 *   globalRecord: {
 *     record: { score: number, player_name: string },
 *     recentGames: Array<{ id: number, score: number, played_at: string }>,
 *     loading: boolean,
 *     error: Error | null,
 *     recordGame: (score: number) => Promise<Object>,
 *     submitRecord: (score: number, playerName: string) => Promise<Object>
 *   }
 * }} props
 */
function KeoGame({ onStart, onReturn, globalRecord }) {
  const [playerName, setPlayerName] = useState('')
  const [recordStatus, setRecordStatus] = useState('idle')
  const [gameOpened, setGameOpened] = useState(false)
  const loggedRoundRef = useRef(false)
  const {
    canvasRef,
    catchAlert,
    finishGame,
    resultMessage,
    score,
    secondsLeft,
    startGame,
    status,
    returnToTimer,
  } = useKeoGame({ onStart, onReturn })

  useEffect(() => {
    if (status !== 'finished' || loggedRoundRef.current) return
    loggedRoundRef.current = true
    globalRecord.recordGame(score).catch(() => {})
  }, [globalRecord, score, status])

  const startsGame = () => {
    setPlayerName('')
    setRecordStatus('idle')
    loggedRoundRef.current = false
    startGame()
  }

  const returnsToTimer = () => {
    setPlayerName('')
    setRecordStatus('idle')
    setGameOpened(false)
    returnToTimer()
  }

  const openGame = () => {
    setGameOpened(true)
    onStart()
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

  if (!gameOpened) {
    return <button className="game-launch" type="button" onClick={openGame}>Начать игру</button>
  }

  return (
    <div className={`game-area game-area-active ${status === 'playing' ? 'game-area-playing' : ''}`}>
      {!globalRecord.loading && !globalRecord.error && (
        <aside className="global-record">
          <div className="best-record">
            <span className="record-caption">🏆 Общий рекорд</span>
            <span className="record-value">{globalRecord.record.score}</span>
            <span className="record-holder">КЕОзавр · {globalRecord.record.player_name}</span>
          </div>
          <div className="recent-games">
            <span className="recent-title">Последние игры</span>
            {globalRecord.recentGames.length > 0 ? globalRecord.recentGames.map((game) => (
              <div className="recent-game" key={game.id}>
                <span>{new Date(game.played_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                <b>{game.score}</b>
              </div>
            )) : <span className="recent-empty">Пока пусто</span>}
          </div>
        </aside>
      )}
      <section className={`game ${status === 'playing' ? 'game-active' : ''} ${catchAlert ? `game-${catchAlert.type}-hit` : ''}`} aria-label="Игра: поймай банки KEO">
      {status === 'playing' && (
        <div className="game-stats">
          <span>ОЧКИ · {score}</span>
          <button className="finish-game" type="button" onClick={finishGame}>Завершить</button>
          <span>{secondsLeft} СЕК</span>
        </div>
      )}
      <canvas ref={canvasRef} />
      {catchAlert?.type === 'water' && (
        <div key={catchAlert.id} className="catch-notification fatal-error">
          <strong>ФАТАЛЬНАЯ ОШИБКА · −5</strong>
        </div>
      )}
      {(catchAlert?.type === 'paddleBonus' || catchAlert?.type === 'speedBonus') && (
        <div key={catchAlert.id} className="catch-notification bonus-notification">
          <strong>{catchAlert.type === 'paddleBonus' ? 'РАКЕТКА УВЕЛИЧЕНА' : 'СКОРОСТЬ ВОССТАНОВЛЕНА'}</strong>
        </div>
      )}
      {catchAlert?.type === 'megaKeo' && (
        <div key={catchAlert.id} className="catch-notification mega-notification">
          <strong>MEGA KEO · +7</strong>
        </div>
      )}
      {catchAlert?.type === 'megaWater' && (
        <div key={catchAlert.id} className="catch-notification mega-water-notification">
          <strong>МЕГА-ФАТАЛЬНАЯ ОШИБКА · −15</strong>
        </div>
      )}
      {status !== 'playing' && (
        <div className={`game-overlay ${status === 'ready' ? 'game-instructions' : ''}`}>
          {status === 'ready' ? (
            <>
              <span className="result-label">МИНИ-ИГРА · {GAME_CONFIG.durationSeconds} СЕКУНД</span>
              <h2>Сделай правильный выбор</h2>
              <div className="rules">
                <span><i className="rule-dot keo-dot" />KEO +1 и замедление</span>
                <span><i className="rule-dot water-dot" />Вода −5 и сброс скорости</span>
                <span><i className="rule-dot bonus-dot" />Лови случайные бонусы</span>
                <span><i className="rule-dot mega-dot" />Mega KEO +7</span>
                <span><i className="rule-dot mega-water-dot" />Mega H₂O −15</span>
              </div>
              <button type="button" onClick={startsGame}>Играть</button>
            </>
          ) : (
            <>
              <span className="result-label">МОЙ РЕЗУЛЬТАТ</span>
              <strong>{score}</strong>
              <h2 className="result-message">{resultMessage}</h2>
              <p>баночек <span className="keo">KEO</span> за {GAME_CONFIG.durationSeconds} секунд</p>
              {isNewRecord && (
                <form className="record-form" onSubmit={saveRecord}>
                  <label htmlFor="player-name">Новый общий рекорд! Как тебя зовут?</label>
                  <div>
                    <input id="player-name" maxLength="30" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Имя КЕОзавра" autoComplete="nickname" />
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
          )}
        </div>
      )}
      </section>
    </div>
  )
}

export default KeoGame
