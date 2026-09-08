/** @typedef {'keo' | 'megaKeo' | 'water' | 'megaWater' | 'paddleBonus' | 'speedBonus'} ItemType */
/** @typedef {'ready' | 'playing' | 'finished'} GameStatus */

/**
 * @typedef {Object} FallingItem
 * @property {ItemType} type
 * @property {number} x
 * @property {number} y
 * @property {number} speed
 * @property {number} rotation
 * @property {number} spin
 */

/**
 * @typedef {Object} GameState
 * @property {number} paddleX
 * @property {number} paddleTargetX
 * @property {number} paddleSpeedRatio
 * @property {number} paddleWidth
 * @property {number} paddleWideUntil
 * @property {number} width
 * @property {number} height
 * @property {FallingItem[]} items
 * @property {number} score
 * @property {number} lastSpawn
 */

/**
 * @typedef {Object} CatchAlert
 * @property {ItemType} type
 * @property {number} id
 */

export {}
