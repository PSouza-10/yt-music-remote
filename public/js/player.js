let minimizeButton = document.getElementById('minimizePlayer')

minimizeButton.addEventListener('click', () => {
  let player = document.getElementById('player')
  let roomInfo = document.getElementById('roomInfo')
  let buttons = document.getElementById('playerButtons')

  const isOpen = player.classList.contains('open')

  if (isOpen) {
    buttons.classList.add('minimized')
    roomInfo.classList.remove('open')
    player.classList.remove('open')
    minimizeButton.classList.remove('open')
  } else {
    buttons.classList.remove('minimized')
    roomInfo.classList.add('open')
    player.classList.add('open')
    minimizeButton.classList.add('open')
  }
})
