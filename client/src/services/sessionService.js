import api from './api';
import { createOptimizedInterval /* throttle */ } from '../utils/performanceUtils';

class SessionService {
  constructor() {
    this.sessionId = null;
    this.userId = null;
    this.isActive = false;
    this.activityTimer = null;
    this.heartbeatInterval = null;
  }

  // Start a new session
  async startSession(userId, additionalData = {}) {
    try {
      this.userId = userId;
      
      const response = await api.post(`/admin/users/${userId}/session/start`, {
        deviceInfo: additionalData.deviceInfo || navigator.userAgent,
        ipAddress: additionalData.ipAddress || await this.getClientIP()
      });

      if (response.data.sessionId) {
        this.sessionId = response.data.sessionId;
        this.isActive = true;
        
        // Start activity tracking
        this.startActivityTracking();
        
        // Start heartbeat to keep session alive
        this.startHeartbeat();
        
        console.log('Session started:', this.sessionId);
        return this.sessionId;
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  // End the current session
  async endSession() {
    if (!this.sessionId || !this.userId) return;

    try {
      await api.put(`/admin/users/${this.userId}/session/${this.sessionId}/end`);
      
      this.cleanup();
      console.log('Session ended:', this.sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Update session activity
  async updateActivity() {
    if (!this.sessionId || !this.userId || !this.isActive) return;

    try {
      await api.put(`/admin/users/${this.userId}/session/${this.sessionId}/activity`);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Start tracking user activity
  startActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let lastActivityUpdate = 0;
    const ACTIVITY_UPDATE_THROTTLE = 30000; // Only update activity every 30 seconds
    
    const activityHandler = () => {
      if (this.activityTimer) {
        clearTimeout(this.activityTimer);
      }
      
      // Only update activity if enough time has passed (throttling)
      const now = Date.now();
      if (now - lastActivityUpdate > ACTIVITY_UPDATE_THROTTLE) {
        this.updateActivity();
        lastActivityUpdate = now;
      }
      
      // Set timer to end session after 30 minutes of inactivity
      this.activityTimer = setTimeout(() => {
        this.endSession();
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Store event listeners for cleanup
    this.activityHandler = activityHandler;
    this.activityEvents = events;
  }

  // Start heartbeat to keep session alive
  startHeartbeat() {
    // Use optimized interval that pauses when tab is not visible
    this.heartbeatCleanup = createOptimizedInterval(() => {
      if (this.isActive) {
        this.updateActivity();
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  // Clean up session tracking
  cleanup() {
    this.isActive = false;
    
    // Clear timers
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.heartbeatCleanup) {
      this.heartbeatCleanup();
      this.heartbeatCleanup = null;
    }
    
    // Remove event listeners
    if (this.activityHandler && this.activityEvents) {
      this.activityEvents.forEach(event => {
        document.removeEventListener(event, this.activityHandler, true);
      });
    }
    
    // Reset session data
    this.sessionId = null;
    this.userId = null;
  }

  // Get client IP address (approximate)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Handle page visibility change
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, reduce activity tracking
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    } else {
      // Page is visible again, resume tracking
      if (this.isActive) {
        this.updateActivity();
        this.startHeartbeat();
      }
    }
  }

  // Initialize session service
  init() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      if (this.isActive) {
        // Use sendBeacon for reliable session end on page unload
        if (navigator.sendBeacon && this.sessionId && this.userId) {
          const data = JSON.stringify({});
          navigator.sendBeacon(
            `${this.API_BASE}/admin/users/${this.userId}/session/${this.sessionId}/end`,
            data
          );
        }
      }
    });
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isActive: this.isActive
    };
  }
}

// Create singleton instance
const sessionService = new SessionService();
sessionService.init();

export default sessionService;