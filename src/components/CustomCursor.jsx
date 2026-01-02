import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = ({ zoomRef }) => {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [variant, setVariant] = useState('default');

  const mouseYRef = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;

    // Use refs for values accessed in the animation loop to avoid re-renders/stale closures
    const mousePos = useRef({ x: -100, y: -100 });
    const isHoveringInteractive = useRef(false);

    // Tweak: Only check bounds occasionally or just use rAF? 
    // rAF is safer for performance than mousemove since mousemove can fire 1000Hz+

    // Loop logic
    let rAFId = null;

    const loop = () => {
      // 1. Update Cursor Position
      const { x, y } = mousePos.current;
      if (cursor) {
        // Using translate3d for hardware acceleration
        // Using fixed position, so we just use clientX/Y
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      // 2. Update Variant Logic
      // We only read layout (getBoundingClientRect) once per frame max, which is acceptable
      if (zoomRef && zoomRef.current) {
        const rect = zoomRef.current.getBoundingClientRect();

        let newVariant = 'default';

        // Priority to "hidden" (inside the box)
        if (y >= rect.top && y <= rect.bottom) {
          newVariant = 'hidden';
        } else if (y > rect.bottom) {
          newVariant = 'dot';
        } else {
          newVariant = 'default';
        }

        // Update state only if changed to avoid React render cycles
        setVariant(prev => prev !== newVariant ? newVariant : prev);
      }

      rAFId = requestAnimationFrame(loop);
    };

    // Event Listeners
    const moveCursor = (e) => {
      // Just store coordinates, don't do layout work here
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('[data-cursor-hover]');

      if (isInteractive) {
        setHovered(true);
        isHoveringInteractive.current = true;
      } else {
        setHovered(false);
        isHoveringInteractive.current = false;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    // Use stored scroll listener if needed, but rAF handles layout checks naturally now

    // Start loop
    rAFId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [zoomRef]);

  return (
    <>
      <style>{`
        body {
          cursor: none;
        }
        .custom-cursor-arrow {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.1s ease-out, opacity 0.2s ease;
          will-change: transform;
        }
        .custom-cursor-arrow.hidden {
            opacity: 0;
        }
        .start-point {
            transform-origin: top left;
        }
        .cursor-svg {
            width: 24px;
            height: 24px;
            fill: #eab308; /* Yellow-500 */
            stroke: black;
            stroke-width: 1.5px;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s;
        }
        .cursor-svg.hovered {
            transform: scale(1.5);
        }
        /* Dot Mode Styles */
        .cursor-svg.dot {
            transform: scale(0.5);
            fill: #eab308;
            stroke: black;
            stroke-width: 2px;
        }
        .cursor-svg.dot.hovered {
            transform: scale(0.8);
        }
      `}</style>
      <div ref={cursorRef} className={`custom-cursor-arrow ${variant === 'hidden' ? 'hidden' : ''}`} style={{ willChange: 'transform' }}>
        <svg
          className={`cursor-svg ${hovered ? 'hovered' : ''} ${variant === 'dot' ? 'dot' : ''}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {variant === 'dot' ? (
            <circle cx="12" cy="12" r="10" />
          ) : (
            <path d="M5.5 3.5L12 21.5L14.5 14.5L21.5 12L5.5 3.5Z" />
          )}
        </svg>
      </div>
    </>
  );
};

export default CustomCursor;
