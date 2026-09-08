/**
 * @param {CanvasRenderingContext2D} context
 * @param {import('./types.js').FallingItem} item
 */
export function drawItem(context, item) {
  context.save()
  context.translate(item.x, item.y)
  context.rotate(item.rotation)

  if (item.type === 'water') {
    context.fillStyle = '#78b9d8'
    context.beginPath()
    context.roundRect(-13, -20, 26, 46, 8)
    context.fill()
    context.fillStyle = '#4b96bb'
    context.fillRect(-7, -27, 14, 9)
    context.fillStyle = '#f2eee6'
    context.font = 'bold 9px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('H₂O', 0, 5)
  } else {
    context.fillStyle = '#f5c400'
    context.beginPath()
    context.roundRect(-15, -27, 30, 54, 7)
    context.fill()
    context.fillStyle = '#173a36'
    context.font = 'bold 12px Roboto, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('KEO', 0, 2)
    context.fillStyle = '#d6d2c8'
    context.fillRect(-12, -27, 24, 3)
    context.fillRect(-12, 24, 24, 3)
  }

  context.restore()
}
