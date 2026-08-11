type EventCallback = (payload: any) => void;

export class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectTimer: any = null;
  private reconnectInterval = 2000;
  private maxReconnectInterval = 10000;
  private isConnectedState = false;
  private onlineCountState = 1;

  constructor() {
    // Lazy connect on initialization
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Realtime] Connected to WebSocket server');
        this.isConnectedState = true;
        this.reconnectInterval = 2000;
        this.emitLocal('connection_change', { connected: true });
        // Ping every 25s to keep connection alive
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { event: eventName, payload } = data;

          if (eventName === 'presence:update' && payload?.onlineCount) {
            this.onlineCountState = payload.onlineCount;
          }

          if (eventName) {
            this.dispatch(eventName, payload);
          }
        } catch (e) {
          console.error('[Realtime] Message parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnectedState = false;
        this.emitLocal('connection_change', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Realtime] WebSocket error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.error('[Realtime] Failed to initialize WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  private heartbeatInterval: any = null;

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: 'ping' }));
      }
    }, 25000);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      console.log('[Realtime] Attempting reconnection...');
      this.reconnectInterval = Math.min(this.reconnectInterval * 1.5, this.maxReconnectInterval);
      this.connect();
    }, this.reconnectInterval);
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: EventCallback): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  public send(event: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('[Realtime] Cannot send event - WebSocket not connected');
    }
  }

  private dispatch(event: string, payload: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`[Realtime] Listener error for event ${event}:`, e);
        }
      });
    }
  }

  private emitLocal(event: string, payload: any): void {
    this.dispatch(event, payload);
  }

  public getOnlineCount(): number {
    return this.onlineCountState;
  }

  public isConnected(): boolean {
    return this.isConnectedState;
  }
}

export const realtime = new RealtimeService();
