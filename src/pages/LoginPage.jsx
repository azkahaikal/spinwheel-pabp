import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [nama, setNama] = useState(''); // State baru untuk Nama
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        // --- PROSES DAFTAR (Langsung Auto-Login) ---
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: nama, 
            }
          }
        });
        
        if (error) throw error;

        toast.success('Pendaftaran berhasil! Mengarahkan ke Dashboard...');
        // Tidak perlu lagi mengubah state isRegister atau mengosongkan password
        // karena sistem akan otomatis merender halaman Dashboard

      } else {
        // --- PROSES LOGIN MANUAL ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Berhasil masuk!');
      }
    } catch (err) {
      const message = err.message === 'Invalid login credentials' 
        ? 'Email atau password salah.' 
        : err.message;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-heading">
      <div className="w-full max-w-md bg-card border border-border/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{isRegister ? 'Buat Akun Baru' : 'Masuk Ke Spin Decide'}</h1>
          <p className="text-muted-foreground text-sm text-center mt-2">
            {isRegister ? 'Lengkapi data di bawah untuk mendaftar' : 'Login untuk melihat riwayat putaran kamu'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Kolom Nama hanya muncul kalau sedang di mode Daftar */}
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" placeholder="Nama Panggilan" className="pl-10 bg-secondary/50"
                value={nama} onChange={e => setNama(e.target.value)} required={isRegister} 
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input 
              type="email" placeholder="Email" className="pl-10 bg-secondary/50"
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input 
              type="password" placeholder="Password (Min. 6 Karakter)" className="pl-10 bg-secondary/50"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            />
          </div>
          <Button disabled={isLoading} className="w-full bg-primary py-6 rounded-xl glow-primary mt-2">
            {isLoading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}</span>
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="ml-2 text-primary font-bold hover:underline">
            {isRegister ? 'Login di sini' : 'Daftar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}