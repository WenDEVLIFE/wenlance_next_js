'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ShootingStars component that creates a premium animated night sky background.
 */
export const ShootingStars: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate static stars
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0b]">
      {/* Static twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white opacity-0"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Shooting stars */}
      <ShootingStar delay={0} />
      <ShootingStar delay={4} />
      <ShootingStar delay={8} />

      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

const ShootingStar = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="absolute h-[2px] w-[100px] bg-gradient-to-r from-transparent via-blue-400 to-white"
      initial={{ top: "-10%", left: "110%", rotate: -45, opacity: 1 }}
      animate={{
        top: "110%",
        left: "-10%",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 10,
        delay: delay,
        ease: "linear",
      }}
      style={{
        boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.4)",
      }}
    />
  );
};
