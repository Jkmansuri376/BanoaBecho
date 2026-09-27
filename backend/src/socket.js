let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    // Join negotiation thread room
    socket.on('join_thread', ({ listingId, buyerId }) => {
      if (listingId && buyerId) {
        const roomName = `thread_${listingId}_${buyerId}`;
        socket.join(roomName);
        console.log(`📡 Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    // Leave negotiation thread room
    socket.on('leave_thread', ({ listingId, buyerId }) => {
      if (listingId && buyerId) {
        const roomName = `thread_${listingId}_${buyerId}`;
        socket.leave(roomName);
        console.log(`👋 Socket ${socket.id} left room: ${roomName}`);
      }
    });

    // Join user-specific notification room
    socket.on('join_user_notifications', ({ userId }) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`🔔 Socket ${socket.id} registered for notifications on room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

function emitThreadEvent(listingId, buyerId, eventName, payload) {
  if (ioInstance) {
    const roomName = `thread_${listingId}_${buyerId}`;
    ioInstance.to(roomName).emit(eventName, payload);
    console.log(`📢 Emitted ${eventName} to ${roomName}`);
  }
}

function emitUserEvent(userId, eventName, payload) {
  if (ioInstance && userId) {
    const roomName = `user_${userId}`;
    ioInstance.to(roomName).emit(eventName, payload);
    console.log(`🔔 Emitted notification ${eventName} to user room ${roomName}`);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitThreadEvent,
  emitUserEvent
};
