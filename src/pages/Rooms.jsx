import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Copy, ArrowRight, Trash2, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import OptionEditor from '@/components/OptionEditor';
import SpinWheel from '@/components/SpinWheel';
import ResultModal from '@/components/ResultModal';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Rooms() {
  const [user, setUser] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [options, setOptions] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => { 
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user)); 
  }, []);

  // 1. PERBAIKAN: Mengambil daftar room (Gunakan supabase.from)
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false }) // Asumsi kolom tanggal kamu bernama 'created_at'
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // 2. PERBAIKAN: Subscribe ke update Realtime Supabase
  useEffect(() => {
    const channel = supabase.channel('realtime-rooms')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          
          if (activeRoom && payload.new && payload.new.id === activeRoom.id) {
            if (payload.eventType === 'UPDATE') {
              setActiveRoom(payload.new);
              setOptions(payload.new.options || []);
              if (payload.new.result && payload.new.status === 'finished') {
                setResult(payload.new.result);
                setShowResult(true);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom, queryClient]);

  // 3. PERBAIKAN: Membuat Room baru (Insert)
  const createRoom = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          name: newRoomName || 'Ruangan Baru',
          code: generateCode(),
          status: 'waiting',
          options: [],
          participants: [{ email: user?.email, name: user?.full_name }],
          host_email: user?.email,
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setCreateOpen(false);
      setNewRoomName('');
      setActiveRoom(room);
      setOptions(room.options || []);
      toast.success('Room dibuat!');
    },
    onError: (error) => {
      toast.error('Gagal membuat room: ' + error.message);
    }
  });

  const joinRoom = async () => {
    const found = rooms.find(r => r.code === joinCode.toUpperCase());
    if (!found) { toast.error('Room tidak ditemukan'); return; }
    
    const alreadyIn = found.participants?.some(p => p.email === user?.email);
    if (!alreadyIn) {
      // 4. PERBAIKAN: Update Data
      const { error } = await supabase
        .from('rooms')
        .update({
          participants: [...(found.participants || []), { email: user?.email, name: user?.full_name }],
        })
        .eq('id', found.id);
        
      if (error) { toast.error('Gagal masuk ke database'); return; }
    }
    
    setActiveRoom(found);
    setOptions(found.options || []);
    setJoinCode('');
    toast.success('Bergabung ke room!');
  };

  const updateRoomOptions = async (newOptions) => {
    setOptions(newOptions);
    if (activeRoom) {
      await supabase.from('rooms').update({ options: newOptions }).eq('id', activeRoom.id);
    }
  };

  const spinRoom = () => {
    if (activeRoom) {
      supabase.from('rooms').update({ status: 'spinning' }).eq('id', activeRoom.id);
    }
  };

  const handleRoomResult = async (winner) => {
    const label = winner.label || winner;
    if (activeRoom) {
      await supabase.from('rooms').update({
        status: 'finished',
        result: label,
      }).eq('id', activeRoom.id);
    }
    setResult(label);
    setShowResult(true);
  };

  const deleteRoom = async (roomId) => {
    // 5. PERBAIKAN: Hapus Data
    await supabase.from('rooms').delete().eq('id', roomId);
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
      setOptions([]);
    }
    toast.success('Room dihapus');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Kode disalin!');
  };

  const resetRoom = async () => {
    if (activeRoom) {
      await supabase.from('rooms').update({ status: 'waiting', result: null }).eq('id', activeRoom.id);
      setResult(null);
      setShowResult(false);
    }
  };

  const isHost = activeRoom?.host_email === user?.email;

  if (activeRoom) {
    return (
      <div>
        <PageHeader icon={Users} title={activeRoom.name} subtitle={`Kode: ${activeRoom.code}`} />

        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => { setActiveRoom(null); setOptions([]); }}>
            ← Kembali
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyCode(activeRoom.code)}>
            <Copy className="w-3 h-3 mr-1" /> Salin Kode
          </Button>
          <Badge variant="secondary">
            {activeRoom.participants?.length || 0} peserta
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="flex justify-center">
              <SpinWheel
                options={options}
                onResult={handleRoomResult}
                spinning={spinning}
                setSpinning={setSpinning}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border/30 p-4">
              <h3 className="font-heading font-semibold mb-3">Peserta</h3>
              <div className="space-y-2">
                {activeRoom.participants?.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {(p.name || p.email)?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm">{p.name || p.email}</span>
                    {p.email === activeRoom.host_email && (
                      <Badge variant="secondary" className="text-xs ml-auto">Host</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <div className="bg-card rounded-2xl border border-border/30 p-4">
                <h3 className="font-heading font-semibold mb-3">Pilihan</h3>
                <OptionEditor options={options} setOptions={updateRoomOptions} />
              </div>
            )}
          </div>
        </div>

        <ResultModal
          open={showResult}
          onClose={() => setShowResult(false)}
          result={result}
          onSpinAgain={resetRoom}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={Users} title="Rooms" subtitle="Buat atau gabung ruangan untuk putar bersama" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-left hover:border-primary/40 transition-all"
            >
              <Plus className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-heading font-bold text-lg">Buat Room</h3>
              <p className="text-sm text-muted-foreground">Buat ruangan dan undang teman</p>
            </motion.button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading">Buat Room Baru</DialogTitle>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nama ruangan..."
              className="bg-secondary/50"
            />
            <Button onClick={() => createRoom.mutate()} className="bg-primary hover:bg-primary/80">
              <Plus className="w-4 h-4 mr-2" /> Buat
            </Button>
          </DialogContent>
        </Dialog>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <ArrowRight className="w-8 h-8 text-accent mb-3" />
          <h3 className="font-heading font-bold text-lg mb-3">Gabung Room</h3>
          <div className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Masukkan kode..."
              className="bg-secondary/50 uppercase"
            />
            <Button onClick={joinRoom} className="bg-accent hover:bg-accent/80 text-white shrink-0">
              Gabung
            </Button>
          </div>
        </div>
      </div>

      <h3 className="font-heading font-semibold text-lg mb-4">Room Saya</h3>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Belum ada room. Buat yang pertama!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-2xl border border-border/30 p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-heading font-semibold">{room.name}</h4>
                  <Badge variant={room.status === 'waiting' ? 'secondary' : room.status === 'spinning' ? 'default' : 'outline'}>
                    {room.status === 'waiting' ? 'Menunggu' : room.status === 'spinning' ? 'Berputar' : 'Selesai'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="font-mono bg-secondary/50 px-2 py-1 rounded">{room.code}</span>
                  <button onClick={() => copyCode(room.code)}>
                    <Copy className="w-3 h-3" />
                  </button>
                  <span>• {room.participants?.length || 0} peserta</span>
                </div>
                {room.result && (
                  <div className="flex items-center gap-1 text-sm text-primary mb-3">
                    <CheckCircle className="w-3 h-3" />
                    <span>{room.result}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setActiveRoom(room); setOptions(room.options || []); }} className="flex-1">
                    Masuk
                  </Button>
                  {room.host_email === user?.email && (
                    <Button size="sm" variant="ghost" onClick={() => deleteRoom(room.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}