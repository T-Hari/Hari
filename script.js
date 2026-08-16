document.addEventListener('DOMContentLoaded', () => {
    
    // Force all 3D models to render at 100% resolution even while spinning
    document.querySelectorAll('model-viewer').forEach(viewer => {
        viewer.minimumRenderScale = 1;
    });
    
    // Apple-style smooth scroll reveal using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Remove class when scrolling past to allow re-animation
                entry.target.classList.remove('active');
                
                // If this element contains a model-viewer, reset its rotation
                const modelViewer = entry.target.querySelector('model-viewer');
                if (modelViewer) {
                    modelViewer.cameraOrbit = 'auto auto auto';
                    modelViewer.cameraTarget = 'auto auto auto';
                    modelViewer.fieldOfView = 'auto';
                    if (typeof modelViewer.resetTurntableRotation === 'function') {
                        modelViewer.resetTurntableRotation();
                    }
                }
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => revealObserver.observe(el));

    // Manual reset buttons for 3D models
    document.querySelectorAll('.model-reset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.project-visual');
            const modelViewer = container.querySelector('model-viewer');
            if (modelViewer) {
                modelViewer.cameraOrbit = 'auto auto auto';
                modelViewer.cameraTarget = 'auto auto auto';
                modelViewer.fieldOfView = 'auto';
                if (typeof modelViewer.resetTurntableRotation === 'function') {
                    modelViewer.resetTurntableRotation();
                }
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed navbar height (approx 80px)
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scramble Text Effect
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    document.querySelectorAll('.scramble-text').forEach(element => {
        let interval = null;
        
        const scramble = () => {
            let iteration = 0;
            clearInterval(interval);
            
            interval = setInterval(() => {
                element.innerText = element.innerText
                    .split("")
                    .map((letter, index) => {
                        if(index < iteration) {
                            return element.dataset.value[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");
                
                if(iteration >= element.dataset.value.length){ 
                    clearInterval(interval);
                }
                
                iteration += 1 / 3; // Adjust speed (smaller = slower)
            }, 30);
        };

        // Trigger immediately on load so it scrambles while fading in
        scramble();

        // Optional: Re-trigger on hover for a fun interaction
        element.addEventListener('mouseover', scramble);
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const toggleIcon = themeToggleBtn.querySelector('i');
    
    // Check local storage for saved theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            toggleIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggleIcon.classList.replace('fa-moon', 'fa-sun');
        }
    });
});
