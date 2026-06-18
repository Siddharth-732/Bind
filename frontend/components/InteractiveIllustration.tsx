"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface InteractiveIllustrationProps {
  focusedField: "email" | "password" | "name" | null;
  hasError: boolean;
}

export default function InteractiveIllustration({
  focusedField,
  hasError,
}: InteractiveIllustrationProps) {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isEyesClosed, setIsEyesClosed] = useState(false);
  const [isAngry, setIsAngry] = useState(false);

  useEffect(() => {
    if (hasError) {
      setIsAngry(true);
      setPupilOffset({ x: 0, y: 0 });
      setIsEyesClosed(false);
      
      const t = setTimeout(() => setIsAngry(false), 3000);
      return () => clearTimeout(t);
    } else {
      setIsAngry(false);
    }

    if (focusedField === "password") {
      setIsEyesClosed(true);
      setPupilOffset({ x: 0, y: 0 });
    } else if (focusedField) {
      setIsEyesClosed(false);
      setPupilOffset({ x: 4, y: 2 });
    } else {
      setIsEyesClosed(false);
      setPupilOffset({ x: 0, y: 0 });
    }
  }, [focusedField, hasError]);

  const springConfig = { type: "spring" as const, stiffness: 300, damping: 25 };

  // Reusable Eye Component
  const Eye = ({ x, y, isDark = false, eyebrowTilt = 1 }: { x: number; y: number; isDark?: boolean; eyebrowTilt?: number }) => {
    const strokeColor = isDark ? "white" : "#111";

    return (
      <g>
        {/* White Eyeball */}
        <motion.circle
          cx={x}
          cy={y}
          r={6}
          fill="white"
          initial={false}
          animate={{ scaleY: isEyesClosed ? 0.1 : 1, opacity: isEyesClosed ? 0 : 1 }}
          transition={springConfig}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
        
        {/* Pupil */}
        <motion.circle
          cx={x}
          cy={y}
          r={isAngry ? 2 : 2.5}
          fill="#111"
          initial={false}
          animate={{ 
            x: pupilOffset.x, 
            y: pupilOffset.y,
            scaleY: isEyesClosed ? 0 : 1,
            opacity: isEyesClosed ? 0 : 1
          }}
          transition={springConfig}
        />

        {/* Closed Eye Line */}
        <motion.path
          d={`M ${x - 5} ${y} L ${x + 5} ${y}`}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: isEyesClosed ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />

        {/* Angry Eyebrow */}
        <motion.path
          d={`M ${x - 6} ${y - 8} L ${x + 6} ${y - 8 + (4 * eyebrowTilt)}`}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={false}
          animate={{ 
            opacity: isAngry ? 1 : 0, 
            y: isAngry ? 2 : -5 
          }}
          transition={springConfig}
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB] overflow-hidden">
      <motion.div 
        className="relative w-[400px] h-[400px] scale-[1.25] md:scale-[1.4]"
        initial={false}
        animate={hasError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Blue Block (Tall, back left) */}
          <g transform="translate(80, 80)">
            <rect width="110" height="220" fill="#4A90E2" rx="4" />
            <Eye x={50} y={30} eyebrowTilt={1} />
            <Eye x={70} y={30} eyebrowTilt={-1} />
            {/* Small smile / beak morph */}
            <motion.path 
              initial={false}
              animate={{ d: isAngry ? "M 55 45 Q 60 40 65 45" : "M 55 42 Q 60 48 65 42" }}
              stroke="#111" 
              strokeWidth="2" 
              fill="none" 
              transition={springConfig}
            />
          </g>

          {/* Black Block (Medium, middle) */}
          <g transform="translate(160, 150)">
            <rect width="90" height="150" fill="#212121" rx="4" />
            <Eye x={40} y={30} isDark eyebrowTilt={1} />
            <Eye x={60} y={30} isDark eyebrowTilt={-1} />
            {/* Expression morph */}
            <motion.path 
              initial={false}
              animate={{ d: isAngry ? "M 45 45 Q 50 40 55 45" : "M 45 45 Q 50 45 55 45" }}
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              transition={springConfig}
            />
          </g>

          {/* Yellow Shape (Right, front) */}
          <g transform="translate(220, 190)">
            <path d="M 0 50 A 50 50 0 0 1 100 50 L 100 110 L 0 110 Z" fill="#F7CA18" />
            <Eye x={30} y={40} eyebrowTilt={1} />
            {/* Long Beak (Chuck style) - scales up slightly when angry */}
            <motion.path
              d="M 50 50 L 100 50 L 50 56 Z"
              fill="#E67E22"
              initial={false}
              animate={{ scale: isAngry ? 1.1 : 1, x: isAngry ? 5 : 0 }}
              transition={springConfig}
            />
          </g>

          {/* Red Semicircle (Bottom Left, front) */}
          <g transform="translate(40, 200)">
            <path d="M 0 100 A 100 100 0 0 1 200 100 Z" fill="#E23636" />
            <g transform="translate(100, 50)">
               <Eye x={0} y={0} eyebrowTilt={1} />
               <Eye x={24} y={0} eyebrowTilt={-1} />
               {/* Beak Morph */}
               <motion.path 
                 initial={false}
                 animate={{ d: isAngry ? "M 5 15 L 12 25 L 19 15 Z" : "M 5 15 L 12 22 L 19 15 Z" }}
                 fill="#F1C40F" 
                 transition={springConfig}
               />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
