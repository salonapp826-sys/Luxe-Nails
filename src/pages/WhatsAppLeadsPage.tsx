import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Phone, MapPin, MessageCircle, Calendar, RefreshCw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WhatsAppLead {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  requirement: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}

interface Conversation {
  id: string;
  phone: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  is_bot_reply: boolean;
  created_at: string;
}

export default function WhatsAppLeadsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<WhatsAppLead | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    } else if (user) {
      fetchLeads();
    }
  }, [user, authLoading, navigate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversation history');
    }
  };

  const handleLeadClick = (lead: WhatsAppLead) => {
    setSelectedLead(lead);
    fetchConversations(lead.phone);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Lead status updated');
      fetchLeads();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const exportLeads = () => {
    const csv = [
      ['Name', 'Phone', 'City', 'Requirement', 'Status', 'Created At'],
      ...filteredLeads.map(lead => [
        lead.name || 'N/A',
        lead.phone,
        lead.city || 'N/A',
        lead.requirement || 'N/A',
        lead.status,
        new Date(lead.created_at).toLocaleString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const triggerWebsiteCrawl = async () => {
    try {
      toast.info('Starting website crawl...');
      const { data, error } = await supabase.functions.invoke('crawl-website', {
        method: 'POST',
      });

      if (error) throw error;
      toast.success('Website crawled successfully! AI knowledge updated.');
    } catch (error: any) {
      console.error('Error crawling website:', error);
      toast.error('Failed to crawl website');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone.includes(searchQuery)) ||
      (lead.city?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.requirement?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">WhatsApp Leads</h1>
            <p className="text-muted-foreground">AI-powered lead management dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={triggerWebsiteCrawl} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Update AI Knowledge
            </Button>
            <Button onClick={exportLeads} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('/admin/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All Leads', count: statusCounts.all, filter: 'all', color: 'bg-blue-500' },
            { label: 'New', count: statusCounts.new, filter: 'new', color: 'bg-green-500' },
            { label: 'Contacted', count: statusCounts.contacted, filter: 'contacted', color: 'bg-yellow-500' },
            { label: 'Converted', count: statusCounts.converted, filter: 'converted', color: 'bg-purple-500' },
            { label: 'Lost', count: statusCounts.lost, filter: 'lost', color: 'bg-gray-500' },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setStatusFilter(stat.filter)}
              className={`glass-card p-4 rounded-xl text-left transition-all hover:scale-105 ${
                statusFilter === stat.filter ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by name, phone, city, or requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Leads List */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Leads ({filteredLeads.length})
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => handleLeadClick(lead)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:border-primary ${
                    selectedLead?.id === lead.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{lead.name || 'Unknown Customer'}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === 'new'
                          ? 'bg-green-100 text-green-700'
                          : lead.status === 'contacted'
                          ? 'bg-yellow-100 text-yellow-700'
                          : lead.status === 'converted'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                    {lead.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {lead.city}
                      </div>
                    )}
                    {lead.requirement && (
                      <p className="line-clamp-1">{lead.requirement}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}

              {filteredLeads.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No leads found</p>
                </div>
              )}
            </div>
          </div>

          {/* Conversation View */}
          <div className="glass-card p-6 rounded-2xl">
            {selectedLead ? (
              <>
                <div className="mb-4 pb-4 border-b">
                  <h2 className="text-xl font-semibold mb-2">{selectedLead.name || 'Unknown Customer'}</h2>
                  <div className="flex gap-2">
                    {['new', 'contacted', 'converted', 'lost'].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedLead.status === status ? 'default' : 'outline'}
                        onClick={() => updateLeadStatus(selectedLead.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex ${conv.direction === 'incoming' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-xl ${
                          conv.direction === 'incoming'
                            ? 'bg-muted'
                            : conv.is_bot_reply
                            ? 'bg-accent text-white'
                            : 'bg-primary text-white'
                        }`}
                      >
                        <p className="text-sm">{conv.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(conv.created_at).toLocaleTimeString()}
                          {conv.is_bot_reply && ' • Bot'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {conversations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No conversation history</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a lead to view conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
