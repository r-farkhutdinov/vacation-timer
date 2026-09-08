import { GAME_COLORS } from './constants.js'

/**
 * @param {CanvasRenderingContext2D} context
 * @param {import('./types.js').FallingItem} item
 */
export function drawItem(context, item) {
  context.save()
  context.translate(item.x, item.y)
  context.rotate(item.rotation)

  if (item.type === 'megaWater') {
    context.fillStyle = GAME_COLORS.waterDark
    context.beginPath()
    context.roundRect(-20, -31, 40, 69, 12)
    context.fill()
    context.fillStyle = GAME_COLORS.megaWaterDark
    context.fillRect(-11, -41, 22, 13)
    context.fillStyle = GAME_COLORS.white
    context.font = 'bold 13px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('MEGA', 0, -4)
    context.fillText('H₂O', 0, 13)
  } else if (item.type === 'megaKeo') {
    context.fillStyle = GAME_COLORS.keo
    context.beginPath()
    context.roundRect(-22, -38, 44, 76, 10)
    context.fill()
    context.fillStyle = GAME_COLORS.paddle
    context.font = 'bold 14px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('MEGA', 0, -7)
    context.fillText('KEO', 0, 10)
    context.fillStyle = GAME_COLORS.megaMetal
    context.fillRect(-18, -38, 36, 4)
    context.fillRect(-18, 34, 36, 4)
  } else if (item.type === 'paddleBonus' || item.type === 'speedBonus') {
    context.fillStyle = item.type === 'paddleBonus' ? GAME_COLORS.paddleBonus : GAME_COLORS.speedBonus
    context.beginPath()
    context.arc(0, 0, 19, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = GAME_COLORS.white
    context.font = `bold ${item.type === 'paddleBonus' ? 18 : 20}px Roboto, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(item.type === 'paddleBonus' ? '↔' : '↯', 0, 1)
  } else if (item.type === 'water') {
    context.fillStyle = GAME_COLORS.water
    context.beginPath()
    context.roundRect(-13, -20, 26, 46, 8)
    context.fill()
    context.fillStyle = GAME_COLORS.waterDark
    context.fillRect(-7, -27, 14, 9)
    context.fillStyle = GAME_COLORS.light
    context.font = 'bold 9px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('H₂O', 0, 5)
  } else {
    context.fillStyle = GAME_COLORS.keo
    context.beginPath()
    context.roundRect(-15, -27, 30, 54, 7)
    context.fill()
    context.fillStyle = GAME_COLORS.paddle
    context.font = 'bold 12px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('KEO', 0, 2)
    context.fillStyle = GAME_COLORS.metal
    context.fillRect(-12, -27, 24, 3)
    context.fillRect(-12, 24, 24, 3)
  }

  context.restore()
}
