import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  '#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B', '#10B981',
  '#EF4444', '#3B82F6', '#F97316', '#14B8A6', '#A855F7',
  '#E11D48', '#0EA5E9', '#84CC16', '#D946EF', '#6366F1',
];

export default function SpinWheel({ options = [], onResult, spinning, setSpinning, weights }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);

  const segments = options.length || 1;
  const segmentAngle = 360 / segments;

  const drawWheel = useCallback((ctx, w, h, rot) => {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    // Offset -90deg so segment 0 starts at top (where the pointer is)
    ctx.rotate((rot - 90) * Math.PI / 180);

    let totalWeight = 0;
    const effectiveWeights = options.map((_, i) => weights?.[i] || 1);
    effectiveWeights.forEach(w => totalWeight += w);

    let startAngle = 0;

    options.forEach((opt, i) => {
      const sliceAngle = (effectiveWeights[i] / totalWeight) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      const color = COLORS[i % COLORS.length];
      gradient.addColorStop(0, color + '99');
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, Math.min(14, 140 / segments))}px Inter`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      const label = opt.label || opt;
      const maxLen = Math.max(8, 20 - segments);
      const displayText = label.length > maxLen ? label.slice(0, maxLen) + '…' : label;
      ctx.fillText(displayText, radius - 16, 5);
      ctx.restore();

      startAngle = endAngle;
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1025';
    ctx.fill();
    ctx.strokeStyle = 'rgba(139,92,246,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
    centerGrad.addColorStop(0, '#A78BFA');
    centerGrad.addColorStop(1, '#7C3AED');
    ctx.fillStyle = centerGrad;
    ctx.fill();

    ctx.restore();
  }, [options, weights, segments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.parentElement.clientWidth;
    const s = Math.min(size, 420);
    canvas.width = s * 2;
    canvas.height = s * 2;
    canvas.style.width = s + 'px';
    canvas.style.height = s + 'px';
    ctx.scale(2, 2);
    drawWheel(ctx, s, s, currentRotation);
  }, [options, currentRotation, drawWheel]);

  const spin = () => {
    if (spinning || options.length < 2) return;
    setSpinning(true);

    let totalWeight = 0;
    const effectiveWeights = options.map((_, i) => weights?.[i] || 1);
    effectiveWeights.forEach(w => totalWeight += w);

    // Weighted random
    let rand = Math.random() * totalWeight;
    let winnerIdx = 0;
    for (let i = 0; i < effectiveWeights.length; i++) {
      rand -= effectiveWeights[i];
      if (rand <= 0) { winnerIdx = i; break; }
    }

    // Calculate target angle
    // Segments start at top (12 o'clock) due to -90deg draw offset.
    // The pointer is at top, so we need the winner's segment center to land at 0deg (top).
    let angleStart = 0;
    for (let i = 0; i < winnerIdx; i++) {
      angleStart += (effectiveWeights[i] / totalWeight) * 360;
    }
    const sliceAngle = (effectiveWeights[winnerIdx] / totalWeight) * 360;
    // Pick a random point within the winner slice
    const targetWithinSlice = angleStart + sliceAngle * (0.2 + Math.random() * 0.6);
    // We need targetWithinSlice to end up at 0deg (top), so rotate by -targetWithinSlice
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = currentRotation + extraSpins * 360 - (currentRotation % 360) - targetWithinSlice;

    setRotation(finalRotation);

    let start = null;
    const duration = 4000 + Math.random() * 1000;
    const startRot = currentRotation;
    const diff = finalRotation - startRot;

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = easeOutCubic(progress);
      setCurrentRotation(startRot + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentRotation(finalRotation);
        setSpinning(false);
        const winner = options[winnerIdx];
        onResult?.(winner, winnerIdx);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer */}
      <div className="absolute -top-1 z-10 flex flex-col items-center">
        <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <div className="relative cursor-pointer" onClick={spin}>
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
        <canvas ref={canvasRef} className="relative z-[1]" />
      </div>

      {/* Spin button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={spin}
        disabled={spinning || options.length < 2}
        className="mt-6 px-10 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {spinning ? 'Memutar...' : '🎯 PUTAR!'}
      </motion.button>
    </div>
  );
}