'use client';
import { useCallTickerSocket } from '@/hooks/useCallTickerSocket';
import { AlertSidebarItem } from './AlertSidebarItem';

export function CallTicker() {
  const { events, connected } = useCallTickerSocket();

  const highRiskEvents = events.filter((e) => e.type === 'CALL_FLAGGED_HIGH_RISK');
  const allEvents = events;

  return (
    <div className="flex gap-4 h-full">
      {/* LEFT: All call events ticker (ambient feed) */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-xl p-4 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
            Live Call Ticker
          </h2>
          <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-400' : 'text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {connected ? 'Live' : 'Reconnecting…'}
          </span>
        </div>

        {allEvents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">Waiting for calls…</p>
        ) : (
          <div className="overflow-y-auto flex-1 pr-1 space-y-0">
            {allEvents.map((event) => (
              <AlertSidebarItem key={`${event.callId}-${event.timestamp}`} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: High-risk alerts sidebar (attention-grabbing) */}
      <div className="w-72 flex flex-col bg-gray-900 rounded-xl p-4 border border-red-900">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-400 text-lg">🚨</span>
          <h2 className="text-red-400 font-semibold text-sm uppercase tracking-widest">
            Critical Alerts
          </h2>
          {highRiskEvents.length > 0 && (
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {highRiskEvents.length}
            </span>
          )}
        </div>

        {highRiskEvents.length === 0 ? (
          <p className="text-gray-600 text-sm text-center mt-8">No active alerts</p>
        ) : (
          <div className="overflow-y-auto flex-1 pr-1 space-y-0">
            {highRiskEvents.map((event) => (
              <AlertSidebarItem key={`alert-${event.callId}-${event.timestamp}`} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
