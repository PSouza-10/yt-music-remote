const socket = io()
let nameInput,
  connInput,
  registerButton,
  connButton,
  idDisplay,
  roomDisplay,
  player
let connectId
let minimize
let client = {
  id: '',
  name: ''
}
let roomInfo
let registered = false
let isHost = false
const displayRoomInfo = ({ remotes, host }, openPlayer = false) => {
  title = host.id === client.id ? 'Transmitindo' : `Conectado a ${host.name}`

  const hostDisplay = `<span class="host">${title}</span>`
  const remotesDisplay =
    '<ul class="remotes">' +
    remotes.map(({ name, id }) =>
      id !== client.id ? `<li>${name}</li>` : ''
    ) +
    '</ul>'

  roomDisplay.innerHTML =
    hostDisplay + '<h3> Usuários remotos </h3>' + remotesDisplay

  if (!player.classList.contains('open') && openPlayer) {
    minimize.click()
  }
}

const toggleConnBtn = () => {
  if (connectId !== '' && client.name && client.id && registered) {
    connButton.disabled = false
  } else {
    connButton.disabled = true
  }
}
const ls = {
  get: key => {
    return JSON.parse(localStorage.getItem(key))
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

window.onload = () => {
  socket.emit('getId')
  player = document.getElementById('player')
  nameInput = document.getElementById('nameInput')
  connInput = document.getElementById('IdInput')
  registerButton = document.getElementById('register')
  connButton = document.getElementById('connect')
  idDisplay = document.getElementById('clientId')
  roomDisplay = document.getElementById('roomInfo')
  minimize = document.getElementById('minimizePlayer')

  nameInput.addEventListener('keyup', e => {
    client.name = e.target.value
    if (client.name && client.id) {
      registerButton.disabled = false
    } else {
      registerButton.disabled = true
    }
    toggleConnBtn()
  })
  connInput.addEventListener('keyup', e => {
    connectId = e.target.value

    toggleConnBtn()
  })

  const name = ls.get('name')
  if (name) {
    registerButton.disabled = false
    nameInput.value = name
    client.name = name
  }

  registerButton.addEventListener('click', e => {
    console.log(client)
    if (client.name) {
      socket.emit('register', client.name)
    }
  })

  connButton.addEventListener('click', e => {
    if (connectId) {
      socket.emit('joinRoom', connectId)
    } else {
      alert('Por favor insira o ID de conexão')
    }
  })
}

socket.on('clientId', id => {
  client.id = id
  idDisplay.innerText = id
})

socket.on('error', err => {
  window.alert('Aviso: ' + err)
})

socket.on('msg', msg => {
  window.alert(msg)

  if (msg === 'Registrado com sucesso') {
    ls.set('name', client.name)
    registered = true
    toggleConnBtn()
  }
})

socket.on('roomJoined', room => {
  roomInfo = room
  displayRoomInfo(room, true)
})

socket.on('newRemote', user => {
  if (!isHost) {
    roomInfo.remotes.push(user)
    displayRoomInfo(roomInfo, false)
  }
})

socket.on('joinedHost', room => {
  if (client.id === room.host.id) {
    isHost = true
    roomInfo = room

    displayRoomInfo(room, true)
  }
})
// https://music.youtube.com/watch?v=ok4i1aPrecw&list=RDAMVMok4i1aPrecw

var tag = document.createElement('script')
var YTplayer
let paused = true
tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

const playlist = 'PLtIbAho4zwcyXslCLMyNK9pJyWLr1HdCx'
async function handlePlayerLoaded(e) {
  e.target.loadPlaylist({
    list: playlist,
    listType: 'playlist'
  })
  e.target.playVideo()
}

function onYouTubeIframeAPIReady() {
  YTplayer = new YT.Player('musicPlayer', {
    height: '200',
    width: '200',
    events: {
      onReady: handlePlayerLoaded
    }
  })
}
// https://img.youtube.com/vi/ok4i1aPrecw/sddefault.jpg
const playerActions = {
  next: () => {
    YTplayer.nextVideo()
  },
  previous: () => {
    YTplayer.previousVideo()
  },
  play: () => {
    if (paused) YTplayer.playVideo()
    else YTplayer.pauseVideo()

    paused = !paused
  }
}

socket.on('playerEventToHost', actionType => {
  if (isHost) {
    const fn = playerActions[actionType]
    fn()
  }
})
function handleAction(e) {
  if (isHost) {
    const fn = playerActions[e.id]
    fn()
  } else {
    socket.emit('playerEvent', e.id)
  }
}
