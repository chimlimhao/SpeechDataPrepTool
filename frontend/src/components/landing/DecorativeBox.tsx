"use client"

import React from "react";

interface DecorativeBoxProps {
  className?: string;
  rotate?: string;
  position?: string;
  children?: React.ReactNode;
}

export function DecorativeBox({ 
  className = "", 
  rotate = "", 
  position = "",
  children
}: DecorativeBoxProps) {
  return (
    <div className={`absolute -z-10 ${position} ${rotate}`}>
      <div
        className={`size-16 md:size-20 lg:size-28 flex items-center justify-center rounded-xl lg:rounded-3xl border border-teal-500/20 bg-gradient-to-br from-card via-card/80 to-teal-500/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_20px_rgba(20,184,166,0.2)] transition-shadow duration-300 ${className}`}
      >
        {children}
      </div>
    </div>
  )
} 