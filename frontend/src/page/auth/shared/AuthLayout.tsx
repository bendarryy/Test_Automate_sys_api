// filepath: d:\1 learn\project s - Copy\Automated_Sys_tmp\frontend\src\page\auth\shared\AuthLayout.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  FaRocket, FaShieldAlt, FaBolt, FaGlobe, FaStar, FaUsers, FaAward, FaChartLine, FaUserCircle
} from "react-icons/fa";
import "./CosmicLogin.css"; // We'll create this CSS file next

interface Feature {
  icon: React.ReactNode;
  title: string;
  color: string;
}

const features: Feature[] = [
  { icon: <FaShieldAlt />, title: "Quantum Security", color: "cyan" },
  { icon: <FaBolt />, title: "Lightning Fast", color: "purple" },
  { icon: <FaGlobe />, title: "Global Network", color: "blue" },
  { icon: <FaStar />, title: "Premium Experience", color: "green" },
];

interface Stat {
  icon: React.ReactNode;
  label: string;
}

const stats: Stat[] = [
  { icon: <FaUsers />, label: "1M+ Active Users" },
  { icon: <FaAward />, label: "99.9% Uptime" },
  { icon: <FaChartLine />, label: "150+ Countries" },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  error?: boolean; // Optional: for conditional styling based on form error state
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animationId: number;

    const STAR_COUNT = 150;
    const COMET_COUNT = 3;

    interface Star { x: number; y: number; r: number; alpha: number; speed: number; twinkleSpeed: number; }
    const stars: Star[] = [];

    interface Comet { x: number; y: number; vx: number; vy: number; len: number; alpha: number; color: string; trail: Array<{x: number, y: number}>; }
    const comets: Comet[] = [];

    function initStars() {
      stars.length = 0; // Clear existing stars
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.5 + 0.5, // Varying sizes
          alpha: Math.random() * 0.8 + 0.2, // Varying brightness
          speed: Math.random() * 0.2 + 0.05, // Stars that slowly fall
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    function initComets() {
      comets.length = 0; // Clear existing comets
      for (let i = 0; i < COMET_COUNT; i++) {
        comets.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height * 0.3,
          vx: (Math.random() - 0.5) * 4 + 2, // Varied speeds and directions
          vy: Math.random() * 1 + 0.5,
          len: Math.random() * 100 + 50,
          alpha: Math.random() * 0.5 + 0.3,
          color: ["#06B6D4", "#8B5CF6", "#EC4899"][Math.floor(Math.random() * 3)],
          trail: []
        });
      }
    }
    
    initStars();
    initComets();

    // Particle system (subtle movements)
    const particles: Star[] = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 0.8 + 0.2,
        alpha: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.1 - 0.05, // Slower, can move up/down
        twinkleSpeed: 0,
    }));


    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Deep space gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas!.height);
      grad.addColorStop(0, "#0F172A"); // Dark slate
      grad.addColorStop(0.6, "#1E3A8A"); // Darker Blue
      grad.addColorStop(1, "#3B82F6"); // Blue
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      
      // Radial glow for depth
      if (canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = Math.max(canvas.width, canvas.height) * 0.7;
        const radialGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
        radialGrad.addColorStop(0, 'rgba(139, 92, 246, 0.1)'); // Purple glow center
        radialGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)'); // Blue glow mid
        radialGrad.addColorStop(1, 'rgba(15, 23, 42, 0)'); // Fade to background
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }


      // Draw stars
      stars.forEach(s => {
        s.y += s.speed;
        s.alpha += (Math.random() - 0.5) * s.twinkleSpeed;
        if (s.alpha < 0.1) s.alpha = 0.1;
        if (s.alpha > 1) s.alpha = 1;
        if (s.y > canvas!.height + s.r) { // Regenerate stars
          s.y = -s.r;
          s.x = Math.random() * canvas!.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.shadowColor = `rgba(255, 255, 255, ${s.alpha * 0.7})`;
        ctx.shadowBlur = s.r * 3;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow
      });

      // Draw particles
      particles.forEach(p => {
        p.x += (Math.random() - 0.5) * 0.3; // Subtle horizontal drift
        p.y += p.speed + (Math.random() - 0.5) * 0.2; // Subtle vertical drift
        if (p.y > canvas!.height + p.r) p.y = -p.r;
        if (p.y < -p.r) p.y = canvas!.height + p.r;
        if (p.x > canvas!.width + p.r) p.x = -p.r;
        if (p.x < -p.r) p.x = canvas!.width + p.r;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 255, ${p.alpha})`;
        ctx.fill();
      });


      // Draw comets
      comets.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        
        // Add current position to trail
        c.trail.push({ x: c.x, y: c.y });
        if (c.trail.length > c.len / 5) { // Keep trail length manageable
            c.trail.shift();
        }

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(c.trail[0].x, c.trail[0].y);
        for (let i = 1; i < c.trail.length; i++) {
            const segment = c.trail[i];
            const opacity = (i / c.trail.length) * c.alpha; // Fade out
            const cometGrad = ctx.createLinearGradient(segment.x, segment.y, c.trail[i-1].x, c.trail[i-1].y);
            cometGrad.addColorStop(0, `${c.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
            cometGrad.addColorStop(1, `${c.color}00`);

            ctx.strokeStyle = cometGrad;
            ctx.lineWidth = Math.max(1, (i / c.trail.length) * 2.5); // Tapering trail
            ctx.lineTo(segment.x, segment.y);
        }
        ctx.stroke();


        if (c.x < -c.len || c.x > canvas!.width + c.len || c.y > canvas!.height + c.len) {
          // Reset comet
          Object.assign(c, {
            x: Math.random() * canvas!.width,
            y: Math.random() * canvas!.height * 0.1, // Start near top
            vx: (Math.random() - 0.5) * 4 + (c.vx > 0 ? 2 : -2), // Keep general direction
            vy: Math.random() * 1 + 0.5,
            trail: []
          });
        }
      });

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return (
    <div className="cosmic-auth-root">
      <canvas ref={canvasRef} className="cosmic-canvas-bg" />
      <div className={`cosmic-auth-container ${isMobile ? "mobile-stack" : ""}`}>
        {/* Left Side - Promotional Section */}
        <section className="cosmic-promo-section">
          <div className="promo-content">
            <div className="promo-logo">
              <FaRocket className="rocket-icon" />
              <span>CosmicAuth</span>
            </div>
            <h1 className="promo-headline">Explore the Digital Universe</h1>
            <p className="promo-subtitle">
              Join millions of space travelers securing their digital journey with unparalleled speed and quantum-level trust.
            </p>
            <div className="promo-features-grid">
              {features.map((feature, index) => (
                <div key={index} className={`feature-card ${feature.color}-theme`}>
                  <span className="feature-icon">{feature.icon}</span>
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
              ))}
            </div>
            <div className="promo-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="testimonial">
              <FaUserCircle className="testimonial-avatar" />
              <blockquote>
                “CosmicAuth transformed our access management. It's secure, blazing fast, and the experience is out of this world!”
              </blockquote>
              <cite>Sarah Chen, Tech Lead, SpaceX</cite>
            </div>
          </div>
          <div className="animated-borders">
            <div className="circle-border cb1"></div>
            <div className="circle-border cb2"></div>
            <div className="circle-border cb3"></div>
          </div>
        </section>

        {/* Right Side - Login Form Area */}
        <section className="cosmic-form-section">
          <div className={`form-card-glassmorphism ${error ? "has-error" : ""}`}>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
