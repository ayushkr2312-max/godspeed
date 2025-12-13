import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Users, Calendar, ArrowRight, Twitch, Youtube, Menu, X, ChevronDown, ChevronRight, Gamepad2, Zap, Target } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import HUDOverlay from './components/HUDOverlay';
import LogoImg from './assets/logo.svg';
import FounderImg from './assets/founder.webp';
import TiltContainer from './components/TiltContainer';
import BgVideo from './assets/bgvid2.webm';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Lenis from '@studio-freight/lenis';


// --- ASSETS & CONFIG ---
// Local logo asset
const LOGO_URL = LogoImg;

const THEME = {
  gold: "#FFD700",
  dark: "#0a0a0a",
  darker: "#050505",
  gray: "#1f1f1f",
  text: "#ffffff",
  accent: "#facc15"
};

const ROSTER = [
  { id: 1, ign: "ROCKET LEAGUE", name: "APAC", img: "https://i0.wp.com/www.vitaplayer.co.uk/wp-content/uploads/2021/05/rocketleague-rocketpass5-psyonix.jpg?fit=1920%2C1080&ssl=1" },
  { id: 2, ign: "SSBU", name: "NA", img: "https://www.nintendo.com/eu/media/images/10_share_images/games_15/nintendo_switch_4/H2x1_NSwitch_SuperSmashBrosUltimate_02.jpg" },
  { id: 3, ign: "COMING SOON", name: "", img: "https://i.ibb.co/cczxzJzy/unnamed.jpg" },
];

const MATCHES = {
  // Live stream section will use a Twitch embed
  upcoming: [
    { id: 3, opponent: "RLCS Open-2", date: "JAN 4", time: "20:00 EST", tournament: "Rocket League", status: "UPCOMING" },
    { id: 4, opponent: "SSBU Regional", date: "JAN 7", time: "18:00 EST", tournament: "SSBU", status: "UPCOMING" },
  ],
  recent: [
    { id: 5, opponent: "RLCS Qualifiers", date: "DEC 28", time: "14:00 EST", tournament: "Rocket League", status: "COMPLETED", score: "3-2" },
    { id: 6, opponent: "SSBU Finals", date: "DEC 25", time: "19:00 EST", tournament: "SSBU", status: "COMPLETED", score: "2-3" },
  ]
};

// --- COMPONENTS ---

const XIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 2.077 2.077 0 0 0-.252.515 18.068 18.068 0 0 0-5.201 0 2.083 2.083 0 0 0-.251-.515.074.074 0 0 0-.078-.037 19.787 19.787 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.085 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.085 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const GlitchText = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-yellow-500 opacity-0 group-hover:opacity-70 animate-pulse z-0">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-red-500 opacity-0 group-hover:opacity-70 animate-pulse delay-75 z-0">{text}</span>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 text-center" data-aos="fade-up" data-cursor-hover>
    <TiltContainer scale={1.02} maxRotation={3.5}>
      <div className="inline-block">
        <h3 className="text-yellow-500 font-bold tracking-widest uppercase mb-2 text-sm">{subtitle}</h3>
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
          {title}
          <span className="text-yellow-500 inline-block animate-dot-blink">.</span>
        </h2>
        <div className="w-24 h-1 bg-yellow-500 mx-auto mt-6 transform -skew-x-12"></div>
      </div>
    </TiltContainer>
  </div>
);

const PlayerCard = ({ player }) => (
  <div className="relative">
    <div className="group relative h-96 group-hover:h-[28rem] w-full overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-yellow-500/50 hover:-translate-y-2 holographic" data-aos="zoom-in">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90" />
      <img
        src={player.img}
        alt={player.ign}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 blur-[0.75px] group-hover:blur-none"
      />
      {/* Persistent low opacity film */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 w-full h-56 p-6 z-20 transform transition-transform duration-300 translate-y-12 group-hover:-translate-y-28">
        {/* Strip backing for legibility */}
        <div className="absolute inset-0 bg-black/80 z-0 transition-opacity duration-300 group-hover:opacity-0"></div>

        <div className="overflow-hidden mb-2 relative z-10">
          <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter translate-y-0 group-hover:-translate-y-1 transition-transform [text-shadow:0_0_4px_rgba(0,0,0,0.8)] group-hover:[text-shadow:0_0_8px_rgba(0,0,0,0.9)]">
            {player.ign}
          </h3>
        </div>
        {player.name && (
          <p className="relative z-10 text-white font-mono font-bold text-[1.3125rem] mb-4 border-l-2 border-yellow-500 pl-3 [text-shadow:0_0_3px_rgba(0,0,0,0.7)] group-hover:[text-shadow:0_0_6px_rgba(0,0,0,0.9)]">
            {player.name}
          </p>
        )}

        {player.name && (
          <div className="relative z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
            {['PLAYER 1', 'PLAYER 2', 'PLAYER 3'].map((pName, i) => (
              <div key={i} className="group/player flex items-center gap-4">
                <div className="flex items-center gap-2 border-b border-white/40 hover:border-yellow-500 transition-colors pb-0.5 cursor-pointer w-fit group/text">
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter [text-shadow:0_0_4px_rgba(0,0,0,0.8)] group-hover/text:text-yellow-500 transition-colors">
                    {pName}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-yellow-500 opacity-0 group-hover/text:opacity-100 -translate-x-2 group-hover/text:translate-x-0 transition-all duration-300" />
                </div>
                {/* Social Icons - Reveal on Text Hover */}
                <div className="flex items-center gap-6 bg-black/90 px-5 py-2.5 rounded border border-zinc-800 opacity-0 group-hover/player:opacity-100 pointer-events-none group-hover/player:pointer-events-auto transition-all duration-300 translate-x-[-10px] group-hover/player:translate-x-0 shadow-lg">
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors hover:scale-110 transform duration-200" title="X">
                    {/* Using X icon */}
                    <X size={22} />
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-[#9146FF] transition-colors hover:scale-110 transform duration-200" title="Twitch">
                    <Twitch size={22} />
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-[#FF0000] transition-colors hover:scale-110 transform duration-200" title="YouTube">
                    <Youtube size={22} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 z-20">
        <Zap className="text-yellow-500 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
    {/* Yellow line below the card */}
    <div className="h-1 bg-yellow-500 w-full mt-4" />
  </div>
);

const Navigation = ({ isScrolled, scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'ROSTERS', id: 'roster' },
    { name: 'About', id: 'about' },
    { name: 'Partners', id: 'contact' },
  ];

  return (
    <nav
      className={`fixed z-50 transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isScrolled
        ? 'top-4 left-0 right-0 w-[98%] max-w-7xl mx-auto bg-black/80 backdrop-blur-md border-b-2 border-r-2 border-yellow-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 px-8 transform -skew-x-12'
        : 'top-0 left-0 w-full bg-transparent py-6 border-b border-transparent px-6 transform -skew-x-0'
        }`}
    >
      <div className={`w-full flex justify-between items-center transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isScrolled ? 'transform skew-x-12' : 'transform skew-x-0'}`}>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('hero')}>
          {/* Mini Logo for Nav */}
          <div className="w-9 h-11">
            <img src={LogoImg} alt="GS" className="w-full h-full object-cover object-center transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
          </div>
          <span className="text-xl font-black italic tracking-tighter nav-logo">
            <span className="text-yellow-500">GOD </span>
            <span className="text-white">SPEED</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {navLinks.map((link) => (
            <TiltContainer key={link.name} scale={1.1} maxRotation={15}>
              <button
                onClick={() => scrollToSection(link.id)}
                className="cyber-glitch group relative px-3 py-2 bg-yellow-500 text-black font-black italic uppercase overflow-hidden transform skew-x-[-12deg] transition-all hover:bg-white shadow-xl hover:shadow-2xl shadow-black/40"
              >
                <span className="relative z-10 inline-block skew-x-[12deg] group-hover:translate-x-1 transition-transform">{link.name}</span>
                <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
            </TiltContainer>
          ))}

        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-black border-b border-zinc-800 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="flex flex-col p-3 gap-3">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => { scrollToSection(link.id); setIsOpen(false); }}
              className="cyber-glitch group relative w-full text-left px-4 py-3 bg-yellow-500 text-black font-black italic uppercase skew-x-[-12deg] transition-all hover:bg-white"
            >
              <span className="relative z-10 inline-block skew-x-[12deg] group-hover:translate-x-1 transition-transform">{link.name}</span>
              <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Trail Effect Component
const SpeedTrail = ({ cursorRef }) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const canvasContextRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual size for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvasContextRef.current = ctx;

    const updateSize = () => {
      if (!canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      canvasRef.current.width = r.width * dpr;
      canvasRef.current.height = r.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', updateSize);

    let animationFrameId;

    const animate = () => {
      const { x, y, active } = cursorRef.current;
      const points = pointsRef.current;

      // Add point if active
      if (active) {
        points.push({ x, y, age: 1.0 });
      }

      // Fade out points
      for (let i = 0; i < points.length; i++) {
        points[i].age -= 0.05; // Fade speed
      }

      // Remove dead points
      while (points.length > 0 && points[0].age <= 0) {
        points.shift();
      }

      // Clear
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (points.length > 1) {
        // Draw Trail
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw segments with varying opacity/width
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          // Style: Black, fading opacity, tapering width
          ctx.strokeStyle = `rgba(0, 0, 0, ${p2.age})`;
          ctx.lineWidth = p2.age * 8; // Start thick (8px) and taper
          ctx.stroke();
        }

        // Draw Head Dot
        if (active) {
          const head = points[points.length - 1];
          ctx.beginPath();
          ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#000';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ width: '100%', height: '100%' }} />;
};

const InfiniteMarquee = () => {
  return (
    <div className="w-full overflow-hidden bg-black/50 border-y border-zinc-900 py-10 relative group">
      {/* Gradient Overlay for depth */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

      <div className="flex whitespace-nowrap overflow-hidden">
        {/* Group 1 */}
        <div className="flex shrink-0 animate-scroll-text group-hover:[animation-play-state:paused]">
          {[...Array(4)].map((_, i) => (
            <div key={`g1-${i}`} className="flex items-center px-8">
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>GOD SPEED</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>CULTURE</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>DOMINANCE</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
            </div>
          ))}
        </div>
        {/* Group 2 (Duplicate for seamless loop) */}
        <div className="flex shrink-0 animate-scroll-text group-hover:[animation-play-state:paused]" aria-hidden="true">
          {[...Array(4)].map((_, i) => (
            <div key={`g2-${i}`} className="flex items-center px-8">
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>GOD SPEED</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>CULTURE</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-transparent transition-all duration-300 hover:text-yellow-500 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)' }}>DOMINANCE</span>
              <span className="text-8xl md:text-9xl font-black italic uppercase text-yellow-500/20 px-8" style={{ WebkitTextStroke: '0px' }}>//</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const heroRef = useRef(null);
  const aboutUsRef = useRef(null);
  const rosterRef = useRef(null);
  const scheduleRef = useRef(null);
  const aboutRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomStripRef = useRef(null);
  const zoomTextRef = useRef(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollVelocity = useRef(0);
  const rafId = useRef(null);
  const zoomSectionTop = useRef(null);
  const lenisRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const zoomCursorRef = useRef({ x: 0, y: 0, active: false });
  const contactRef = useRef(null);

  // Trigger animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Initialize AOS
    AOS.init({ duration: 1000 });

    const handleScroll = ({ scroll, limit, velocity, direction, progress }) => {
      setScrolled(scroll > 50);

      // Check cursor variant based on sections
      // Check cursor variant based on sections

      // Use requestAnimationFrame for smooth parallax updates
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        // Calculate parallax for zoom section
        if (zoomRef.current) {
          const rect = zoomRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const currentScrollY = scroll;
          const currentTime = Date.now();

          // Store section's absolute top position on first calculation
          if (zoomSectionTop.current === null) {
            zoomSectionTop.current = rect.top + currentScrollY;
          }

          // Calculate scroll velocity for motion blur
          const deltaY = Math.abs(currentScrollY - lastScrollY.current);
          const deltaTime = Math.max(1, currentTime - lastScrollTime.current);
          const vel = deltaY / deltaTime;
          scrollVelocity.current = vel * 16;

          lastScrollY.current = currentScrollY;
          const sectionTop = zoomSectionTop.current;
          const sectionHeight = rect.height;
          const scrollProgress = Math.max(0, Math.min(1, (currentScrollY - sectionTop + windowHeight) / (sectionHeight + windowHeight)));

          // Calculate parallax offsets based on scroll position
          const scrollRatio = (currentScrollY - sectionTop) / (sectionHeight + windowHeight);

          // Check if mobile device (simplified check)
          const isMobile = window.innerWidth <= 768;

          // Reduce effect intensity on mobile
          const boxMultiplier = isMobile ? -10 : -100;
          const textMultiplier = isMobile ? 20 : 200;

          const boxOffset = scrollRatio * boxMultiplier;
          const textOffset = scrollRatio * textMultiplier;

          if (zoomRef.current) {
            zoomRef.current.style.transform = `skewY(-2deg) translateY(${boxOffset}px)`;
          }
          if (zoomStripRef.current) {
            zoomStripRef.current.style.transform = `skewY(-2deg) translateY(${boxOffset * 1.2}px)`;
          }
          if (zoomTextRef.current) {
            zoomTextRef.current.style.transform = `translate3d(0, ${textOffset}px, 0)`;
          }
        }
      });
    };

    // Lenis animation loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Listen to Lenis scroll events
    lenis.on('scroll', handleScroll);

    handleScroll({ scroll: lenis.scroll, limit: lenis.limit, velocity: 0, direction: 'vertical', progress: 0 }); // Initial calculation

    return () => {
      lenis.destroy();
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const scrollToSection = (id) => {
    const refs = {
      'hero': heroRef,
      'about': aboutUsRef,
      'roster': rosterRef,
      'schedule': scheduleRef,
      'contact': contactRef
    };
    const ref = refs[id];
    if (ref && ref.current && lenisRef.current) {
      lenisRef.current.scrollTo(ref.current, {
        offset: 0,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  return (
    <div id="warp-container" className="bg-black min-h-screen text-white font-sans selection:bg-yellow-500 selection:text-black overflow-x-hidden cursor-none">
      <CustomCursor zoomRef={zoomRef} />
      <HUDOverlay />
      <div className="streaks-container">
        <div className="streaks streaks-left">
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
        </div>
        <div className="streaks streaks-right">
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
          <div className="streak"></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 
              0 0 25px rgba(0, 0, 0, 0.6),
              0 0 50px rgba(255, 215, 0, 0.4),
              0 0 75px rgba(255, 215, 0, 0.3);
          }
          50% {
            text-shadow: 
              0 0 35px rgba(0, 0, 0, 0.7),
              0 0 70px rgba(255, 215, 0, 0.6),
              0 0 105px rgba(255, 215, 0, 0.5),
              0 0 140px rgba(255, 215, 0, 0.3);
          }
        }
        .zoom-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes glitch-slide {
          0% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          20% {
            clip-path: polygon(0 0, 99.5% 0, 99.5% 25%, 0.5% 25%, 0.5% 50%, 100% 50%, 100% 75%, 0 75%, 0 100%, 99.5% 100%, 99.5% 100%, 0 100%);
          }
          40% {
            clip-path: polygon(0.5% 0, 100% 0, 100% 25%, 0 25%, 0 50%, 99.5% 50%, 99.5% 75%, 0.5% 75%, 0.5% 100%, 100% 100%, 100% 100%, 0.5% 100%);
          }
          60% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          80% {
            clip-path: polygon(0.3% 0, 99.7% 0, 99.7% 40%, 0.3% 40%, 0.3% 60%, 99.7% 60%, 99.7% 100%, 0.3% 100%);
          }
          100% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }
        .cyber-glitch {
          position: relative;
        }
        .cyber-glitch:hover {
          animation: glitch-slide 0.3s ease-in-out;
        }
        .cyber-glitch::before,
        .cyber-glitch::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          clip-path: inherit;
          opacity: 0;
          pointer-events: none;
        }
        .cyber-glitch:hover::before {
          animation: glitch-slide 0.3s ease-in-out 0.05s;
          opacity: 0.3;
          filter: hue-rotate(90deg);
        }
        .cyber-glitch:hover::after {
          animation: glitch-slide 0.3s ease-in-out 0.1s;
          opacity: 0.3;
          filter: hue-rotate(-90deg);
        }
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 215, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 215, 0, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .zoom-streaks-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .zoom-streak {
          position: absolute;
          width: 600px;
          height: 3px;
          animation: zoom-streak-slide linear infinite;
        }
        .zoom-streak:nth-child(1) {
          top: 10%;
          background: linear-gradient(to right, transparent, rgba(40, 40, 40, 0.8), transparent);
          animation-duration: 1.84s;
          animation-delay: 0s;
        }
        .zoom-streak:nth-child(2) {
          top: 22.5%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation-duration: 2.16s;
          animation-delay: 0.25s;
        }
        .zoom-streak:nth-child(3) {
          top: 35%;
          background: linear-gradient(to right, transparent, rgba(40, 40, 40, 0.8), transparent);
          animation-duration: 2.0s;
          animation-delay: 0.5s;
        }
        .zoom-streak:nth-child(4) {
          top: 47.5%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation-duration: 2.24s;
          animation-delay: 0.75s;
        }
        .zoom-streak:nth-child(5) {
          top: 60%;
          background: linear-gradient(to right, transparent, rgba(40, 40, 40, 0.8), transparent);
          animation-duration: 1.92s;
          animation-delay: 1.0s;
        }
        .zoom-streak:nth-child(6) {
          top: 72.5%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation-duration: 2.16s;
          animation-delay: 1.25s;
        }
        .zoom-streak:nth-child(7) {
          top: 85%;
          background: linear-gradient(to right, transparent, rgba(40, 40, 40, 0.8), transparent);
          animation-duration: 1.84s;
          animation-delay: 1.5s;
        }
        .zoom-streak:nth-child(8) {
          top: 97.5%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation-duration: 2.0s;
          animation-delay: 1.75s;
        }
        @keyframes zoom-streak-slide {
          0% {
            left: -600px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>

      <Navigation isScrolled={scrolled} scrollToSection={scrollToSection} />

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src={BgVideo} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">

          <div
            className="mb-8 relative group"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - left) / width - 0.5;
              const y = (e.clientY - top) / height - 0.5;
              e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1, 1, 1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
            }}
          >
            <div className={`relative ${mounted ? 'hero-logo animate animate-float' : 'hero-initial'}`}>
              <div className="absolute -inset-10 bg-yellow-500/[0.17] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={LOGO_URL}
                alt="GOD SPEED Logo"
                className="w-48 h-48 md:w-72 md:h-72 object-contain relative z-10 transition-all duration-500 ease-out group-hover:scale-105 animate-logo-pulse group-hover:[animation-play-state:paused]"
                style={{ top: '6px' }}
              />
            </div>
          </div>

          <div className={`-mt-3 md:-mt-4 flex flex-col items-center hero-initial ${mounted ? 'hero-title animate' : ''}`}>
            <h1 className="group relative text-6xl md:text-9xl font-black uppercase tracking-tighter mb-4 leading-none select-none cursor-pointer"
              style={{ textShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
              }}
            >
              <span className="absolute inset-0 blur-2xl bg-yellow-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20"></span>

              {/* The Solid Main Text (Top Layer) */}
              <span className="relative z-10 block font-black italic tracking-tighter animate-text-pulse group-hover:[animation-play-state:paused]">
                <span className="text-yellow-500 brand-yellow">GOD </span>
                <span className="text-white speed-text">SPEED</span>
              </span>

              {/* The "Ghost" Text (Bottom Layer - Shoots out on hover) */}
              <span className="absolute top-0 left-0 -z-10 block text-transparent opacity-0 transition-all duration-300 ease-out group-hover:translate-x-10 group-hover:opacity-[0.15] font-black italic tracking-tighter">
                <span className="text-yellow-500 brand-yellow" style={{ WebkitTextStroke: '1px #eab308' }}>GOD </span>
                <span className="text-white speed-text" style={{ WebkitTextStroke: '1px white' }}>SPEED</span>
              </span>
              {/* Ghost Text - Left Direction */}
              <span className="absolute top-0 left-0 -z-10 block text-transparent opacity-0 transition-all duration-300 ease-out group-hover:-translate-x-10 group-hover:opacity-[0.15] font-black italic tracking-tighter">
                <span className="text-yellow-500 brand-yellow" style={{ WebkitTextStroke: '1px #eab308' }}>GOD </span>
                <span className="text-white speed-text" style={{ WebkitTextStroke: '1px white' }}>SPEED</span>
              </span>
            </h1>

            <div className={`hero-initial mb-12 ${mounted ? 'hero-subtitle animate' : ''}`}>
              <TiltContainer scale={1.05} maxRotation={3}>
                <p className="text-zinc-400 hover:text-white transition-all duration-300 cursor-default text-lg md:text-xl tracking-widest uppercase max-w-xl mx-auto hover:[text-shadow:0_0_20px_rgba(234,179,8,0.5)]">
                  BUILT ON CULTURE. DRIVEN TO COMPETE.
                </p>
              </TiltContainer>
            </div>

            <div className={`flex gap-4 hero-initial ${mounted ? 'hero-cta animate' : ''}`}>
              <TiltContainer scale={1.05} maxRotation={12}>
                <button
                  onClick={() => scrollToSection('roster')}
                  className="cyber-glitch group relative px-8 py-3 bg-yellow-500 text-black font-black italic uppercase overflow-hidden transform skew-x-[-12deg] transition-all hover:bg-white"
                >
                  <span className="relative z-10 inline-block skew-x-[12deg] group-hover:translate-x-1 transition-transform">Meet The Team</span>
                  <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
              </TiltContainer>
              <TiltContainer scale={1.05} maxRotation={12}>
                <button
                  onClick={() => scrollToSection('schedule')}
                  className="cyber-glitch group relative px-8 py-3 bg-yellow-500 text-black font-black italic uppercase overflow-hidden transform skew-x-[-12deg] transition-all hover:bg-white"
                >
                  <span className="relative z-10 inline-block skew-x-[12deg] group-hover:translate-x-1 transition-transform">Schedule</span>
                  <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
              </TiltContainer>
            </div>


          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-[44%] -translate-x-1/2 sm:left-[49%] sm:-translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Scroll</span>
          <ChevronDown className="w-5 h-5 text-yellow-500" />
        </div>

        {/* Floating social buttons with dynamic state transition */}
        <div className="fixed z-50 pointer-events-none w-full h-full top-0 left-0">
          {[XIcon, Twitch, Youtube, DiscordIcon].map((Icon, i) => {
            // Calculate styles based on state
            let style = {};
            let baseClasses = `fixed pointer-events-auto w-8 h-8 sm:w-12 sm:h-12 bg-zinc-900/90 border border-yellow-500/50 flex items-center justify-center rounded-full text-zinc-400 hover:bg-yellow-500 hover:text-black transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-1 z-50 hero-initial ${mounted ? 'hero-social animate' : ''}`;

            if (!scrolled) {
              // Hero Positions
              // Using inline styles for responsive calcs is tricky, but we can use CSS variables or media queries if strictly needed.
              // However, since we used Tailwind arbitrary values before, we can use specific classes if we stick to the strings JIT can see.
              // SAFEST: Use style for standard placement relative to viewport.

              // To handle responsive md: values in inline style, we'd need window listener.
              // BETTER: Return full class strings (no interpolation) for Hero, and style for Scrolled.

              if (i === 0) baseClasses += " left-[calc(50%-460px)] md:left-[calc(50%-560px)] bottom-[5%] md:bottom-[10%]"; // Left Inner
              if (i === 1) baseClasses += " left-[calc(50%-580px)] md:left-[calc(50%-680px)] bottom-[5%] md:bottom-[10%]"; // Left Outer
              if (i === 2) baseClasses += " right-[calc(50%-460px)] md:right-[calc(50%-560px)] bottom-[5%] md:bottom-[10%]"; // Right Inner
              if (i === 3) baseClasses += " right-[calc(50%-580px)] md:right-[calc(50%-680px)] bottom-[5%] md:bottom-[10%]"; // Right Outer
            } else {
              // Scrolled Positions (Vertical Stack) - Fixed bottom right
              // Use inline style for the bottom offset to avoid JIT issues
              const bottomOffset = 2 + ((3 - i) * 3.8);
              style = {
                bottom: `${bottomOffset}rem`,
                right: '1rem' // "right-4" equiv
              };
              // Add responsive class purely for right spacing if needed, but style overrides.
              // We'll rely on the style for positioning.
            }

            return (
              <a
                key={i}
                href="#"
                aria-label={`social-float-${i}`}
                className={baseClasses}
                style={Object.keys(style).length > 0 ? style : undefined}
              >
                <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </a>
            );
          })}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section ref={aboutUsRef} className="pt-20 pb-10 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            title="About Us"
            subtitle="Our Story"
          />

          <div className="max-w-6xl mx-auto text-center text-zinc-300 space-y-6" data-aos="fade-up">
            <TiltContainer scale={1.02} maxRotation={3}>
              <div className="transform -skew-x-6 relative group">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Target className="text-yellow-500 w-8 h-8 animate-spin-slow" />
                </div>
                <p className="text-xl leading-relaxed" style={{ fontSize: '117%' }}>
                  God Speed is a competitive esports organization built on identity, culture, and high-level performance. We focus on creating a strong, positive environment where players can grow, teams can thrive, and our community can feel connected to the work we do.
                </p>
              </div>
            </TiltContainer>
            <TiltContainer scale={1.02} maxRotation={3}>
              <div className="transform -skew-x-6 relative group">
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Trophy className="text-yellow-500 w-8 h-8 animate-bounce" />
                </div>
                <p className="text-xl leading-relaxed" style={{ fontSize: '117%' }}>
                  We're committed to setting a standard — one built on structure, preparation, and doing things the right way. No shortcuts. No noise. Just a group dedicated to showing up with purpose and representing our brand with pride.
                </p>
              </div>
            </TiltContainer>
            <TiltContainer scale={1.02} maxRotation={3}>
              <div className="transform -skew-x-6 relative group">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Gamepad2 className="text-yellow-500 w-8 h-8 animate-pulse" />
                </div>
                <p className="text-xl leading-relaxed" style={{ fontSize: '117%' }}>
                  On stage, in practice, and across every project, God Speed stands for professionalism, consistency, and a culture that supports development. Our goal is to elevate talent, build a recognizable and trusted brand, and operate with the same energy and integrity that we expect from our competitors.
                </p>
              </div>
            </TiltContainer>
            <div className="flex flex-col items-center space-y-10 pt-12">
              <div className="w-[250px] h-[10px] bg-yellow-500 transform -skew-x-12"></div>
              <div className="w-[150px] h-[7.5px] bg-yellow-500 transform -skew-x-12"></div>
              <div className="w-[50px] h-[5px] bg-yellow-500 transform -skew-x-12"></div>
            </div>
          </div>
        </div>

        {/* Interactive Spacer */}
        <div className="mt-32 mb-4">
          <InfiniteMarquee />
        </div>
      </section>

      {/* ROSTER SECTION */}
      <section ref={rosterRef} className="pt-20 pb-32 relative">
        <div className="container mx-auto px-6">
          <SectionHeader title="Active Rosters" subtitle="The Squad" />

          <div className="flex flex-wrap justify-center gap-12 max-w-7xl mx-auto">
            {ROSTER.map((player) => (
              <div key={player.id} className="w-full sm:w-[calc(33.333%-32px)] min-w-[280px] relative pb-1 group">
                <TiltContainer scale={1.02} maxRotation={5}>
                  <div className="relative">
                    <div className="absolute -right-8 -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                      <Users className="text-yellow-500/20 w-16 h-16 animate-pulse" />
                    </div>
                    <div className="absolute -left-4 bottom-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                      <Zap className="text-yellow-500/20 w-12 h-12 animate-bounce" />
                    </div>
                    <div className="relative z-10">
                      <PlayerCard player={player} />
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </TiltContainer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER (replaced with single #ZOOM) */}
      <div
        ref={zoomStripRef}
        className="relative h-6 bg-yellow-500/80 mt-16 transform -skew-y-2 origin-bottom-left"
        style={{
          transform: 'skewY(-2deg) translateY(0px)',
          width: '100%',
          willChange: 'transform'
        }}
      ></div>
      <div
        ref={zoomRef}
        className="relative bg-yellow-500 text-black pt-8 md:pt-12 pb-0 mt-6 transform -skew-y-2 transition-transform duration-300 ease-out overflow-hidden touch-manipulation group/zoom"
        style={{
          transform: 'skewY(-2deg) translateY(0px)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)'
        }}
        onMouseEnter={() => zoomCursorRef.current.active = true}
        onMouseLeave={() => zoomCursorRef.current.active = false}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          zoomCursorRef.current.x = e.clientX - rect.left;
          zoomCursorRef.current.y = e.clientY - rect.top;
          zoomCursorRef.current.active = true;
        }}
      >
        <SpeedTrail cursorRef={zoomCursorRef} />
        <div className="zoom-streaks-container">
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
          <div className="zoom-streak"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center justify-center w-full" style={{ minHeight: '100%', paddingBottom: '2rem' }}>
            <h2
              ref={zoomTextRef}
              className="text-[7.2rem] md:text-[14.4rem] font-black italic text-black tracking-tight leading-none transition-transform duration-300 ease-out will-change-transform"
              style={{
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                WebkitTransform: 'translateZ(0)',
                lineHeight: 1
              }}
            >
              #ZOOM
            </h2>
          </div>
        </div>
      </div>

      {/* MATCHES SECTION */}
      <section ref={scheduleRef} className="pt-20 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* WATCH LIVE SECTION */}
          <SectionHeader title="Watch Live" subtitle="" />
          <div className={`mb-16 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ${isLive ? '' : 'max-w-2xl mx-auto'}`} data-aos="fade-up">
            {/* Twitch Embed */}
            <div className={`relative ${isLive ? 'pt-[56.25%]' : 'pt-[75%] md:pt-[42.25%]'}`}>
              <iframe
                src={`https://player.twitch.tv/?channel=godspeedes&parent=${window.location.hostname}&muted=false`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                scrolling="no"
                onError={() => setIsLive(false)}
              ></iframe>
            </div>

            {/* Stream Info */}
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">GOD SPEED Esports {isLive ? 'Live' : 'Offline'}</h3>
                  <p className="flex items-center gap-2 text-sm text-zinc-400">
                    {isLive ? (
                      <>
                        <span className="flex items-center gap-1 text-red-500 font-bold">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE NOW
                        </span>
                        <span>•</span>
                      </>
                    ) : (
                      <span className="text-yellow-500">Currently offline</span>
                    )}
                    <span>Follow on <a href="https://www.twitch.tv/godspeedes" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">Twitch</a></span>
                  </p>
                </div>
                <a
                  href="https://www.twitch.tv/godspeedes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-glitch w-full md:w-auto px-4 md:px-6 py-2 bg-yellow-500 border border-yellow-500 text-black font-bold uppercase text-sm hover:bg-yellow-400 hover:border-yellow-400 transition-all text-center"
                >
                  {isLive ? 'WATCH ON TWITCH' : 'FOLLOW ON TWITCH'}
                </a>
              </div>

              {/* Chat Toggle for Mobile */}
              {isLive && (
                <div className="mt-4 md:hidden">
                  <button
                    onClick={() => window.open('https://www.twitch.tv/popout/godspeedes/chat?popout=', 'GOD SPEED ES Chat', 'width=350,height=600' + ',left=' + (window.screen.width - 350) + ',top=' + (window.screen.height - 600) / 2)}
                    className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-sm text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                      <path d="M7 10h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                    </svg>
                    Open Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING MATCHES */}
          <SectionHeader title="Upcoming Matches" subtitle="" />
          <div className="space-y-4 mb-16">
            {MATCHES.upcoming.map((match) => (
              <div key={match.id} className="relative group" data-aos="fade-right">
                <TiltContainer scale={1.02} maxRotation={3}>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between hover:border-yellow-500/50 transition-all hover:bg-zinc-900 relative overflow-hidden" data-cursor-hover>
                    <div className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                      <Calendar className="text-yellow-500/10 w-24 h-24 rotate-12" />
                    </div>
                    <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto relative z-10">
                      <div className="bg-zinc-800 p-3 rounded text-center min-w-[80px]">
                        <span className="block text-xl font-bold text-white leading-none">{match.date.split(' ')[1]}</span>
                        <span className="block text-xs text-zinc-500 uppercase font-bold">{match.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-2xl font-black italic uppercase text-white">{match.opponent}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500 text-black rounded uppercase">{match.tournament}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Calendar className="w-4 h-4" /> {match.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltContainer>
              </div>
            ))}
          </div>

          {/* RECENT MATCHES */}
          <SectionHeader title="Recent Matches" subtitle="" />
          <div className="space-y-4">
            {MATCHES.recent.map((match) => (
              <div key={match.id} className="relative group" data-aos="fade-right">
                <TiltContainer scale={1.02} maxRotation={3}>
                  <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 flex flex-col md:flex-row items-center justify-between hover:border-zinc-600/50 transition-all relative overflow-hidden">
                    <div className="absolute -left-4 -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                      <Trophy className="text-zinc-700/20 w-24 h-24 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto relative z-10">
                      <div className="bg-zinc-800/80 p-3 rounded text-center min-w-[80px] opacity-90">
                        <span className="block text-xl font-bold text-zinc-300 leading-none">{match.date.split(' ')[1]}</span>
                        <span className="block text-xs text-zinc-400 uppercase font-bold">{match.date.split(' ')[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-2xl font-black italic uppercase text-zinc-500">{match.opponent}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-500 rounded uppercase">{match.tournament}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <Calendar className="w-4 h-4" /> {match.time}
                          {match.score && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-zinc-800/50 text-zinc-400 rounded">
                              {match.status === 'COMPLETED' ? 'FT: ' + match.score : match.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="relative overflow-hidden w-full md:w-auto px-6 py-2 bg-transparent border border-yellow-400/30 text-yellow-300 font-bold uppercase text-sm hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all z-10">
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/80"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                        </span>
                        VOD
                      </span>
                      <span className="absolute inset-0 bg-yellow-400/0 animate-pulse-slow"></span>
                      <style jsx>{`
                            @keyframes pulse-slow {
                            0%, 100% { background-color: rgba(253, 224, 71, 0.05); }
                            50% { background-color: rgba(253, 224, 71, 0.15); }
                            }
                            .animate-pulse-slow {
                            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                            }
                        `}</style>
                    </button>
                  </div>
                </TiltContainer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A WORD FROM THE FOUNDER SECTION */}
      <section className="pt-12 pb-16 relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="A Word From The Founder"
            subtitle="Our Vision"
          />

          <div className="relative group grid grid-cols-1 lg:grid-cols-10 gap-8 items-center p-8">
            {/* Yellow Frame Accents - Top Right & Bottom Left - Covering the whole section */}
            <div className="absolute -top-4 -right-4 w-16 h-1 bg-yellow-500 z-0 skew-x-[-10deg]"></div>
            <div className="absolute -top-4 -right-4 w-1 h-16 bg-yellow-500 z-0 skew-y-[-10deg]"></div>

            <div className="absolute -bottom-4 -left-4 w-16 h-1 bg-yellow-500 z-0 skew-x-[-10deg]"></div>
            <div className="absolute -bottom-4 -left-4 w-1 h-16 bg-yellow-500 z-0 skew-y-[-10deg]"></div>

            {/* Left: Founder Image */}
            <div className="lg:col-span-2 relative" data-aos="fade-right">
              <TiltContainer scale={1.05} maxRotation={5}>
                <div className="relative group/image">
                  <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-lg max-w-xs mx-auto z-10">
                    <img
                      src={FounderImg}
                      alt="Founder"
                      className="w-full h-auto object-contain object-center transition-transform duration-700 group-hover/image:scale-105 relative z-20"
                    />
                  </div>
                </div>
              </TiltContainer>
            </div>

            {/* Right: Founder Message */}
            <div className="lg:col-span-8 space-y-4" data-aos="fade-left">
              <div className="space-y-3">
                <p className="text-zinc-300 text-base leading-relaxed hover:text-white transition-colors duration-300 cursor-default hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  My role is to drive the brand's vision, steer our competitive direction, and manage the day-to-day operations across all our divisions. Drawing from my experience in commentary, league management, and event production, I'm here to ensure we operate with professional structure.
                </p>
                <p className="text-zinc-300 text-base leading-relaxed hover:text-white transition-colors duration-300 cursor-default hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  Ultimately, my focus is to build a culture where our players and creators don't just compete—they grow through consistency and purpose.
                </p>
              </div>

              {/* Founder Signature */}
              <div className="pt-6 border-t border-zinc-800">
                <div className="transform -skew-x-6">
                  <p className="text-yellow-500 font-bold text-base mb-1 hover:text-white transition-colors duration-300 cursor-default hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">Eric "Wolfy2Hot" Madera</p>
                </div>
                <p className="text-white text-xs font-mono uppercase hover:text-yellow-500 transition-colors duration-300 cursor-default">Founder and CEO of God Speed Esports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section ref={contactRef} className="pt-12 pb-16 relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            title="Contact Us"
            subtitle="Get In Touch"
          />

          <div className="max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            <TiltContainer scale={1.01} maxRotation={2}>
              <div className="bg-zinc-900 p-8 rounded-sm border border-zinc-800 relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <Target className="text-yellow-500/10 w-40 h-40 animate-spin-slow" />
                </div>
                <p className="text-zinc-400 text-center mb-8 relative z-10">For partnerships, inquiries, or general questions, reach out to us below.</p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const name = formData.get('name');
                    const email = formData.get('email');
                    const inquiry = formData.get('inquiry');

                    try {
                      const result = await emailjs.send(
                        'service_j7grdas', // Your EmailJS service ID
                        'template_mtv7jqk', // Your EmailJS template ID
                        {
                          from_name: name,
                          from_email: email,
                          message: inquiry,
                          to_email: ' GodSpeedES.contact@gmail.com'
                        }
                      );

                      alert('Thank you for your inquiry! We will get back to you soon.');
                      e.target.reset();
                    } catch (error) {
                      console.error('EmailJS error:', error);
                      alert('Sorry, there was an error sending your message. Please try again or email us directly at GodSpeedES.contact@gmail.com');
                    }
                  }}
                  className="space-y-6 relative z-10"
                >
                  <div>
                    <label className="block text-yellow-500 text-sm font-mono uppercase mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-yellow-500 font-mono text-sm"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-yellow-500 text-sm font-mono uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-yellow-500 font-mono text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-yellow-500 text-sm font-mono uppercase mb-2">Your Inquiry</label>
                    <textarea
                      name="inquiry"
                      required
                      rows="5"
                      className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-yellow-500 font-mono text-sm resize-none"
                      placeholder="Tell us about your inquiry..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full cyber-glitch bg-yellow-500 text-black px-6 py-3 font-bold uppercase hover:bg-white transition-colors"
                  >
                    Send Inquiry
                  </button>
                </form>
              </div>
            </TiltContainer>
          </div>
        </div>
      </section>

      {/* ABOUT / FOOTER SECTION */}
      <section ref={aboutRef} className="relative py-24 border-t border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
              <h2 className="text-4xl font-black italic tracking-tighter text-white"><span className="text-yellow-500">GOD </span><span className="text-white">SPEED</span></h2>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-3xl mx-auto">
              God Speed is built on community, culture, and competition. We're here to create a positive environment where players can grow, teams can thrive, and fans can feel part of something bigger.
            </p>
          </div>

          <div className="border-t border-zinc-900 mt-20 pt-8 text-center text-zinc-600 text-xs font-mono uppercase">
            <p>&copy; 2024 GOD SPEED Esports. All Rights Reserved.</p>
          </div>
        </div>
      </section>
    </div >
  );
}