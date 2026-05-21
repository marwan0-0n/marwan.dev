const typedText = document.getElementById('typed-text');
const phrases = ['Generative AI Specialist', 'Machine Learning Engineer'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const currentPhrase = phrases[phraseIndex];
  if (!isDeleting) {
    typedText.textContent = currentPhrase.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2000);
      return;
    }
  } else {
    typedText.textContent = currentPhrase.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, isDeleting ? 40 : 80);
}

window.addEventListener('DOMContentLoaded', () => {
  typeLoop();
  initCanvas();
  initScrollReveal();
  
  setTimeout(() => {
    initSkillsPhysics();
  }, 300);
});

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const header = entry.target.querySelector('.section-header');
        if (header) header.classList.add('revealed');
        
        const cards = entry.target.querySelectorAll('.streamlit-card, .notebook-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, index * 150);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}

// محرك الفيزيقيا المطور بنظام AABB لمنع تداخل الأيقونات تماماً على الموبايل والكمبيوتر
function initSkillsPhysics() {
  const container = document.querySelector('.skills-shell');
  if (!container) return;
  
  const blocks = Array.from(container.querySelectorAll('.skill-block'));
  if (blocks.length === 0) return;
  
  let containerW = container.clientWidth;
  let containerH = container.clientHeight;
  
  const isMobile = containerW < 768;
  const blockW = isMobile ? 80 : 110;  
  const blockH = isMobile ? 110 : 140; 
  const margin = isMobile ? 12 : 25;
  const speedModifier = isMobile ? 0.3 : 0.55; 
  
  const nodes = [];

  blocks.forEach((block) => {
    let x, y, isOverlapping;
    let safetyCounter = 0;
    
    do {
      x = Math.random() * (containerW - blockW - margin * 2) + margin;
      y = Math.random() * (containerH - blockH - margin * 2) + margin;
      
      // فحص أولي للمربعات المحيطة لمنع التكدس الأولي العشوائي
      isOverlapping = nodes.some(n => {
        return Math.abs(n.x - x) < (blockW + 10) && Math.abs(n.y - y) < (blockH + 10);
      });
      safetyCounter++;
    } while (isOverlapping && safetyCounter < 300);
    
    block.style.position = 'absolute';
    block.style.left = `${x}px`;
    block.style.top = `${y}px`;
    block.style.opacity = "1";
    
    nodes.push({
      el: block,
      x, y,
      w: blockW,
      h: blockH,
      vx: (Math.random() - 0.5) * speedModifier, 
      vy: (Math.random() - 0.5) * speedModifier,
      scale: 1
    });
  });

  function updatePhysics() {
    containerW = container.clientWidth;
    containerH = container.clientHeight;
    
    for (let i = 0; i < nodes.length; i++) {
      let n = nodes[i];
      
      n.x += n.vx;
      n.y += n.vy;
      
      // الارتداد المطاطي الذكي من جدران الـ Container
      if (n.x < margin) { n.x = margin; n.vx *= -1; }
      if (n.x > containerW - n.w - margin) { n.x = containerW - n.w - margin; n.vx *= -1; }
      if (n.y < margin) { n.y = margin; n.vy *= -1; }
      if (n.y > containerH - n.h - margin) { n.y = containerH - n.h - margin; n.vy *= -1; }
      
      // نظام تصادم رادع ومستقر يعتمد على كتل صناديق الـ AABB المستطيلة
      for (let j = i + 1; j < nodes.length; j++) {
        let n2 = nodes[j];
        
        // حساب مراكز الأيقونات الحالية
        let cx1 = n.x + n.w / 2;
        let cy1 = n.y + n.h / 2;
        let cx2 = n2.x + n2.w / 2;
        let cy2 = n2.y + n2.h / 2;
        
        let dx = cx2 - cx1;
        let dy = cy2 - cy1;
        
        // مسافة الأمان الفاصلة بين الأيقونات
        let gap = isMobile ? 8 : 15;
        let targetDistX = n.w + gap;
        let targetDistY = n.h + gap;
        
        let overlapX = targetDistX - Math.abs(dx);
        let overlapY = targetDistY - Math.abs(dy);
        
        // إذا حدث تداخل على المحورين السيني والصادي، يتم حل الاصطدام فوراً بالدفع المرتد
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            // دفع أفقي على محور X
            let pushX = overlapX * 0.5;
            if (dx > 0) { n.x -= pushX; n2.x += pushX; } else { n.x += pushX; n2.x -= pushX; }
            let temp = n.vx; n.vx = n2.vx; n2.vx = temp; // تبادل السرعات للارتداد
          } else {
            // دفع رأسي على محور Y (حل مشكلة الركوب فوق بعض)
            let pushY = overlapY * 0.5;
            if (dy > 0) { n.y -= pushY; n2.y += pushY; } else { n.y += pushY; n2.y -= pushY; }
            let temp = n.vy; n.vy = n2.vy; n2.vy = temp;
          }
        }
      }
      
      // تطبيق الإحداثيات الجديدة مع الحفاظ على حركات الـ Scale والتفاعل
      n.el.style.left = `${n.x}px`;
      n.el.style.top = `${n.y}px`;
      n.el.style.transform = `scale(${n.scale})`;
    }
    requestAnimationFrame(updatePhysics);
  }
  
  updatePhysics();
  
  blocks.forEach((block, idx) => {
    const node = nodes[idx];
    block.addEventListener('mouseenter', () => { node.scale = 1.12; block.style.zIndex = 30; });
    block.addEventListener('mouseleave', () => { node.scale = 1; block.style.zIndex = 2; });
  });
}

function initCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const particles = [];
  const mouse = { x: width / 2, y: height / 2, active: false };

  const isSmallScreen = width < 768;
  const config = {
    density: isSmallScreen ? Math.min(50, Math.floor(width / 6)) : Math.min(160, Math.floor(width / 8)),
    linkDistance: isSmallScreen ? 150 : 280, 
    mouseRadius: isSmallScreen ? 160 : 350,   
    particleSpeed: isSmallScreen ? 0.45 : 0.85
  };

  class Particle {
    constructor() { this.spawn(); }
    spawn() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * config.particleSpeed;
      this.vy = (Math.random() - 0.5) * config.particleSpeed;
      this.baseRadius = Math.random() * 1.5 + 1;
      this.radius = this.baseRadius;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.active) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.hypot(dx, dy);
        if (dist < config.mouseRadius) {
          let force = (config.mouseRadius - dist) / config.mouseRadius;
          this.x += (dx / dist) * force * (isSmallScreen ? 0.7 : 1.5);
          this.y += (dy / dist) * force * (isSmallScreen ? 0.7 : 1.5);
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
      ctx.fill();
    }
  }

  for (let i = 0; i < config.density; i++) particles.push(new Particle());

  function renderLoop() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let p1 = particles[i];
        let p2 = particles[j];
        let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        
        if (dist < config.linkDistance) {
          let alpha = (1 - dist / config.linkDistance) * 0.15;
          ctx.strokeStyle = `rgba(155, 81, 224, ${alpha})`; 
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(renderLoop);
  }

  renderLoop();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchend', () => { mouse.active = false; });
}