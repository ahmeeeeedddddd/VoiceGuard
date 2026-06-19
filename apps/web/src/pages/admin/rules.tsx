import React from 'react';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { RuleBuilder } from '@/components/admin/RuleBuilder';

export default function RulesPage() {
  return (
    <AppLayout>
      <Head>
        <title>Governance Control | VoiceGuard AI</title>
      </Head>
      
      <div className="p-8 max-w-6xl mx-auto">
        <RuleBuilder />
      </div>
    </AppLayout>
  );
}
