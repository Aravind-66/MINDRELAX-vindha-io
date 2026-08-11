import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDPlantCanvasProps {
  level?: number;
  xp?: number;
  className?: string;
}

export const ThreeDPlantCanvas: React.FC<ThreeDPlantCanvasProps> = ({ level = 1, xp = 0, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const plantGroup = new THREE.Group();
    scene.add(plantGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x34d399, 1.8);
    dirLight1.position.set(5, 10, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // 3D Decorative Pot
    const potGeo = new THREE.CylinderGeometry(1.1, 0.8, 1.2, 32);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.7
    });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = -0.6;
    plantGroup.add(potMesh);

    // Soil
    const soilGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -0.05;
    plantGroup.add(soilMesh);

    // Procedural Stem
    const stemHeight = 1.2 + Math.min(level * 0.2, 1.8);
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.18, stemHeight, 16);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.4
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = stemHeight / 2;
    plantGroup.add(stemMesh);

    // Leaves
    const leafGeo = new THREE.SphereGeometry(0.4, 16, 16);
    leafGeo.scale(1.8, 0.2, 0.8);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.2,
      metalness: 0.1
    });

    const leafCount = 4 + Math.min(level * 2, 10);
    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / leafCount) * Math.PI * 2;
      const heightFrac = 0.3 + (i / leafCount) * (stemHeight - 0.4);
      leaf.position.set(Math.cos(angle) * 0.35, heightFrac, Math.sin(angle) * 0.35);
      leaf.rotation.y = angle;
      leaf.rotation.z = Math.PI / 6;
      plantGroup.add(leaf);
    }

    // Top Flower/Bud for level >= 3
    if (level >= 3) {
      const flowerGroup = new THREE.Group();
      flowerGroup.position.y = stemHeight + 0.1;

      const coreGeo = new THREE.IcosahedronGeometry(0.3, 2);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, emissive: 0xb45309, emissiveIntensity: 0.3 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      flowerGroup.add(core);

      const petalGeo = new THREE.ConeGeometry(0.25, 0.7, 16);
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
      for (let p = 0; p < 8; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat);
        const rot = (p / 8) * Math.PI * 2;
        petal.position.set(Math.cos(rot) * 0.4, 0, Math.sin(rot) * 0.4);
        petal.rotation.y = rot;
        petal.rotation.z = Math.PI / 2;
        flowerGroup.add(petal);
      }
      plantGroup.add(flowerGroup);
    }

    // Floating Aura Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      positions[p * 3] = (Math.random() - 0.5) * 3;
      positions[p * 3 + 1] = Math.random() * stemHeight + 0.5;
      positions[p * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    plantGroup.add(particles);

    // Mouse Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      plantGroup.rotation.y += deltaX * 0.01;
      plantGroup.rotation.x += deltaY * 0.01;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating sway
      if (!isDragging) {
        plantGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;
        plantGroup.rotation.z = Math.cos(elapsedTime * 0.8) * 0.04;
      }

      particles.rotation.y = elapsedTime * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mount.contains(domElem)) {
        mount.removeChild(domElem);
      }
      renderer.dispose();
    };
  }, [level, xp]);

  return (
    <div className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[280px]" />
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] text-slate-400 backdrop-blur-md pointer-events-none">
        Drag to rotate in 3D
      </div>
    </div>
  );
};
