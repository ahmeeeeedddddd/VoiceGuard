import React from 'react';
import { Plus, Trash2, Save, Search, Filter, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@voiceguard/ui';

interface Rule {
  id: string;
  code: string;
  text: string;
  category: string;
  points: number;
  isActive: boolean;
}

const MOCK_RULES: Rule[] = [
  { id: '1', code: 'AC-01', text: 'Call recording disclosure within 10s', category: 'COMPLIANCE', points: 20, isActive: true },
  { id: '2', code: 'AC-02', text: 'Identity verification (2 factors)', category: 'SECURITY', points: 30, isActive: true },
  { id: '3', code: 'AC-03', text: 'PCI data never repeated by agent', category: 'PCI', points: 50, isActive: true },
  { id: '4', code: 'AC-04', text: 'Empathy statement on complaint', category: 'SOFT SKILLS', points: 15, isActive: true },
];

export function RuleBuilder() {
  const [rules, setRules] = React.useState<Rule[]>(MOCK_RULES);
  const [search, setSearch] = React.useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Script Validation Rules</h1>
          <p className="text-sm text-gray-500">Manage AI-driven compliance checks and scoring weights.</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
          <Plus size={18} />
          Create New Rule
        </Button>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Search by rule text or code..." 
              className="pl-10 bg-white border-gray-200 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 text-gray-600">
            <Filter size={16} />
            Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/30">
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Validation Rule</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Weight</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.filter(r => r.text.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())).map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-mono text-xs font-bold text-blue-600">{rule.code}</TableCell>
                <TableCell>
                  <p className="font-bold text-gray-900">{rule.text}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" className="bg-gray-100 text-gray-600 border-none px-2 h-5 text-[9px] font-bold">
                    {rule.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-black text-gray-900">{rule.points}</span>
                  <span className="text-[10px] text-gray-400 font-bold ml-1">pts</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <div className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${rule.isActive ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${rule.isActive ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                      <Save size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300">
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="p-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium bg-gray-50/20">
          <p>Showing {rules.length} total validation rules</p>
          <div className="flex items-center gap-2 text-blue-600 font-bold cursor-pointer hover:underline">
            <ShieldCheck size={14} />
            Run Global Re-Validation
          </div>
        </div>
      </Card>
    </div>
  );
}
