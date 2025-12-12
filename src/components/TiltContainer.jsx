import React, { useRef } from 'react';

const TiltContainer = ({ children, className = "", scale = 1.1, perspective = 1000, maxRotation = 10 }) => {
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        // Rotate relative to mouse position
        // x * maxRotation gives rotation around Y axis
        // -y * maxRotation gives rotation around X axis

        if (containerRef.current) {
            // If the child is what we want to rotate, or the container itself
            // Let's rotate the container's first child for consistency if we want to preserve layout space, 
            // OR just rotate the container itself if it's a button.
            // For buttons, rotating the container is fine.
            e.currentTarget.style.transform = `perspective(${perspective}px) rotateY(${x * maxRotation}deg) rotateX(${-y * maxRotation}deg) scale3d(${scale}, ${scale}, ${scale})`;
        }
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = `perspective(${perspective}px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <div
            ref={containerRef}
            className={`transition-transform duration-100 ease-out will-change-transform ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

export default TiltContainer;
