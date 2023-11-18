function flexible (window, document) {
  const baseSize = 37.7

  const windowSize = window.innerWidth
  if (windowSize < 576) {
    const scale = windowSize / 750
    document.documentElement.style.fontSize = `${baseSize * scale}px`
  } else if (windowSize > 940) {
    document.documentElement.style.fontSize = '37.5px'
  } else {
    document.documentElement.style.fontSize = '25px'
  }
}
flexible(window, document)

let interval
window.addEventListener('resize', () => {
  const reload = () => flexible(window, document)
  if (interval) clearTimeout(interval)
  interval = setTimeout(reload, 100)
})
