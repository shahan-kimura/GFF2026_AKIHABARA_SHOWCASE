/* ========================================
   GFF AI Portfolio Showcase — Main Script
   ======================================== */

const GFFPortfolio = (() => {
  // --- State ---
  let config = {};
  let idleTimer = null;
  let idleSeconds = 0;
  let idleInterval = null;
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let fpsCount = 0;
  let currentFps = 60;
  let currentVideoIndex = 0;
  let videoSwitchInterval = null;

  // --- Init ---
  function init(options) {
    config = Object.assign({
      pageType: 'home',
      videos: [],
      teamOrder: ['team1', 'team2', 'team4', 'team5', 'team6'],
      currentTeam: null,
      idleTimeout: 30,
      videoSwitchTime: 8000
    }, options);

    setupVideoBackground();
    setupMouseReveal();
    setupFUI();
    setupIdleTimer();
    setupGalleryLightbox();
    setupParallax();
  }

  // --- Video Background ---
  function setupVideoBackground() {
    const bgVideo = document.getElementById('bgVideo');
    const revealVideo = document.getElementById('revealVideo');
    if (!bgVideo || config.videos.length === 0) return;

    if (config.pageType === 'home') {
      // Randomly pick an initial video
      currentVideoIndex = Math.floor(Math.random() * config.videos.length);
      loadVideo(bgVideo, config.videos[currentVideoIndex]);
      if (revealVideo) loadVideo(revealVideo, config.videos[currentVideoIndex]);

      // Switch video every N seconds on home page
      videoSwitchInterval = setInterval(() => {
        currentVideoIndex = (currentVideoIndex + 1) % config.videos.length;
        crossfadeVideo(bgVideo, config.videos[currentVideoIndex]);
        if (revealVideo) loadVideo(revealVideo, config.videos[currentVideoIndex]);
      }, config.videoSwitchTime);
    } else {
      // Team page: single video
      loadVideo(bgVideo, config.videos[0]);
      if (revealVideo) loadVideo(revealVideo, config.videos[0]);
    }
  }

  function loadVideo(videoEl, src) {
    videoEl.src = src;
    videoEl.load();
    videoEl.play().catch(() => { });
  }

  function crossfadeVideo(videoEl, src) {
    videoEl.classList.add('hidden');
    setTimeout(() => {
      videoEl.src = src;
      videoEl.load();
      videoEl.play().catch(() => { });
      videoEl.classList.remove('hidden');
    }, 1000);
  }

  // --- Mouse Reveal Effect ---
  function setupMouseReveal() {
    const revealLayer = document.querySelector('.mouse-reveal-layer');
    if (!revealLayer) return;

    document.addEventListener('mousemove', (e) => {
      revealLayer.style.setProperty('--mx', e.clientX + 'px');
      revealLayer.style.setProperty('--my', e.clientY + 'px');
    });
  }

  // --- FUI (Cyberpunk Corner Info) ---
  function setupFUI() {
    const fuiOverlay = document.getElementById('fuiOverlay');
    if (!fuiOverlay) return;

    const coordEl = document.getElementById('fuiCoord');
    const fpsEl = document.getElementById('fuiFps');
    const frameEl = document.getElementById('fuiFrame');
    const idleEl = document.getElementById('fuiIdle');
    const timeEl = document.getElementById('fuiTime');
    const statusEl = document.getElementById('fuiStatus');
    const streamEl = document.getElementById('fuiStream');

    // Update coordinates on mouse move
    document.addEventListener('mousemove', (e) => {
      if (coordEl) {
        coordEl.textContent = `X:${String(e.clientX).padStart(4, '0')} Y:${String(e.clientY).padStart(4, '0')}`;
      }
    });

    // FPS counter + frame counter
    function updateFUI() {
      frameCount++;
      fpsCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        currentFps = fpsCount;
        fpsCount = 0;
        lastFpsTime = now;
      }

      if (fpsEl) fpsEl.textContent = currentFps;
      if (frameEl) frameEl.textContent = String(frameCount).padStart(6, '0');
      if (timeEl) {
        const d = new Date();
        timeEl.textContent = d.toLocaleTimeString('ja-JP', { hour12: false });
      }

      // Cycle status text
      if (statusEl && frameCount % 180 === 0) {
        const statuses = ['SCANNING', 'ANALYZING', 'RENDERING', 'STREAMING', 'PROCESSING', 'ENCODING'];
        statusEl.textContent = statuses[Math.floor(Math.random() * statuses.length)];
      }

      if (streamEl && frameCount % 120 === 0) {
        streamEl.textContent = Math.random() > 0.2 ? 'ACTIVE' : 'BUFFERING';
      }

      requestAnimationFrame(updateFUI);
    }
    requestAnimationFrame(updateFUI);
  }

  // --- 30-Second Idle Auto-Switch ---
  function setupIdleTimer() {
    if (config.teamOrder.length === 0) return;

    const autoSwitchBar = document.getElementById('autoSwitchBar');

    function resetIdle() {
      idleSeconds = 0;
      if (autoSwitchBar) autoSwitchBar.style.width = '0%';
    }

    // Listen for user activity
    ['mousemove', 'click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, resetIdle, { passive: true });
    });

    // Count idle seconds
    idleInterval = setInterval(() => {
      idleSeconds++;
      const idleEl = document.getElementById('fuiIdle');
      if (idleEl) idleEl.textContent = String(idleSeconds).padStart(2, '0') + 's';

      // Update progress bar
      if (autoSwitchBar) {
        const pct = (idleSeconds / config.idleTimeout) * 100;
        autoSwitchBar.style.width = Math.min(pct, 100) + '%';
      }

      // Auto-switch at threshold
      if (idleSeconds >= config.idleTimeout) {
        resetIdle();
        navigateToNext();
      }
    }, 1000);
  }

  function navigateToNext() {
    let nextPage;
    if (config.pageType === 'home') {
      nextPage = config.teamOrder[0] + '.html';
    } else {
      const idx = config.teamOrder.indexOf(config.currentTeam);
      if (idx === -1 || idx === config.teamOrder.length - 1) {
        nextPage = 'index.html';
      } else {
        nextPage = config.teamOrder[idx + 1] + '.html';
      }
    }
    triggerGlitchTransition(nextPage);
  }

  // --- Glitch Transition ---
  function triggerGlitchTransition(targetUrl) {
    const overlay = document.getElementById('glitchOverlay');
    if (!overlay) {
      window.location.href = targetUrl;
      return;
    }

    overlay.classList.add('active');

    // Navigate after animation
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 700);
  }

  // --- Typing Text Animation ---
  function typeText(el, text, speed = 50) {
    if (!el) return;
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
      } else {
        clearInterval(interval);
        // Remove cursor after a delay
        setTimeout(() => {
          if (cursor.parentNode) cursor.remove();
        }, 2000);
      }
    }, speed);
  }

  // --- Gallery Lightbox ---
  function setupGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('img');

    // Attach to gallery items and workflow images
    const handleImageClick = (img) => {
      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
      }
    };

    // Use event delegation for gallery items since they are dynamically created
    document.body.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        handleImageClick(item.querySelector('img'));
      }
    });

    const workflowImgs = document.querySelectorAll('.workflow-image');
    workflowImgs.forEach(img => {
      img.addEventListener('click', () => {
        handleImageClick(img);
      });
    });

    // Close on click anywhere inside lightbox (including the image self to zoom out)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.tagName === 'IMG' || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        lightbox.classList.remove('active');
      }
    });
  }

  // --- Scroll Parallax ---
  function setupParallax() {
    const items = document.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    // Assign different speeds
    items.forEach((item, i) => {
      item.dataset.parallaxSpeed = (i % 3 === 0) ? '0.08' : (i % 3 === 1) ? '0.04' : '0.12';
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Dynamically fetch items since they may have been added after init
          const currentItems = document.querySelectorAll('.gallery-item');
          currentItems.forEach(item => {
            const speed = parseFloat(item.dataset.parallaxSpeed) || 0.08;
            const rect = item.getBoundingClientRect();
            const offset = (rect.top + scrollY - window.innerHeight * 0.5) * speed;
            item.style.transform = `translateY(${-offset}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Fade-in on scroll via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observe dynamically added items via MutationObserver
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList.contains('gallery-item')) {
            // Apply speed and initial styles
            const i = document.querySelectorAll('.gallery-item').length;
            node.dataset.parallaxSpeed = (i % 3 === 0) ? '0.08' : (i % 3 === 1) ? '0.04' : '0.12';
            node.style.opacity = '0';
            node.style.transform = 'translateY(30px)';
            node.style.transition = 'opacity 0.6s ease, transform 0.8s ease';
            observer.observe(node);
          }
        });
      });
    });

    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
      mutationObserver.observe(galleryGrid, { childList: true });
    }

    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.8s ease';
      observer.observe(item);
    });
  }

  // --- Public API ---
  return {
    init,
    typeText,
    triggerGlitchTransition
  };
})();
