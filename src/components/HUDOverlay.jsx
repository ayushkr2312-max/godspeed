import React from 'react';

const HUDOverlay = () => {
    return (
        <div className="hud-overlay fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-500/30 opacity-60" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-500/30 opacity-60" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-500/30 opacity-60" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-yellow-500/30 opacity-60" />

            {/* Decorative horizontal lines */}
            <div className="absolute top-12 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
            <div className="absolute bottom-12 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

            {/* Vertical coordinates/info */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 flex flex-col gap-2 text-[8px] font-mono text-yellow-500/40 writing-vertical select-none">
                <span>SYS.NORMAL</span>
                <span>ZOOM.0.0</span>
            </div>

            {/* Right side artificial scroll gauge */}
            <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1 h-32 bg-zinc-900/50 border border-zinc-800 rounded-full flex flex-col justify-between py-1 items-center">
                <div className="w-0.5 h-1 bg-yellow-500/50"></div>
                <div className="w-0.5 h-1 bg-yellow-500/20"></div>
                <div className="w-0.5 h-1 bg-yellow-500/20"></div>
                <div className="w-0.5 h-1 bg-yellow-500/50"></div>
            </div>

            {/* Grid Overlay Texture (Scanlines) */}
            <div className="absolute inset-0 bg-transparent" style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
                backgroundSize: '100% 3px, 3px 100%',
                pointerEvents: 'none',
                opacity: 0.4
            }} />
        </div>
    );
};

export default HUDOverlay;
