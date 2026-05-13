import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { History, Trash2, Calendar, Tag, Info } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SpinHistory() {
  const { user } = useAuth();

  // Menggunakan React Query untuk mengambil data
  const { data: sessions = [], isLoading, refetch } = useQuery({
    // Query hanya berjalan jika user.id sudah ada
    queryKey: ['spin-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('spin_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // Gunakan created_at sesuai SQL

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id, // Pastikan tidak memanggil API jika user belum login
  });

  const handleDelete = async (sessionId) => {
    try {
      const { error } = await supabase
        .from('spin_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      toast.success('Riwayat berhasil dihapus');
      refetch();
    } catch (err) {
      toast.error('Gagal menghapus riwayat');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={History} 
        title="Riwayat Putaran" 
        subtitle="Lihat semua hasil keputusan yang pernah kamu buat" 
      />

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border/50">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-heading font-semibold">Belum ada riwayat</h3>
          <p className="text-muted-foreground text-sm">Hasil putaran roda kamu akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((s) => (
            <div 
              key={s.id} 
              className="group relative bg-card border border-border/30 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {s.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-heading font-bold text-lg">{s.title || 'Putaran Roda'}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {/* Pastikan s.created_at ada sesuai struktur SQL public.spin_sessions */}
                      <span>
                        {s.created_at ? format(new Date(s.created_at), 'PPP p', { locale: id }) : 'Waktu tidak diketahui'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
                      <span className="text-xs text-muted-foreground block">Hasil Utama</span>
                      <span className="font-bold text-primary">{s.result}</span>
                    </div>
                    {s.result_secondary && (
                      <div className="px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
                        <span className="text-xs text-muted-foreground block">Hasil Kedua</span>
                        <span className="font-bold text-accent">{s.result_secondary}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(s.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}