/**
 * Google Antigravity Full-Viewport Background Atmosphere Engine
 * AJJEZ Performance & Growth Marketing Consultancy
 * 
 * Features:
 * - Full-screen fixed canvas with responsive retina / high-DPI scaling
 * - Zero-G floating particles drifting upwards across all sections
 * - Global interactive cursor & touch repulsion (< 140px)
 * - Delicate neural constellation links between nearby particles and cursor
 * - Full-screen interactive radial spotlight aura tracking mouse movement
 * - Automatic 3D tilt support for hero content cards (< 1.5 deg)
 * - Battery & performance optimization: pauses on tab hide, caps DPR at 2
 * - Respects prefers-reduced-motion
 */

(function () {
  'use strict';

  function initAntigravityBackground() {
    // 1. Ensure Canvas and Spotlight elements exist in DOM
    let canvas = document.getElementById('antigravityCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'antigravityCanvas';
      canvas.className = 'fixed inset-0 pointer-events-none -z-10 w-full h-full';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    let spotlight = document.getElementById('antigravitySpotlight');
    if (!spotlight) {
      spotlight = document.createElement('div');
      spotlight.id = 'antigravitySpotlight';
      spotlight.className = 'fixed inset-0 pointer-events-none -z-10 antigravity-spotlight';
      document.body.insertBefore(spotlight, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check user accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId = null;
    let isVisible = true;

    // Global cursor & interaction state
    let mouseX = -1000;
    let mouseY = -1000;
    let isHovering = false;

    // Optional hero card 3D tilt (if present on index.html)
    const heroSection = document.getElementById('heroSection');
    const heroTiltCard = document.getElementById('heroTiltCard');
    let heroHovered = false;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    // AJJEZ 5-color palette for particles
    const colors = [
      'rgba(172, 236, 161, ', // lightGreen #ACECA1
      'rgba(201, 242, 199, ', // tea #C9F2C7
      'rgba(98, 148, 96, ',   // sage #629460
      'rgba(150, 190, 140, '  // mutedOlive #96BE8C
    ];

    // Responsive particle count (balanced for 60fps performance on all devices)
    function getParticleCount() {
      const area = window.innerWidth * window.innerHeight;
      if (window.innerWidth < 768) return 35;
      if (area > 2000000) return 80; // Large 2K/4K monitors
      return 60; // Standard desktop/laptop
    }

    let particles = [];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + Math.random() * 25;
        // Anti-gravity: slow, tranquil upward velocity
        this.vy = -(0.25 + Math.random() * 0.45);
        // Micro horizontal drift
        this.vx = (Math.random() - 0.5) * 0.22;
        this.size = 1.0 + Math.random() * 1.8;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = 0.25 + Math.random() * 0.45;
        this.alpha = this.baseAlpha;
        this.pulseSpeed = 0.015 + Math.random() * 0.02;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.pulseAngle += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.15;

        this.x += this.vx;
        this.y += this.vy;

        // Interactive cursor repulsion across the entire screen
        if (isHovering && mouseX > -500) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 140;

          if (dist < repelRadius && dist > 0) {
            const force = (1 - dist / repelRadius) * 2.4;
            this.x += (dx / dist) * force;
            this.y += (dy / dist) * force;
          }
        }

        // Seamless viewport wrapping
        if (this.y < -20) {
          this.reset(false);
        }
        if (this.x < -20) this.x = width + 15;
        if (this.x > width + 20) this.x = -15;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + Math.max(0.05, Math.min(1, this.alpha)) + ')';
        ctx.fill();
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);

      const targetCount = getParticleCount();
      if (particles.length === 0) {
        for (let i = 0; i < targetCount; i++) {
          particles.push(new Particle());
        }
      } else if (particles.length < targetCount) {
        while (particles.length < targetCount) {
          particles.push(new Particle());
        }
      } else if (particles.length > targetCount) {
        particles.length = targetCount;
      }
    }

    // Draw delicate constellation links between nearby particles and the mouse
    function drawConstellations() {
      const maxDist = 75;
      const pLen = particles.length;

      for (let i = 0; i < pLen; i++) {
        const p1 = particles[i];

        // Link to cursor anywhere on screen
        if (isHovering && mouseX > -500) {
          const mdx = p1.x - mouseX;
          const mdy = p1.y - mouseY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 115) {
            const mAlpha = (1 - mDist / 115) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(172, 236, 161, ${mAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Link neighboring particles
        for (let j = i + 1; j < pLen; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(172, 236, 161, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function render() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Render all particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      drawConstellations();

      // Handle Hero 3D Tilt Card if on index.html
      if (heroTiltCard && !prefersReducedMotion) {
        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        if (Math.abs(currentTiltX) > 0.001 || Math.abs(currentTiltY) > 0.001 || heroHovered) {
          heroTiltCard.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(${heroHovered ? 4 : 0}px)`;
        } else {
          heroTiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    // Global Mousemove Tracking across the entire window
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;

      // Update full-page CSS spotlight variables
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

      // If over hero section on index.html, calculate subtle tilt
      if (heroSection && heroTiltCard && !prefersReducedMotion) {
        const rect = heroSection.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          heroHovered = true;
          const heroRelX = e.clientX - rect.left;
          const heroRelY = e.clientY - rect.top;
          const normX = (heroRelX / rect.width - 0.5) * 2;
          const normY = (heroRelY / rect.height - 0.5) * 2;
          targetTiltX = -normY * 1.5;
          targetTiltY = normX * 1.5;
        } else {
          heroHovered = false;
          targetTiltX = 0;
          targetTiltY = 0;
        }
      }
    }, { passive: true });

    // Handle mouse leaving the window
    document.addEventListener('mouseleave', () => {
      isHovering = false;
      mouseX = -1000;
      mouseY = -1000;
      heroHovered = false;
      targetTiltX = 0;
      targetTiltY = 0;
    });

    // Mobile touch interaction
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        isHovering = true;
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isHovering = false;
      mouseX = -1000;
      mouseY = -1000;
    });

    // Window resize handler with debouncing
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    }, { passive: true });

    // Pause animation when tab is inactive to preserve 100% of battery / CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        animationFrameId = requestAnimationFrame(render);
      }
    });

    // Start engine
    resize();
    animationFrameId = requestAnimationFrame(render);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntigravityBackground);
  } else {
    initAntigravityBackground();
  }
})();
