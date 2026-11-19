document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu & Navbar Logic ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });

    // --- Starfield Canvas ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            stars = [];
            const starCount = Math.floor((width * height) / 8000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.2,
                    alpha: Math.random(),
                    speed: Math.random() * 0.02 + 0.005
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(star => {
                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0.1) star.speed *= -1;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(250, 250, 240, ${star.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        draw();
    }

    // --- Spacey Floating Hero Title Animation ---
    const titleEl = document.getElementById('hero-title');
    if (titleEl) {
        const lines = titleEl.querySelectorAll('.line');
        const allLetters = [];

        lines.forEach(line => {
            const text = line.textContent.trim();
            line.textContent = '';
            text.split('').forEach(char => {
                const span = document.createElement('span');
                if (char === ' ') {
                    span.className = 'space';
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }
                line.appendChild(span);
            });
        });

        titleEl.querySelectorAll('.line span:not(.space)').forEach(l => allLetters.push(l));

        if (typeof gsap !== 'undefined') {
            allLetters.forEach((letter) => {
                const randomX = gsap.utils.random(-500, 500);
                const randomY = gsap.utils.random(-400, 400);
                const randomZ = gsap.utils.random(-1500, -400);
                const randomRot = gsap.utils.random(-90, 90);
                const randomScale = gsap.utils.random(0.1, 0.5);
                const randomBlur = gsap.utils.random(10, 20);

                gsap.set(letter, {
                    x: randomX,
                    y: randomY,
                    z: randomZ,
                    rotation: randomRot,
                    scale: randomScale,
                    opacity: 0,
                    filter: `blur(${randomBlur}px)`
                });
            });

            const tl = gsap.timeline({ paused: true });
            tl.to("#hero-content", { opacity: 1, duration: 0.5 });

            allLetters.forEach((letter) => {
                tl.to(letter, {
                    x: 0,
                    y: 0,
                    z: 0,
                    rotation: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: gsap.utils.random(2.5, 4.5),
                    ease: "sine.out",
                }, gsap.utils.random(0.2, 3.5));
            });

            tl.to(".hero-subtitle", {
                opacity: 1, y: 0, duration: 1.5, ease: "power3.out"
            }, "+=0.5");

            window.heroTimeline = tl;
        } else {
            allLetters.forEach(l => { l.style.opacity = '1'; });
            const hc = document.getElementById('hero-content');
            if (hc) hc.style.opacity = '1';
            const sub = document.querySelector('.hero-subtitle');
            if (sub) { sub.style.opacity = '1'; sub.style.transform = 'translateY(0)'; }
        }
    } else {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({ paused: true });
            tl.to("#hero-content", { opacity: 1, duration: 0.5 })
              .to(".hero-title", { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
              .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.6");
            window.heroTimeline = tl;
        }
    }

    // --- API Logic ---
    const API_KEY = 'IvoBsA8jHnnZnZOGmrGrNgOAWRMdamfwjuJQPPqs';
    const ULTIMATE_FALLBACK = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop';
    
    const loadingEl = document.getElementById('hero-loading');
    const errorEl = document.getElementById('hero-error');
    const emptyEl = document.getElementById('hero-empty');
    const imageOverlay = document.getElementById('hero-image');

    async function fetchWithTimeout(url, timeoutMs = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    window.fetchNasaData = async function() {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        if (imageOverlay) {
            imageOverlay.style.backgroundImage = `url('${ULTIMATE_FALLBACK}')`;
            imageOverlay.style.opacity = '0.6';
        }
        if (window.heroTimeline) window.heroTimeline.play();

        try {
            const data = await fetchWithTimeout(
                `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
                15000
            );
            if (data.url && !data.url.includes('nasa-logo') && imageOverlay) {
                console.log("Real NASA image found — swapping in.");
                imageOverlay.style.opacity = '0';
                setTimeout(() => {
                    imageOverlay.style.backgroundImage = `url('${data.url}')`;
                    imageOverlay.style.opacity = '0.6';
                }, 600);
            }
        } catch (err) {
            console.log("NASA API unavailable — fallback remains.");
        }
    };

    if (imageOverlay) {
        fetchNasaData();
    }

    // --- Known Page: API Cards & ScrollTrigger ---
    if (document.getElementById('cards-grid')) {
        
        window.fetchArchiveCards = async function() {
            const loading = document.getElementById('cards-loading');
            const error = document.getElementById('cards-error');
            const grid = document.getElementById('cards-grid');
            
            loading.style.display = 'block';
            error.style.display = 'none';
            grid.style.display = 'none';

            try {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 3);
                
                const formatDate = (date) => date.toISOString().split('T')[0];
                
                const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`);
                if (!response.ok) throw new Error('API Error');
                
                const data = await response.json();
                const validCards = data.filter(item => item.media_type === 'image' && !item.url.includes('nasa-logo'));

                if (validCards.length === 0) throw new Error('No valid images');

                grid.innerHTML = '';
                validCards.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card reveal-card';
                    card.innerHTML = `
                        <img src="${item.url}" alt="${item.title}" class="card-image">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-date">${item.date}</p>
                        <p class="card-explanation">${item.explanation}</p>
                    `;
                    grid.appendChild(card);
                });

                loading.style.display = 'none';
                grid.style.display = 'grid';

                gsap.from('.reveal-card', {
                    scrollTrigger: {
                        trigger: '.cards-grid',
                        start: 'top 80%',
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out"
                });

            } catch (err) {
                console.error(err);
                loading.style.display = 'none';
                error.style.display = 'block';
            }
        };

        fetchArchiveCards();
    }

    // --- Reveal on scroll (robust) ---
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        reveals.forEach((el) => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.fromTo(el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 95%',
                            toggleActions: 'play none none none',
                            once: true
                        }
                    }
                );
            } else {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }

    // --- Unknown Page: Constellation SVG Animation + Empty State ---
    if (document.querySelector('.constellation-svg') && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const constellationSvg = document.querySelector('.constellation-svg');
        const lines = constellationSvg.querySelectorAll('.constellation-line');
        const stars = constellationSvg.querySelectorAll('.constellation-star');

        gsap.to(lines, {
            scrollTrigger: {
                trigger: constellationSvg,
                start: 'top 70%',
                toggleActions: 'play none none none'
            },
            strokeDashoffset: 0,
            duration: 2.5,
            ease: 'power2.inOut',
            stagger: 0.4
        });

        gsap.to(stars, {
            scrollTrigger: {
                trigger: constellationSvg,
                start: 'top 70%',
                toggleActions: 'play none none none'
            },
            opacity: 1,
            scale: 1.2,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.3,
            delay: 0.3
        });

        gsap.to(stars, {
            opacity: 0.6,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.4,
            delay: 3
        });
    }

    // --- Search signals (Empty state demonstration) ---
    window.searchSignals = function() {
        const btn = document.getElementById('search-signals-btn');
        if (!btn) return;
        const originalText = btn.textContent;
        btn.textContent = 'Searching...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            const box = btn.closest('.empty-state-box');
            if (box) {
                gsap.fromTo(box,
                    { borderColor: 'rgba(255, 216, 77, 0.5)' },
                    { borderColor: 'rgba(200, 200, 210, 0.2)', duration: 1.5, ease: 'power2.out' }
                );
            }
        }, 1500);
    };

    // --- Falling Star Mouse Trail ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        let lastTrailTime = 0;

        window.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTrailTime < 30) return;
            lastTrailTime = now;

            const star = document.createElement('div');
            star.className = 'star-trail';
            document.body.appendChild(star);

            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;

            gsap.set(star, {
                x: e.clientX + offsetX,
                y: e.clientY + offsetY,
                scale: gsap.utils.random(0.6, 1.4),
                opacity: 1
            });

            gsap.to(star, {
                y: e.clientY + 60 + gsap.utils.random(-20, 20),
                x: e.clientX + gsap.utils.random(-40, 40),
                opacity: 0,
                scale: 0.2,
                duration: gsap.utils.random(0.8, 1.4),
                ease: "power2.out",
                onComplete: () => star.remove()
            });
        });
    }
});