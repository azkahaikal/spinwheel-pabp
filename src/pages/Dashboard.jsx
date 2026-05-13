import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/api/supabaseClient';
import { CircleDot, Weight, CopyCheck, Flame, Users, History, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const features = [
  {
    path: '/spin/normal',
    icon: CircleDot,
    title: 'Spin Normal',
    desc: 'Roda putar klasik untuk pilihan acak',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'glow-primary',
  },
  {
    path: '/spin/weighted',
    icon: Weight,
    title: 'Weighted Spin',
    desc: 'Atur bobot untuk setiap pilihan',
    gradient: 'from-cyan-500 to-teal-600',
    glow: 'glow-accent',
  },
  {
    path: '/spin/double',
    icon: CopyCheck,
    title: 'Double Spin',
    desc: 'Dua roda putar sekaligus',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'glow-pink',
  },
  {
    path: '/spin/truth-or-dare',
    icon: Flame,
    title: 'Truth or Dare',
    desc: 'Permainan seru Truth or Dare',
    gradient: 'from-orange-500 to-amber-600',
    glow: 'glow-primary',
  },
  {
    path: '/rooms',
    icon: Users,
    title: 'Rooms',
    desc: 'Putar bersama teman real-time',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'glow-accent',
  },
  {
    path: '/history',
    icon: History,
    title: 'Riwayat',
    desc: 'Lihat semua hasil putaran',
    gradient: 'from-emerald-500 to-green-600',
    glow: 'glow-primary',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [totalSpins, setTotalSpins] = useState(0);

  useEffect(() => {
    if (user) {
      supabase
        .from('spin_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => setTotalSpins(count || 0));
    }
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-border/30 p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-24 -translate-x-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Selamat datang kembali</span>
          </div>

          {/* Menampilkan nama pengguna dengan aman */}
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
            Halo, <span className="text-gradient">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>! 👋
          </h1>
          
          <p className="text-muted-foreground max-w-lg">
            Buat keputusan lebih menyenangkan dengan roda putar interaktif. 
            Kamu sudah memutar <span className="text-primary font-semibold">{totalSpins}</span> kali!
          </p>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={f.path}
              className={`group block p-6 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-all duration-300 hover:${f.glow}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <span>Mulai</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}