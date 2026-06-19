'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export interface CallAlertEvent {
  type: 'CALL_INGESTED' | 'CALL_FLAGGED_HIGH_RISK' | 'CALL_STATUS_CHANGED';
  callId: string;
  externalId: string;
  agentId?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  timestamp: string;
  workspaceLink: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCallTickerSocket() {
  const [events, setEvents] = useState<CallAlertEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${API_URL}/dashboard`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);

      // On (re)connect: fetch recent calls snapshot to backfill ticker
      fetch(`${API_URL}/calls/recent?limit=20`)
        .then((r) => r.json())
        .then((data: CallAlertEvent[]) => {
          if (Array.isArray(data)) {
            setEvents(data.slice(0, 20));
          }
        })
        .catch(() => {
          // Backfill is best-effort; don't crash the ticker if the REST call fails
        });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('call-event', (event: CallAlertEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // cap at 50
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { events, connected };
}
