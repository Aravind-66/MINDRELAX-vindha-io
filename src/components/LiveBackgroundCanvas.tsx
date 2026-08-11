import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWellness } from '../context/WellnessContext';

export const LiveBackgroundCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { bgTheme } = useWellness();
  const themeRef = useRef(bgTheme);

  useEffect(() => {
    themeRef.current = bgTheme;
  }, [bgTheme]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // 1. Primary Organic 3D Wave Surface
    const planeWidth = 50;
    const planeHeight = 50;
    const segmentsX = 90;
    const segmentsY = 90;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2.3);

    const posAttribute = geometry.attributes.position;
    const originalPositions = new Float32Array(posAttribute.array.length);
    originalPositions.set(posAttribute.array);

    // Primary Wave Particles
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array((segmentsX + 1) * (segmentsY + 1) * 3);
    particlePositions.set(originalPositions);
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.1,
      transparent: true,
      opacity: 0.4
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. Floating Starfield / Dust Orbs (Upper Atmosphere)
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starOriginals = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 45;
      starPositions[i + 1] = Math.random() * 18;
      starPositions[i + 2] = (Math.random() - 0.5) * 35;
      starOriginals[i] = starPositions[i];
      starOriginals[i + 1] = starPositions[i + 1];
      starOriginals[i + 2] = starPositions[i + 2];
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 3. Dynamic Ambient Lights
    const ambientLight = new THREE.AmbientLight(0x020617, 1.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 1.2, 30);
    pointLight1.position.set(-8, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0284c7, 1.2, 30);
    pointLight2.position.set(8, -3, -3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 1.0, 25);
    pointLight3.position.set(0, 8, -5);
    scene.add(pointLight3);

    // Color Theme Presets for Light Mode
    const themes = {
      emerald: {
        particleColor: 0x059669,
        wireColor: 0x0d9488,
        starColor: 0x10b981,
        light1: 0x059669,
        light2: 0x0284c7,
        light3: 0x047857,
        fog: 0xf8fafc
      },
      cosmic: {
        particleColor: 0x9333ea,
        wireColor: 0x4f46e5,
        starColor: 0xc084fc,
        light1: 0x7e22ce,
        light2: 0x4338ca,
        light3: 0x9333ea,
        fog: 0xfaf5ff
      },
      ocean: {
        particleColor: 0x0284c7,
        wireColor: 0x2563eb,
        starColor: 0x38bdf8,
        light1: 0x0284c7,
        light2: 0x1d4ed8,
        light3: 0x0369a1,
        fog: 0xf0f9ff
      },
      sunset: {
        particleColor: 0xe11d48,
        wireColor: 0xd97706,
        starColor: 0xfb7185,
        light1: 0xe11d48,
        light2: 0xb45309,
        light3: 0x9f1239,
        fog: 0xfff1f2
      },
      zen: {
        particleColor: 0x65a30d,
        wireColor: 0x047857,
        starColor: 0x84cc16,
        light1: 0x65a30d,
        light2: 0x0d9488,
        light3: 0x4d7c0f,
        fog: 0xf7fee7
      }
    };

    // Smooth Color Transition Target Setup
    let currentTheme = themes[themeRef.current] || themes.emerald;

    // Mouse Parallax Logic
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Check for live theme changes
      const activePreset = themes[themeRef.current] || themes.emerald;
      particleMat.color.lerp(new THREE.Color(activePreset.particleColor), 0.03);
      starMat.color.lerp(new THREE.Color(activePreset.starColor), 0.03);
      pointLight1.color.lerp(new THREE.Color(activePreset.light1), 0.03);
      pointLight2.color.lerp(new THREE.Color(activePreset.light2), 0.03);
      pointLight3.color.lerp(new THREE.Color(activePreset.light3), 0.03);
      scene.fog?.color.lerp(new THREE.Color(activePreset.fog), 0.03);

      // Smooth camera motion
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 4;
      camera.position.y = 5 + targetY * 3;
      camera.lookAt(0, 0, 0);

      // Animate 3D Wave Vertices
      const positionAttr = particleGeo.attributes.position;
      const positions = positionAttr.array as Float32Array;

      const meshPosAttr = geometry.attributes.position;
      const meshPositions = meshPosAttr.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];

        // Complex organic 3-tier wave equation
        const wave1 = Math.sin(x * 0.35 + elapsedTime * 0.9) * 0.5;
        const wave2 = Math.cos(z * 0.3 + elapsedTime * 0.7) * 0.45;
        const wave3 = Math.sin((x + z) * 0.25 + elapsedTime * 0.6) * 0.3;

        const newY = originalPositions[i + 1] + wave1 + wave2 + wave3;

        positions[i + 1] = newY;
        meshPositions[i + 1] = newY;
      }

      positionAttr.needsUpdate = true;
      meshPosAttr.needsUpdate = true;

      // Animate Upper Starfield Particles
      const starPosAttr = starGeo.attributes.position;
      const starPos = starPosAttr.array as Float32Array;

      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i + 1] = starOriginals[i + 1] + Math.sin(elapsedTime + starOriginals[i]) * 0.3;
        starPos[i] = starOriginals[i] + Math.cos(elapsedTime * 0.5 + starOriginals[i + 2]) * 0.2;
      }
      starPosAttr.needsUpdate = true;

      // Orbit point lights for continuous dynamic shadows & highlights
      pointLight1.position.x = Math.sin(elapsedTime * 0.4) * 10;
      pointLight1.position.z = Math.cos(elapsedTime * 0.4) * 10;

      pointLight2.position.x = Math.cos(elapsedTime * 0.3) * -10;
      pointLight2.position.z = Math.sin(elapsedTime * 0.3) * -10;

      pointLight3.position.y = 6 + Math.sin(elapsedTime * 0.5) * 3;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const themeGradients: Record<string, string> = {
    emerald: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-50 to-slate-100',
    cosmic: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/50 via-slate-50 to-slate-100',
    ocean: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/50 via-slate-50 to-slate-100',
    sunset: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/50 via-slate-50 to-slate-100',
    zen: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-100/50 via-slate-50 to-slate-100'
  };

  const currentGradient = themeGradients[bgTheme] || themeGradients.emerald;

  return (
    <div className={`fixed inset-0 pointer-events-none -z-10 ${currentGradient} overflow-hidden transition-all duration-700`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
