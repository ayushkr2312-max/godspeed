import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = ({ zoomRef }) => {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [variant, setVariant] = useState('default');

  const mouseYRef = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;

    const updateVariant = () => {
      if (!zoomRef || !zoomRef.current) return;

      const rect = zoomRef.current.getBoundingClientRect();
      const y = mouseYRef.current;

      // Strict spatial check:
      if (y < rect.top) {
        // Mouse is physically above the banner
        setVariant(v => v !== 'default' ? 'default' : v);
      } else if (y > rect.bottom) {
        // Mouse is physically below the banner
        setVariant(v => v !== 'dot' ? 'dot' : v);
      } else {
        // Inside vertical bounds
        setVariant(v => v !== 'hidden' ? 'hidden' : v);
      }
    };

    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      mouseYRef.current = clientY;

      if (cursor) {
        cursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }
      updateVariant();
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
      } else {
        setHovered(false);
      }
    };

    const handleScroll = () => {
      updateVariant();
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', handleScroll);
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
      <div ref={cursorRef} className={`custom-cursor-arrow ${variant === 'hidden' ? 'hidden' : ''}`}>
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
