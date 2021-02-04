const socket = io()
let connect_id = ''
let room = {}

const handleAction = e => {
  console.log({ room, id: e.target.id })
  socket.emit('playerAction', { room, action: e.target.id })
}

function getStoredInfo() {
  const stored = localStorage.getItem('client')

  if (stored) return JSON.parse(stored)
  else return null
}

const playerActions = {
  next: () => {
    localStorage.setItem('action', 'next')
  },
  previous: () => {
    localStorage.setItem('action', 'previous')
  },
  play: () => {
    localStorage.setItem('action', 'play')
  }
}

function handleLoad() {
  const params = new URLSearchParams(window.location.search)
  connect_id = params.get('to')
  const client = getStoredInfo()
  console.log(connect_id, client)

  if (connect_id && connect_id.startsWith('user-')) {
    window.alert(`${connect_id.split('user-')[0]} se conectou a voce`)
  } else if (connect_id) {
    socket.emit('connectPlayer', {
      connect_id,
      client
    })
  } else {
    window.alert('A aplicação não conseguiu se conectar ao servidor')
  }

  document.querySelectorAll('.playerButton').forEach(button => {
    button.addEventListener('click', handleAction)
  })
}

socket.on('playerConnected', current_room => {
  room = current_room
  console.log(room)
  document.getElementById('connectedTo').innerText =
    'Conectado a ' + current_room.to.clientName
})

socket.on('actionreturn', action => {
  const fn = playerActions[action]
  fn()
})
window.onload = () => handleLoad()
