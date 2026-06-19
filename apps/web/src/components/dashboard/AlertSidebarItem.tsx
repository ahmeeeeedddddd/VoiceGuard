import { CallAlertEvent } from '@/hooks/useCallTickerSocket';

interface AlertSidebarItemProps {
  event: CallAlertEvent;
}

export function AlertSidebarItem({ event }: AlertSidebarItemProps) {
  const isHighRisk = event.type === 'CALL_FLAGGED_HIGH_RISK';
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div
      className={`rounded-lg p-3 mb-2 border-l-4 ${
        isHighRisk
          ? 'bg-red-950 border-red-500 text-red-100'
          : 'bg-gray-800 border-gray-600 text-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${isHighRisk ? 'text-red-400' : 'text-gray-400'}`}>
          {isHighRisk ? '🚨 High Risk Alert' : '📞 Call Ingested'}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>

      <p className="text-sm font-medium truncate">
        External ID: <span className="font-mono">{event.externalId}</span>
      </p>

      {event.agentId && (
        <p className="text-xs text-gray-400 mt-0.5">
          Agent: <span className="font-mono">{event.agentId}</span>
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          event.riskLevel === 'HIGH'
            ? 'bg-red-700 text-red-100'
            : event.riskLevel === 'MEDIUM'
            ? 'bg-yellow-700 text-yellow-100'
            : 'bg-green-800 text-green-100'
        }`}>
          {event.riskLevel ?? event.status}
        </span>

        {isHighRisk && (
          <a
            href={event.workspaceLink}
            className="text-xs text-red-400 underline hover:text-red-300 font-semibold"
          >
            Open Workspace →
          </a>
        )}
      </div>
    </div>
  );
}
