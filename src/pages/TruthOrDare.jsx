import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Flame, Sparkles, RefreshCw, Plus, X, Users, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import SpinWheel from '@/components/SpinWheel';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_TRUTHS = [
  "Apa rahasia terbesar yang pernah kamu simpan?",
  "Siapa orang yang paling kamu kagumi diam-diam?",
  "Kapan terakhir kali kamu menangis dan kenapa?",
  "Apa hal paling memalukan yang pernah terjadi padamu?",
  "Apa ketakutan terbesar yang kamu punya?",
];

const DEFAULT_DARES = [
  "Telepon orang terakhir di riwayat panggilan sekarang!",
  "Nyanyi lagu anak-anak dengan penuh penghayatan!",
  "Jalan jongkok keliling ruangan!",
  "Push up 10 kali sekarang!",
  "Dance tanpa musik selama 30 detik!",
];

// --- Reusable list editor ---
function ListEditor({ title, emoji, items, setItems, color }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setItems(prev => [...prev, trimmed]);
    setInput('');
  };

  const remove = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className={`rounded-2xl border ${color.border} bg-card overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <span className="font-heading font-bold">{title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}>{items.length} item</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && add()}
                  placeholder={`Tambah ${title.toLowerCase()}...`}
                  className="bg-secondary/50 border-border/50 text-sm"
                />
                <Button onClick={add} size="icon" className={`${color.btn} shrink-0`}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/20 group"
                    >
                      <span className="flex-1 text-sm leading-snug">{item}</span>
                      <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Step 1: Setup ---
function PlayerSetup({ onStart }) {
  const [players, setPlayers] = useState([]);
  const [inputName, setInputName] = useState('');
  const [truths, setTruths] = useState(DEFAULT_TRUTHS);
  const [dares, setDares] = useState(DEFAULT_DARES);

  const COLORS = ['#8B5CF6','#06B6D4','#EC4899','#F59E0B','#10B981','#EF4444','#3B82F6','#F97316'];

  const addPlayer = () => {
    const trimmed = inputName.trim();
    if (!trimmed) return;
    setPlayers(prev => [...prev, trimmed]);
    setInputName('');
  };

  const removePlayer = (idx) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-5"
    >
      <div className="bg-card rounded-2xl border border-border/30 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Daftar Pemain</h2>
        </div>
        <div className="flex gap-2">
          <Input
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
            placeholder="Nama pemain..."
            className="bg-secondary/50 border-border/50"
          />
          <Button onClick={addPlayer} size="icon" className="bg-primary hover:bg-primary/80 shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {players.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-2">Tambahkan minimal 2 pemain</p>
            )}
            {players.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30 border border-border/20"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  {name[0]?.toUpperCase()}
                </div>
                <span className="flex-1 font-medium text-sm">{name}</span>
                <button onClick={() => removePlayer(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium px-1">Kustomisasi Pertanyaan & Tantangan</p>
        <ListEditor
          title="Pertanyaan Truth"
          emoji="🤔"
          items={truths}
          setItems={setTruths}
          color={{
            border: 'border-cyan-500/20',
            badge: 'bg-cyan-500/15 text-cyan-400',
            btn: 'bg-cyan-500 hover:bg-cyan-600 text-white',
          }}
        />
        <ListEditor
          title="Tantangan Dare"
          emoji="🔥"
          items={dares}
          setItems={setDares}
          color={{
            border: 'border-orange-500/20',
            badge: 'bg-orange-500/15 text-orange-400',
            btn: 'bg-orange-500 hover:bg-orange-600 text-white',
          }}
        />
      </div>

      <Button
        onClick={() => onStart(players, truths, dares)}
        disabled={players.length < 2 || truths.length === 0 || dares.length === 0}
        className="w-full bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-lg py-6 rounded-xl glow-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ArrowRight className="w-5 h-5 mr-2" />
        Mulai Permainan ({players.length} pemain)
      </Button>
    </motion.div>
  );
}

// --- Step 2: Spin Player ---
function PlayerSpin({ players, onPlayerSelected, onReset }) {
  const [spinning, setSpinning] = useState(false);
  const wheelOptions = players.map(name => ({ label: name }));

  const handleResult = (winner) => {
    onPlayerSelected(winner.label || winner);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Putar roda untuk menentukan siapa yang giliran!</p>
      </div>
      <div className="flex justify-center">
        <SpinWheel options={wheelOptions} onResult={handleResult} spinning={spinning} setSpinning={setSpinning} />
      </div>
      <div className="text-center">
        <button onClick={onReset} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
          ← Ubah daftar pemain
        </button>
      </div>
    </motion.div>
  );
}

// --- Step 3: Choose Truth or Dare ---
function ChoicePicker({ player, onChoice, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-heading font-bold text-primary">{player}</span>
        </div>
        <p className="text-muted-foreground text-lg">Pilih tantanganmu!</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onChoice('truth')}
          className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 hover:border-cyan-400/60 transition-all text-center space-y-3"
        >
          <div className="text-5xl">🤔</div>
          <div>
            <p className="font-heading font-bold text-xl text-cyan-400">TRUTH</p>
            <p className="text-xs text-muted-foreground">Jawab jujur pertanyaan</p>
          </div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onChoice('dare')}
          className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 hover:border-orange-400/60 transition-all text-center space-y-3"
        >
          <div className="text-5xl">🔥</div>
          <div>
            <p className="font-heading font-bold text-xl text-orange-400">DARE</p>
            <p className="text-xs text-muted-foreground">Lakukan tantangan</p>
          </div>
        </motion.button>
      </div>
      <div className="text-center">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
          ← Putar ulang
        </button>
      </div>
    </motion.div>
  );
}

// --- Step 4: Show Challenge ---
function ChallengeDisplay({ player, type, challenge, onNext, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center flex flex-wrap gap-2 justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="font-heading font-bold text-primary">{player}</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
          type === 'truth' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
        }`}>
          {type === 'truth' ? '🤔 TRUTH' : '🔥 DARE'}
        </div>
      </div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`p-8 rounded-2xl border-2 text-center ${
          type === 'truth' ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30' : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30'
        }`}
      >
        <p className="text-xl md:text-2xl font-heading font-bold leading-relaxed">{challenge}</p>
      </motion.div>
      <div className="flex gap-3">
        <Button onClick={onNext} className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-heading font-semibold py-5">
          <RefreshCw className="w-4 h-4 mr-2" /> Giliran Berikutnya
        </Button>
        <Button onClick={onReset} variant="outline" className="border-border/50">Mulai Ulang</Button>
      </div>
    </motion.div>
  );
}

// --- Main Page ---
export default function TruthOrDare() {
  const { user } = useAuth();
  const [step, setStep] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [truths, setTruths] = useState([]);
  const [dares, setDares] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [choiceType, setChoiceType] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const STEPS = ['setup', 'spin', 'choose', 'challenge'];

  const handleStart = (playerList, truthList, dareList) => {
    setPlayers(playerList);
    setTruths(truthList);
    setDares(dareList);
    setStep('spin');
  };

  const handlePlayerSelected = (player) => {
    setSelectedPlayer(player);
    setStep('choose');
  };

  const handleChoice = async (type) => {
    const pool = type === 'truth' ? truths : dares;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setChoiceType(type);
    setChallenge(picked);
    setStep('challenge');
    
    if (user) {
      await supabase.from('spin_sessions').insert({
        user_id: user.id,
        type: 'truth_or_dare',
        title: `${selectedPlayer} - ${type === 'truth' ? 'Truth' : 'Dare'}`,
        options: players.map(p => ({ label: p })),
        result: picked,
      });
    }
  };

  const handleNext = () => {
    setSelectedPlayer(null);
    setChoiceType(null);
    setChallenge(null);
    setStep('spin');
  };

  const handleReset = () => {
    setPlayers([]); setTruths([]); setDares([]);
    setSelectedPlayer(null); setChoiceType(null); setChallenge(null);
    setStep('setup');
  };

  return (
    <div>
      <PageHeader icon={Flame} title="Truth or Dare" subtitle="Input pemain, putar roda, dan terima tantangannya!" />

      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-primary text-white glow-primary' : STEPS.indexOf(step) > i ? 'bg-primary/30 text-primary' : 'bg-secondary text-muted-foreground'
            }`}>{i + 1}</div>
            {i < 3 && <div className={`w-8 h-0.5 transition-all ${STEPS.indexOf(step) > i ? 'bg-primary/50' : 'bg-border/50'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlayerSetup onStart={handleStart} />
          </motion.div>
        )}
        {step === 'spin' && (
          <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlayerSpin players={players} onPlayerSelected={handlePlayerSelected} onReset={handleReset} />
          </motion.div>
        )}
        {step === 'choose' && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChoicePicker player={selectedPlayer} onChoice={handleChoice} onBack={() => setStep('spin')} />
          </motion.div>
        )}
        {step === 'challenge' && (
          <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChallengeDisplay player={selectedPlayer} type={choiceType} challenge={challenge} onNext={handleNext} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}