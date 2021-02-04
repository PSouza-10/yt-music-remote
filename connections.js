const { v4 } = require('uuid')

let rooms = []

module.exports = {
  register: (name, id) => {
    const user = rooms.find(({ host }) => host.id === id)
    if (!user) {
      rooms.push({
        host: {
          name: name,
          id: id
        },
        remotes: []
      })
      console.log(`Novo usuário ${name} de ID: ${id} `)
      console.log(rooms)
    } else {
      return false
    }
  },
  joinRoom: (hostId, client) => {
    let joined = false

    let roomIndex = rooms.findIndex(({ host }) => host.id === hostId)
    if (roomIndex > -1) {
      rooms[roomIndex].remotes.push(client)

      console.log(
        `O usuário ${client.name} requisitou entrada na sala do usuário: ${rooms[roomIndex].host.name}`
      )
      console.log(rooms)
      return rooms[roomIndex]
    }
    return false
  },
  getUser: socketId => {
    const userRoom = rooms.find(({ host }) => host.id === socketId)

    if (userRoom) {
      return userRoom.host
    } else {
      return false
    }
  },
  getUserRooms: socketId => {
    let connectedRooms = []
    rooms.forEach(({ host, remotes }) => {
      const remote = remotes.findIndex(({ id }) => id === socketId)
      if (remote > -1) {
        connectedRooms.push({
          host,
          remotes
        })
      }
    })
    return connectedRooms[0]
  },
  userLeave: socketId => {
    rooms = rooms.filter(({ host }) => host.id !== socketId)

    let indexes = []
    rooms.forEach(({ host, remotes }, index) => {
      const hasUser = remotes.findIndex(({ id }) => id === socketId)
      if (hasUser !== -1) {
        indexes.push(hasUser)
      }
    })

    for (let index of indexes) {
      rooms[index].remotes = rooms[index].remotes.filter(
        ({ id }) => id !== socketId
      )
    }
  },
  emitError: (socket, msg) => {
    socket.emit('error', msg)
    return false
  }
}
