import React, { useRef } from 'react';

/**
 * Drop-in replacement for your Card.
 * Props preserved: { children, className, hover, gradient }
 * New: subtle 3D tilt that respects reduced-motion.
 */
const cn = (...c) => c.filter(Boolean).join(' ');

export default function Card({
  children,
  className = '',
  hover = false,
  gradient = false,
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const px = (x / r.width) * 2 - 1;   // -1 .. 1
    const py = (y / r.height) * 2 - 1;  // -1 .. 1
    // smaller values = gentler tilt
    el.style.setProperty('--tilt-x', `${-(py * 6)}deg`);
    el.style.setProperty('--tilt-y', `${px * 6}deg`);
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', `0deg`);
    el.style.setProperty('--tilt-y', `0deg`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        // base glass card
        'card-3d rounded-2xl p-6 backdrop-blur-xl transition-all duration-300',
        gradient
          ? 'bg-linear-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70'
          : 'bg-white/80 dark:bg-gray-800/80',
        'border border-gray-200/50 dark:border-gray-700/50',
        // depth + shadow
        'shadow-3d',
        // optional hover lift
        hover && 'hover:-translate-y-1',
        className
      )}
    >
      {/* subtle highlight that follows the cursor */}
      <div className="pointer-events-none card-3d-glare" />
      {children}
    </div>
  );
}
