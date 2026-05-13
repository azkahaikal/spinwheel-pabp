import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function ResultModal({ open, onClose, result, resultSecondary, onSpinAgain }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 text-center max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-heading text-xl text-muted-foreground">
            🎉 Hasil Putaran
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-fit"
          >
            <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 glow-primary">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-heading font-bold text-gradient">
                {result}
              </p>
            </div>
          </motion.div>

          {resultSecondary && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto w-fit"
            >
              <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 glow-pink">
                <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  {resultSecondary}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <Button
          onClick={onSpinAgain}
          className="bg-gradient-to-r from-primary to-accent text-white font-heading"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Putar Lagi
        </Button>
      </DialogContent>
    </Dialog>
  );
}