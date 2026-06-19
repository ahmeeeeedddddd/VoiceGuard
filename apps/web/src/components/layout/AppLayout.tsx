import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50/30 overflow-hidden font-sans antialiased text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto bg-white/40">
          <div className="h-full blueprint-bg relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-transparent pointer-events-none" />
            {children}
          </div>
        </main>
      </div>
      
      <style jsx global>{`
        .blueprint-bg {
          background-image: 
            linear-gradient(to right, #f1f5f9 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
