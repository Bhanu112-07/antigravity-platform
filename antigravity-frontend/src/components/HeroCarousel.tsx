"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const slides = [
  {
    image: "/images/hero_urban_cyberpunk.png",
    title: "URBAN ARSENAL",
    subtitle: "Engineered for the modern nomad. High-performance techwear meets street style.",
    cta: "Shop Techwear",
    link: "/products?category=Men",
    color: "from-purple-600 to-blue-600"
  },
  {
    image: "/images/hero_minimalist_fashion.png",
    title: "MINIMALIST EDGE",
    subtitle: "Elegance in simplicity. Discover our monochromatic summer collection.",
    cta: "Explore Styles",
    link: "/products?category=PHANTS",
    color: "from-gray-600 to-gray-900"
  },
  {
    image: "/images/hero_neon_nightlife.png",
    title: "NEON PULSE",
    subtitle: "Command the night. Reflective details and bold silhouettes for after-dark ventures.",
    cta: "View Collection",
    link: "/products",
    color: "from-cyan-600 to-purple-600"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-105"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          
          {/* Overlay Gradient (Lighter for white theme) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center max-w-6xl">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-2xl"
            >
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-cyan-600 mb-4">
                Exclusive Drop
              </h2>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-black leading-none uppercase">
                {slides[current].title}
              </h1>
              <p className="text-lg md:text-xl text-black/70 mb-10 font-medium max-w-lg leading-relaxed">
                {slides[current].subtitle}
              </p>
              <div className="flex gap-4">
                <Link 
                  href={slides[current].link} 
                  className="px-10 py-5 bg-black text-white font-bold uppercase tracking-wider rounded-none hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20"
                >
                  {slides[current].cta}
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-300 ${
              current === i ? 'w-12 bg-black' : 'w-4 bg-black/20 hover:bg-black/40'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-10 z-30 hidden md:flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 rotate-90 origin-right">Scroll</span>
        <div className="w-px h-12 bg-black/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/3 bg-black"
          />
        </div>
      </div>
    </section>
  );
}
