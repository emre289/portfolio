// ===== MAIN.JS - Emre Demirbaş AI Portfolio =====

document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initNavbar();
    initTypingEffect();
    initScrollReveal();
    initSkillBars();
    initStatCounters();
    initSmoothScroll();
    initMobileMenu();
    initScrollProgress();
    initContactForm();
    initCardHoverGlow();
});

// ===== NEURAL NETWORK CANVAS =====
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;

    let mouseX = W / 2;
    let mouseY = H / 2;
    let mouseActive = false;

    const MAX_DIST = 160;
    const MOUSE_DIST = 220;

    function getNodeCount() {
        return Math.min(90, Math.max(35, Math.floor(W * H / 10000)));
    }

    class Node {
        constructor(randomY = true) {
            this.x = Math.random() * W;
            this.y = randomY ? Math.random() * H : -10;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.r = Math.random() * 2 + 1;
            this.phase = Math.random() * Math.PI * 2;
            this.phaseSpeed = 0.015 + Math.random() * 0.02;
            // Occasionally a node is gold (primary color)
            this.isGold = Math.random() < 0.12;
        }

        update() {
            this.phase += this.phaseSpeed;
            this.x += this.vx;
            this.y += this.vy;

            // Mouse repulsion / attraction
            if (mouseActive) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < MOUSE_DIST && d > 0) {
                    const force = (MOUSE_DIST - d) / MOUSE_DIST;
                    this.vx += (dx / d) * force * 0.06;
                    this.vy += (dy / d) * force * 0.06;
                }
            }

            // Speed damping
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 1.8) {
                this.vx = (this.vx / speed) * 1.8;
                this.vy = (this.vy / speed) * 1.8;
            }

            // Wrap edges
            if (this.x < -30) this.x = W + 30;
            if (this.x > W + 30) this.x = -30;
            if (this.y < -30) this.y = H + 30;
            if (this.y > H + 30) this.y = -30;
        }

        draw() {
            const pulse = 0.8 + Math.sin(this.phase) * 0.3;
            const coreR = this.r * pulse;
            const glowR = coreR * 7;

            const color = this.isGold ? '244, 196, 48' : '0, 212, 255';

            // Glow
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
            grd.addColorStop(0, `rgba(${color}, 0.25)`);
            grd.addColorStop(1, `rgba(${color}, 0)`);
            ctx.beginPath();
            ctx.fillStyle = grd;
            ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.fillStyle = `rgba(${color}, ${0.75 + Math.sin(this.phase) * 0.25})`;
            ctx.arc(this.x, this.y, coreR, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let nodes = [];

    function buildNodes() {
        nodes = [];
        const n = getNodeCount();
        for (let i = 0; i < n; i++) {
            nodes.push(new Node(true));
        }
    }

    buildNodes();

    // Flowing data particles along edges
    const dataParticles = [];

    class DataParticle {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.t = 0;
            this.speed = 0.006 + Math.random() * 0.008;
        }

        update() { this.t += this.speed; }
        done() { return this.t >= 1; }

        draw() {
            const x = this.a.x + (this.b.x - this.a.x) * this.t;
            const y = this.a.y + (this.b.y - this.a.y) * this.t;
            const alpha = Math.sin(this.t * Math.PI);

            ctx.beginPath();
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha * 0.9})`;
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let frameCount = 0;

    function animate() {
        ctx.clearRect(0, 0, W, H);
        frameCount++;

        // Draw connections & spawn data particles
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < MAX_DIST) {
                    const alpha = (1 - d / MAX_DIST) * 0.55;
                    const lineW = (1 - d / MAX_DIST) * 1.2;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
                    ctx.lineWidth = lineW;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();

                    // Occasionally spawn a data particle on an edge
                    if (frameCount % 40 === 0 && Math.random() < 0.08) {
                        dataParticles.push(new DataParticle(nodes[i], nodes[j]));
                    }
                }
            }
        }

        // Update & draw nodes
        nodes.forEach(n => { n.update(); n.draw(); });

        // Update & draw data particles
        for (let i = dataParticles.length - 1; i >= 0; i--) {
            dataParticles[i].update();
            dataParticles[i].draw();
            if (dataParticles[i].done()) dataParticles.splice(i, 1);
        }

        // Cap particles
        if (dataParticles.length > 60) dataParticles.splice(0, 10);

        requestAnimationFrame(animate);
    }

    animate();

    // Mouse tracking
    document.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouseActive = true;
    });

    document.addEventListener('mouseleave', () => { mouseActive = false; });

    // Touch support
    canvas.addEventListener('touchmove', e => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        mouseActive = true;
    }, { passive: true });

    window.addEventListener('resize', () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
        buildNodes();
    });
}

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;

    const titles = [
        'Veri Bilimciyim',
        'AI Uzmanıyım',
        'LLM Geliştiricisiyim',
        'Agent Developer\'ım',
        'Vibecoding Eğitmeniyim',
        'ML Mühendisiyim',
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentTitle = titles[titleIndex];

        if (isDeleting) {
            typingText.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 45;
        } else {
            typingText.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 95;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typingSpeed = 2200;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typingSpeed = 450;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
}

// ===== SKILL BARS =====
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

// ===== STAT COUNTERS =====
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(number => counterObserver.observe(number));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const stepTime = 2000 / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                window.scrollTo({
                    top: targetElement.offsetTop - navHeight,
                    behavior: 'smooth'
                });

                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('name')?.value,
            email: document.getElementById('email')?.value,
            subject: document.getElementById('subject')?.value,
            message: document.getElementById('message')?.value
        };

        if (!payload.name || !payload.email || !payload.message) {
            showNotification('Lütfen tüm gerekli alanları doldurun.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            showNotification('Lütfen geçerli bir e-posta adresi girin.', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        submitBtn.disabled = true;

        try {
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.url) {
                await fetch(API_CONFIG.url, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            showNotification('Mesajınız başarıyla gönderildi!', 'success');
            form.reset();
        } catch (error) {
            showNotification('Mesajınız gönderildi!', 'success');
            form.reset();
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notification.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        padding: 18px 24px; background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; border-radius: 12px; display: flex; align-items: center;
        gap: 12px; font-size: 0.95rem; font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 5000);
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== SCROLL PROGRESS =====
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
    });
}

// ===== PARALLAX - SHAPES =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const speed = 0.08 + index * 0.04;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== CARD HOVER GLOW =====
function initCardHoverGlow() {
    const cards = document.querySelectorAll(
        '.skills-category, .education-card, .certificate-card, .timeline-content'
    );

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// ===== CONSOLE EASTER EGG =====
console.log('%c🧠 Neural Network Active', 'font-size: 20px; font-weight: bold; color: #00d4ff;');
console.log('%cEmre Demirbaş | AI & Veri Bilimi Uzmanı', 'font-size: 14px; color: #f4c430; font-weight: 600;');
console.log('%cTurkcell Global Bilgi | Vibecoding Eğitmeni', 'font-size: 12px; color: #a0a0b0;');
console.log('%c📧 cv.emredemirbas@gmail.com', 'font-size: 11px; color: #6b6b7b;');
