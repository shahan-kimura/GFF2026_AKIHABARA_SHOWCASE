/* ========================================
   GFF2026 AKIHABARA — Main Script v2
   ======================================== */

const GFFPortfolio = (() => {
  let config = {};
  let idleSeconds = 0;
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let fpsCount = 0;
  let currentFps = 60;
  let currentVideoIndex = 0;
  let idleBarInterval = null;

  // === TEAM DATA ===
  const TEAM_DATA = {
    team1: { num: '01', name: 'TEAM 01', title: 'BAT BREAK',        concept: '自身の思うがままに破壊する爽快感！たくさん壊して、倒して、壊しまくれ！', download: 'https://drive.google.com/file/d/12kb6BDzSdt-ALH6C7FY7qoW48kObJQDY/view?usp=drive_link' },
    team2: { num: '02', name: 'TEAM 02', title: 'Quick The Fury',   concept: 'おもちゃを題材に、ボスを撃破しパーツ（能力）を獲得しながら攻略順を自由に選べる、狂気を軸にした3Dサイコホラーアクション。', download: 'https://drive.google.com/file/d/1k4KkM9IdbIaDBMVGH0JNCWMpXT_4Z2ff/view?usp=drive_link' },
    team3: { num: '03', name: 'TEAM 03', title: 'CREEPY CHATEU',    concept: '緊張と恐怖が入り混じる探索と、危機を光で切り抜ける駆け引きが楽しめ、脱出を果たしたときの達成感を味わえる作品です。', download: 'https://drive.google.com/file/d/17poCjdEO2U-SES-C3TfpATcgAzRSRsi1/view?usp=drive_link' },
    team4: { num: '04', name: 'TEAM 04', title: 'TheLastBet',       concept: '堕ちたギャンブラーが、運命を司る地下闘技場で、力を使いながら次々と現れる敵を倒し、地上への帰還を目指す3Dアクションゲーム。', download: 'https://drive.google.com/file/d/1AaYAUoXFPRQTn-jv2I-HLA_k3vEzXV_j/view?usp=drive_link' },
    team5: { num: '05', name: 'TEAM 05', title: 'ヤギバイ',         concept: '笑えてドキドキする！八木とのドタバタ逃走劇×ひらりとかわし投函を決める爽快感', download: 'https://drive.google.com/file/d/19PkS9iK7Za579119bPeWwWJXDD9xs21W/view?usp=drive_link' },
    team6: { num: '06', name: 'TEAM 06', title: 'BULLET OR TREAT',  concept: '敵か自分か！打つか打たれるか！記憶が分ける、メモライズガンシューティング！', download: 'https://drive.google.com/file/d/1jwnN1SpS35X6HaSjqJiVKDKkP-rzwFoa/view?usp=drive_link' },
    team7: { num: '07', name: 'TEAM 07', title: '記憶の残響',       concept: '第一人称視点で、どこから敵が出てくるのかわからない緊張感と驚き。', download: 'https://drive.google.com/file/d/1bSfYhZP_9Z3YNoA3bL9iOmH6k-FKVbPJ/view?usp=drive_link' },
    team8: { num: '08', name: 'TEAM 08', title: 'NayoucoPrologue',  concept: 'キャラクターとフィールドの連動した謎解きに、美しいアートデザインを融合させ、プレイヤーを引き込む没入感のある体験を生み出す。', download: 'https://drive.google.com/file/d/1eLtsCKh1Iy7B96ZEZ8zYIh_XtbSJIZNw/view?usp=drive_link' },
  };

  const TEAM_ORDER = ['team1','team2','team3','team4','team5','team6','team7','team8'];

  // === INIT ===
  function init(options) {
    config = Object.assign({
      pageType: 'home',
      videos: [],
      currentTeam: null,
      idleTimeout: 30,
      videoSwitchTime: 9000
    }, options);
    config.teamOrder = TEAM_ORDER;

    setupVideoBackground();
    setupMouseReveal();
    setupFUI();
    setupIdleTimer();
    setupModals();
    setupCardHover();
    if (config.pageType === 'team') {
      injectTeamData();
      setupPrevNextNav();
      setupAutoSwitchBar();
    }
  }

  // === VIDEO ===
  function setupVideoBackground() {
    const bgVideo   = document.getElementById('bgVideo');
    const revealVid = document.getElementById('revealVideo');
    if (!bgVideo || config.videos.length === 0) return;

    if (config.pageType === 'home') {
      currentVideoIndex = Math.floor(Math.random() * config.videos.length);
      loadVideo(bgVideo,   config.videos[currentVideoIndex]);
      if (revealVid) loadVideo(revealVid, config.videos[currentVideoIndex]);
      setInterval(() => {
        currentVideoIndex = (currentVideoIndex + 1) % config.videos.length;
        crossfadeVideo(bgVideo, config.videos[currentVideoIndex]);
        if (revealVid) loadVideo(revealVid, config.videos[currentVideoIndex]);
      }, config.videoSwitchTime);
    } else {
      loadVideo(bgVideo, config.videos[0]);
      if (revealVid) loadVideo(revealVid, config.videos[0]);
    }
  }

  function loadVideo(el, src) {
    el.src = src; el.load();
    el.play().catch(() => {});
  }
  function crossfadeVideo(el, src) {
    el.style.opacity = '0';
    setTimeout(() => { loadVideo(el, src); el.style.opacity = '1'; }, 900);
  }

  // === MOUSE REVEAL ===
  function setupMouseReveal() {
    const layer = document.querySelector('.mouse-reveal-layer');
    if (!layer) return;
    document.addEventListener('mousemove', (e) => {
      layer.style.setProperty('--mx', e.clientX + 'px');
      layer.style.setProperty('--my', e.clientY + 'px');
    });
  }

  // === FUI ===
  function setupFUI() {
    const fuiOverlay = document.getElementById('fuiOverlay');
    if (!fuiOverlay) return;
    const coordEl = document.getElementById('fuiCoord');
    const fpsEl   = document.getElementById('fuiFps');
    const frameEl = document.getElementById('fuiFrame');
    const idleEl  = document.getElementById('fuiIdle');
    const timeEl  = document.getElementById('fuiTime');
    const statusEl= document.getElementById('fuiStatus');

    const statuses = ['ENERGIZED','SCANNING','ONLINE','ACTIVE','TRANSMIT'];
    let statusIdx = 0;
    setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      if (statusEl) statusEl.textContent = statuses[statusIdx];
    }, 3000);

    document.addEventListener('mousemove', (e) => {
      if (coordEl) coordEl.textContent = `X:${String(e.clientX).padStart(4,'0')} Y:${String(e.clientY).padStart(4,'0')}`;
    });

    function updateFUI() {
      frameCount++; fpsCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        currentFps = fpsCount; fpsCount = 0; lastFpsTime = now;
      }
      if (fpsEl)   fpsEl.textContent   = currentFps;
      if (frameEl) frameEl.textContent = String(frameCount).padStart(6, '0');
      if (timeEl)  timeEl.textContent  = new Date().toLocaleTimeString('ja-JP', { hour12: false });
      requestAnimationFrame(updateFUI);
    }
    requestAnimationFrame(updateFUI);
  }

  // === IDLE TIMER ===
  function setupIdleTimer() {
    function resetIdle() { idleSeconds = 0; }
    ['mousemove','click','keydown','touchstart'].forEach(evt =>
      document.addEventListener(evt, resetIdle, { passive: true }));
    setInterval(() => {
      idleSeconds++;
      const idleEl = document.getElementById('fuiIdle');
      if (idleEl) idleEl.textContent = String(idleSeconds).padStart(2,'0') + 's';
      if (idleSeconds >= config.idleTimeout) { resetIdle(); navigateToNext(); }
    }, 1000);
  }

  // === AUTO-SWITCH PROGRESS BAR ===
  function setupAutoSwitchBar() {
    const bar = document.querySelector('.auto-switch-bar');
    if (!bar) return;
    let elapsed = 0;
    idleBarInterval = setInterval(() => {
      elapsed++;
      bar.style.width = ((elapsed / config.idleTimeout) * 100) + '%';
      if (elapsed >= config.idleTimeout) elapsed = 0;
    }, 1000);
    // Reset on activity
    ['mousemove','click','keydown'].forEach(evt =>
      document.addEventListener(evt, () => { elapsed = 0; bar.style.width = '0'; }, { passive: true }));
  }

  // === NAVIGATION ===
  function navigateToNext() {
    let nextPage;
    if (config.pageType === 'home') {
      nextPage = config.teamOrder[0] + '.html';
    } else {
      const idx = config.teamOrder.indexOf(config.currentTeam);
      nextPage = (idx === -1 || idx === config.teamOrder.length - 1)
        ? 'index.html'
        : config.teamOrder[idx + 1] + '.html';
    }
    triggerGlitchTransition(nextPage);
  }

  function triggerGlitchTransition(url) {
    const overlay = document.getElementById('glitchOverlay');
    if (!overlay) { window.location.href = url; return; }
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 700);
  }

  // === MODALS ===
  function setupModals() {
    const proposalModal = document.getElementById('proposalModal');
    const videoModal    = document.getElementById('videoModal');
    const bgVideo       = document.getElementById('bgVideo');

    window.openModal = (type) => {
      if (type === 'proposal') {
        proposalModal?.classList.add('active');
      } else {
        videoModal?.classList.add('active');
        const v = videoModal?.querySelector('video');
        if (v) {
          v.currentTime = 0;
          v.play();
        }
        bgVideo?.pause();
      }
    };
    window.closeModal = () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      videoModal?.querySelector('video')?.pause();
      bgVideo?.play();
    };
    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) window.closeModal();
      });
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.closeModal();
    });
  }

  // === CARD HOVER (Home — play video preview) ===
  function setupCardHover() {
    if (config.pageType !== 'home') return;
    const cards = document.querySelectorAll('.team-card');
    cards.forEach(card => {
      const v = card.querySelector('video');
      if (!v) return;
      card.addEventListener('mouseenter', () => v.play());
      card.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
    });
  }

  // === INJECT TEAM DATA INTO DETAIL PAGES ===
  function injectTeamData() {
    if (!config.currentTeam) return;
    const data = TEAM_DATA[config.currentTeam];
    if (!data) return;
    const nameEl    = document.getElementById('teamName');
    const titleEl   = document.getElementById('workTitle');
    const conceptEl = document.getElementById('teamConcept');
    const dlBtn     = document.getElementById('downloadBtn');

    if (nameEl)    { nameEl.textContent    = ''; typeText(nameEl,    data.name,    55); }
    if (titleEl)   { titleEl.textContent   = ''; setTimeout(() => typeText(titleEl,   data.title,   75), 700); }
    if (conceptEl) { conceptEl.textContent = ''; setTimeout(() => typeText(conceptEl, data.concept,  22), 1500); }

    // DL button
    if (dlBtn && data.download) {
      dlBtn.href = data.download;
      dlBtn.style.display = '';
    }

    // Highlight active nav link
    const activeLink = document.querySelector(`.nav-team-link[href="${config.currentTeam}.html"]`);
    if (activeLink) activeLink.classList.add('active');

    // Update FUI bottom-left
    const fuiBL = document.querySelector('.fui-corner.bottom-left');
    if (fuiBL) fuiBL.innerHTML = `NODE: TEAM_${data.num}<br>TITLE: ${data.title.substring(0,14)}<br>STREAM: <span id="fuiStream">ACTIVE</span>`;
  }

  // === PREV / NEXT SETUP ===
  function setupPrevNextNav() {
    const prevBtn = document.getElementById('prevTeamBtn');
    const nextBtn = document.getElementById('nextTeamBtn');
    if (!prevBtn || !nextBtn || !config.currentTeam) return;
    const idx = TEAM_ORDER.indexOf(config.currentTeam);
    const prevTeam = idx > 0 ? TEAM_ORDER[idx - 1] : null;
    const nextTeam = idx < TEAM_ORDER.length - 1 ? TEAM_ORDER[idx + 1] : null;
    if (prevTeam) {
      const pd = TEAM_DATA[prevTeam];
      prevBtn.href = prevTeam + '.html';
      prevBtn.textContent = `← TEAM ${pd.num}`;
    } else { prevBtn.href = 'index.html'; prevBtn.textContent = '← HOME'; }
    if (nextTeam) {
      const nd = TEAM_DATA[nextTeam];
      nextBtn.href = nextTeam + '.html';
      nextBtn.textContent = `TEAM ${nd.num} →`;
    } else { nextBtn.href = 'index.html'; nextBtn.textContent = 'HOME →'; }
  }

  // === TYPE TEXT ===
  function typeText(el, text, speed = 40) {
    if (!el) return;
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { el.textContent += text[i]; i++; }
      else clearInterval(iv);
    }, speed);
  }

  return { init, typeText, triggerGlitchTransition };
})();
