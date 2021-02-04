const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { v4 } = require('uuid')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {
  emitError,
  joinRoom,
  getUser,
  getUserRooms,
  register,
  userLeave
} = require('./connections')
// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Run when client connects
io.on('connection', socket => {
  socket.on('getId', () => {
    socket.emit('clientId', socket.id)
  })

  socket.on('register', clientName => {
    if (clientName) {
      register(clientName, socket.id)
      socket.join()
      socket.emit('msg', 'Registrado com sucesso')
    } else {
      emitError(socket, 'O campo nome deve ser preenchido')
    }
  })

  socket.on('joinRoom', roomId => {
    const user = getUser(socket.id)

    if (!user) {
      emitError(socket, 'Você deve estar registrado para se conectar')
    } else {
      const joined = joinRoom(roomId, user)
      if (joined !== {}) {
        socket.join(roomId)
        socket.emit('roomJoined', joined)
        socket.broadcast.to(roomId).emit('joinedHost', joined)
        socket.broadcast.to(roomId).emit('newRemote', user)
      } else {
        emitError(socket, 'O dispositivo de destino não está conectado')
      }
    }
  })

  socket.on('playerEvent', type => {
    const userRoom = getUserRooms(socket.id)
    console.log(type)
    console.log(userRoom)
    if (userRoom) {
      socket.broadcast.to(userRoom.host.id).emit('playerEventToHost', type)
    } else {
      emitError(socket, 'Você não está conectado a nenhum dispositivo')
    }
  })
  socket.on('disconnect', () => {
    const room = getUser(socket.id)
    userLeave(socket.id)

    if (room) {
      console.log(`${room.name} se desconectou`)
    }
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
