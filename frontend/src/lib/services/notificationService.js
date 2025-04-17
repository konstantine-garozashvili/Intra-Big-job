class NotificationService {
    constructor() {
        this.eventSource = null;
        this.listeners = new Set();
    }

    connect() {
        if (this.eventSource) {
            return;
        }

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found. Cannot connect to notifications stream.');
            return;
        }

        // Use the correct API URL with token as query parameter for authentication
        const apiUrl = `http://localhost:8000/api/notifications/stream?token=${encodeURIComponent(token)}`;
        this.eventSource = new EventSource(apiUrl);
        
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifyListeners(data);
            } catch (e) {
                // Ignore keep-alive messages
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            this.disconnect();
            // Try to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(data) {
        this.listeners.forEach(listener => listener(data));
    }
}

export const notificationService = new NotificationService();
