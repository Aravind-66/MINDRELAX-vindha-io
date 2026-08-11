import React, { useState, useRef } from 'react';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt angle in degrees, default 12
  glare?: boolean;
  glowColor?: string;
  onClick?: () => void;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className = '',
  depth = 12,
  glare = true,
  glowColor = 'rgba(0, 0, 0, 0.35)', // subtle dark depth shadow
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top; // y position within element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -depth;
    const rotY = ((x - centerX) / centerX) * depth;

    setRotateX(rotX);
    setRotateY(rotY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.15 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: '1000px' }}
      className="w-full inline-block"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative transition-transform duration-300 ease-out preserve-3d cursor-pointer ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px) scale3d(1.005, 1.005, 1.005)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
          boxShadow: isHovered ? `0 12px 28px -8px ${glowColor}` : undefined
        }}
      >
        {children}
      </div>
    </div>
  );
};
