import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useWellness } from '../context/WellnessContext';

interface ThreeZenCanvasProps {
  variant?: 'hero' | 'meditation' | 'ambient' | 'plant';
  className?: string;
}

export const ThreeZenCanvas: React.FC<ThreeZenCanvasProps> = ({ variant = 'hero', className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { bgTheme } = useWellness();
  const themeRef = useRef(bgTheme);

  useEffect(() => {
    themeRef.current = bgTheme;
  }, [bgTheme]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = mount.clientWidth || 300;
    const height = mount.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = variant === 'meditation' ? 5 : 6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight2.position.set(-5, -5, 2);
    scene.add(pointLight2);

    // Objects based on variant
    let torusMesh: THREE.Mesh | null = null;
    let sphereMesh: THREE.Mesh | null = null;
    let particlesMesh: THREE.Points | null = null;
    let torusMat: THREE.MeshPhysicalMaterial | null = null;
    let sphereMat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null = null;

    if (variant === 'hero' || variant === 'ambient') {
      // Elegant 3D Zen Ring (Torus Knot)
      const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16, 2, 3);
      torusMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f766e,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe: false,
        emissive: 0x042f2e,
        emissiveIntensity: 0.2
      });
      torusMesh = new THREE.Mesh(geometry, torusMat);
      mainGroup.add(torusMesh);

      // Inner glowing core
      const coreGeo = new THREE.IcosahedronGeometry(0.7, 2);
      sphereMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      sphereMesh = new THREE.Mesh(coreGeo, sphereMat);
      mainGroup.add(sphereMesh);
    } else if (variant === 'meditation') {
      // Concentric Breathing Rings
      const ringGeo1 = new THREE.TorusGeometry(1.5, 0.08, 16, 100);
      const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);

      const ringGeo2 = new THREE.TorusGeometry(1.1, 0.06, 16, 100);
      const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI / 3;

      const sphereGeo = new THREE.SphereGeometry(0.6, 32, 32);
      sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.9,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.5
      });
      sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);

      mainGroup.add(ring1);
      mainGroup.add(ring2);
      mainGroup.add(sphereMesh);
      torusMesh = ring1;
    } else if (variant === 'plant') {
      // 3D Organic Geometric Crystal / Plant Sprout
      const stemGeo = new THREE.CylinderGeometry(0.1, 0.15, 2, 16);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = -0.5;

      const leafGeo = new THREE.DodecahedronGeometry(0.7, 1);
      sphereMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.2, metalness: 0.2 });
      sphereMesh = new THREE.Mesh(leafGeo, sphereMat);
      sphereMesh.position.y = 0.8;

      mainGroup.add(stem);
      mainGroup.add(sphereMesh);
    }

    // Floating Ambient Particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.6
    });
    particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    const themeColors = {
      emerald: { main: 0x10b981, secondary: 0x06b6d4, accent: 0x34d399 },
      cosmic: { main: 0xa855f7, secondary: 0x6366f1, accent: 0xc084fc },
      ocean: { main: 0x06b6d4, secondary: 0x3b82f6, accent: 0x38bdf8 },
      sunset: { main: 0xf43f5e, secondary: 0xf59e0b, accent: 0xfb7185 },
      zen: { main: 0x84cc16, secondary: 0x10b981, accent: 0xa3e635 }
    };

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamically lerp colors when bgTheme changes
      const targetColors = themeColors[themeRef.current] || themeColors.emerald;
      pointLight1.color.lerp(new THREE.Color(targetColors.main), 0.04);
      pointLight2.color.lerp(new THREE.Color(targetColors.secondary), 0.04);
      particleMat.color.lerp(new THREE.Color(targetColors.accent), 0.04);
      if (torusMat) torusMat.color.lerp(new THREE.Color(targetColors.main), 0.04);
      if (sphereMat) sphereMat.color.lerp(new THREE.Color(targetColors.accent), 0.04);

      if (!prefersReducedMotion) {
        if (torusMesh) {
          torusMesh.rotation.x = elapsedTime * 0.2;
          torusMesh.rotation.y = elapsedTime * 0.3;
        }
        if (sphereMesh) {
          sphereMesh.rotation.y = -elapsedTime * 0.4;
          const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.08;
          sphereMesh.scale.set(scale, scale, scale);
        }
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.05;
        }

        // Smooth Mouse Parallax
        mainGroup.rotation.y += (mouseX * 0.5 - mainGroup.rotation.y) * 0.05;
        mainGroup.rotation.x += (-mouseY * 0.5 - mainGroup.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[180px] flex items-center justify-center pointer-events-none ${className}`}
    />
  );
};
