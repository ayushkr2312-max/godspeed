import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;

    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      if (cursor) {
        cursor.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button') || e.target.getAttribute('role') === 'button') {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

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
          transition: transform 0.1s ease-out;
          will-change: transform;
        }
        .start-point {
            /* Adjust so the tip of the arrow is at 0,0 */
            transform-origin: top left;
        }
        .cursor-svg {
            width: 24px;
            height: 24px;
            fill: #eab308; /* Yellow-500 */
            stroke: black;
            stroke-width: 1.5px;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cursor-svg.hovered {
            transform: scale(1.5);
        }
      `}</style>
      <div ref={cursorRef} className="custom-cursor-arrow">
        <svg
          className={`cursor-svg ${hovered ? 'hovered' : ''}`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.5 3.5L12 21.5L14.5 14.5L21.5 12L5.5 3.5Z" />
        </svg>
      </div>
    </>
  );
};

export default CustomCursor;
