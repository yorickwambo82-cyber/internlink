import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = 3003;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://internlink.cm'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store connected users: socketId -> userId
const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`[NotificationService] Client connected: ${socket.id}`);

  // User authenticates with their ID
  socket.on('authenticate', (userId: string) => {
    connectedUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);
    console.log(`[NotificationService] User ${userId} authenticated on socket ${socket.id}`);
  });

  // Send notification to specific user
  socket.on('send-notification', (data: {
    userId: string;
    notification: {
      id: string;
      title: string;
      message: string;
      type: string;
      link?: string;
      createdAt: string;
    };
  }) => {
    io.to(`user:${data.userId}`).emit('notification', data.notification);
    console.log(`[NotificationService] Notification sent to user ${data.userId}: ${data.notification.title}`);
  });

  // Broadcast to all users of a role
  socket.on('broadcast-role', (data: {
    role: string;
    notification: {
      id: string;
      title: string;
      message: string;
      type: string;
      link?: string;
      createdAt: string;
    };
  }) => {
    io.emit(`role:${data.role}`, data.notification);
    console.log(`[NotificationService] Broadcast to role ${data.role}: ${data.notification.title}`);
  });

  // Typing indicator for messaging
  socket.on('typing', (data: { userId: string; targetUserId: string }) => {
    io.to(`user:${data.targetUserId}`).emit('user-typing', { userId: data.userId });
  });

  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      console.log(`[NotificationService] User ${userId} disconnected`);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`[NotificationService] Running on port ${PORT}`);
});
