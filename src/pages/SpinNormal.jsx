import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { CircleDot } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SpinWheel from '@/components/SpinWheel';
import OptionEditor from '@/components/OptionEditor';
import ResultModal from '@/components/ResultModal';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_OPTIONS = [
  { label: 'Pilihan 1' },
  { label: 'Pilihan 2' },
  { label: 'Pilihan 3' },
  { label: 'Pilihan 4' },
  { label: 'Pilihan 5' },
];

export default function SpinNormal() {
  const { user } = useAuth();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleResult = async (winner) => {
    const label = winner.label || winner;
    setResult(label);
    setShowResult(true);

    if (user) {
      console.log("Mencoba menyimpan data untuk user:", user.id); // Cek ID di console
      
      // Tambahkan const { error } untuk menangkap penolakan dari database
      const { data, error } = await supabase.from('spin_sessions').insert({
        user_id: user.id,
        type: 'normal',
        title: 'Spin Normal',
        options: options,
        result: label,
      }).select(); // Tambahkan .select() untuk memastikan data dikembalikan

      // Jika ada error, paksa munculkan pop-up di layar
      if (error) {
        console.error("Gagal simpan ke database:", error);
        alert("Gagal menyimpan ke database! Error: " + error.message);
      } else {
        console.log("Berhasil disimpan!", data);
      }
    } else {
      alert("Sistem gagal membaca data akun kamu (User kosong).");
    }
  };

  return (
    <div>
      <PageHeader icon={CircleDot} title="Spin Normal" subtitle="Masukkan pilihan dan putar roda!" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex justify-center">
          <SpinWheel
            options={options}
            onResult={handleResult}
            spinning={spinning}
            setSpinning={setSpinning}
          />
        </div>

        <div className="bg-card rounded-2xl border border-border/30 p-6">
          <h3 className="font-heading font-semibold text-lg mb-4">Daftar Pilihan</h3>
          <OptionEditor options={options} setOptions={setOptions} />
        </div>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        result={result}
        onSpinAgain={() => setShowResult(false)}
      />
    </div>
  );
}