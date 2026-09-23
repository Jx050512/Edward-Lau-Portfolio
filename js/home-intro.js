/* Edward Lau Portfolio — Home keynote intro, UX-polished */
(() => {
  'use strict';

  const INTRO_SEEN_KEY = 'edwardIntroSeen';
  const MUSIC_PREF_KEY = 'edwardMusicPreference';

  const getSession = key => {
    try { return sessionStorage.getItem(key); } catch (_) { return null; }
  };
  const setSession = (key, value) => {
    try { sessionStorage.setItem(key, value); } catch (_) {}
  };

  const intro = document.getElementById('keynoteIntro');
  if (!intro) return;

  const recruiterFast = getSession('edwardRecruiterMode') === '1';
  const alreadySeen = getSession(INTRO_SEEN_KEY) === '1';

  if (recruiterFast || alreadySeen) {
    intro.remove();
    document.documentElement.classList.toggle('recruiter-mode', recruiterFast);
    document.documentElement.classList.remove('keynote-active', 'intro-seen');
    document.body.style.overflow = '';
    return;
  }

  const skip = document.getElementById('keynoteSkip');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let started = false;
  let timer = null;

  document.documentElement.classList.add('keynote-active');
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // Shared soundtrack. Playback never starts on initial page load.
  let audio = document.getElementById('portfolioAudio');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'portfolioAudio';
    audio.src = 'assets/3-Strikes-Terror-Jr.mp3';
    audio.loop = true;
    audio.preload = 'metadata';
    audio.autoplay = false;
    audio.muted = false;
    audio.volume = 0.18;
    audio.setAttribute('playsinline', '');
    document.body.appendChild(audio);
  }

  const gate = document.createElement('div');
  gate.className = 'keynote-audio-gate';
  gate.setAttribute('role', 'group');
  gate.setAttribute('aria-label', 'Choose how to enter the portfolio');
  gate.innerHTML = `
    <span class="keynote-gate-label">Choose how to enter</span>
    <div class="keynote-gate-actions">
      <button class="keynote-choice keynote-choice-primary" type="button" data-intro-sound>♪ Enter with sound</button>
      <button class="keynote-choice" type="button" data-intro-silent>Enter without sound</button>
    </div>
    <small>Tip: tapping the background also starts with sound.</small>
  `;
  intro.appendChild(gate);
  intro.classList.add('keynote-needs-tap');

  const markSeen = () => setSession(INTRO_SEEN_KEY, '1');

  const finish = () => {
    if (finished) return;
    finished = true;
    markSeen();
    if (timer) window.clearTimeout(timer);

    intro.classList.add('is-leaving');
    document.documentElement.classList.remove('keynote-active');
    document.body.style.overflow = previousOverflow;

    window.setTimeout(() => intro.remove(), reducedMotion ? 30 : 840);
  };

  const beginAnimation = () => {
    if (started) return;
    started = true;
    markSeen();
    intro.classList.remove('keynote-waiting', 'keynote-needs-tap');
    intro.classList.add('keynote-started');
    gate.remove();

    if (reducedMotion) {
      window.setTimeout(finish, 80);
    } else {
      timer = window.setTimeout(finish, 3950);
    }
  };

  const startWithSound = async () => {
    if (started) return;
    try {
      await audio.play();
      setSession(MUSIC_PREF_KEY, 'on');
    } catch (_) {
      // If the browser still blocks playback, continue silently rather than trapping the visitor.
      setSession(MUSIC_PREF_KEY, 'off');
    }
    beginAnimation();
  };

  const startSilently = () => {
    if (started) return;
    audio.pause();
    setSession(MUSIC_PREF_KEY, 'off');
    beginAnimation();
  };

  const skipIntro = () => {
    if (started) {
      finish();
      return;
    }
    // Skip means skip the experience quietly; it never turns sound on.
    setSession(MUSIC_PREF_KEY, 'off');
    finish();
  };

  gate.querySelector('[data-intro-sound]')?.addEventListener('click', event => {
    event.stopPropagation();
    startWithSound();
  });

  gate.querySelector('[data-intro-silent]')?.addEventListener('click', event => {
    event.stopPropagation();
    startSilently();
  });

  skip?.addEventListener('click', event => {
    event.stopPropagation();
    skipIntro();
  });

  // Preserve the original cinematic behaviour: tapping the intro background starts with sound.
  intro.addEventListener('pointerdown', event => {
    if (started) return;
    if (event.target.closest('.keynote-choice, #keynoteSkip')) return;
    startWithSound();
  });

  window.addEventListener('keydown', event => {
    if (finished || started) return;
    const interactive = event.target?.closest?.('button, a, input, textarea, select');
    if (interactive) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault();
      startWithSound();
    } else if (event.key === 'Escape') {
      skipIntro();
    }
  }, true);
})();
