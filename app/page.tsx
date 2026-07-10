'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene } from '@/components/Scene';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ArrowLeft, ArrowRight, ShoppingBag, X, ChevronRight, ChevronDown, Plus, Instagram, Twitter, Youtube, Sun, Moon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '@/lib/store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

const COLORS = [
  { name: 'Original', hex: '#FF5500' },
  { name: 'Midnight', hex: '#1A1A1A' },
  { name: 'Hyper Blue', hex: '#0066FF' },
  { name: 'Neon Green', hex: '#39FF14' },
  { name: 'Electric Purple', hex: '#BF00FF' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Cloud White', hex: '#F5F5F5' },
  { name: 'Desert Sand', hex: '#EDC9AF' },
  { name: 'Cobalt', hex: '#3D59AB' },
];

const PATTERNS = ['CLASSIC', 'STREET', 'TECH', 'CROSS'] as const;

// Custom Accordion Tab Component
function AccordionTab({ id, label, isActive, onClick, children }: { id: string, label: string, isActive: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className={cn("border-b border-foreground/10 transition-all overflow-hidden", isActive ? "pb-8" : "pb-0")}>
      <button 
        onClick={onClick}
        className={cn(
          "w-full py-5 px-6 flex justify-between items-center group transition-all duration-300",
          isActive 
            ? "bg-foreground/10 border-l-4 border-neon-orange" 
            : "bg-foreground/[0.04] hover:bg-foreground/[0.08] border-l-4 border-transparent"
        )}
      >
        <span className={cn(
          "font-display text-lg italic font-black uppercase transition-all",
          isActive ? "text-neon-orange" : "text-foreground/60 group-hover:text-foreground"
        )}>
          {label}
        </span>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className={cn("w-4 h-4", isActive ? "text-neon-orange" : "text-foreground/30")} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="px-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EcommercePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  
  const [activeColor, setActiveColor] = useState(COLORS[0].hex);
  const [activePattern, setActivePattern] = useState<typeof PATTERNS[number]>('CLASSIC');
  const [variants, setVariants] = useState<{ color: string; pattern: typeof PATTERNS[number]; price: string; name: string; promo: string; customText?: string; logoUrl?: string | null }[]>([
    { color: COLORS[0].hex, pattern: 'CLASSIC', price: '34.99', name: 'ELITE CLASSIC', promo: 'THE ORIGINAL ARCHITECT OF PERFORMANCE', customText: '', logoUrl: null },
    { color: COLORS[2].hex, pattern: 'STREET', price: '49.99', name: 'STREET MASTER', promo: 'RAW POWER FOR THE CONCRETE JUNGLE', customText: '', logoUrl: null },
    { color: COLORS[3].hex, pattern: 'TECH', price: '59.99', name: 'TECH SERIES', promo: 'CYBERNETIC GRIP FOR THE FUTURE GAME', customText: '', logoUrl: null },
  ]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeEnvironment, setActiveEnvironment] = useState<'studio' | 'city' | 'night' | 'warehouse'>('studio');
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState('"Space Grotesk"');
  const [engravingType, setEngravingType] = useState<'laser' | 'gold'>('gold');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savedLogos, setSavedLogos] = useState<string[]>([]);
  const [teamRoster, setTeamRoster] = useState<{name: string, number: string, logoUrl?: string | null}[]>([]);
  
  const updatePlayer = (idx: number, field: 'name' | 'number' | 'logoUrl', value: string | null) => {
    const newRoster = [...teamRoster];
    const player = { ...newRoster[idx] };
    if (field === 'name' || field === 'number') {
      player[field] = value as string;
    } else if (field === 'logoUrl') {
      player[field] = value;
    }
    newRoster[idx] = player;
    setTeamRoster(newRoster);
  };

  const removePlayer = (idx: number) => {
    setTeamRoster(teamRoster.filter((_, i) => i !== idx));
  };

  const applyPlayerToBall = (player: {name: string, number: string, logoUrl?: string | null}) => {
    setCustomText(`${player.name} ${player.number}`.trim());
    if (player.logoUrl) setLogoUrl(player.logoUrl);
  };
  const [activeAccordionTab, setActiveAccordionTab] = useState<string | null>('base');
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setSavedLogos(prev => [url, ...prev].slice(0, 5));
    }
  };

  const addPlayer = () => {
    setTeamRoster([...teamRoster, { name: '', number: '' }]);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{id: string, color: string, pattern: string, price: string}[]>([]);
  const [shards, setShards] = useState<{ left: string; top: string; duration: number }[]>([]);
  const setIsDesignStudio = useStore(state => state.setIsDesignStudio);
  const isIntroComplete = useStore(state => state.isIntroComplete);
  const setIsIntroComplete = useStore(state => state.setIsIntroComplete);
  const setIsAnatomyMode = useStore(state => state.setIsAnatomyMode);
  const setAnatomyProgress = useStore(state => state.setAnatomyProgress);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const ballTransformRef = useRef({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isIntroComplete) {
      ScrollTrigger.refresh();
    }
  }, [isIntroComplete]);

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
    setShards([...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
    })));
    /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

    const ctx = gsap.context(() => {
      // Create a main timeline for the ball's movement
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        }
      });

      const dockingX = 1060 / window.innerHeight;

      // Section A -> B: Smooth transition keeping ball centered
      tl.to(ballTransformRef.current, {
        y: 2,
        x: 0,
        scale: 1.2,
        ease: 'power2.inOut',
        duration: 1,
      })
      .to(ballTransformRef.current, {
        y: 0,
        x: 0,
        scale: 1.5,
        ease: 'power2.out',
        duration: 1,
      })
      // Section F: Anatomy (Shifted to left for info display)
      .to(ballTransformRef.current, {
        y: 0,
        x: -0.8,
        scale: 1.4,
        ease: 'power2.inOut',
        duration: 1,
      })
      .to(canvasWrapperRef.current, { opacity: 1, duration: 1 }, '<')
      // Section C: Move to side for info
      .to(ballTransformRef.current, {
        x: -1.2,
        scale: 0.9,
        ease: 'power2.inOut',
        duration: 1,
      })
      .to(canvasWrapperRef.current, { opacity: 0.15, duration: 1 }, '<')
      // Section D: Center-right for Lab (Docking next to drawer)
      .to(ballTransformRef.current, {
        x: dockingX,
        y: 0,
        scale: 1.3,
        ease: 'power3.inOut',
        duration: 1,
      })
      .to(canvasWrapperRef.current, { opacity: 1, duration: 1 }, '<')
      // Section E: Background for Contact
      .to(ballTransformRef.current, {
        y: -1.5,
        x: 0,
        scale: 0.6,
        ease: 'power2.inOut',
        duration: 1,
      })
      .to(canvasWrapperRef.current, { opacity: 0.2, duration: 1 }, '<');

      // Keep the canvas wrapper static and centered
      gsap.set(canvasWrapperRef.current, { y: 0, x: 0, scale: 1 });

      // Detection for Design Studio (Section D)
      ScrollTrigger.create({
        trigger: '#section-d',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setIsDesignStudio(true),
        onEnterBack: () => setIsDesignStudio(true),
        onLeave: () => setIsDesignStudio(false),
        onLeaveBack: () => setIsDesignStudio(false),
      });

      // Detection for Anatomy Mode (Section Anatomy)
      ScrollTrigger.create({
        trigger: '#section-anatomy',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          setAnatomyProgress(self.progress);
        },
        onEnter: () => setIsAnatomyMode(true),
        onEnterBack: () => setIsAnatomyMode(true),
        onLeave: () => setIsAnatomyMode(false),
        onLeaveBack: () => setIsAnatomyMode(false),
      });

      // Spacing text animation
      gsap.to('#spacing-text-left', {
        scrollTrigger: { trigger: '#section-b', start: 'top bottom', end: 'top top', scrub: 2 },
        x: -400,
        opacity: 0,
      });
      gsap.to('#spacing-text-right', {
        scrollTrigger: { trigger: '#section-b', start: 'top bottom', end: 'top top', scrub: 2 },
        x: 400,
        opacity: 0,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToCart = () => {
    const currentPrice = variants[activeVariantIndex]?.price || '34.99';
    const newItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      color: activeColor, 
      pattern: activePattern,
      price: currentPrice
    };
    setCartItems([...cartItems, newItem]);
    setIsCartOpen(true);
  };

  const nextVariant = () => {
    const nextIndex = (activeVariantIndex + 1) % variants.length;
    setActiveVariantIndex(nextIndex);
    // Smooth transition for ball properties
    setActiveColor(variants[nextIndex].color);
    setActivePattern(variants[nextIndex].pattern);
  };

  const prevVariant = () => {
    const prevIndex = (activeVariantIndex - 1 + variants.length) % variants.length;
    setActiveVariantIndex(prevIndex);
    setActiveColor(variants[prevIndex].color);
    setActivePattern(variants[prevIndex].pattern);
  };

  const confirmBuild = () => {
    // Generate a price based on complexity
    const basePrice = 34.99;
    const patternBonus = activePattern === 'CLASSIC' ? 0 : 15;
    const colorBonus = activeColor === COLORS[0].hex ? 0 : 10;
    const calculatedPrice = (basePrice + patternBonus + colorBonus).toFixed(2);

    const colorName = COLORS.find(c => c.hex === activeColor)?.name || 'Custom';
    const variantName = `${colorName} ${activePattern}`.toUpperCase();
    const promoLine = activePattern === 'TECH' 
      ? `ADVANCED ${colorName.toUpperCase()} NEURAL INTERFACE`
      : activePattern === 'STREET'
      ? `REINFORCED ${colorName.toUpperCase()} DURABILITY CORE`
      : `${colorName.toUpperCase()} SIGNATURE SERIES`;

    const newVariant = { 
      color: activeColor, 
      pattern: activePattern,
      price: calculatedPrice,
      name: variantName,
      promo: promoLine,
      customText: customText,
      logoUrl: logoUrl
    };

    // Check if variant already exists to avoid duplicates in gallery
    const exists = variants.some(v => 
      v.color === newVariant.color && 
      v.pattern === newVariant.pattern && 
      v.customText === newVariant.customText && 
      v.logoUrl === newVariant.logoUrl
    );
    
    if (!exists) {
      const newVariants = [...variants, newVariant];
      setVariants(newVariants);
      setActiveVariantIndex(newVariants.length - 1);
    }
    
    // Smooth scroll to the top to see the new creation (optional, but keep it for visual confirmation)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show visual confirmation
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div ref={containerRef} className={cn(
      "relative bg-background min-h-[500vh] font-ui selection:bg-neon-orange selection:text-white",
      !isIntroComplete && "h-screen overflow-hidden"
    )}>
      {/* Theme Overlays */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 scanline pointer-events-none z-50" />
      <div className="fixed inset-0 bg-noise pointer-events-none z-[60]" />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={isIntroComplete ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-14 px-6 flex items-center justify-between z-[100] rounded-full border border-foreground/10 backdrop-blur-md bg-background/60 shadow-[0_4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neon-orange rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.4)]">
              <span className="text-sm">🏀</span>
            </div>
            <span className="font-display font-black italic tracking-tighter text-xl">T-REX</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono font-bold tracking-[0.3em] uppercase opacity-70">
          <button onClick={() => scrollToSection('section-collection')} className="hover:text-neon-orange transition-colors">Shop</button>
          <button onClick={() => scrollToSection('section-b')} className="hover:text-neon-orange transition-colors">Tech</button>
          <button onClick={() => scrollToSection('section-anatomy')} className="hover:text-neon-orange transition-colors">Anatomy</button>
          <button onClick={() => scrollToSection('section-d')} className="hover:text-neon-orange transition-colors">Lab</button>
        </nav>

        <div className="flex items-center gap-4">
           <button 
             onClick={toggleTheme}
             className="relative p-2 hover:bg-foreground/5 rounded-full transition-all group"
             title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
           >
             <AnimatePresence mode="wait">
               <motion.div
                 key={theme}
                 initial={{ opacity: 0, rotate: -90 }}
                 animate={{ opacity: 1, rotate: 0 }}
                 exit={{ opacity: 0, rotate: 90 }}
                 transition={{ duration: 0.2 }}
               >
                 {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </motion.div>
             </AnimatePresence>
           </button>
           <button 
             onClick={() => setIsCartOpen(true)}
             className="relative p-2 hover:bg-foreground/5 rounded-full transition-all group"
           >
             <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
             {cartItems.length > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-orange text-black text-[9px] font-black rounded-full flex items-center justify-center">
                 {cartItems.length}
               </span>
             )}
           </button>
        </div>
      </motion.header>

      {/* Persistent 3D Canvas */}
      <div ref={canvasWrapperRef} className={cn(
        "fixed inset-0 w-full h-screen z-[25]",
        physicsEnabled ? "pointer-events-auto" : "pointer-events-none"
      )}>
        <Scene 
          color={activeColor} 
          pattern={activePattern} 
          environment={activeEnvironment}
          physicsEnabled={physicsEnabled}
          customText={customText}
          fontFamily={fontFamily}
          engravingType={engravingType}
          logoUrl={logoUrl}
          transformRef={ballTransformRef}
        />
      </div>

      {/* Section A: Hero */}
      <section id="section-a" className="relative h-screen flex items-center justify-center z-30">
        <div className="flex items-baseline gap-4 pointer-events-none relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeVariantIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="flex items-baseline gap-4"
            >
              <h1 id="spacing-text-left" className="text-[20vw] font-display leading-none tracking-tighter opacity-10 uppercase">
                {(variants[activeVariantIndex]?.name || 'T - REX').split(' ')[0].slice(0, 3)}
              </h1>
              <div className="w-[22vw] shrink-0"></div>
              <h1 id="spacing-text-right" className="text-[20vw] font-display leading-none tracking-tighter opacity-10 uppercase">
                {(variants[activeVariantIndex]?.name || 'T - REX').split(' ').slice(-1)[0].slice(-3)}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Overlays */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isIntroComplete ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="absolute top-32 left-12"
        >
          <button 
            onClick={() => setIsPromoOpen(true)}
            className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center group cursor-pointer hover:border-neon-orange hover:scale-110 transition-all bg-black/10 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 fill-white ml-1" />
          </button>
          <div className="font-mono text-[9px] tracking-widest mt-3 opacity-50 uppercase">Promotion Video</div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isIntroComplete && (
            <motion.div 
              key={activeVariantIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="absolute bottom-12 left-12 font-mono"
            >
              <div className="text-6xl font-black italic tracking-tighter text-foreground">
                ${variants[activeVariantIndex]?.price || '34.99'}
              </div>
              <div className="text-xl font-display font-black text-neon-orange uppercase tracking-tight -mt-1 drop-shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                {variants[activeVariantIndex]?.name || 'T - REX CLASSIC'}
              </div>
              <div className="text-[9px] tracking-[0.4em] opacity-30 mt-2 uppercase italic">29.5&quot; Official Size / Series 04</div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={isIntroComplete ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="absolute bottom-12 right-12 flex gap-4 z-50"
        >
           <button 
             onClick={prevVariant}
             className="w-14 h-14 border border-foreground/20 flex items-center justify-center cursor-pointer hover:border-foreground transition-all group bg-background/20 backdrop-blur-sm"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <button 
             onClick={nextVariant}
             className="w-14 h-14 border border-foreground/20 flex items-center justify-center cursor-pointer hover:border-foreground transition-all group bg-background/20 backdrop-blur-sm"
           >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </motion.div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={isIntroComplete ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "circOut" }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <button 
            onClick={addToCart}
            className="px-16 py-5 bg-neon-orange text-black font-black text-xl italic tracking-tighter shadow-[0_0_40px_rgba(255,85,0,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            ADD TO CART
          </button>
          <div className="flex gap-4">
            {variants.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  activeVariantIndex === i ? "bg-neon-orange w-4" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section: Shop Collection */}
      <section id="section-collection" className="relative py-32 px-12 z-30 bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-8 mb-24">
            <div>
              <div className="text-neon-orange font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-4">[ ARCHIVE.04 ]</div>
              <h2 className="text-8xl md:text-9xl font-display italic font-black tracking-tighter text-foreground">SHOP<br/>COLLECTION</h2>
            </div>
            <p className="font-mono text-sm tracking-[0.2em] opacity-40 uppercase max-w-md md:text-right">
              A curation of high-performance engineering and experimental aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {variants.map((variant, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-foreground/[0.03] border border-foreground/5 p-8 hover:bg-foreground/[0.05] transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  setActiveVariantIndex(index);
                  setActiveColor(variant.color);
                  setActivePattern(variant.pattern);
                  setCustomText(variant.customText || '');
                  setLogoUrl(variant.logoUrl || null);
                  scrollToSection('section-a');
                }}
              >
                <div className="relative h-64 mb-8 flex items-center justify-center">
                   {/* Mini preview circle */}
                   <div 
                     className="w-48 h-48 rounded-full shadow-[0_0_50px_rgba(255,85,0,0.1)] group-hover:scale-110 transition-transform duration-500"
                     style={{ 
                       backgroundColor: variant.color,
                       backgroundImage: variant.pattern === 'STREET' 
                         ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)' 
                         : variant.pattern === 'TECH' 
                         ? 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)' 
                         : 'none'
                     }}
                   />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-display text-4xl italic font-black text-white drop-shadow-2xl">VIEW</span>
                   </div>
                </div>

                <div className="flex justify-between items-end">
                   <div>
                      <div className="text-neon-orange font-mono text-[9px] tracking-[0.3em] uppercase mb-1">{variant.pattern}</div>
                      <h3 className="text-2xl font-display font-black italic text-white uppercase">{variant.name}</h3>
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-mono font-black italic text-white">${variant.price}</div>
                   </div>
                </div>

                {/* Decorative corner tag */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-white/10 group-hover:border-neon-orange/40 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section B: Technical HUD */}
      <section id="section-b" className="relative h-screen z-30">
        {/* Layered Crosshairs explicitly above WebGL */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-neon-orange/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,85,0,0.1)]">
            <div className="w-[380px] h-[380px] border border-neon-orange/10 rounded-full border-dashed animate-spin-slow"></div>
            
            {/* Horizontal & Vertical Crosshair Lines with Filter Drop Shadow */}
            <div className="absolute w-32 h-[1px] bg-neon-orange left-0 shadow-[0_0_10px_rgba(255,85,0,0.8)]"></div>
            <div className="absolute w-32 h-[1px] bg-neon-orange right-0 shadow-[0_0_10px_rgba(255,85,0,0.8)]"></div>
            <div className="absolute h-32 w-[1px] bg-neon-orange top-0 shadow-[0_0_10px_rgba(255,85,0,0.8)]"></div>
            <div className="absolute h-32 w-[1px] bg-neon-orange bottom-0 shadow-[0_0_10px_rgba(255,85,0,0.8)]"></div>
            
            {/* Target Cross */}
            <div className="absolute w-4 h-4 border-t border-l border-neon-orange -top-2 -left-2 shadow-neon-orange" />
            <div className="absolute w-4 h-4 border-t border-r border-neon-orange -top-2 -right-2 shadow-neon-orange" />
            <div className="absolute w-4 h-4 border-b border-l border-neon-orange -bottom-2 -left-2 shadow-neon-orange" />
            <div className="absolute w-4 h-4 border-b border-r border-neon-orange -bottom-2 -right-2 shadow-neon-orange" />
          </div>
        </div>

        {/* Data Panels with high contrast backdrop blur */}
        <div className="max-w-7xl mx-auto h-full grid grid-cols-2 items-center px-12 relative z-40 font-mono">
          <div className="space-y-12">
            <div className="space-y-2 bg-background/40 backdrop-blur-md p-6 border border-foreground/5 inline-block">
              <div className="text-neon-orange text-[10px] font-bold tracking-[0.2em] uppercase">[ ELITE CONTROL ]</div>
              <div className="text-6xl font-black italic text-foreground">100%</div>
              <div className="text-[9px] opacity-40 uppercase text-foreground">Microfiber Compound</div>
              <div className="w-32 h-1 bg-foreground/10 overflow-hidden mt-2">
                <div className="w-full h-full bg-neon-orange opacity-60"></div>
              </div>
            </div>
            <div className="space-y-2 bg-background/40 backdrop-blur-md p-6 border border-foreground/5 inline-block">
              <div className="text-6xl font-black italic text-foreground">0.5<span className="text-lg">mm</span></div>
              <div className="text-[9px] opacity-40 uppercase text-foreground">Pebble Precision Depth</div>
            </div>
          </div>

          <div className="text-right space-y-12 flex flex-col items-end">
            <div className="space-y-2 bg-background/40 backdrop-blur-md p-6 border border-foreground/5 inline-block">
              <div className="text-neon-orange text-[10px] font-bold tracking-[0.2em] uppercase">[ PERFECT FLIGHT ]</div>
              <div className="text-6xl font-black italic text-foreground">0.85</div>
              <div className="text-[9px] opacity-40 uppercase text-foreground">Drag Coefficient</div>
              <div className="flex justify-end gap-1 mt-2">
                <div className="w-1 h-4 bg-neon-orange"></div>
                <div className="w-1 h-4 bg-neon-orange"></div>
                <div className="w-1 h-4 bg-neon-orange"></div>
                <div className="w-1 h-4 bg-neon-orange/20"></div>
              </div>
            </div>
            <div className="space-y-2 bg-background/40 backdrop-blur-md p-6 border border-foreground/5 inline-block">
              <div className="text-6xl font-black italic text-foreground">28.5</div>
              <div className="text-[9px] opacity-40 uppercase text-foreground">Rotational Stability %</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-6 font-mono z-40 bg-background/40 backdrop-blur-sm px-8 py-3 border border-foreground/5">
           <div className="w-24 h-px bg-neon-orange/40" />
           <div className="flex items-center gap-3">
              <span className="text-neon-orange font-black text-xl italic">1.2MM</span>
              <span className="text-[8px] opacity-60 uppercase tracking-widest text-foreground">Pebble Height</span>
           </div>
           <div className="w-24 h-px bg-neon-orange/40" />
        </div>
      </section>

      {/* Section F: Tech Anatomy */}
      <section id="section-anatomy" className="relative min-h-screen z-20 flex flex-col justify-center px-12 md:px-24 bg-background/50 py-32">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="relative h-[60vh] flex items-center justify-center">
              {/* 3D Ball will be here, handled by Scene component */}
           </div>

           <div className="space-y-12">
              <div>
                <div className="font-mono text-neon-orange text-[10px] tracking-[0.4em] uppercase mb-4">Engineering Focus</div>
                <h2 className="text-8xl md:text-9xl font-display italic font-black tracking-tighter text-foreground leading-none mb-8">
                  TECH<br/>ANATOMY
                </h2>
              </div>

              <div className="space-y-8">
                 {[
                   { title: '01. EVO-SKIN', desc: 'Hybrid synthetic leather with moisture-wicking polymers.' },
                   { title: '02. CORE-LOCK', desc: 'Butyl bladder technology for consistent internal pressure.' },
                   { title: '03. FLEX-GRID', desc: 'Nylon windings providing structural integrity under 500PSI.' }
                 ].map((layer, i) => (
                   <motion.div 
                     key={layer.title}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.2 }}
                     className="group cursor-default"
                   >
                     <div className="text-xl font-display font-black italic text-foreground group-hover:text-neon-orange transition-colors mb-2 uppercase">{layer.title}</div>
                     <div className="font-mono text-[10px] opacity-40 tracking-wider uppercase">{layer.desc}</div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Section C: Marketing Break */}
      <section id="section-c" className="relative h-screen flex flex-col justify-center items-center px-12 z-30 overflow-hidden bg-background/40">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {shards.map((shard, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 bg-foreground/10"
              style={{
                left: shard.left,
                top: shard.top,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
              animate={{ rotate: 360, y: [0, -40, 0] }}
              transition={{ duration: shard.duration, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <h2 className="text-[18vw] font-display leading-[0.75] font-black italic tracking-tighter text-foreground">
            DEFY<br/>GRAVITY
          </h2>
          <button 
            onClick={() => scrollToSection('section-collection')}
            className="mt-16 px-16 py-6 border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-display text-3xl italic tracking-tight"
          >
            SHOP COLLECTION
          </button>
        </div>

        <div className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-center font-mono text-[10px] tracking-[0.4em] text-foreground/50 uppercase">
          <span>Official Store</span>
          <span>Global Shipping</span>
          <div className="flex gap-8">
            <Instagram className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
            <Twitter className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
            <Youtube className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </div>
      </section>

      {/* Section D: Customization Lab */}
      <section id="section-d" className="relative h-screen flex z-30 overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay opacity-5" />
        
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
           <h2 className="text-[35vw] font-display font-black whitespace-nowrap rotate-[-5deg] text-foreground">DESIGN STUDIO</h2>
        </div>

        <div className="w-full max-w-lg h-full bg-background border-r border-foreground/10 p-16 flex flex-col justify-start relative z-30 overflow-y-auto minimal-scrollbar shadow-2xl">
          <div className="ui-separator opacity-10" />
          
          <div className="space-y-4 mb-16 relative">
            <div className="text-neon-orange font-mono text-[10px] font-bold tracking-[0.4em] uppercase">[ CREATOR&apos;S DRAWER V.04 ]</div>
            <h2 className="text-8xl font-display leading-[0.85] italic font-black tracking-tighter text-foreground">DESIGN<br/>STUDIO</h2>
          </div>

          <div className="flex-1 space-y-2">
            {/* Accordion 1: Shop Collection (Presets) */}
            <AccordionTab 
              id="base" 
              label="Shop Collection" 
              isActive={activeAccordionTab === 'base'} 
              onClick={() => setActiveAccordionTab(activeAccordionTab === 'base' ? null : 'base')}
            >
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { name: 'STEALTH', color: '#111111', pattern: 'TECH' as const },
                  { name: 'INFERNO', color: '#FF3300', pattern: 'STREET' as const },
                  { name: 'VEROTEX', color: '#00FFCC', pattern: 'CROSS' as const },
                  { name: 'CLASSIC', color: '#FF5500', pattern: 'CLASSIC' as const },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setActiveColor(preset.color);
                      setActivePattern(preset.pattern);
                    }}
                    className={cn(
                      "group relative p-4 bg-foreground/5 border border-foreground/10 text-left hover:bg-foreground/10 transition-all",
                      activeColor === preset.color && activePattern === preset.pattern && "border-neon-orange bg-foreground/10"
                    )}
                  >
                    <div className="w-full h-2 bg-foreground/10 mb-2 overflow-hidden">
                       <div className="h-full w-1/2 bg-neon-orange" style={{ backgroundColor: preset.color }} />
                    </div>
                    <div className="font-display text-sm italic font-black uppercase text-foreground">{preset.name}</div>
                  </button>
                ))}
              </div>
            </AccordionTab>

            {/* Accordion 2: Colors & Materials */}
            <AccordionTab 
              id="colors" 
              label="Colors & Materials" 
              isActive={activeAccordionTab === 'colors'} 
              onClick={() => setActiveAccordionTab(activeAccordionTab === 'colors' ? null : 'colors')}
            >
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Color Swatches</label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setActiveColor(color.hex)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                          activeColor === color.hex ? "border-foreground scale-110 shadow-lg" : "border-transparent"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Grip Pattern</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PATTERNS.map((pattern) => (
                      <button
                        key={pattern}
                        onClick={() => setActivePattern(pattern)}
                        className={cn(
                          "py-3 border font-mono text-[9px] tracking-widest transition-all",
                          activePattern === pattern 
                            ? "bg-foreground text-background border-foreground" 
                            : "border-foreground/20 text-foreground/60 hover:border-foreground/40"
                        )}
                      >
                        {pattern}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionTab>

            {/* Accordion 3: Custom Text & Engraving */}
            <AccordionTab 
              id="text" 
              label="Text & Engraving" 
              isActive={activeAccordionTab === 'text'} 
              onClick={() => setActiveAccordionTab(activeAccordionTab === 'text' ? null : 'text')}
            >
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Engraving Label</label>
                  <input 
                    type="text"
                    maxLength={12}
                    placeholder="ENTER TEXT"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 px-6 py-4 font-display text-lg italic font-black uppercase tracking-tight focus:outline-none focus:border-neon-orange transition-colors text-foreground"
                  />
                  <div className="text-[9px] font-mono text-foreground/40 text-right uppercase tracking-widest">
                    {customText.length} / 12 Characters
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Font Selection</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'VARSITY', font: '"Space Grotesk"' },
                      { name: 'MODERN', font: 'Inter' },
                      { name: 'SCRIPT', font: 'serif' }
                    ].map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setFontFamily(f.font)}
                        className={cn(
                          "py-3 border font-mono text-[9px] tracking-widest transition-all",
                          fontFamily === f.font 
                            ? "bg-neon-orange text-black border-neon-orange" 
                            : "border-foreground/10 text-foreground/40"
                        )}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Engraving Style</label>
                  <div className="flex gap-2">
                    {(['laser', 'gold'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setEngravingType(style)}
                        className={cn(
                          "flex-1 py-4 border font-display text-xs italic font-black tracking-widest transition-all uppercase",
                          engravingType === style 
                            ? "bg-foreground text-background border-foreground" 
                            : "border-foreground/10 text-foreground/40 hover:border-foreground/30"
                        )}
                      >
                        {style === 'laser' ? 'Laser Engraved' : 'Gold Foil Stamp'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionTab>

            {/* Accordion 4: Team & Logos */}
            <AccordionTab 
              id="team" 
              label="Team Roster & Logos" 
              isActive={activeAccordionTab === 'team'} 
              onClick={() => setActiveAccordionTab(activeAccordionTab === 'team' ? null : 'team')}
            >
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Saved Assets</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 minimal-scrollbar">
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-foreground/20 flex items-center justify-center hover:border-foreground/40 transition-colors"
                    >
                      <Plus className="w-6 h-6 opacity-40 text-foreground" />
                    </button>
                    {savedLogos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLogoUrl(url)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 border-2 transition-all p-2 bg-foreground/5",
                          logoUrl === url ? "border-neon-orange shadow-[0_0_15px_rgba(255,85,0,0.2)]" : "border-foreground/10"
                        )}
                      >
                        <img src={url} alt="Saved Logo" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono font-bold tracking-[0.4em] uppercase text-foreground/60">Team Roster</label>
                    <button 
                      onClick={addPlayer}
                      className="text-[9px] font-mono text-neon-orange hover:underline uppercase tracking-widest"
                    >
                      + Add Player
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto minimal-scrollbar pr-2">
                    {teamRoster.map((player, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-foreground/5 p-2 border border-foreground/5 group">
                        <div className="relative w-8 h-8 flex-shrink-0 bg-background border border-foreground/10 flex items-center justify-center overflow-hidden">
                          {player.logoUrl ? (
                            <img src={player.logoUrl} className="w-full h-full object-contain" alt="Player logo" />
                          ) : (
                            <button 
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) updatePlayer(idx, 'logoUrl', URL.createObjectURL(file));
                                };
                                input.click();
                              }}
                              className="w-full h-full flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity"
                            >
                              <Plus className="w-4 h-4 text-foreground" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="NAME"
                            value={player.name}
                            onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                            className="flex-1 bg-transparent border-b border-foreground/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-neon-orange text-foreground"
                          />
                          <input 
                            type="text" 
                            placeholder="#"
                            value={player.number}
                            onChange={(e) => updatePlayer(idx, 'number', e.target.value)}
                            className="w-10 bg-transparent border-b border-foreground/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-neon-orange text-center text-foreground"
                          />
                        </div>
                        <div className="flex gap-1 opacity-100 transition-opacity">
                          <button 
                            onClick={() => applyPlayerToBall(player)}
                            className="p-2 border border-neon-orange/40 bg-neon-orange/10 hover:bg-neon-orange hover:text-black transition-all"
                            title="Apply to Ball"
                          >
                             <ArrowRight className="w-3 h-3 text-neon-orange group-hover:text-black" />
                          </button>
                          <button 
                            onClick={() => removePlayer(idx)}
                            className="p-2 border border-foreground/10 hover:bg-red-500/20 hover:text-red-500 transition-all"
                          >
                             <X className="w-3 h-3 text-foreground group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {teamRoster.length === 0 && (
                      <div className="text-center py-8 border border-dashed border-foreground/10 text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
                        No members added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTab>
          </div>

          <div className="space-y-4 mt-16 pt-8 border-t border-foreground/10">
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setPhysicsEnabled(!physicsEnabled);
                  if (physicsEnabled) {
                     // Force refresh or small nudge to reset if needed
                  }
                }}
                className={cn(
                  "flex-1 py-4 font-mono text-[10px] tracking-[0.3em] font-bold transition-all border-2",
                  physicsEnabled 
                    ? "bg-neon-orange text-black border-neon-orange shadow-[0_0_20px_rgba(255,85,0,0.4)]" 
                    : "border-foreground/20 text-foreground hover:border-foreground/40"
                )}
              >
                {physicsEnabled ? "DISABLE GRAVITY" : "TEST PHYSICS"}
              </button>
              <button 
                className="flex-1 py-4 font-mono text-[10px] tracking-[0.3em] font-bold border-2 border-neon-orange/40 text-neon-orange hover:bg-neon-orange hover:text-black transition-all"
                onClick={() => alert("AR feature coming soon to mobile devices.")}
              >
                VIEW IN AR
              </button>
            </div>
            <button 
              onClick={confirmBuild}
              className="w-full bg-neon-orange py-6 font-display text-3xl italic font-black tracking-tight shadow-[0_0_40px_rgba(255,85,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-black"
            >
              ADD TO COLLECTIONS
            </button>
          </div>
        </div>

        <div className="absolute right-12 bottom-12 text-right font-mono text-[9px] tracking-[0.5em] opacity-20 uppercase text-foreground">
          Basketball Technical Lab — Series 04
        </div>
      </section>

      {/* Section E: Contact Hub */}
      <section id="section-e" className="relative h-screen flex flex-col justify-center px-12 z-30 overflow-hidden bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div>
              <h2 className="text-8xl md:text-9xl font-display italic font-black tracking-tighter text-foreground mb-8">
                CONTACT<br/><span className="text-neon-orange">HUB</span>
              </h2>
              <p className="font-mono text-sm tracking-[0.3em] opacity-40 uppercase max-w-md text-foreground">
                Direct access to our technical design team and customer support division.
              </p>
           </div>
           
           <div className="space-y-12 border-l border-foreground/10 pl-12">
              <div className="group cursor-pointer">
                 <div className="font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase mb-2 group-hover:text-neon-orange transition-colors text-foreground">Support Line</div>
                 <div className="text-4xl md:text-5xl font-display font-black italic text-foreground group-hover:translate-x-2 transition-transform">
                   +1 (888) T - REX-LAB
                 </div>
              </div>
              
              <div className="group cursor-pointer">
                 <div className="font-mono text-[10px] tracking-[0.4em] opacity-40 uppercase mb-2 group-hover:text-neon-orange transition-colors text-foreground">Digital Correspondence</div>
                 <div className="text-4xl md:text-5xl font-display font-black italic text-foreground group-hover:translate-x-2 transition-transform underline decoration-neon-orange/30">
                   HELLO@TREX.LAB
                 </div>
              </div>

              <div className="pt-12 flex gap-8">
                 {['Instagram', 'Twitter', 'Laboratory'].map(link => (
                   <a key={link} href="#" className="font-mono text-[10px] tracking-[0.2em] opacity-30 hover:opacity-100 hover:text-neon-orange transition-all uppercase text-foreground">
                     {link}
                   </a>
                 ))}
              </div>
           </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[40vw] h-full bg-gradient-to-l from-neon-orange/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-12 left-12 font-mono text-[8px] tracking-[1em] opacity-20 uppercase text-foreground">
          Series 04 / Worldwide Distribution
        </div>
      </section>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[200] bg-neon-orange text-black font-display text-xl italic font-black px-12 py-4 shadow-[0_0_50px_rgba(255,85,0,0.5)]"
          >
            SAVED TO COLLECTION
          </motion.div>
        )}

        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] z-[201] border-l border-white/10 flex flex-col font-mono"
            >
              <div className="p-10 flex justify-between items-center border-b border-white/5 bg-black/20">
                <h2 className="text-3xl font-display italic font-black">YOUR CART ({cartItems.length})</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <ShoppingBag className="w-12 h-12 mb-6" />
                    <p className="text-[10px] tracking-[0.4em] uppercase font-bold">No items in payload</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-8 group relative p-4 border border-white/5 hover:border-white/10 transition-colors bg-white/[0.02]">
                      <div 
                        className="w-20 h-20 shrink-0 rounded-full border border-white/10 relative overflow-hidden"
                        style={{ backgroundColor: item.color }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/40" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-display text-2xl italic leading-none font-black tracking-tight">CUSTOM {item.pattern}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                           <span className="text-[9px] text-gray-500 uppercase tracking-tighter">{item.color}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <span className="text-neon-orange font-display text-2xl italic font-black">${item.price}</span>
                          <button 
                            onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))}
                            className="text-[9px] font-bold text-red-500 uppercase hover:text-red-400 transition-colors"
                          >
                            [ REMOVE ]
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-10 border-t border-foreground/10 space-y-8 bg-foreground/[0.03]">
                <div className="flex justify-between items-end">
                   <span className="text-foreground/40 text-[10px] font-bold tracking-[0.4em] uppercase">Total Amount</span>
                   <span className="text-5xl font-display font-black italic text-foreground">
                    ${cartItems.reduce((acc, item) => acc + parseFloat(item.price), 0).toFixed(2)}
                   </span>
                </div>
                
                <button className="w-full bg-foreground text-background py-6 font-display text-2xl italic font-black tracking-tight hover:bg-neon-orange hover:text-white transition-all group flex items-center justify-center gap-4">
                  CHECKOUT
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="overflow-hidden py-3 border-y border-white/5">
                   <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-12 text-[9px] font-bold tracking-[0.5em] uppercase text-gray-600">
                      <span>Free Shipping Worldwide</span>
                      <span>Elite Club Members Save 20%</span>
                      <span>Free Shipping Worldwide</span>
                      <span>Elite Club Members Save 20%</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Promotion Video Modal */}
      <AnimatePresence>
        {isPromoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-20 bg-black/95 backdrop-blur-2xl"
          >
            <div className="relative w-full max-w-6xl aspect-video bg-gray-900 border border-white/10 shadow-2xl overflow-hidden group">
               {/* Mock Video Content */}
               <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-neon-orange/20 to-transparent z-10" />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      y: [0, -20, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-[url('https://picsum.photos/seed/ball/1920/1080')] bg-cover bg-center grayscale opacity-40" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
                     <div className="w-[50vh] h-[50vh] opacity-20 blur-3xl bg-neon-orange rounded-full animate-pulse" />
                  </div>
                  <div className="z-20 text-center space-y-6">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-7xl md:text-9xl font-display italic font-black tracking-tighter text-glow">
                        {variants[activeVariantIndex]?.name || 'PURE POWER'}
                      </h2>
                      <p className="font-mono text-xs tracking-[0.6em] opacity-40 uppercase mt-4">
                        {variants[activeVariantIndex]?.promo || 'A Technical Masterpiece in Motion'}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="flex justify-center gap-12 pt-8"
                    >
                       <div className="text-center group">
                          <div className="text-4xl font-display font-black italic text-neon-orange">98%</div>
                          <div className="text-[8px] font-mono opacity-40 uppercase tracking-[0.3em] mt-1">Grip Rating</div>
                       </div>
                       <div className="text-center border-l border-white/10 pl-12 group">
                          <div className="text-4xl font-display font-black italic text-white">S04</div>
                          <div className="text-[8px] font-mono opacity-40 uppercase tracking-[0.3em] mt-1">Tech Spec</div>
                       </div>
                    </motion.div>
                  </div>
               </div>

               <button 
                 onClick={() => setIsPromoOpen(false)}
                 className="absolute top-8 right-8 z-30 p-4 hover:bg-white/10 rounded-full transition-colors border border-white/20 bg-black/20"
               >
                 <X className="w-6 h-6" />
               </button>

               <div className="absolute bottom-8 left-8 z-30 flex items-center gap-4 font-mono text-[10px] tracking-widest opacity-50">
                  <div className="w-2 h-2 bg-neon-orange animate-pulse rounded-full" />
                  LIVE PREVIEW: SERIES 04 LAB
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
