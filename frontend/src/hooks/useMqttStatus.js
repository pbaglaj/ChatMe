import mqtt from 'mqtt';
import { useEffect, useState, useRef } from 'react';

export const usePublishMyStatus = (myUserId) => {
  useEffect(() => {
    if (!myUserId) return;

    const client = mqtt.connect('ws://localhost:9001', {
      clientId: `web_${myUserId}_${Math.random().toString(16).slice(2, 8)}`,
      will: {
        topic: `users/${myUserId}/status`,
        payload: 'offline',
        retain: true
      }
    });

    client.on('connect', () => {
      client.publish(`users/${myUserId}/status`, 'online', { retain: true });
    });

    return () => {
      client.publish(`users/${myUserId}/status`, 'offline', { retain: true });
      client.end();
    };
  }, [myUserId]);
};

export const useMqttStatus = (userId) => {
  const [status, setStatus] = useState('offline');
  const clientRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!userId) return;

    isMountedRef.current = true;

    const client = mqtt.connect('ws://localhost:9001', {
      clientId: `subscriber_${userId}_${Math.random().toString(16).slice(2, 8)}`,
    });

    clientRef.current = client;

    client.on('connect', () => {
      if (!isMountedRef.current || client.disconnecting) return;
      
      client.subscribe(`users/${userId}/status`);
    });

    client.on('message', (topic, message) => {
      if (!isMountedRef.current) return;
      const newStatus = message.toString();
      setStatus(newStatus);
    });

    return () => {
      isMountedRef.current = false;
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [userId]);

  return status;
};