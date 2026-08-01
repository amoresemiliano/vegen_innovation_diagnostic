"use client";
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, List, BarChart3, MessageCircle, FileDown } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import html2pdf from 'html2pdf.js';

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
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const leadIds = leadsData?.map(l => l.id) || [];
      let enhancedLeads = leadsData || [];
      
      if (leadIds.length > 0) {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .in('lead_id', leadIds);
          
        const sessionIds = sessionsData?.map(s => s.id) || [];
        let logsData: any[] = [];
        
        if (sessionIds.length > 0) {
          const { data } = await supabase
            .from('framework_logs')
            .select('*')
            .in('session_id', sessionIds)
            .order('step_number', { ascending: true });
          logsData = data || [];
        }
        
        enhancedLeads = leadsData.map(lead => {
          const session = sessionsData?.find(s => s.lead_id === lead.id);
          const logs = session ? logsData.filter(l => l.session_id === session.id) : [];
          return { ...lead, session, logs };
        });
      }

      setLeads(enhancedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (lead) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; color: #111827;">
        <h1 style="color: #10B981; margin-bottom: 0;">Diagnóstico de Innovación</h1>
        <h2 style="margin-top: 5px;">${lead.empresa}</h2>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <h3>Datos de Contacto</h3>
        <p><strong>Contacto:</strong> ${lead.nombre}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Teléfono:</strong> ${lead.whatsapp || 'N/A'}</p>
        <p><strong>Industria:</strong> ${lead.industria || 'N/A'}</p>
        <p><strong>Ubicación:</strong> ${lead.ubicacion || 'N/A'}</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <h3>Registro de Entrevista (Q&A)</h3>
        ${lead.logs && lead.logs.length > 0 ? lead.logs.map((log, i) => `
          <div style="margin-bottom: 15px; background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin:0; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Pregunta ${i+1} • ${log.framework_tag}</p>
            <p style="margin: 5px 0; font-weight: bold;">Q: ${log.question_text}</p>
            <p style="margin: 0; color: #4b5563;">A: ${log.answer_text}</p>
          </div>
        `).join('') : '<p>No hay registro de preguntas disponible.</p>'}
        
        <div style="page-break-before: always;"></div>
        
        <h3 style="color: #F97316;">Propuestas Estratégicas (IA)</h3>
        ${lead.session?.proposals && lead.session.proposals.length > 0 ? lead.session.proposals.map((prop, i) => `
          <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #F97316; background: #fff7ed;">
            <p style="margin: 0;">${prop}</p>
          </div>
        `).join('') : '<p>No hay propuestas generadas.</p>'}
      </div>
    `;

    const opt: any = {
      margin:       10,
      filename:     `Diagnostico_${lead.empresa || 'Vegen'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
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

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      setLeads(leads.map(l => l.id.toString() === draggableId ? { ...l, status: newStatus } : l));
      
      try {
        await supabase
          .from('leads')
          .update({ status: newStatus })
          .eq('id', draggableId);
      } catch (err) {
        console.error('Error updating status:', err);
      }
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <div key={col.id} className="w-80 flex-shrink-0 bg-gray-200/50 rounded-2xl p-4 flex flex-col h-[75vh]">
                <h3 className="font-bold text-[#111827] mb-4 text-sm uppercase tracking-wide px-2 flex justify-between">
                  {col.title}
                  <span className="bg-white text-xs px-2 py-1 rounded-full">{leads.filter(l => l.status === col.id || (!l.status && col.id === '1_nuevo')).length}</span>
                </h3>
                
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex-1 overflow-y-auto space-y-3 pr-1"
                    >
                      {leads.filter(l => l.status === col.id || (!l.status && col.id === '1_nuevo')).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#10B981] transition-all group relative cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-[#111827] truncate">{lead.empresa || 'Empresa Local'}</h4>
                                <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-2">{new Date(lead.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                                {lead.industria || 'Industria'} • {lead.ubicacion || 'Ubicación'}
                              </p>
                              
                              <p className="text-xs text-gray-600 mb-1 font-medium">👤 {lead.nombre}</p>
                              <p className="text-xs text-gray-500 mb-3 truncate">📧 {lead.email}</p>
                              
                              <div className="flex gap-2 mt-3">
                                {lead.whatsapp && (
                                  <a 
                                    href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=Hola,%20te%20escribimos%20de%20Vegen%20Digital.%20Has%20rellenado%20el%20formulario%20para%20recibir%20propuestas%20de%20innovación...%20te%20queda%20bien%20que%20coordinemos%20una%20llamada%20para%20ver%20cómo%20podemos%20ayudarte?`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors py-2 rounded-lg text-[10px] font-bold"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    WhatsApp
                                  </a>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    generatePDF(lead);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 hover:bg-[#111827] hover:text-white transition-colors py-2 rounded-lg text-[10px] font-bold"
                                >
                                  <FileDown className="w-3 h-3" />
                                  Descargar
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {activeTab === 'list' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="p-4 font-bold whitespace-nowrap">Empresa</th>
                  <th className="p-4 font-bold whitespace-nowrap">Industria</th>
                  <th className="p-4 font-bold whitespace-nowrap">Ubicación</th>
                  <th className="p-4 font-bold whitespace-nowrap">Contacto</th>
                  <th className="p-4 font-bold whitespace-nowrap">Email</th>
                  <th className="p-4 font-bold whitespace-nowrap">WhatsApp</th>
                  <th className="p-4 font-bold whitespace-nowrap">Fecha</th>
                  <th className="p-4 font-bold whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-[#111827]">{lead.empresa}</td>
                    <td className="p-4 text-xs text-gray-600">{lead.industria}</td>
                    <td className="p-4 text-xs text-gray-600">{lead.ubicacion}</td>
                    <td className="p-4 text-gray-600 font-medium">{lead.nombre}</td>
                    <td className="p-4 text-gray-500">
                      <div className="text-xs truncate max-w-[150px]">{lead.email}</div>
                    </td>
                    <td className="p-4 text-gray-500">
                      {lead.whatsapp ? (
                        <a 
                          href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=Hola,%20te%20escribimos%20de%20Vegen%20Digital.%20Has%20rellenado%20el%20formulario%20para%20recibir%20propuestas%20de%20innovación...%20te%20queda%20bien%20que%20coordinemos%20una%20llamada%20para%20ver%20cómo%20podemos%20ayudarte?`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors px-2 py-1 rounded text-[10px] font-bold"
                        >
                          <MessageCircle className="w-3 h-3" /> Chat
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs font-bold whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select 
                        value={lead.status || '1_nuevo'}
                        onChange={(e) => moveLead(lead.id, e.target.value)}
                        className="bg-gray-100 rounded p-1 text-[#111827] text-xs font-bold outline-none border-transparent hover:border-[#10B981] transition-colors"
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-black text-[#111827] mb-2">{leads.length}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Leads Totales</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-black text-[#10B981] mb-2">{leads.filter(l => l.status === '1_nuevo' || !l.status).length}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nuevos</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-black text-[#F97316] mb-2">{leads.filter(l => l.status === '3_caliente').length}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calientes</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#111827] rounded-bl-full opacity-10"></div>
              <div className="text-5xl font-black text-[#111827] mb-2">
                {leads.length > 0 ? Math.round((leads.filter(l => l.status === '4_cliente').length / leads.length) * 100) : 0}%
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Conversión</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Desglose por Industria</h3>
              <div className="space-y-4">
                {Object.entries(
                  leads.reduce((acc, lead) => {
                    const ind = lead.industria || 'Sin Especificar';
                    acc[ind] = (acc[ind] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([ind, count]: any) => (
                  <div key={ind}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#111827]">{ind}</span>
                      <span className="text-gray-500">{count} leads</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: `${(count / leads.length) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Desglose por Ubicación</h3>
              <div className="space-y-4">
                {Object.entries(
                  leads.reduce((acc, lead) => {
                    const loc = lead.ubicacion || 'Desconocida';
                    acc[loc] = (acc[loc] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([loc, count]: any) => (
                  <div key={loc}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#111827]">{loc}</span>
                      <span className="text-gray-500">{count} leads</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#F97316] h-1.5 rounded-full" style={{ width: `${(count / leads.length) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Framework Metrics */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 shadow-sm text-white">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Preguntas por Framework</h3>
              <div className="space-y-4">
                {(() => {
                  const frameworkCounts = leads.reduce((acc, lead) => {
                    if (lead.logs) {
                      lead.logs.forEach(log => {
                        const tag = log.framework_tag || 'General';
                        acc[tag] = (acc[tag] || 0) + 1;
                      });
                    }
                    return acc;
                  }, {});
                  const totalQuestions = Object.values(frameworkCounts).reduce((a: any, b: any) => a + b, 0) as number;
                  
                  return Object.entries(frameworkCounts).sort((a: any, b: any) => b[1] - a[1]).map(([tag, count]: any) => (
                    <div key={tag}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-200">{tag}</span>
                        <span className="text-gray-400">{count} preguntas</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: totalQuestions > 0 ? `${(count / totalQuestions) * 100}%` : '0%' }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Proposal Areas */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Áreas de Propuestas (Vegen)</h3>
              <div className="space-y-4">
                {(() => {
                  const proposalCounts = leads.reduce((acc, lead) => {
                    if (lead.session?.proposals) {
                      lead.session.proposals.forEach(prop => {
                        const lowerProp = prop.toLowerCase();
                        if (lowerProp.includes('ia') || lowerProp.includes('inteligencia artificial') || lowerProp.includes('predictiv') || lowerProp.includes('machine learning')) {
                          acc['IA & Automatización Avanzada'] = (acc['IA & Automatización Avanzada'] || 0) + 1;
                        } else if (lowerProp.includes('data') || lowerProp.includes('dashboard') || lowerProp.includes('panel') || lowerProp.includes('analítica')) {
                          acc['Data & BI'] = (acc['Data & BI'] || 0) + 1;
                        } else if (lowerProp.includes('marketing') || lowerProp.includes('mkt') || lowerProp.includes('ventas') || lowerProp.includes('ecommerce') || lowerProp.includes('e-commerce') || lowerProp.includes('crm')) {
                          acc['Marketing, Ventas & CRM'] = (acc['Marketing, Ventas & CRM'] || 0) + 1;
                        } else {
                          acc['Sistemas & Operaciones'] = (acc['Sistemas & Operaciones'] || 0) + 1;
                        }
                      });
                    }
                    return acc;
                  }, {});
                  const totalProposals = Object.values(proposalCounts).reduce((a: any, b: any) => a + b, 0) as number;

                  return Object.entries(proposalCounts).sort((a: any, b: any) => b[1] - a[1]).map(([area, count]: any) => (
                    <div key={area}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-[#111827]">{area}</span>
                        <span className="text-gray-500">{count} props</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: totalProposals > 0 ? `${(count / totalProposals) * 100}%` : '0%' }}></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
