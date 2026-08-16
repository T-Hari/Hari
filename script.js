document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // FEATURE 1: Force 3D models to render at full resolution
    // ============================================================
    document.querySelectorAll("model-viewer").forEach(viewer => {
        viewer.minimumRenderScale = 1;
    });

    // ============================================================
    // FEATURE 2: SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = pct + "%";
        }, { passive: true });
    }

    // ============================================================
    // FEATURE 3: AMBIENT PARTICLE DUST (desktop only)
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

        const PARTICLE_COUNT = 55;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
            opacity: Math.random() * 0.4 + 0.1,
            drift: (Math.random() - 0.5) * 0.3,
        }));

        function getParticleColor() {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            return isDark ? "229,101,21" : "82,137,173";
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = getParticleColor();
            particles.forEach(p => {
                p.y -= p.speed;
                p.x += p.drift;
                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ============================================================
    // FEATURE 4: CINEMATIC SCROLL REVEAL
    // ============================================================
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.12 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
                const modelViewer = entry.target.querySelector("model-viewer");
                if (modelViewer) {
                    modelViewer.cameraOrbit = "auto auto auto";
                    modelViewer.cameraTarget = "auto auto auto";
                    modelViewer.fieldOfView = "auto";
                    if (typeof modelViewer.resetTurntableRotation === "function") {
                        modelViewer.resetTurntableRotation();
                    }
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal-up").forEach(el => revealObserver.observe(el));

    // ============================================================
    // FEATURE 5: MODEL RESET BUTTONS
    // ============================================================
    document.querySelectorAll(".model-reset-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const container = e.target.closest(".project-visual");
            const modelViewer = container.querySelector("model-viewer");
            if (modelViewer) {
                modelViewer.cameraOrbit = "auto auto auto";
                modelViewer.cameraTarget = "auto auto auto";
                modelViewer.fieldOfView = "auto";
                if (typeof modelViewer.resetTurntableRotation === "function") {
                    modelViewer.resetTurntableRotation();
                }
            }
        });
    });

    // ============================================================
    // FEATURE 6: SMOOTH SCROLL
    // ============================================================
    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // ============================================================
    // FEATURE 7: SCRAMBLE TEXT
    // ============================================================
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    document.querySelectorAll(".scramble-text").forEach(element => {
        let interval = null;
        const scramble = () => {
            let iteration = 0;
            clearInterval(interval);
            interval = setInterval(() => {
                element.innerText = element.innerText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return element.dataset.value[index];
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");
                if (iteration >= element.dataset.value.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        };
        scramble();
        element.addEventListener("mouseover", scramble);
    });

    // ============================================================
    // FEATURE 8: DARK MODE TOGGLE
    // ============================================================
    const themeToggleBtn = document.getElementById("theme-toggle");
    const toggleIcon = themeToggleBtn.querySelector("i");
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleIcon.classList.replace("fa-moon", "fa-sun");
    }
    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
            toggleIcon.classList.replace("fa-sun", "fa-moon");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            toggleIcon.classList.replace("fa-moon", "fa-sun");
        }
    });

    // ============================================================
    // FEATURE 9: CUSTOM TRAILING CURSOR (desktop only)
    // ============================================================
    const dot = document.querySelector(".cursor-dot");
    const outline = document.querySelector(".cursor-outline");
    if (dot && outline && window.matchMedia("(pointer: fine)").matches) {
        let outlineX = 0, outlineY = 0;
        let dotX = 0, dotY = 0;
        let rafId;

        document.addEventListener("mousemove", (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
            dot.style.left = dotX + "px";
            dot.style.top  = dotY + "px";
        });

        function animateOutline() {
            outlineX += (dotX - outlineX) * 0.12;
            outlineY += (dotY - outlineY) * 0.12;
            outline.style.left = outlineX + "px";
            outline.style.top  = outlineY + "px";
            rafId = requestAnimationFrame(animateOutline);
        }
        animateOutline();

        const hoverTargets = "a, button, .bento-card, .nav-socials a, .theme-toggle, model-viewer";
        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener("mouseenter", () => {
                dot.classList.add("hovering");
                outline.classList.add("hovering");
            });
            el.addEventListener("mouseleave", () => {
                dot.classList.remove("hovering");
                outline.classList.remove("hovering");
            });
        });
    }

    // ============================================================
    // FEATURE 10: MAGNETIC NAVBAR ICONS
    // ============================================================
    document.querySelectorAll(".nav-socials a").forEach(icon => {
        icon.addEventListener("mousemove", (e) => {
            const rect = icon.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * 0.35;
            const deltaY = (e.clientY - centerY) * 0.35;
            icon.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        icon.addEventListener("mouseleave", () => {
            icon.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
            icon.style.transform = "translate(0px, 0px)";
            setTimeout(() => { icon.style.transition = ""; }, 500);
        });
    });

    // ============================================================
    // FEATURE 11: CARD GLARE EFFECT
    // ============================================================
    document.querySelectorAll(".bento-card").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty("--x", x + "%");
            card.style.setProperty("--y", y + "%");
        });
    });

    // ============================================================
    // FEATURE 12: 3D MOUSE TRACKING FOR STATIC IMAGES (rover)
    // ============================================================
    document.querySelectorAll(".project-visual").forEach(box => {
        const img = box.querySelector(".project-img");
        if (img) {
            box.addEventListener("mousemove", (e) => {
                const rect = box.getBoundingClientRect();
                const rotateX = (((e.clientY - rect.top) / rect.height) - 0.5) * -20;
                const rotateY = (((e.clientX - rect.left) / rect.width) - 0.5) * 20;
                img.style.animation = "none";
                img.style.transition = "none";
                img.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            box.addEventListener("mouseleave", () => {
                img.style.transition = "transform 0.5s ease";
                img.style.transform = "scale(0.9) rotateX(-5deg) rotateY(0deg)";
                setTimeout(() => {
                    img.style.animation = "float3d 8s ease-in-out infinite";
                    img.style.transition = "none";
                }, 500);
            });
        }
    });
});
