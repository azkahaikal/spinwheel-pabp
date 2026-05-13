import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Weight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SpinWheel from '@/components/SpinWheel';
import OptionEditor from '@/components/OptionEditor';
import ResultModal from '@/components/ResultModal';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_OPTIONS = [
  { label: 'Opsi A' },
  { label: 'Opsi B' },
  { label: 'Opsi C' },
];

export default function SpinWeighted() {
  const { user } = useAuth();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [weights, setWeights] = useState([3, 2, 1]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleResult = async (winner) => {
    const label = winner.label || winner;
    setResult(label);
    setShowResult(true);
    
    if (user) {
      await supabase.from('spin_sessions').insert({
        user_id: user.id,
        type: 'weighted',
        title: 'Weighted Spin',
        options: options.map((o, i) => ({ ...o, weight: weights[i] || 1 })),
        result: label,
      });
    }
  };

  return (
    <div>
      <PageHeader icon={Weight} title="Weighted Spin" subtitle="Atur bobot probabilitas setiap pilihan" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex justify-center">
          <SpinWheel
            options={options}
            weights={weights}
            onResult={handleResult}
            spinning={spinning}
            setSpinning={setSpinning}
          />
        </div>

        <div className="bg-card rounded-2xl border border-border/30 p-6">
          <h3 className="font-heading font-semibold text-lg mb-2">Daftar Pilihan</h3>
          <p className="text-xs text-muted-foreground mb-4">Angka bobot menentukan probabilitas terpilih</p>
          <OptionEditor
            options={options}
            setOptions={setOptions}
            showWeights={true}
            weights={weights}
            setWeights={setWeights}
          />
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