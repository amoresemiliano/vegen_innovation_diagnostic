"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, List, BarChart3 } from 'lucide-react';

const COLUMNS = [
  { id: '1_nuevo', title: '1. Nuevos Diagnósticos' },
  { id: '2_en_conversacion', title: '2. En Conversación' },
  { id: '3_caliente', title: '3. Calientes (Priority)' },
  { id: '4_cliente', title: '4. Conversión / Cliente' }
];

export default function KanbanDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          nombre,
          empresa,
          email,
          whatsapp,
          created_at,
          status
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveLead = async (leadId, newStatus) => {
    try {
      await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);
      
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-[#111827] font-bold">Cargando centro de mando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827]">Dashboard Vegen Digital</h1>
          <p className="text-gray-500">Control operativo de leads de diagnóstico</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'kanban' ? 'bg-[#111827] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Kanban
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'list' ? 'bg-[#111827] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'metrics' ? 'bg-[#111827] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 className="w-4 h-4" /> Métricas
          </button>
        </div>
      </div>

      {activeTab === 'kanban' && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex-shrink-0 bg-gray-200/50 rounded-2xl p-4 flex flex-col h-[75vh]">
              <h3 className="font-bold text-[#111827] mb-4 text-sm uppercase tracking-wide px-2 flex justify-between">
                {col.title}
                <span className="bg-white text-xs px-2 py-1 rounded-full">{leads.filter(l => l.status === col.id || (!l.status && col.id === '1_nuevo')).length}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {leads.filter(l => l.status === col.id || (!l.status && col.id === '1_nuevo')).map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#10B981] transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#111827] truncate">{lead.empresa || 'Empresa Local'}</h4>
                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-2">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">👤 {lead.nombre}</p>
                      {lead.whatsapp && <p className="text-xs text-gray-500 mb-3">📱 {lead.whatsapp}</p>}
                      <p className="text-xs text-gray-500 mb-3 truncate">📧 {lead.email}</p>
                      
                      <select 
                        value={lead.status || '1_nuevo'}
                        onChange={(e) => moveLead(lead.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-[#111827] text-xs font-bold w-full outline-none hover:border-[#10B981] transition-colors"
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="p-4 font-bold">Empresa</th>
                  <th className="p-4 font-bold">Contacto</th>
                  <th className="p-4 font-bold">Email / Tel</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-[#111827]">{lead.empresa}</td>
                    <td className="p-4 text-gray-600">{lead.nombre}</td>
                    <td className="p-4 text-gray-500">
                      <div>{lead.email}</div>
                      <div className="text-xs">{lead.whatsapp}</div>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select 
                        value={lead.status || '1_nuevo'}
                        onChange={(e) => moveLead(lead.id, e.target.value)}
                        className="bg-gray-100 rounded p-1 text-[#111827] text-xs font-bold outline-none"
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <div className="p-8 text-center text-gray-500 font-medium">No hay leads todavía.</div>}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black text-[#10B981] mb-2">{leads.length}</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total de Leads Generados</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black text-[#F97316] mb-2">{leads.filter(l => l.status === '4_cliente').length}</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Conversiones (Clientes)</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black text-[#111827] mb-2">
              {leads.length > 0 ? Math.round((leads.filter(l => l.status === '4_cliente').length / leads.length) * 100) : 0}%
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tasa de Conversión</div>
          </div>
        </div>
      )}

    </div>
  );
}
