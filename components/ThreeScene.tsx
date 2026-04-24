"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FloatingObj {
  mesh: THREE.Mesh;
  rotX: number;
  rotY: number;
  rotZ: number;
  floatAmp: number;
  floatSpeed: number;
  floatOffset: number;
  baseY: number;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const dl = new THREE.DirectionalLight(0xa8d5e2, 2.5);
    dl.position.set(4, 6, 5);
    scene.add(dl);

    const pl1 = new THREE.PointLight(0xb8e0c8, 4, 18);
    pl1.position.set(-5, 3, 3);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(0xc4b7e8, 3, 14);
    pl2.position.set(5, -3, 2);
    scene.add(pl2);

    const pl3 = new THREE.PointLight(0xe8c4d0, 2, 12);
    pl3.position.set(0, -5, 4);
    scene.add(pl3);

    /* ── Materials ── */
    const mat = (color: number, opacity = 0.78) =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.04,
        roughness: 0.06,
        transparent: true,
        opacity,
        envMapIntensity: 0.8,
      });

    const palette = [
      mat(0x9dc8db, 0.82),   // pastel blue
      mat(0xa8d4b8, 0.78),   // mint green
      mat(0xc4b7e8, 0.72),   // soft lavender
      mat(0xe0c8a8, 0.80),   // warm beige
      mat(0xe0a8b8, 0.68),   // blush pink
    ];

    /* ── Object factory ── */
    const objects: FloatingObj[] = [];

    const add = (geo: THREE.BufferGeometry, matIdx: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(geo, palette[matIdx % palette.length]);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.016,
        rotY: (Math.random() - 0.5) * 0.016,
        rotZ: (Math.random() - 0.5) * 0.008,
        floatAmp: 0.07 + Math.random() * 0.10,
        floatSpeed: 0.38 + Math.random() * 0.55,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: y,
      });
    };

    /* Crystals (icosahedra) */
    add(new THREE.IcosahedronGeometry(0.58, 0), 0, -3.8, 1.8, -1.2);
    add(new THREE.IcosahedronGeometry(0.38, 0), 2, 3.4, -1.4, -0.6);
    add(new THREE.IcosahedronGeometry(0.46, 0), 4, -2.2, -2.2, -2.0);
    add(new THREE.IcosahedronGeometry(0.28, 0), 1, 2.6, 2.2, 0.2);
    add(new THREE.IcosahedronGeometry(0.32, 0), 3, 0.6, 3.0, -1.5);

    /* Spheres */
    add(new THREE.SphereGeometry(0.38, 32, 32), 1, 4.0, 1.6, -1.8);
    add(new THREE.SphereGeometry(0.24, 32, 32), 3, -4.0, -0.6, -1.2);
    add(new THREE.SphereGeometry(0.48, 32, 32), 0, 0.4, -2.8, -2.4);
    add(new THREE.SphereGeometry(0.20, 32, 32), 4, -1.6, 2.8, 0.4);
    add(new THREE.SphereGeometry(0.30, 32, 32), 2, 2.0, -3.2, -1.0);

    /* Octahedra */
    add(new THREE.OctahedronGeometry(0.42, 0), 2, 1.8, 0.6, -0.8);
    add(new THREE.OctahedronGeometry(0.26, 0), 3, -0.8, -3.2, -1.8);
    add(new THREE.OctahedronGeometry(0.34, 0), 1, -3.2, -1.8, 0.0);

    /* Rings */
    add(new THREE.TorusGeometry(0.48, 0.11, 16, 48), 0, -4.8, 0.2, -2.5);
    add(new THREE.TorusGeometry(0.32, 0.08, 12, 36), 2, 4.4, 0.8, -3.0);

    /* ── Mouse tracking ── */
    const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 1.6;
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 1.2;
    };
    window.addEventListener("mousemove", onMouse);

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    let rafId: number;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * 0.035;
      mouse.y += (mouse.ty - mouse.y) * 0.035;
      camera.position.x = mouse.x * 0.45;
      camera.position.y = mouse.y * 0.32;
      camera.lookAt(scene.position);

      for (const o of objects) {
        o.mesh.rotation.x += o.rotX;
        o.mesh.rotation.y += o.rotY;
        o.mesh.rotation.z += o.rotZ;
        o.mesh.position.y = o.baseY + Math.sin(t * o.floatSpeed + o.floatOffset) * o.floatAmp;
      }

      renderer.render(scene, camera);
    };
    tick();

    /* ── Resize ── */
    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      for (const o of objects) {
        o.mesh.geometry.dispose();
        (o.mesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
