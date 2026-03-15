/**
 * HeartStor ChMS - Vanilla JS functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load version from hs_version.txt
    const versionSpan = document.getElementById('current-version');
    if (versionSpan) {
        const loadVersion = () => {
            // Check if we're using file:// protocol
            const isFileProtocol = window.location.protocol === 'file:';
            
            if (isFileProtocol) {
                // Use synchronous XMLHttpRequest for file:// protocol
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', 'hs_version.txt', false); // synchronous
                    xhr.send(null);
                    if (xhr.status === 0 || xhr.status === 200) {
                        versionSpan.textContent = xhr.responseText.trim();
                    } else {
                        throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
                    }
                } catch (error) {
                    console.error('Error loading version (file://):', error);
                    versionSpan.textContent = 'Unknown';
                }
            } else {
                // Use fetch for http/https protocols
                fetch('hs_version.txt')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(version => {
                        versionSpan.textContent = version.trim();
                    })
                    .catch(error => {
                        // Fallback to XMLHttpRequest
                        console.warn('Fetch failed, trying XMLHttpRequest:', error);
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', 'hs_version.txt', true);
                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 0 || xhr.status === 200) {
                                    versionSpan.textContent = xhr.responseText.trim();
                                } else {
                                    console.error('Error loading version:', xhr.status, xhr.statusText);
                                    versionSpan.textContent = 'Unknown';
                                }
                            }
                        };
                        xhr.onerror = function() {
                            console.error('XMLHttpRequest error loading version');
                            versionSpan.textContent = 'Unknown';
                        };
                        xhr.send();
                    });
            }
        };
        
        loadVersion();
    }

    // 2. Load checksums for advanced users (install page)
    const checksum64El = document.getElementById('checksum-64');
    const checksum32El = document.getElementById('checksum-32');
    const checksumErrorEl = document.getElementById('checksum-error');

    if (checksum64El && checksum32El) {
        const loadChecksums = () => {
            const isFileProtocol = window.location.protocol === 'file:';

            const applyChecksums = (text) => {
                const lines = text.split(/\r?\n/);
                let found64 = false;
                let found32 = false;

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#')) return;

                    const [key, value] = trimmed.split('=');
                    if (!key || !value) return;

                    const k = key.trim().toLowerCase();
                    const v = value.trim();

                    if (k === '64-bit') {
                        checksum64El.textContent = v;
                        found64 = true;
                    } else if (k === '32-bit') {
                        checksum32El.textContent = v;
                        found32 = true;
                    }
                });

                if ((!found64 || !found32) && checksumErrorEl) {
                    checksumErrorEl.style.display = 'block';
                }
            };

            if (isFileProtocol) {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', 'hs_checksums.txt', false);
                    xhr.send(null);
                    if (xhr.status === 0 || xhr.status === 200) {
                        applyChecksums(xhr.responseText);
                    } else {
                        throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
                    }
                } catch (error) {
                    console.error('Error loading checksums (file://):', error);
                    if (checksumErrorEl) checksumErrorEl.style.display = 'block';
                }
            } else {
                fetch('hs_checksums.txt')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(applyChecksums)
                    .catch(error => {
                        console.error('Error loading checksums:', error);
                        if (checksumErrorEl) checksumErrorEl.style.display = 'block';
                    });
            }
        };

        loadChecksums();
    }

    // 3. Dynamic Year for Copyright Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 4. Mobile Navigation Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileBtn.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 5. Sticky Navbar highlighting and style changes on scroll
    const navbar = document.getElementById('navbar');
    
    function handleScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // 6. Smooth Scrolling for anchor links (fallback/enchancement for css scroll-behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Scroll Reveal Animation for Sections
    const revealElements = document.querySelectorAll('.reveal');
    
    function reveal() {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // Trigger points before element is in viewport

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    // Initial check
    reveal();
    
    // Add scroll listener with basic throttle to improve performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                reveal();
                scrollTimeout = null;
            }, 50); // 50ms throttle
        }
    });

    // 8. Hero image slideshow
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 1) {
        let currentHeroSlide = 0;

        // Ensure only the first slide is initially visible
        heroSlides.forEach((slide, index) => {
            slide.classList.toggle('active', index === 0);
        });

        const showNextHeroSlide = () => {
            heroSlides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            heroSlides[currentHeroSlide].classList.add('active');
        };

        // Auto-advance slides
        setInterval(showNextHeroSlide, 3000); // change slide every 3 seconds

        // Advance slide on click/tap
        const heroSlideshowEl = document.querySelector('.hero-slideshow');
        if (heroSlideshowEl) {
            heroSlideshowEl.addEventListener('click', showNextHeroSlide);
        }
    }
});

// Fancy cursor-following heart animation
window.addEventListener('DOMContentLoaded', () => {
    const heart = document.querySelector('.cursor-heart');
    if (!heart) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isAnimating = false;

    function animate() {
        if (!isAnimating) return;

        const lerpFactor = 0.14;
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;

        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const baseScale = 0.7;
        const maxExtraScale = 0.4;
        const scale = baseScale + Math.min(distance / 400, maxExtraScale);

        const wobbleX = Math.sin(Date.now() / 400) * 6;
        const wobbleY = Math.cos(Date.now() / 500) * 4;

        heart.style.opacity = '1';
        heart.style.transform = `translate3d(${currentX + wobbleX}px, ${currentY + wobbleY}px, 0) rotate(45deg) scale(${scale})`;

        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
    });
});