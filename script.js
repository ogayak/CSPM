/* ====== PERFORMANCE OPTIMIZED SCRIPT ====== */

// Throttle function for better performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* ====== MENU & HEADER BEHAVIOR ====== */
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
const header = document.getElementById("header");

// Enhanced mobile menu toggle
menuToggle && menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.classList.toggle("active");
  
  // Prevent body scroll when menu is open
  if (navLinks.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("nav") && navLinks.classList.contains("active")) {
    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Optimized header scroll behavior with throttling
const updateHeader = throttle(() => {
  header.classList.toggle("scrolled", window.scrollY > 50);
}, 16); // ~60fps

window.addEventListener("scroll", updateHeader, { passive: true });

/* ====== PERFORMANCE OPTIMIZED GLOBE ANIMATION ====== */

function initGlobe(canvasId, isMobile = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { 
    alpha: true, 
    antialias: false,
    powerPreference: "low-power" // Better for battery life
  });
  
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  let cw, ch, cx, cy, radiusPx;
  let dots = [];
  let rotX = 0;
  let rotY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let t = 0;
  let animationId;
  let isVisible = true;

  // Reduced animation speeds for better performance
  const autoSpinY = isMobile ? 0.004 : 0.006; // Slower for mobile
  const autoSpinX = isMobile ? 0.001 : 0.002;

  // Simplified color palette
  const palette = isMobile ? 
    [
      "#4a90e2", "#2e7d32", "#8bc34a", "#ffd700", 
      "#ff9800", "#ffffff"
    ] :
    [
      "#2e7d32", "#4caf50", "#8bc34a", "#ffd700",
      "#4a90e2", "#1976d2", "#ff9800", "#ffffff"
    ];

  // Intersection Observer to pause animation when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationId) {
        animate();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(canvas);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    cw = Math.floor(rect.width);
    ch = Math.floor(rect.height);
    canvas.width = Math.floor(cw * DPR);
    canvas.height = Math.floor(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    cx = cw / 2;
    cy = ch / 2;
    radiusPx = Math.min(cw, ch) * (isMobile ? 0.35 : 0.4); // Slightly smaller
    buildDots();
  }

  // Reduced dot count for better performance
  function buildDots() {
    const N = isMobile ? 300 : 600; // Reduced from 600/1200
    dots = [];
    
    const inc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * inc;

      const vx = Math.cos(phi) * r;
      const vz = Math.sin(phi) * r;
      const vy = y;

      dots.push({
        v: { x: vx, y: vy, z: vz },
        phase: Math.random() * Math.PI * 2,
        amp: 0.03 + Math.random() * 0.05, // Reduced amplitude
        speed: 0.5 + Math.random() * 0.8, // Slower animation
        color: palette[Math.floor(Math.random() * palette.length)],
        size: isMobile ? 1.2 + Math.random() * 0.6 : 1.5 + Math.random() * 0.8,
        baseSize: isMobile ? 1.2 + Math.random() * 0.6 : 1.5 + Math.random() * 0.8
      });
    }
  }

  // Optimized rotation function
  function rotate(v, ax, ay) {
    const cosy = Math.cos(ay), siny = Math.sin(ay);
    const cosx = Math.cos(ax), sinx = Math.sin(ax);

    let x = v.x, y = v.y, z = v.z;

    // X rotation
    const y1 = y * cosx - z * sinx;
    const z1 = y * sinx + z * cosx;

    // Y rotation
    const x2 = x * cosy + z1 * siny;
    const z2 = -x * siny + z1 * cosy;

    return { x: x2, y: y1, z: z2 };
  }

  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, cw, ch);

    const perspective = isMobile ? 500 : 600; // Reduced for performance
    const points = [];

    // Calculate all points first
    for (const d of dots) {
      // Simplified bounce animation
      const bounce = 1 + d.amp * Math.sin(t * d.speed + d.phase);

      // Rotate the unit vector
      const r = rotate(d.v, rotX, rotY);
      
      // Scale to pixel radius with bounce
      const px = r.x * radiusPx * bounce;
      const py = r.y * radiusPx * bounce;
      const pz = r.z * radiusPx * bounce;

      // Perspective projection
      const scale = perspective / (perspective - pz);
      const sx = px * scale + cx;
      const sy = py * scale + cy;
      
      // Dynamic size and alpha based on depth
      const size = d.baseSize * scale;
      const alpha = Math.max(0.4, Math.min(1, 0.8 + (pz / radiusPx) * 0.2));

      points.push({ sx, sy, pz, size, color: d.color, alpha });
    }

    // Sort by depth for proper rendering
    points.sort((a, b) => a.pz - b.pz);

    // Render all points with simplified shadows
    ctx.shadowBlur = 2;
    for (const p of points) {
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  let lastTime = 0;
  const targetFPS = isMobile ? 30 : 45; // Reduced FPS for better performance
  const frameInterval = 1000 / targetFPS;

  function animate(currentTime = 0) {
    if (!isVisible) {
      animationId = null;
      return;
    }

    // Frame rate limiting
    if (currentTime - lastTime >= frameInterval) {
      // Smooth automatic rotation
      rotY += autoSpinY;
      rotX += autoSpinX;

      // Ease toward mouse target (desktop only)
      if (!isMobile) {
        rotY += (targetRotY - rotY) * 0.03; // Slower easing
        rotX += (targetRotX - rotX) * 0.03;
      }

      // Increment time for animations
      t += 0.012; // Slower time increment
      
      draw();
      lastTime = currentTime;
    }
    
    animationId = requestAnimationFrame(animate);
  }

  // Simplified mouse interaction (desktop only)
  if (!isMobile) {
    let mouseTimeout;
    
    const handleMouseMove = throttle((e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      
      targetRotY = rotY + nx * 0.2; // Reduced sensitivity
      targetRotX = rotX - ny * 0.1;
      
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        targetRotY = rotY;
        targetRotX = rotX;
      }, 3000); // Longer timeout
    }, 32); // Throttle mouse events

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
  }

  // Debounced resize handler
  const debouncedResize = debounce(resize, 250);
  window.addEventListener("resize", debouncedResize, { passive: true });
  
  // Initialize
  resize();
  animate();

  // Cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    observer.disconnect();
    window.removeEventListener("resize", debouncedResize);
  };
}

// Initialize globes with error handling
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      // Desktop globe
      if (document.getElementById("globe")) {
        initGlobe("globe", false);
      }
      
      // Mobile globe
      if (document.getElementById("mobile-globe")) {
        initGlobe("mobile-globe", true);
      }
    } else {
      // Hide globes for users who prefer reduced motion
      const globeElements = document.querySelectorAll('#globe, #mobile-globe, .mobile-globe-container');
      globeElements.forEach(el => el.style.display = 'none');
    }
  } catch (error) {
    console.warn('Globe animation failed to initialize:', error);
  }
});

/* ====== SMOOTH SCROLLING WITH PERFORMANCE ====== */
const smoothScrollTo = (target) => {
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      smoothScrollTo(target);
      
      // Close mobile menu if open
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });
});

/* ====== PERFORMANCE OPTIMIZATIONS ====== */

// Preload critical images with lazy loading fallback
const preloadImage = (src) => {
  if ('loading' in HTMLImageElement.prototype) {
    const img = new Image();
    img.src = src;
    img.loading = 'lazy';
  }
};

// Preload hero background only if not on mobile to save bandwidth
if (window.innerWidth > 768) {
  preloadImage("images/240_F_296865124_prQqJP0AOco65TgNFyaFHwVwTlOoKYg0.jpg");
}

// Optimize background attachment for mobile
if (window.innerWidth <= 768) {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.backgroundAttachment = 'scroll';
  }
}

// Add performance monitoring
let performanceEntries = [];
const observer = new PerformanceObserver((list) => {
  performanceEntries = performanceEntries.concat(list.getEntries());
});

if ('PerformanceObserver' in window) {
  observer.observe({ entryTypes: ['paint', 'navigation'] });
}
// Simple form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('formStatus');

  if(name && email && message) {
    // For now, just simulate submission
    status.textContent = "Thank you! Your message has been sent.";
    status.style.color = "green";
    
    // Clear form
    this.reset();
  } else {
    status.textContent = "Please fill out all fields.";
    status.style.color = "red";
  }
});

document.getElementById("contactForm").addEventListener("submit", async function(e) {
  e.preventDefault(); // stop normal form submission

  let form = e.target;
  let formData = new FormData(form);

  let status = document.getElementById("formStatus");
  status.textContent = "⏳ Sending...";

  try {
    let response = await fetch("send_mail.php", {
      method: "POST",
      body: formData
    });

    let result = await response.text();
    status.innerHTML = result; // show PHP response
    form.reset(); // clear form after success
  } catch (error) {
    status.innerHTML = "<span style='color:red;'>❌ Something went wrong. Try again later.</span>";
  }
});
