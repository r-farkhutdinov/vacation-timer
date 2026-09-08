export const GAME_CONFIG = Object.freeze({
  durationSeconds: 30,
  alertDurationMs: 700,
  maxDeltaSeconds: 0.03,
  maxDevicePixelRatio: 2,
})

export const PADDLE_CONFIG = Object.freeze({
  widthRatio: 0.265,
  bonusWidthMultiplier: 1.56,
  height: 14,
  bottomOffset: 30,
  initialSpeedRatio: 2.27,
  minimumSpeedRatio: 0.61,
  slowdownRatio: 0.097,
  keyboardStepRatio: 0.193,
  bonusDurationMs: 5_000,
})

export const SPAWN_CONFIG = Object.freeze({
  itemIntervalMs: 520,
  horizontalPadding: 24,
  startY: -35,
  minimumFallSpeed: 145,
  fallSpeedVariance: 115,
  scoreSpeedIncrease: 1.5,
  waterSpeedMultiplier: 1.25,
  rotationVariance: 0.5,
  spinVariance: 1.8,
  bonusMinimumIntervalMs: 3_200,
  bonusIntervalVarianceMs: 2_800,
  bonusMinimumSpeed: 175,
  bonusSpeedVariance: 45,
  bonusSpin: 1.4,
})

export const ITEM_CONFIG = Object.freeze({
  keo: { score: 1, halfHeight: 27 },
  megaKeo: { score: 7, chance: 0.035, halfHeight: 38 },
  water: { score: -5, chance: 0.45, halfHeight: 27 },
  megaWater: { score: -15, chance: 0.025, halfHeight: 41 },
  paddleBonus: { halfHeight: 27 },
  speedBonus: { halfHeight: 27 },
})

export const COLLISION_CONFIG = Object.freeze({
  horizontalItemRadius: 16,
  offscreenPadding: 40,
})

export const GAME_COLORS = Object.freeze({
  paddle: '#173a36',
  keo: '#f5c400',
  water: '#78b9d8',
  waterDark: '#4b96bb',
  megaWaterDark: '#2b6f91',
  light: '#f2eee6',
  metal: '#d6d2c8',
  megaMetal: '#fff3a8',
  paddleBonus: '#8b65c7',
  speedBonus: '#df5a3e',
  white: '#fff',
})
