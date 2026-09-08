import { useEffect, useRef, useState } from 'react'
import {
  COLLISION_CONFIG,
  GAME_COLORS,
  GAME_CONFIG,
  ITEM_CONFIG,
  PADDLE_CONFIG,
  SPAWN_CONFIG,
} from '../game/constants.js'
import { drawItem } from '../game/drawItem.js'
import { getResultMessage } from '../game/resultMessages.js'

/**
 * @param {{ onStart: () => void, onReturn: () => void }} callbacks
 */
export function useKeoGame({ onStart, onReturn }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(GAME_CONFIG.durationSeconds)
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
      paddleSpeedRatio: PADDLE_CONFIG.initialSpeedRatio,
      paddleWidth: 0,
      paddleWideUntil: 0,
      width: 0,
      height: 0,
      items: [],
      score: 0,
      lastSpawn: 0,
    }
    let frame
    let alertTimeout
    let previousTime = performance.now()
    const finishTime = previousTime + GAME_CONFIG.durationSeconds * 1000
    let nextBonusTime = previousTime + SPAWN_CONFIG.bonusMinimumIntervalMs + Math.random() * SPAWN_CONFIG.bonusIntervalVarianceMs
    let lastBonusType = Math.random() < .5 ? 'paddleBonus' : 'speedBonus'

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, GAME_CONFIG.maxDevicePixelRatio)
      canvas.width = bounds.width * ratio
      canvas.height = bounds.height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      state.width = bounds.width
      state.height = bounds.height
      const widthMultiplier = state.paddleWideUntil > performance.now()
        ? PADDLE_CONFIG.bonusWidthMultiplier
        : 1
      state.paddleWidth = state.width * PADDLE_CONFIG.widthRatio * widthMultiplier
      state.paddleX = Math.max(0, (state.width - state.paddleWidth) / 2)
      state.paddleTargetX = state.paddleX
    }

    const movePaddle = (clientX) => {
      const bounds = canvas.getBoundingClientRect()
      state.paddleTargetX = Math.max(0, Math.min(state.width - state.paddleWidth, clientX - bounds.left - state.paddleWidth / 2))
    }

    const handlePointer = (event) => movePaddle(event.clientX)
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        state.paddleTargetX = Math.max(0, Math.min(state.width - state.paddleWidth, state.paddleTargetX + direction * state.width * PADDLE_CONFIG.keyboardStepRatio))
      }
    }

    const draw = (time) => {
      const delta = Math.min((time - previousTime) / 1000, GAME_CONFIG.maxDeltaSeconds)
      previousTime = time
      const remaining = Math.max(0, finishTime - time)
      setSecondsLeft(Math.ceil(remaining / 1000))

      if (remaining === 0) {
        setResultMessage(getResultMessage(state.score))
        setStatus('finished')
        return
      }

      if (state.paddleWideUntil && time >= state.paddleWideUntil) {
        state.paddleWidth = state.width * PADDLE_CONFIG.widthRatio
        state.paddleWideUntil = 0
        state.paddleX = Math.min(state.paddleX, state.width - state.paddleWidth)
        state.paddleTargetX = Math.min(state.paddleTargetX, state.width - state.paddleWidth)
      }

      const paddleDistance = state.paddleTargetX - state.paddleX
      const paddleStep = Math.sign(paddleDistance) * Math.min(Math.abs(paddleDistance), state.width * state.paddleSpeedRatio * delta)
      state.paddleX += paddleStep

      if (time - state.lastSpawn > SPAWN_CONFIG.itemIntervalMs) {
        const itemRoll = Math.random()
        const itemType = itemRoll < ITEM_CONFIG.megaWater.chance
          ? 'megaWater'
          : itemRoll < ITEM_CONFIG.megaWater.chance + ITEM_CONFIG.water.chance
          ? 'water'
          : itemRoll < ITEM_CONFIG.megaWater.chance + ITEM_CONFIG.water.chance + ITEM_CONFIG.megaKeo.chance ? 'megaKeo' : 'keo'
        const baseSpeed = SPAWN_CONFIG.minimumFallSpeed + Math.random() * SPAWN_CONFIG.fallSpeedVariance + state.score * SPAWN_CONFIG.scoreSpeedIncrease
        state.items.push({
          type: itemType,
          x: SPAWN_CONFIG.horizontalPadding + Math.random() * Math.max(1, state.width - SPAWN_CONFIG.horizontalPadding * 2),
          y: SPAWN_CONFIG.startY,
          speed: itemType === 'water' || itemType === 'megaWater' ? baseSpeed * SPAWN_CONFIG.waterSpeedMultiplier : baseSpeed,
          rotation: (Math.random() - .5) * SPAWN_CONFIG.rotationVariance,
          spin: (Math.random() - .5) * SPAWN_CONFIG.spinVariance,
        })
        state.lastSpawn = time
      }

      if (time >= nextBonusTime) {
        const bonusType = lastBonusType === 'paddleBonus' ? 'speedBonus' : 'paddleBonus'
        state.items.push({
          type: bonusType,
          x: SPAWN_CONFIG.horizontalPadding + Math.random() * Math.max(1, state.width - SPAWN_CONFIG.horizontalPadding * 2),
          y: SPAWN_CONFIG.startY,
          speed: SPAWN_CONFIG.bonusMinimumSpeed + Math.random() * SPAWN_CONFIG.bonusSpeedVariance,
          rotation: 0,
          spin: SPAWN_CONFIG.bonusSpin,
        })
        lastBonusType = bonusType
        nextBonusTime = time + SPAWN_CONFIG.bonusMinimumIntervalMs + Math.random() * SPAWN_CONFIG.bonusIntervalVarianceMs
      }

      const paddleY = state.height - PADDLE_CONFIG.bottomOffset
      state.items = state.items.filter((item) => {
        item.y += item.speed * delta
        item.rotation += item.spin * delta
        const itemHalfHeight = ITEM_CONFIG[item.type].halfHeight
        const caught = item.y + itemHalfHeight >= paddleY
          && item.y - itemHalfHeight < paddleY + PADDLE_CONFIG.height
          && item.x >= state.paddleX - COLLISION_CONFIG.horizontalItemRadius
          && item.x <= state.paddleX + state.paddleWidth + COLLISION_CONFIG.horizontalItemRadius

        if (caught) {
          if (item.type === 'paddleBonus') {
            state.paddleWidth = Math.min(state.width * PADDLE_CONFIG.widthRatio * PADDLE_CONFIG.bonusWidthMultiplier, state.width)
            state.paddleWideUntil = time + PADDLE_CONFIG.bonusDurationMs
          } else if (item.type === 'speedBonus') {
            state.paddleSpeedRatio = PADDLE_CONFIG.initialSpeedRatio
          } else {
            const scoreDelta = ITEM_CONFIG[item.type].score
            state.score = Math.max(0, state.score + scoreDelta)
            setScore(state.score)
            state.paddleSpeedRatio = item.type === 'water' || item.type === 'megaWater'
              ? PADDLE_CONFIG.initialSpeedRatio
              : Math.max(PADDLE_CONFIG.minimumSpeedRatio, state.paddleSpeedRatio - PADDLE_CONFIG.slowdownRatio)
          }
          setCatchAlert({ type: item.type, id: time })
          window.clearTimeout(alertTimeout)
          alertTimeout = window.setTimeout(() => setCatchAlert(null), GAME_CONFIG.alertDurationMs)
          return false
        }
        return item.y < state.height + COLLISION_CONFIG.offscreenPadding
      })

      context.clearRect(0, 0, state.width, state.height)
      context.fillStyle = GAME_COLORS.paddle
      context.beginPath()
      context.roundRect(state.paddleX, paddleY, state.paddleWidth, PADDLE_CONFIG.height, PADDLE_CONFIG.height / 2)
      context.fill()
      state.items.forEach((item) => drawItem(context, item))
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
    setSecondsLeft(GAME_CONFIG.durationSeconds)
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

  const finishGame = () => {
    setResultMessage(getResultMessage(score))
    setStatus('finished')
  }

  return {
    canvasRef,
    catchAlert,
    resultMessage,
    finishGame,
    score,
    secondsLeft,
    startGame,
    status,
    returnToTimer,
  }
}
