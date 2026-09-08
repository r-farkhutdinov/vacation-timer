import { useEffect, useRef, useState } from 'react'
import {
  ALERT_DURATION,
  GAME_DURATION_SECONDS,
  ITEM_SPAWN_INTERVAL,
  KEO_SCORE,
  PADDLE_HEIGHT,
  PADDLE_INITIAL_SPEED,
  PADDLE_KEY_STEP,
  PADDLE_MIN_SPEED,
  PADDLE_SLOWDOWN,
  PADDLE_WIDTH,
  WATER_CHANCE,
  WATER_SCORE,
  WATER_SPEED_MULTIPLIER,
} from '../game/constants.js'
import { drawItem } from '../game/drawItem.js'
import { getResultMessage } from '../game/resultMessages.js'

/**
 * @param {{ onStart: () => void, onReturn: () => void }} callbacks
 */
export function useKeoGame({ onStart, onReturn }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION_SECONDS)
  /** @type {[import('../game/types.js').GameStatus, Function]} */
  const [status, setStatus] = useState('ready')
  const [round, setRound] = useState(0)
  /** @type {[import('../game/types.js').CatchAlert | null, Function]} */
  const [catchAlert, setCatchAlert] = useState(null)
  const [resultMessage, setResultMessage] = useState('')

  useEffect(() => {
    if (status !== 'playing') return undefined

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    /** @type {import('../game/types.js').GameState} */
    const state = {
      paddleX: 0,
      paddleTargetX: 0,
      paddleSpeed: PADDLE_INITIAL_SPEED,
      width: 0,
      height: 0,
      cans: [],
      score: 0,
      lastSpawn: 0,
    }
    let frame
    let alertTimeout
    let previousTime = performance.now()
    const finishTime = previousTime + GAME_DURATION_SECONDS * 1000

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = bounds.width * ratio
      canvas.height = bounds.height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      state.width = bounds.width
      state.height = bounds.height
      state.paddleX = Math.max(0, (state.width - PADDLE_WIDTH) / 2)
      state.paddleTargetX = state.paddleX
    }

    const movePaddle = (clientX) => {
      const bounds = canvas.getBoundingClientRect()
      state.paddleTargetX = Math.max(0, Math.min(state.width - PADDLE_WIDTH, clientX - bounds.left - PADDLE_WIDTH / 2))
    }

    const handlePointer = (event) => movePaddle(event.clientX)
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        state.paddleTargetX = Math.max(0, Math.min(state.width - PADDLE_WIDTH, state.paddleTargetX + direction * PADDLE_KEY_STEP))
      }
    }

    const draw = (time) => {
      const delta = Math.min((time - previousTime) / 1000, 0.03)
      previousTime = time
      const remaining = Math.max(0, finishTime - time)
      setSecondsLeft(Math.ceil(remaining / 1000))

      if (remaining === 0) {
        setResultMessage(getResultMessage(state.score))
        setStatus('finished')
        return
      }

      const paddleDistance = state.paddleTargetX - state.paddleX
      const paddleStep = Math.sign(paddleDistance) * Math.min(Math.abs(paddleDistance), state.paddleSpeed * delta)
      state.paddleX += paddleStep

      if (time - state.lastSpawn > ITEM_SPAWN_INTERVAL) {
        const isWater = Math.random() < WATER_CHANCE
        const baseSpeed = 145 + Math.random() * 115 + state.score * 1.5
        state.cans.push({
          type: isWater ? 'water' : 'keo',
          x: 24 + Math.random() * Math.max(1, state.width - 48),
          y: -35,
          speed: isWater ? baseSpeed * WATER_SPEED_MULTIPLIER : baseSpeed,
          rotation: (Math.random() - .5) * .5,
          spin: (Math.random() - .5) * 1.8,
        })
        state.lastSpawn = time
      }

      const paddleY = state.height - 30
      state.cans = state.cans.filter((item) => {
        item.y += item.speed * delta
        item.rotation += item.spin * delta
        const caught = item.y + 27 >= paddleY
          && item.y - 27 < paddleY + PADDLE_HEIGHT
          && item.x >= state.paddleX - 16
          && item.x <= state.paddleX + PADDLE_WIDTH + 16

        if (caught) {
          state.score = Math.max(0, state.score + (item.type === 'water' ? WATER_SCORE : KEO_SCORE))
          setScore(state.score)
          state.paddleSpeed = item.type === 'water'
            ? PADDLE_INITIAL_SPEED
            : Math.max(PADDLE_MIN_SPEED, state.paddleSpeed - PADDLE_SLOWDOWN)
          setCatchAlert({ type: item.type, id: time })
          window.clearTimeout(alertTimeout)
          alertTimeout = window.setTimeout(() => setCatchAlert(null), ALERT_DURATION)
          return false
        }
        return item.y < state.height + 40
      })

      context.clearRect(0, 0, state.width, state.height)
      context.fillStyle = '#173a36'
      context.beginPath()
      context.roundRect(state.paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 7)
      context.fill()
      state.cans.forEach((item) => drawItem(context, item))
      frame = requestAnimationFrame(draw)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', handleKey)
    canvas.addEventListener('pointermove', handlePointer)
    canvas.addEventListener('pointerdown', handlePointer)
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(alertTimeout)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', handleKey)
      canvas.removeEventListener('pointermove', handlePointer)
      canvas.removeEventListener('pointerdown', handlePointer)
    }
  }, [round, status])

  const resetRound = () => {
    setScore(0)
    setSecondsLeft(GAME_DURATION_SECONDS)
    setCatchAlert(null)
    setResultMessage('')
  }

  const startGame = () => {
    resetRound()
    setStatus('playing')
    setRound((value) => value + 1)
    onStart()
  }

  const returnToTimer = () => {
    resetRound()
    setStatus('ready')
    onReturn()
  }

  return {
    canvasRef,
    catchAlert,
    resultMessage,
    score,
    secondsLeft,
    startGame,
    status,
    returnToTimer,
  }
}
