import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DetailedWeatherConditionType } from '../../types/weather';

interface WeatherAnimationsProps {
  condition: DetailedWeatherConditionType;
  intensity?: 'light' | 'medium' | 'heavy';
  isNight?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'rain' | 'snow' | 'cloud' | 'star' | 'lightning' | 'leaf' | 'bubble';
}

const WeatherAnimations: React.FC<WeatherAnimationsProps> = ({
  condition,
  intensity = 'medium',
  isNight = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize audio context for sound effects
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play weather sound effect
  const playWeatherSound = (type: string) => {
    if (!audioContextRef.current) return;
    
    try {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      switch (type) {
        case 'rain':
          oscillator.type = 'sine';
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.1;
          break;
        case 'thunder':
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = 80;
          gainNode.gain.setValueAtTime(0.3, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
          break;
        case 'wind':
          oscillator.type = 'square';
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.05;
          break;
      }
      
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getParticleCount = () => {
      const baseCount = {
        rain: { light: 50, medium: 100, heavy: 200 },
        'rain-heavy': { light: 100, medium: 200, heavy: 400 },
        snow: { light: 30, medium: 60, heavy: 120 },
        'snow-heavy': { light: 60, medium: 120, heavy: 240 },
        cloudy: { light: 10, medium: 15, heavy: 25 },
        'partly-cloudy-day': { light: 5, medium: 10, heavy: 15 },
        'partly-cloudy-night': { light: 5, medium: 10, heavy: 15 },
        'clear-night': { light: 20, medium: 30, heavy: 50 },
        'clear-day': { light: 0, medium: 0, heavy: 0 },
        thunderstorm: { light: 150, medium: 300, heavy: 500 },
        fog: { light: 100, medium: 150, heavy: 250 },
        wind: { light: 20, medium: 40, heavy: 80 },
        extreme: { light: 200, medium: 400, heavy: 800 }
      };
      
      return baseCount[condition]?.[intensity] || 0;
    };

    const createParticle = (id: number): Particle => {
      const particleTypes = {
        'rain': 'rain',
        'rain-heavy': 'rain',
        'snow': 'snow',
        'snow-heavy': 'snow',
        'cloudy': 'cloud',
        'partly-cloudy-day': 'cloud',
        'partly-cloudy-night': 'cloud',
        'clear-night': 'star',
        'clear-day': 'star',
        'thunderstorm': 'rain',
        'fog': 'cloud',
        'wind': 'leaf',
        'extreme': 'bubble'
      };

      const type = particleTypes[condition] as Particle['type'] || 'rain';
      
      let particle: Particle = {
        id,
        x: Math.random() * dimensions.width,
        y: -10,
        vx: 0,
        vy: 0,
        size: 1,
        opacity: 0.8,
        life: 0,
        maxLife: 1000,
        color: '#ffffff',
        type
      };

      switch (type) {
        case 'rain':
          particle.vx = Math.random() * 2 - 1;
          particle.vy = 5 + Math.random() * 10;
          particle.size = 1 + Math.random() * 2;
          particle.color = isNight ? '#87CEEB' : '#4A90E2';
          particle.opacity = 0.6 + Math.random() * 0.4;
          break;

        case 'snow':
          particle.vx = Math.random() * 4 - 2;
          particle.vy = 1 + Math.random() * 3;
          particle.size = 2 + Math.random() * 4;
          particle.color = '#ffffff';
          particle.opacity = 0.7 + Math.random() * 0.3;
          particle.maxLife = 2000 + Math.random() * 1000;
          break;

        case 'cloud':
          particle.x = Math.random() * (dimensions.width + 200) - 100;
          particle.y = Math.random() * dimensions.height * 0.6;
          particle.vx = 0.5 + Math.random() * 1.5;
          particle.vy = Math.random() * 0.5 - 0.25;
          particle.size = 20 + Math.random() * 40;
          particle.color = isNight ? '#334155' : '#94a3b8';
          particle.opacity = 0.3 + Math.random() * 0.4;
          particle.maxLife = 5000 + Math.random() * 5000;
          break;

        case 'star':
          particle.x = Math.random() * dimensions.width;
          particle.y = Math.random() * dimensions.height * 0.7;
          particle.vx = 0;
          particle.vy = 0;
          particle.size = 1 + Math.random() * 2;
          particle.color = '#fbbf24';
          particle.opacity = 0.5 + Math.random() * 0.5;
          particle.maxLife = 3000 + Math.random() * 2000;
          break;
          
        case 'leaf':
          particle.x = Math.random() * dimensions.width;
          particle.y = -10;
          particle.vx = Math.random() * 2 - 1;
          particle.vy = 1 + Math.random() * 2;
          particle.size = 3 + Math.random() * 5;
          particle.color = ['#8B4513', '#228B22', '#32CD32', '#90EE90'][Math.floor(Math.random() * 4)];
          particle.opacity = 0.6 + Math.random() * 0.4;
          particle.maxLife = 3000 + Math.random() * 2000;
          break;
          
        case 'bubble':
          particle.x = Math.random() * dimensions.width;
          particle.y = dimensions.height + 10;
          particle.vx = Math.random() * 2 - 1;
          particle.vy = -1 - Math.random() * 3;
          particle.size = 5 + Math.random() * 15;
          particle.color = `rgba(100, 150, 255, ${0.3 + Math.random() * 0.4})`;
          particle.opacity = 0.4 + Math.random() * 0.4;
          particle.maxLife = 2000 + Math.random() * 1000;
          break;
      }

      return particle;
    };

    const updateParticle = (particle: Particle) => {
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Add some physics effects
      switch (particle.type) {
        case 'rain':
          // Rain accelerates due to gravity
          particle.vy += 0.1;
          // Wind effect
          if (condition === 'thunderstorm' || condition === 'extreme') {
            particle.vx += (Math.random() - 0.5) * 0.5;
          }
          break;

        case 'snow':
          // Snow floats more
          particle.vx += (Math.random() - 0.5) * 0.2;
          particle.vy += Math.sin(particle.life * 0.01) * 0.1;
          break;

        case 'cloud':
          // Clouds drift slowly
          particle.opacity = Math.sin(particle.life * 0.001) * 0.2 + 0.5;
          break;

        case 'star':
          // Stars twinkle
          particle.opacity = Math.sin(particle.life * 0.01) * 0.3 + 0.7;
          particle.size = 1 + Math.sin(particle.life * 0.02) * 0.5;
          break;
          
        case 'leaf':
          // Leaves swirl
          particle.vx += Math.sin(particle.life * 0.02) * 0.1;
          particle.vy += Math.cos(particle.life * 0.015) * 0.05;
          break;
          
        case 'bubble':
          // Bubbles float up and wobble
          particle.vx += Math.sin(particle.life * 0.03) * 0.2;
          particle.vy -= 0.02;
          particle.opacity = Math.sin(particle.life * 0.01) * 0.2 + 0.6;
          break;
      }

      // Remove particles that are out of bounds or expired
      if (particle.y > dimensions.height + 10 || 
          particle.x > dimensions.width + 100 || 
          particle.x < -100 || 
          particle.life > particle.maxLife) {
        return false;
      }

      return true;
    };

    const renderParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;

      switch (particle.type) {
        case 'rain':
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy);
          ctx.stroke();
          break;

        case 'snow':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add snowflake details
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 0.5;
          const arms = 6;
          for (let i = 0; i < arms; i++) {
            const angle = (i / arms) * Math.PI * 2;
            const length = particle.size * 0.8;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(
              particle.x + Math.cos(angle) * length,
              particle.y + Math.sin(angle) * length
            );
            ctx.stroke();
          }
          break;

        case 'cloud':
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'star':
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 4;
          
          // Draw star shape
          const spikes = 5;
          const outerRadius = particle.size;
          const innerRadius = particle.size * 0.5;
          
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = particle.x + Math.cos(angle) * radius;
            const y = particle.y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'leaf':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          // Simple leaf shape
          ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 1.5, particle.life * 0.01, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'bubble':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update particles
      particlesRef.current = particlesRef.current.filter(updateParticle);

      // Add new particles
      const targetCount = getParticleCount();
      while (particlesRef.current.length < targetCount) {
        particlesRef.current.push(createParticle(Date.now() + Math.random()));
      }

      // Special effects
      if (condition === 'thunderstorm' && Math.random() < 0.001) {
        // Lightning flash
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.restore();
        
        // Play thunder sound
        playWeatherSound('thunder');
      }

      if (condition === 'fog') {
        // Fog overlay
        const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
        gradient.addColorStop(0, `rgba(200, 200, 200, ${isNight ? 0.2 : 0.3})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${isNight ? 0.4 : 0.5})`);
        gradient.addColorStop(1, `rgba(200, 200, 200, ${isNight ? 0.1 : 0.2})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      }

      // Render particles
      particlesRef.current.forEach(particle => renderParticle(ctx, particle));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [condition, intensity, isNight, dimensions]);

  // Don't render for clear day conditions
  if (condition === 'clear-day') {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          mixBlendMode: condition === 'clear-night' ? 'screen' : 'normal'
        }}
      />
      
      {/* Additional CSS-based effects */}
      {condition === 'thunderstorm' && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            transition: { 
              duration: 0.2, 
              repeat: Infinity, 
              repeatDelay: Math.random() * 5 + 2 
            }
          }}
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      
      {(condition === 'wind' || condition === 'extreme') && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(225deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(315deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Ambient light effects for night conditions */}
      {isNight && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0, -20, 0],
              y: [0, -10, 0, 10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -15, 0, 15, 0],
              y: [0, 20, 0, -20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WeatherAnimations;