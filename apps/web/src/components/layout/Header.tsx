import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@voiceguard/ui';

export function Header() {
  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10 print:hidden">
      <div className="flex items-center relative w-96 max-w-full">
        <Search className="absolute left-3 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search calls, agents, criteria..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
        />
        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
          <span className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400 font-mono">⌘K</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>
        
        <div className="h-8 w-px bg-gray-100 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 leading-none">E. Markova</p>
            <p className="text-[10px] text-gray-400 font-medium">QA Lead</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-blue-50">
            EM
          </div>
        </div>
      </div>
    </header>
  );
}
