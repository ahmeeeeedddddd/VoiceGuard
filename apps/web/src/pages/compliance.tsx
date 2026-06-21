import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Button, Badge } from '@voiceguard/ui';
import { Trash2, Edit3, X, Check } from 'lucide-react';

export default function CompliancePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredPhrase, setRequiredPhrase] = useState('');
  const [category, setCategory] = useState('General');
  const [points, setPoints] = useState(10);
  const [isCriticalFail, setIsCriticalFail] = useState(false);

  // Since we don't have real auth
  const headers = {
    'Content-Type': 'application/json',
    'x-mock-role': 'ADMIN',
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('http://localhost:3001/audit/checklist-rules', { headers });
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setRequiredPhrase('');
    setCategory('General');
    setPoints(10);
    setIsCriticalFail(false);
  };

  const handleEditClick = (rule: any) => {
    setEditingId(rule.id);
    setName(rule.name || '');
    setDescription(rule.description || '');
    setRequiredPhrase(rule.requiredPhrase || '');
    setCategory(rule.category || 'General');
    setPoints(rule.points || 10);
    setIsCriticalFail(rule.isCriticalFail || false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = JSON.stringify({ name, description, requiredPhrase, category, points: Number(points), isCriticalFail });
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3001/audit/checklist-rules/${editingId}`, { method: 'PUT', headers, body });
      } else {
        res = await fetch('http://localhost:3001/audit/checklist-rules', { method: 'POST', headers, body });
      }
      
      if (res.ok) {
        resetForm();
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to save rule', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this criterion?')) return;
    try {
      const res = await fetch(`http://localhost:3001/audit/checklist-rules/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to delete rule', err);
    }
  };

  return (
    <AppLayout>
      <Head>
        <title>Compliance Checklists | VoiceGuard AI</title>
      </Head>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-xs font-black text-gray-400 uppercase tracking-widest">Compliance</h1>
            <p className="text-2xl font-black text-gray-900 mt-1">Rule Management</p>
            <p className="mt-1 text-sm text-gray-500">Add, edit, and organize acceptance criteria across your organization.</p>
          </div>

          <Card className="p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Criteria' : 'Create New Criteria'}</h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-gray-400">Cancel Edit</Button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rule Name</label>
                  <input required placeholder="e.g. Greeting Check" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-3 border focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                  <input required placeholder="e.g. Greeting, Process, Closing" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-3 border focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Required Phrase (Exact or Partial Match)</label>
                  <input required placeholder="e.g. thank you" value={requiredPhrase} onChange={e => setRequiredPhrase(e.target.value)} className="w-full rounded-lg border-gray-200 font-mono shadow-sm text-sm p-3 border focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Points</label>
                  <input required type="number" min="0" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-3 border focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description (Optional)</label>
                <input placeholder="Explain what the auditor is looking for..." value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border-gray-200 shadow-sm text-sm p-3 border focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isCriticalFail} onChange={e => setIsCriticalFail(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Critical Failure</span>
                    <span className="text-xs text-gray-500">If failed, the entire call score is heavily penalized.</span>
                  </div>
                </label>
                <Button variant="primary" className="px-6 py-2.5 h-auto text-sm bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-wider rounded-lg shadow-sm">
                  {editingId ? 'Save Changes' : 'Create Criteria'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900">Active Rules Directory</h3>
              <Badge variant="neutral" className="bg-white">{rules.length} rules loaded</Badge>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-400 font-medium">Loading rules...</div>
            ) : rules.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium bg-red-50/20">No matching criteria found. Add one above.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {rules.map(rule => (
                  <div key={rule.id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">{rule.name}</span>
                        <Badge variant="neutral" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight">{rule.category}</Badge>
                        {rule.isCriticalFail && <Badge variant="error" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight bg-red-100/50 text-red-600">Critical</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{rule.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-mono px-2 py-1 rounded">MATCH: "{rule.requiredPhrase}"</span>
                        <span className="text-xs font-bold text-blue-600">+{rule.points} pts</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(rule)}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(rule.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
