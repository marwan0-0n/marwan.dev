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

// محرك الـ Scroll Reveal المتتابع الفاخر
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // إظهار رأس السكشن أولاً
        const header = entry.target.querySelector('.section-header');
        if (header) header.classList.add('revealed');
        
        // إظهار الكروت الداخلية بشكل متتابع زمني (Staggered Effect)
        const cards = entry.target.querySelectorAll('.streamlit-card, .notebook-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, index * 150);
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 }); // تقليل الـ threshold ليعمل بسلاسة أكبر على شاشات الموبايل الطويلة

  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}

// فيزيقيا الأيقونات العائمة المتجاوبة هندسياً (Responsive Elastic Float)
function initSkillsPhysics() {
  const container = document.querySelector('.skills-shell');
  if (!container) return;
  
  const blocks = Array.from(container.querySelectorAll('.skill-block'));
  if (blocks.length === 0) return;
  
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  
  // --- تعديل ذكي: حساب الأبعاد هندسياً بناءً على نوع الجهاز ---
  const isMobile = containerW < 768;
  const blockW = isMobile ? 80 : 110;  // مطابقة عرض العنصر مع الأبعاد الجديدة في الـ CSS
  const blockH = isMobile ? 110 : 140; // مطابقة الارتفاع الكلي شامل الـ label
  const margin = isMobile ? 15 : 30;
  const speedModifier = isMobile ? 0.35 : 0.6; // إبطاء الحركة على الموبايل لتبدو مريحة ولا تسبب تشتت
  
  const nodes = [];

  blocks.forEach((block) => {
    let x, y, isOverlapping;
    let safetyCounter = 0;
    
    do {
      x = Math.random() * (containerW - blockW - margin * 2) + margin;
      y = Math.random() * (containerH - blockH - margin * 2) + margin;
      // ضبط مسافة الأمان الأولية لمنع التكدس عند التحميل
      isOverlapping = nodes.some(n => Math.hypot(n.x - x, n.y - y) < blockW + (isMobile ? 8 : 15));
      safetyCounter++;
    } while (isOverlapping && safetyCounter < 300);
    
    block.style.position = 'absolute';
    block.style.left = `${x}px`;
    block.style.top = `${y}px`;
    block.style.opacity = "1";
    
    nodes.push({
      el: block,
      x, y,
      vx: (Math.random() - 0.5) * speedModifier, 
      vy: (Math.random() - 0.5) * speedModifier,
      radius: blockW / 2
    });
  });

  function updatePhysics() {
    for (let i = 0; i < nodes.length; i++) {
      let n = nodes[i];
      
      n.x += n.vx;
      n.y += n.vy;
      
      // الارتداد المطاطي من الجدران بدقة
      if (n.x < margin) { n.x = margin; n.vx *= -1; }
      if (n.x > containerW - blockW - margin) { n.x = containerW - blockW - margin; n.vx *= -1; }
      if (n.y < margin) { n.y = margin; n.vy *= -1; }
      if (n.y > containerH - blockH - margin) { n.y = containerH - blockH - margin; n.vy *= -1; }
      
      // حسابات منع التداخل والاصطدام التبادلي (Anti-Collision)
      for (let j = i + 1; j < nodes.length; j++) {
        let n2 = nodes[j];
        let dx = n2.x - n.x;
        let dy = n2.y - n.y;
        let dist = Math.hypot(dx, dy);
        let minDist = blockW + (isMobile ? 4 : 10); // تخصيص مسافة نصف قطر التصادم حسب حجم الأيقونة الحالي
        
        if (dist < minDist) {
          let overlap = minDist - dist;
          let angle = Math.atan2(dy, dx);
          
          // فصل العناصر فوراً برفق لمنع الالتصاق والارتعاش
          n.x -= Math.cos(angle) * overlap * 0.5;
          n.y -= Math.sin(angle) * overlap * 0.5;
          n2.x += Math.cos(angle) * overlap * 0.5;
          n2.y += Math.sin(angle) * overlap * 0.5;
          
          // تبادل طاقات متجه السرعة
          let tempVx = n.vx; n.vx = n2.vx; n2.vx = tempVx;
          let tempVy = n.vy; n.vy = n2.vy; n2.vy = tempVy;
        }
      }
      
      n.el.style.left = `${n.x}px`;
      n.el.style.top = `${n.y}px`;
    }
    requestAnimationFrame(updatePhysics);
  }
  
  updatePhysics();
}

// محرك شبكة الجسيمات العملاقة عالية الكثافة (Neural Network Canvas)
function initCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const particles = [];
  const mouse = { x: width / 2, y: height / 2, active: false };

  // جعل كثافة الشبكة والمسافات متغيرة تلقائياً حسب حجم الشاشة لضمان عدم إبطاء الهواتف
  const isSmallScreen = width < 768;
  const config = {
    density: isSmallScreen ? Math.min(60, Math.floor(width / 6)) : Math.min(160, Math.floor(width / 8)),
    linkDistance: isSmallScreen ? 160 : 280, 
    mouseRadius: isSmallScreen ? 180 : 350,   
    particleSpeed: isSmallScreen ? 0.5 : 0.85
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
          this.x += (dx / dist) * force * (isSmallScreen ? 0.8 : 1.5);
          this.y += (dy / dist) * force * (isSmallScreen ? 0.8 : 1.5);
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

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(renderLoop);
  }

  renderLoop();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  // دعم أحداث اللمس على الموبايل (Touch Events) لتتفاعل الشبكة مع يد المستخدم
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchend', () => { mouse.active = false; });
}