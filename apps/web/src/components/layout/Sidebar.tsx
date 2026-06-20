import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Mic2, 
  ShieldCheck, 
  BarChart3, 
  Settings,
  Shield,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@voiceguard/ui';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/' },
  { label: 'Audit Workspace', icon: Mic2, href: '/workspace' },
  { label: 'Compliance', icon: ShieldCheck, href: '/compliance' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Reports', icon: FileText, href: '/reports' },
  { label: 'Users', icon: Users, href: '/users' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col h-screen print:hidden">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <Shield size={20} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900 uppercase">VoiceGuard</h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">AI Governance</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = router.pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
          <span>SYS</span>
          <span className="flex items-center gap-1 text-green-600">
            <span className="w-1 h-1 rounded-full bg-green-600 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase">
          <span>REGION</span>
          <span>us-east-1</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase">
          <span>BUILD</span>
          <span>v2.4.18</span>
        </div>
      </div>
    </aside>
  );
}
