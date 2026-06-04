import React, { useEffect, useRef, useState } from 'react';

export const AgriVisualizer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, active: false });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.width = containerRef.current?.clientWidth || 600;
    let height = canvas.height = containerRef.current?.clientHeight || 500;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 3D parameters
    const focalLength = 350;
    let angleY = 0.002;
    let angleX = 0.001;
    let rotateSpeedY = 0.003;
    let rotateSpeedX = 0.0015;

    // Generate particles
    const particleCount = isMobile ? 40 : 110;
    const particles = [];

    // Create different types of nodes:
    // Type 0: Core network nodes (Mint/Green)
    // Type 1: Glowing knowledge seeds (Gold)
    // Type 2: Floating energy particles (Light emerald)
    for (let i = 0; i < particleCount; i++) {
      // Structure: spherical or double-helix cluster
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.acos((Math.random() * 2) - 1);
      let r = 80 + Math.random() * 120; // Radius range

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseX: r * Math.sin(phi) * Math.cos(theta),
        baseY: r * Math.sin(phi) * Math.sin(theta),
        baseZ: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.35 
          ? (Math.random() > 0.5 ? '#10b981' : '#34d399') // Emerald / Mint
          : '#fbbf24', // Amber/Gold wheat
        type: Math.random() > 0.35 ? 0 : 1,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }

    // Connect some particles statically to form "branches" (agriculture growth motif)
    const connections = [];
    for (let i = 0; i < particleCount; i++) {
      // Connect each particle to 1 or 2 closest ones to build initial network structures
      const p1 = particles[i];
      const dists = particles
        .map((p, idx) => ({ idx, d: Math.hypot(p.baseX - p1.baseX, p.baseY - p1.baseY, p.baseZ - p1.baseZ) }))
        .filter(item => item.idx !== i)
        .sort((a, b) => a.d - b.d);

      // Take top 2 closest
      const numConn = Math.random() > 0.4 ? 2 : 1;
      for (let c = 0; c < numConn && c < dists.length; c++) {
        const neighborIdx = dists[c].idx;
        // Avoid duplicate connection pairs
        if (!connections.some(conn => (conn[0] === i && conn[1] === neighborIdx) || (conn[0] === neighborIdx && conn[1] === i))) {
          connections.push([i, neighborIdx]);
        }
      }
    }

    // Mouse positions smooth transition
    let mouseX = 0;
    let mouseY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Slowly increment base rotation
      angleY += rotateSpeedY;
      angleX += rotateSpeedX;

      const cosY = Math.cos(rotateSpeedY);
      const sinY = Math.sin(rotateSpeedY);
      const cosX = Math.cos(rotateSpeedX);
      const sinX = Math.sin(rotateSpeedX);

      // Smooth mouse follow
      if (mouseRef.current.active) {
        mouseX += (mouseRef.current.tx - mouseX) * 0.08;
        mouseY += (mouseRef.current.ty - mouseY) * 0.08;
      } else {
        // Floating idle mouse
        const time = Date.now() * 0.001;
        mouseX += (width / 2 + Math.sin(time) * 40 - mouseX) * 0.02;
        mouseY += (height / 2 + Math.cos(time * 0.8) * 30 - mouseY) * 0.02;
      }

      // 1. Update and rotate positions
      const projected = [];
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Apply a gentle organic floating wave (Simulating wind in crops)
        p.pulse += p.pulseSpeed;
        const wave = Math.sin(p.pulse) * 0.15;
        p.x += p.vx + wave * p.vx;
        p.y += p.vy + wave * p.vy;
        p.z += p.vz;

        // Keep inside bounds relative to base
        const maxDist = 40;
        const dx = p.x - p.baseX;
        const dy = p.y - p.baseY;
        const dz = p.z - p.baseZ;
        if (Math.hypot(dx, dy, dz) > maxDist) {
          p.vx -= dx * 0.002;
          p.vy -= dy * 0.002;
          p.vz -= dz * 0.002;
        }

        // Apply 3D Rotations
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Projection
        const zDepth = z2 + 300; // Offset depth
        const scale = focalLength / Math.max(1, zDepth);
        const projX = width / 2 + p.x * scale;
        const projY = height / 2 + p.y * scale;

        // Apply mouse interaction in projected screen space
        let screenDx = projX - mouseX;
        let screenDy = projY - mouseY;
        let screenDist = Math.hypot(screenDx, screenDy);

        let finalProjX = projX;
        let finalProjY = projY;

        if (screenDist < 160) {
          // Push particles slightly away or pull based on type
          const force = (160 - screenDist) * 0.15;
          const angle = Math.atan2(screenDy, screenDx);
          // Pull gold seeds, push green nodes
          const dir = p.type === 1 ? -1 : 1;
          finalProjX += Math.cos(angle) * force * dir;
          finalProjY += Math.sin(angle) * force * dir;
        }

        projected.push({
          x: finalProjX,
          y: finalProjY,
          z: zDepth,
          scale: scale,
          color: p.color,
          size: p.size * scale * 0.65,
          alpha: Math.min(1, Math.max(0.15, scale * 0.5)),
          type: p.type
        });
      }

      // 2. Draw connections (Lines)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < connections.length; i++) {
        const [idx1, idx2] = connections[i];
        const p1 = projected[idx1];
        const p2 = projected[idx2];

        // Draw line only if they are somewhat facing the front (not too far behind)
        const avgDepth = (p1.z + p2.z) / 2;
        if (avgDepth > 100) {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          // Draw line if they are not stretched too far by mouse attraction
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.18 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Gradient lines
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(1, p2.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      // 3. Draw mouse connection lines (magnetic net)
      if (mouseRef.current.active || true) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.hypot(dx, dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25 * p.alpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // 4. Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Add glowing effect to the gold knowledge nodes & large seeds
        if (p.type === 1 && !isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        } else if (!isMobile) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#10b981';
        }
        
        ctx.fill();
        ctx.restore();
      }

      // Draw custom orbiting rings representing knowledge fields (supply chain, agronomy, finance)
      if (!isMobile) {
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, 220, 70, angleY * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(width / 2, height / 2, 160, 110, -angleX * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.tx = e.clientX - rect.left;
      mouseRef.current.ty = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.tx = e.touches[0].clientX - rect.left;
        mouseRef.current.ty = e.touches[0].clientY - rect.top;
        mouseRef.current.active = true;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isMobile]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px] md:min-h-[450px] overflow-hidden rounded-[2rem]">
      {/* Background radial glows behind canvas */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block relative z-10 cursor-pointer"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
