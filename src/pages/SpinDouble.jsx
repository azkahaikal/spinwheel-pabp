import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { CopyCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SpinWheel from '@/components/SpinWheel';
import OptionEditor from '@/components/OptionEditor';
import ResultModal from '@/components/ResultModal';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_1 = [
  { label: 'Makan' },
  { label: 'Nonton' },
  { label: 'Main Game' },
];

const DEFAULT_2 = [
  { label: 'Sendiri' },
  { label: 'Bareng Teman' },
  { label: 'Bareng Keluarga' },
];

export default function SpinDouble() {
  const { user } = useAuth();
  const [options1, setOptions1] = useState(DEFAULT_1);
  const [options2, setOptions2] = useState(DEFAULT_2);
  const [spinning1, setSpinning1] = useState(false);
  const [spinning2, setSpinning2] = useState(false);
  const [result1, setResult1] = useState(null);
  const [result2, setResult2] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleResult1 = (winner) => {
    setResult1(winner.label || winner);
  };

  const handleResult2 = (winner) => {
    setResult2(winner.label || winner);
  };

  useEffect(() => {
    const saveAndShowResult = async () => {
      if (result1 && result2 && !spinning1 && !spinning2 && !showResult) {
        setShowResult(true);
        
        if (user) {
          try {
            await supabase.from('spin_sessions').insert({
              user_id: user.id,
              type: 'double',
              title: 'Double Spin',
              options: [...options1, ...options2],
              result: result1,
              result_secondary: result2,
            });
          } catch (error) {
            console.error("Gagal menyimpan:", error);
          }
        }
      }
    };

    saveAndShowResult();
  }, [result1, result2, spinning1, spinning2, showResult, options1, options2, user]);

  return (
    <div>
      <PageHeader icon={CopyCheck} title="Double Spin" subtitle="Dua roda putar untuk kombinasi keputusan" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <h3 className="font-heading font-semibold mb-3 text-center text-primary">Roda 1</h3>
            <div className="flex justify-center">
              <SpinWheel
                options={options1}
                onResult={handleResult1}
                spinning={spinning1}
                setSpinning={setSpinning1}
              />
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <OptionEditor options={options1} setOptions={setOptions1} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <h3 className="font-heading font-semibold mb-3 text-center text-accent">Roda 2</h3>
            <div className="flex justify-center">
              <SpinWheel
                options={options2}
                onResult={handleResult2}
                spinning={spinning2}
                setSpinning={setSpinning2}
              />
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <OptionEditor options={options2} setOptions={setOptions2} />
          </div>
        </div>
      </div>

      <ResultModal
        open={showResult}
        onClose={() => { setShowResult(false); setResult1(null); setResult2(null); }}
        result={result1}
        resultSecondary={result2}
        onSpinAgain={() => { setShowResult(false); setResult1(null); setResult2(null); }}
      />
    </div>
  );
}