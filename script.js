document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) {
        window.addEventListener("scroll", () => {
            const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = Math.min(pct, 100) + "%";
        }, { passive: true });
    }

    // ============================================================
    // HERO HUD / RADAR CANVAS
    // ============================================================
    const heroCanvas = document.getElementById("hero-canvas");
    if (heroCanvas) {
        const hCtx = heroCanvas.getContext("2d");
        let hW, hH, heroAngle = 0;

        function resizeHeroCanvas() {
            hW = heroCanvas.width  = heroCanvas.offsetWidth;
            hH = heroCanvas.height = heroCanvas.offsetHeight;
        }
        resizeHeroCanvas();
        window.addEventListener("resize", resizeHeroCanvas);

        const isDark = () => true;

        function drawHUD() {
            hCtx.clearRect(0, 0, hW, hH);
            const accent = isDark() ? "249,115,22" : "229,101,21";
            const gridColor = isDark() ? "249,115,22" : "37,99,235";

            // Radar center — anchored to lower-right, bleeds well off screen
            const cx = hW * 0.92;
            const cy = hH * 0.65;
            const maxR = Math.sqrt(hW * hW + hH * hH); // diagonal = guaranteed full coverage


            for (let y = 0; y < hH; y += 70) {
                hCtx.strokeStyle = `rgba(${gridColor}, 0.05)`;
                hCtx.beginPath(); hCtx.moveTo(0, y); hCtx.lineTo(hW, y); hCtx.stroke();
            }

            // Concentric rings — large, they bleed off screen naturally
            [100, 210, 340, 490, 660].forEach((r, i) => {
                hCtx.beginPath();
                hCtx.arc(cx, cy, r, 0, Math.PI * 2);
                hCtx.strokeStyle = `rgba(${accent}, ${0.18 - i * 0.03})`;
                hCtx.lineWidth = 1;
                hCtx.stroke();
            });

            // Tick marks on inner ring
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
                hCtx.beginPath();
                hCtx.moveTo(cx + Math.cos(a) * 92,  cy + Math.sin(a) * 92);
                hCtx.lineTo(cx + Math.cos(a) * 108, cy + Math.sin(a) * 108);
                hCtx.strokeStyle = `rgba(${accent}, 0.15)`;
                hCtx.lineWidth = 1;
                hCtx.stroke();
            }

            // Sweep — ONLY a thin leading line + faint angular gradient (no solid fill)
            heroAngle += 0.005;

            // Faint trailing fan using multiple thin arc lines at decreasing opacity
            for (let i = 0; i < 30; i++) {
                const a = heroAngle - (i * 0.025);
                const op = (1 - i / 30) * 0.07;
                hCtx.beginPath();
                hCtx.moveTo(cx, cy);
                hCtx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
                hCtx.strokeStyle = `rgba(${accent}, ${op})`;
                hCtx.lineWidth = 2;
                hCtx.stroke();
            }

            // Bright leading edge line
            hCtx.beginPath();
            hCtx.moveTo(cx, cy);
            hCtx.lineTo(cx + Math.cos(heroAngle) * maxR, cy + Math.sin(heroAngle) * maxR);
            hCtx.strokeStyle = `rgba(${accent}, 0.7)`;
            hCtx.lineWidth = 1.5;
            hCtx.stroke();

            // Blip dots that fade after sweep passes
            const dots = [
                { a: 0.5, r: 180 }, { a: 1.7, r: 330 },
                { a: 2.9, r: 140 }, { a: 4.2, r: 420 },
                { a: 5.4, r: 255 }, { a: 3.4, r: 300 },
            ];
            dots.forEach(d => {
                const dx = cx + Math.cos(d.a) * d.r;
                const dy = cy + Math.sin(d.a) * d.r;
                let diff = (heroAngle - d.a) % (Math.PI * 2);
                if (diff < 0) diff += Math.PI * 2;
                const fade = Math.max(0, 1 - diff / (Math.PI * 2));
                if (fade < 0.02) return;
                const grd = hCtx.createRadialGradient(dx, dy, 0, dx, dy, 9);
                grd.addColorStop(0, `rgba(${accent}, ${fade * 0.7})`);
                grd.addColorStop(1, `rgba(${accent}, 0)`);
                hCtx.beginPath(); hCtx.arc(dx, dy, 9, 0, Math.PI * 2);
                hCtx.fillStyle = grd; hCtx.fill();
                hCtx.beginPath(); hCtx.arc(dx, dy, 2, 0, Math.PI * 2);
                hCtx.fillStyle = `rgba(${accent}, ${fade})`; hCtx.fill();
            });

            requestAnimationFrame(drawHUD);
        }
        drawHUD();
    }

    // ============================================================
    // TYPEWRITER SUBTITLE
    // ============================================================
    const typeEl = document.querySelector(".typewriter-text");
    if (typeEl) {
        const phrases = [
            "4x Patent in UAV Industry.",
            "Autonomous System Lead.",
            "Mechanical System Lead.",
        ];
        let pIdx = 0, cIdx = 0, deleting = false;

        function typeStep() {
            const current = phrases[pIdx];
            if (!deleting) {
                typeEl.textContent = current.slice(0, ++cIdx);
                if (cIdx === current.length) {
                    deleting = true;
                    setTimeout(typeStep, 1800);
                    return;
                }
                setTimeout(typeStep, 65);
            } else {
                typeEl.textContent = current.slice(0, --cIdx);
                if (cIdx === 0) {
                    deleting = false;
                    pIdx = (pIdx + 1) % phrases.length;
                    setTimeout(typeStep, 400);
                    return;
                }
                setTimeout(typeStep, 35);
            }
        }
        setTimeout(typeStep, 800);
    }

    // ============================================================
    // STATS COUNTER ANIMATION
    // ============================================================
    const counters = document.querySelectorAll(".stat-number[data-target]");
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || "";
            const prefix = el.dataset.prefix || "";
            let start = 0;
            const duration = 1600;
            const startTime = performance.now();

            function countUp(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.innerHTML = `${prefix}${current}<span class="accent-char">${suffix}</span>`;
                if (progress < 1) requestAnimationFrame(countUp);
            }
            requestAnimationFrame(countUp);
            countObserver.unobserve(el);
        });
    }, { threshold: 0.4 });

    counters.forEach(c => countObserver.observe(c));

    // ============================================================
    // AMBIENT PARTICLE CANVAS
    // ============================================================
    const canvas = document.getElementById("particle-canvas");
    if (canvas && window.innerWidth > 768) {
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.35 + 0.08,
            opacity: Math.random() * 0.3 + 0.08,
            drift: (Math.random() - 0.5) * 0.25,
        }));
        const isDarkMode = () => true;
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const col = isDarkMode() ? "249,115,22" : "37,99,235";
            particles.forEach(p => {
                p.y -= p.speed; p.x += p.drift;
                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${col}, ${p.opacity})`; ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ============================================================
    // CINEMATIC SCROLL REVEAL
    // ============================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
                const mv = entry.target.querySelector("model-viewer");
                if (mv) {
                    mv.cameraOrbit = "auto auto auto";
                    if (typeof mv.resetTurntableRotation === "function") mv.resetTurntableRotation();
                }
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal-up").forEach(el => revealObserver.observe(el));

    // ============================================================
    // MODEL RESET BUTTONS
    // ============================================================
    document.querySelectorAll(".model-reset-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const mv = e.target.closest(".project-panel-visual, .project-visual")?.querySelector("model-viewer");
            if (mv) {
                mv.cameraOrbit = "auto auto auto";
                if (typeof mv.resetTurntableRotation === "function") mv.resetTurntableRotation();
            }
        });
    });

    // ============================================================
    // SMOOTH SCROLL
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute("href"));
            if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
        });
    });

    // ============================================================
    // SCRAMBLE TEXT
    // ============================================================
    const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerLetters = "abcdefghijklmnopqrstuvwxyz";
    document.querySelectorAll(".scramble-text").forEach(el => {
        let iv = null;
        const scramble = () => {
            let it = 0; clearInterval(iv);
            iv = setInterval(() => {
                el.innerText = el.dataset.value.split("").map((targetChar, i) => {
                    if (i < it) return targetChar;
                    // If punctuation or space, show it immediately
                    if (!/[a-zA-Z]/.test(targetChar)) return targetChar;
                    // Match case of the target character
                    const pool = targetChar === targetChar.toUpperCase() ? upperLetters : lowerLetters;
                    return pool[Math.floor(Math.random() * 26)];
                }).join("");
                if (it >= el.dataset.value.length) clearInterval(iv);
                it += 1 / 3;
            }, 30);
        };
        scramble();
        el.addEventListener("mouseover", scramble);
    });

        // ============================================================
    // CUSTOM TRAILING CURSOR
    // ============================================================
    const dot = document.querySelector(".cursor-dot");
    const outline = document.querySelector(".cursor-outline");
    if (dot && outline && window.matchMedia("(pointer: fine)").matches) {
        let ox = 0, oy = 0, dx = 0, dy = 0;
        document.addEventListener("mousemove", e => {
            dx = e.clientX; dy = e.clientY;
            dot.style.left = dx + "px"; dot.style.top = dy + "px";
        });
        (function animOutline() {
            ox += (dx - ox) * 0.1; oy += (dy - oy) * 0.1;
            outline.style.left = ox + "px"; outline.style.top = oy + "px";
            requestAnimationFrame(animOutline);
        })();
        document.querySelectorAll("a, button, .bento-card, model-viewer").forEach(el => {
            el.addEventListener("mouseenter", () => { dot.classList.add("hovering"); outline.classList.add("hovering"); });
            el.addEventListener("mouseleave", () => { dot.classList.remove("hovering"); outline.classList.remove("hovering"); });
        });
    }

    // ============================================================
    // MAGNETIC NAVBAR ICONS
    // ============================================================
    document.querySelectorAll(".nav-socials a").forEach(icon => {
        icon.addEventListener("mousemove", e => {
            const r = icon.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.32;
            const y = (e.clientY - r.top  - r.height / 2) * 0.32;
            icon.style.transform = `translate(${x}px, ${y}px)`;
        });
        icon.addEventListener("mouseleave", () => {
            icon.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
            icon.style.transform = "translate(0,0)";
            setTimeout(() => { icon.style.transition = ""; }, 500);
        });
    });

    // ============================================================
    // CARD GLARE
    // ============================================================
    document.querySelectorAll(".bento-card").forEach(card => {
        card.addEventListener("mousemove", e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100) + "%");
            card.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100) + "%");
        });
    });

    // ============================================================
    // 3D MOUSE TRACKING FOR STATIC IMAGES
    // ============================================================
    document.querySelectorAll(".project-panel-visual").forEach(box => {
        const img = box.querySelector(".project-img");
        if (img) {
            box.addEventListener("mousemove", e => {
                const r = box.getBoundingClientRect();
                const rx = ((e.clientY - r.top) / r.height - 0.5) * -18;
                const ry = ((e.clientX - r.left) / r.width - 0.5) * 18;
                img.style.animation = "none";
                img.style.transform = `scale(1.04) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
            box.addEventListener("mouseleave", () => {
                img.style.transition = "transform 0.5s ease";
                img.style.transform = "scale(0.88) rotateX(0deg) rotateY(0deg)";
                setTimeout(() => { img.style.animation = "float3d 8s ease-in-out infinite"; img.style.transition = ""; }, 500);
            });
        }
    });

    // ============================================================
    // MODEL VIEWER RESOLUTION
    // ============================================================
    document.querySelectorAll("model-viewer").forEach(v => { v.minimumRenderScale = 1; });
});







