import React from 'react';
import { Sparkles } from 'lucide-react';

interface SectionDividerProps {
  icon?: React.ReactNode;
  className?: string;
}

export function SectionDivider({ icon = <Sparkles className="w-4 h-4 text-pink-500" />, className = '' }: SectionDividerProps) {
  return (
    <div className={`relative flex items-center justify-center my-12 sm:my-16 px-4 ${className}`} aria-hidden="true">
      {/* Left Gradient Line */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/60 to-pink-500/30" />

      {/* Central Icon Container */}
      <div className="mx-4 p-2.5 rounded-full bg-white/80 border border-pink-200/80 shadow-md shadow-pink-500/10 backdrop-blur-md flex items-center justify-center">
        {icon}
      </div>

      {/* Right Gradient Line */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-300/60 to-pink-500/30" />
    </div>
  );
}

export default SectionDivider;
