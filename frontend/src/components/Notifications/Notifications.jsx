import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Notifications.css';

const API_URL = 'https://localhost:5000/api';

function Notifications() {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const abortController = new AbortController();
    
    const connectSSE = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/stream`, {
          credentials: 'include',
          signal: abortController.signal,
        });

        if (!response.ok) {
          console.error('SSE connection failed:', response.status);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                handleNotification(data);
              } catch (e) {
                console.error('Failed to parse SSE message:', e);
              }
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('SSE error:', error);
        }
      }
    };

    connectSSE();

    return () => {
      abortController.abort();
    };
  }, [isLoggedIn]);

  const handleNotification = (data) => {
    if (data.type === 'connected' || data.type === 'heartbeat') {
      return;
    }

    const notification = {
      id: Date.now(),
      ...data,
      read: false
    };

    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_added':
        return '👥';
      case 'new_post':
        return '📝';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  const formatTime = (isoString) => {
    const diffMs = new Date() - new Date(isoString);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="notifications-container">
      <button className="notifications-bell" onClick={toggleNotifications} onBlur={() => setIsOpen(false)}>
        <FontAwesomeIcon icon={faBell} style={{ color: '#007bff'}}/>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {notifications.length > 0 && (
              <button className="clear-btn" onClick={clearNotifications}>
                Clear all
              </button>
            )}
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications yet</p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <span className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    {notification.preview && (
                      <p className="notification-preview">"{notification.preview}"</p>
                    )}
                    <span className="notification-time">{formatTime(notification.time)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
