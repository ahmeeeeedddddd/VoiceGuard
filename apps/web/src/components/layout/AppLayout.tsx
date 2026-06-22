import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !['/login', '/register'].includes(router.pathname)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (['/login', '/register'].includes(router.pathname)) {
    return <>{children}</>;
  }

  if (loading || (!user && router.pathname !== '/login')) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen print:h-auto bg-gray-50/30 overflow-hidden print:overflow-visible font-sans antialiased text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto print:overflow-visible bg-white/40">
          <div className="h-full print:h-auto blueprint-bg relative">
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
