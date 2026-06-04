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

    // Load expert avatar images
    const loadedImages = [];
    const expertImageUrls = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150', // Female agronomist
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150&h=150', // Male researcher
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150', // Female researcher
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150', // Female specialist
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', // Male expert
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150', // Female expert
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', // Male consultant
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150'  // Male leader
    ];

    expertImageUrls.forEach((url, idx) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImages[idx] = img;
      };
    });

    // 3D parameters
    const focalLength = 350;
    let angleY = 0.002;
    let angleX = 0.001;
    let rotateSpeedY = 0.003;
    let rotateSpeedX = 0.0015;

    // Generate particles
    const particleCount = isMobile ? 45 : 100;
    const particles = [];

    // The first 8 particles are major Expert Image Nodes
    for (let i = 0; i < particleCount; i++) {
      if (i < 8) {
        let theta = (i / 8) * Math.PI * 2;
        let phi = Math.PI / 4 + Math.random() * (Math.PI / 2); // Spread vertically
        let r = 110 + Math.random() * 40; // Positioned further out
        
        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          baseX: r * Math.sin(phi) * Math.cos(theta),
          baseY: r * Math.sin(phi) * Math.sin(theta),
          baseZ: r * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.15,
          size: 18, // Larger base size for expert avatars
          color: '#10b981',
          type: 2, // Type 2 is Expert Image Node
          imageIndex: i,
          pulse: Math.random() * Math.PI,
          pulseSpeed: 0.01 + Math.random() * 0.02
        });
      } else {
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos((Math.random() * 2) - 1);
        let r = 60 + Math.random() * 140;

        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          baseX: r * Math.sin(phi) * Math.cos(theta),
          baseY: r * Math.sin(phi) * Math.sin(theta),
          baseZ: r * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.5 + 1.2,
          color: Math.random() > 0.4 
            ? (Math.random() > 0.5 ? '#10b981' : '#34d399') 
            : '#fbbf24', // Amber/Gold
          type: Math.random() > 0.35 ? 0 : 1,
          pulse: Math.random() * Math.PI,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      }
    }

    // Connect particles to form the network
    const connections = [];
    for (let i = 0; i < particleCount; i++) {
      const p1 = particles[i];
      const dists = particles
        .map((p, idx) => ({ idx, d: Math.hypot(p.baseX - p1.baseX, p.baseY - p1.baseY, p.baseZ - p1.baseZ) }))
        .filter(item => item.idx !== i)
        .sort((a, b) => a.d - b.d);

      // Connect each node to its closest neighbors
      // Experts get slightly more connections to act as hubs
      const numConn = p1.type === 2 ? 3 : (Math.random() > 0.4 ? 2 : 1);
      for (let c = 0; c < numConn && c < dists.length; c++) {
        const neighborIdx = dists[c].idx;
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
        const time = Date.now() * 0.001;
        mouseX += (width / 2 + Math.sin(time) * 40 - mouseX) * 0.02;
        mouseY += (height / 2 + Math.cos(time * 0.8) * 30 - mouseY) * 0.02;
      }

      // Update and rotate positions
      const projected = [];
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

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

        // Apply Y Rotation
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Apply X Rotation
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Projection
        const zDepth = z2 + 300; 
        const scale = focalLength / Math.max(1, zDepth);
        const projX = width / 2 + p.x * scale;
        const projY = height / 2 + p.y * scale;

        let screenDx = projX - mouseX;
        let screenDy = projY - mouseY;
        let screenDist = Math.hypot(screenDx, screenDy);

        let finalProjX = projX;
        let finalProjY = projY;

        if (screenDist < 160) {
          const force = (160 - screenDist) * 0.12;
          const angle = Math.atan2(screenDy, screenDx);
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
          size: p.size * scale * 0.75,
          alpha: Math.min(1, Math.max(0.15, scale * 0.55)),
          type: p.type,
          imageIndex: p.imageIndex
        });
      }

      // Draw connections (Lines)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < connections.length; i++) {
        const [idx1, idx2] = connections[i];
        const p1 = projected[idx1];
        const p2 = projected[idx2];

        const avgDepth = (p1.z + p2.z) / 2;
        if (avgDepth > 100) {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.22 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            const rgb1 = p1.color === '#fbbf24' ? '251, 191, 36' : '16, 185, 129';
            const rgb2 = p2.color === '#fbbf24' ? '251, 191, 36' : '16, 185, 129';
            
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(${rgb1}, ${alpha})`);
            grad.addColorStop(1, `rgba(${rgb2}, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connection lines (magnetic net)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.22 * p.alpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.stroke();
        }
      }

      // Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 2) {
          const img = loadedImages[p.imageIndex];
          if (img && img.complete) {
            // Circular Clip
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(8, p.size), 0, Math.PI * 2);
            ctx.clip();
            
            // Draw expert face image
            const diameter = Math.max(8, p.size) * 2;
            ctx.drawImage(img, p.x - Math.max(8, p.size), p.y - Math.max(8, p.size), diameter, diameter);
            
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = p.alpha;
            
            // Glowing border
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(8, p.size), 0, Math.PI * 2);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';
            ctx.stroke();
          } else {
            // Fallback to solid green node
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(6, p.size), 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#10b981';
            ctx.fill();
          }
        } else {
          // Standard connection points
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          
          if (p.type === 1 && !isMobile) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          } else if (!isMobile) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#10b981';
          }
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw custom orbiting rings representing knowledge fields
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
