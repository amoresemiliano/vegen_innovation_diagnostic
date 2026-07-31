"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const COLUMNS = [
  { id: '1_nuevo', title: '1. Nuevos Diagnósticos' },
  { id: '2_en_conversacion', title: '2. En Conversación' },
  { id: '3_caliente', title: '3. Calientes (Priority)' },
  { id: '4_cliente', title: '4. Conversión / Cliente' }
];

export default function KanbanDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      // Actualizar local
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Cargando centro de mando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#003366]">Dashboard Vegen Digital</h1>
          <p className="text-gray-500">Control operativo de leads de diagnóstico</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="w-80 flex-shrink-0 bg-gray-100/50 rounded-xl p-4 flex flex-col h-[80vh]">
            <h3 className="font-bold text-[#003366] mb-4 text-sm uppercase tracking-wide px-2">{col.title}</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {leads.filter(l => l.status === col.id || (!l.status && col.id === '1_nuevo')).map(lead => (
                  <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{lead.empresa || 'Empresa Local'}</h4>
                      <span className="text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">👤 {lead.nombre}</p>
                    {lead.whatsapp && <p className="text-sm text-gray-500 mb-3">📱 {lead.whatsapp}</p>}
                    
                    <div className="flex gap-2 text-xs">
                      <select 
                        value={lead.status || '1_nuevo'}
                        onChange={(e) => moveLead(lead.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded p-1 text-[#003366] font-medium w-full outline-none"
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
