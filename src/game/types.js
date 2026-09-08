/** @typedef {'keo' | 'water'} ItemType */
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
 * @property {number} paddleSpeed
 * @property {number} width
 * @property {number} height
 * @property {FallingItem[]} cans
 * @property {number} score
 * @property {number} lastSpawn
 */

/**
 * @typedef {Object} CatchAlert
 * @property {ItemType} type
 * @property {number} id
 */

export {}
