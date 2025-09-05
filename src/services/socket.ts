import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string, sessionId?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Authenticate user
      this.socket?.emit('authenticate', { userId, sessionId });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Session methods
  joinSession(sessionId: string, userId: string) {
    this.socket?.emit('join_session', { sessionId, userId });
  }

  sendMessage(sessionId: string, content: string, messageType = 'text') {
    this.socket?.emit('send_message', { sessionId, content, messageType });
  }

  updateSessionStatus(sessionId: string, status: string) {
    this.socket?.emit('update_session_status', { sessionId, status });
  }

  // WebRTC signaling
  sendWebRTCOffer(sessionId: string, offer: RTCSessionDescriptionInit, targetUserId: string) {
    this.socket?.emit('webrtc_offer', { sessionId, offer, targetUserId });
  }

  sendWebRTCAnswer(sessionId: string, answer: RTCSessionDescriptionInit, targetUserId: string) {
    this.socket?.emit('webrtc_answer', { sessionId, answer, targetUserId });
  }

  sendICECandidate(sessionId: string, candidate: RTCIceCandidate, targetUserId: string) {
    this.socket?.emit('webrtc_ice_candidate', { sessionId, candidate, targetUserId });
  }

  // Whiteboard
  sendWhiteboardDraw(sessionId: string, drawData: any) {
    this.socket?.emit('whiteboard_draw', { sessionId, drawData });
  }

  clearWhiteboard(sessionId: string) {
    this.socket?.emit('whiteboard_clear', { sessionId });
  }

  // Screen sharing
  startScreenShare(sessionId: string) {
    this.socket?.emit('start_screen_share', { sessionId });
  }

  stopScreenShare(sessionId: string) {
    this.socket?.emit('stop_screen_share', { sessionId });
  }

  // Typing indicators
  startTyping(sessionId: string) {
    this.socket?.emit('typing_start', { sessionId });
  }

  stopTyping(sessionId: string) {
    this.socket?.emit('typing_stop', { sessionId });
  }

  // Instructor availability
  setInstructorAvailable(subjects: string[]) {
    this.socket?.emit('instructor_available', { subjects });
  }

  // Event listeners
  onMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onSessionStatusUpdate(callback: (data: any) => void) {
    this.socket?.on('session_status_updated', callback);
  }

  onUserJoinedSession(callback: (data: any) => void) {
    this.socket?.on('user_joined_session', callback);
  }

  onUserLeftSession(callback: (data: any) => void) {
    this.socket?.on('user_left_session', callback);
  }

  onWebRTCOffer(callback: (data: any) => void) {
    this.socket?.on('webrtc_offer', callback);
  }

  onWebRTCAnswer(callback: (data: any) => void) {
    this.socket?.on('webrtc_answer', callback);
  }

  onICECandidate(callback: (data: any) => void) {
    this.socket?.on('webrtc_ice_candidate', callback);
  }

  onWhiteboardDraw(callback: (data: any) => void) {
    this.socket?.on('whiteboard_draw', callback);
  }

  onWhiteboardClear(callback: (data: any) => void) {
    this.socket?.on('whiteboard_clear', callback);
  }

  onScreenShareStarted(callback: (data: any) => void) {
    this.socket?.on('screen_share_started', callback);
  }

  onScreenShareStopped(callback: (data: any) => void) {
    this.socket?.on('screen_share_stopped', callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onInstructorAvailable(callback: (data: any) => void) {
    this.socket?.on('instructor_available', callback);
  }

  onUserOnline(callback: (data: any) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: any) => void) {
    this.socket?.on('user_offline', callback);
  }

  // Remove event listeners
  off(event: string, callback?: Function) {
    this.socket?.off(event, callback);
  }

  get connected() {
    return this.isConnected && this.socket?.connected;
  }
}

export const socketService = new SocketService();
export default socketService;