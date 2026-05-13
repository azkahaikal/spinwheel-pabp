import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OptionEditor({ options, setOptions, showWeights = false, weights, setWeights }) {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    setOptions([...options, { label: trimmed }]);
    if (showWeights && setWeights) {
      setWeights([...(weights || []), 1]);
    }
    setNewOption('');
  };

  const removeOption = (idx) => {
    setOptions(options.filter((_, i) => i !== idx));
    if (showWeights && setWeights) {
      setWeights((weights || []).filter((_, i) => i !== idx));
    }
  };

  const updateWeight = (idx, val) => {
    if (!setWeights) return;
    const w = [...(weights || [])];
    w[idx] = Math.max(1, parseInt(val) || 1);
    setWeights(w);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addOption()}
          placeholder="Tambah pilihan..."
          className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={addOption} size="icon" className="bg-primary hover:bg-primary/80 shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence>
          {options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{
                background: ['#8B5CF6','#06B6D4','#EC4899','#F59E0B','#10B981','#EF4444','#3B82F6','#F97316','#14B8A6','#A855F7'][i % 10]
              }} />
              <span className="flex-1 text-sm truncate">{opt.label}</span>
              {showWeights && (
                <Input
                  type="number"
                  min={1}
                  value={weights?.[i] || 1}
                  onChange={(e) => updateWeight(i, e.target.value)}
                  className="w-16 h-8 text-center text-xs bg-secondary/50 border-border/50"
                />
              )}
              <button onClick={() => removeOption(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {options.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setOptions([]); setWeights?.([]); }}
          className="text-muted-foreground hover:text-destructive text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Hapus Semua
        </Button>
      )}
    </div>
  );
}