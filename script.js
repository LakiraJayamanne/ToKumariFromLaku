// Day logic
const startDate = new Date('2025-12-01');
// Manual testing override:
// - Set `MANUAL_TODAY` to a 'YYYY-MM-DD' string to force the page to treat that day as today.
// - Set to `null` to disable manual override and allow URL override (`?today=`) or the device date.
// Example: const MANUAL_TODAY = '2025-12-04';
const MANUAL_TODAY = null; // <-- set a YYYY-MM-DD string here for manual testing

// Determine "today" value: manual override > URL `?today=` > device date
let today = new Date();
if (MANUAL_TODAY) {
  const parsedManual = new Date(MANUAL_TODAY);
  if (!isNaN(parsedManual)) {
    today = parsedManual;
    console.log('Using MANUAL_TODAY override:', MANUAL_TODAY);
  } else {
    console.warn('MANUAL_TODAY is set but could not be parsed:', MANUAL_TODAY);
  }
} else {
  try {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('today');
    if (override) {
      const parsed = new Date(override);
      if (!isNaN(parsed)) {
        today = parsed;
        console.log('Using URL ?today= override:', override);
      }
    }
  } catch (e) { /* ignore */ }
}

const msPerDay  = 24 * 60 * 60 * 1000;

let dayIndex = Math.floor((today - startDate) / msPerDay) + 1;
if (dayIndex < 1) dayIndex = 1;
if (dayIndex > 7) dayIndex = 7;

// Show current day
document.querySelectorAll('.day').forEach(el => el.style.display = 'none');
const active = document.getElementById(`day${dayIndex}`);
if (active) active.style.display = 'block';

// 🎵 Song of the Day
const songs = [
  { cover: "music/covers/D4vd.jpg", file: "music/Feel it.mp3", title: "Feel it", artist: "D4vd" },
  { cover: "music/covers/Sailorr.jpg", file: "music/Cut Up.mp3", title: "Cut Up", artist: "SAILORR" },
  { cover: "music/covers/Yeat.jpg", file: "music/Bought the Earth.mp3", title: "Bought the Earth", artist: "Yeat" },
  { cover: "music/covers/Billie.jpg", file: "music/Getting Older.mp3", title: "Getting Older", artist: "Billie Eilish" },
  { cover: "music/covers/Kali.jpg", file: "music/ILYSMIH.mp3", title: "ILYSMIH", artist: "Kali Uchis" },
  { cover: "music/covers/Mac.jpg", file: "music/For the first time.mp3", title: "For the first time", artist: "Mac Demarco" },
  { cover: "music/covers/Billie.jpg", file: "music/Halley's Comet.mp3", title: "Halley's Comet", artist: "Billie Eilish" }
];

const song = songs[dayIndex - 1];
const audioPlayer = document.getElementById('audio-player');
const playBtn     = document.getElementById('play-pause');
const coverImg    = document.querySelector('.song-cover');
const titleElem   = document.querySelector('.song-title');
const artistElem  = document.querySelector('.song-artist');

if (coverImg) {
  try { coverImg.src = song.cover; } catch (e) { console.warn('Could not set coverImg.src', e); }
} else console.warn('No .song-cover element found');
if (audioPlayer) {
  try { audioPlayer.src = song.file; } catch (e) { console.warn('Could not set audioPlayer.src', e); }
} else console.warn('No #audio-player element found');
if (titleElem) titleElem.textContent = `“${song.title}”`; else console.warn('No .song-title element found');
if (artistElem) artistElem.textContent = `— ${song.artist}`; else console.warn('No .song-artist element found');

if (playBtn && audioPlayer) {
  playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playBtn.textContent = '❚❚';
    } else {
      audioPlayer.pause();
      playBtn.textContent = '►';
    }
  });
} else {
  console.warn('Play button or audio player missing; skipping audio handler');
}

// 🎂 Candle Logic
let candleCount = 0;
const maxCandles = 19;
const countDisplay = document.getElementById('candle-counter');
const cakeContainer = document.getElementById('cake-container');

// persistence key for candles
const CANDLES_KEY = 'birthday_cake_candles_v1';
let storedCandles = [];

function saveCandles() {
  try {
    localStorage.setItem(CANDLES_KEY, JSON.stringify(storedCandles));
  } catch (e) { console.warn('Failed to save candles', e); }
}

function loadStoredCandlesFromStorage() {
  try {
    const raw = localStorage.getItem(CANDLES_KEY);
    if (!raw) { storedCandles = []; return; }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) { storedCandles = []; return; }
    storedCandles = arr.slice();
  } catch (e) { storedCandles = []; console.warn('Failed to read stored candles', e); }
}

function renderStoredCandles() {
  if (!cakeContainer) return;
  try {
    storedCandles.forEach(pos => {
      try {
        const el = document.createElement('img');
        el.src = 'cake/candle.png';
        el.className = 'candle';
        el.style.position = 'absolute';
        el.style.left = (pos.x * 100) + '%';
        el.style.top = (pos.y * 100) + '%';
        el.style.transform = 'translate(-50%, -100%)';
        el.setAttribute('aria-hidden', 'true');
        cakeContainer.appendChild(el);
      } catch (e) { /* ignore per-candle errors */ }
    });
    candleCount = storedCandles.length || 0;
    if (countDisplay) countDisplay.textContent = `Candles: ${candleCount} / ${maxCandles}`;
  } catch (e) { console.warn('Failed to render stored candles', e); }
}

function clearSavedCandles() {
  try {
    storedCandles = [];
    saveCandles();
    if (cakeContainer) {
      const nodes = cakeContainer.querySelectorAll('.candle');
      nodes.forEach(n => n.remove());
    }
    candleCount = 0;
    if (countDisplay) countDisplay.textContent = `Candles: ${candleCount} / ${maxCandles}`;
  } catch (e) { console.warn('Failed clearing saved candles', e); }
}

// 🎉 Enable only on December 4
function isBirthday() {
  // allow opening on Dec 4th, 5th, 6th and 7th
  return today.getMonth() === 11 && [4,5,6,7].includes(today.getDate());
}


if (cakeContainer) {
  // load saved candle data from storage (do not render yet)
  loadStoredCandlesFromStorage();

  // If current date is before Dec 4, clear any saved candles so testing before the 4th shows an empty cake
  const isBeforeDec4 = (today.getMonth() === 11 && today.getDate() < 4) || (today.getMonth() < 11);
  if (isBeforeDec4) {
    clearSavedCandles();
  } else {
    // render previously saved candles on Dec 4 and later
    renderStoredCandles();
  }

  cakeContainer.addEventListener('click', (event) => {
    // Only allow placing new candles on the actual birthday (Dec 4)
    if (!(today.getMonth() === 11 && today.getDate() === 4)) {
      alert("Oops — you can only add candles on ur birthday!");
      return;
    }

    if (candleCount >= maxCandles) return;

    const rect = cakeContainer.getBoundingClientRect();
    const x = event.clientX - rect.left; // click x inside container
    const y = event.clientY - rect.top;  // click y inside container

    // store normalized center/bottom anchor percentages (so candles persist across responsive sizes)
    const centerX = x / rect.width;
    const anchorY = y / rect.height; // this represents the bottom anchor point

    // create candle element and position using percent + transform to center horizontally and align bottom
    const candle = document.createElement('img');
    candle.src = 'cake/candle.png';
    candle.className = 'candle';
    candle.style.position = 'absolute';
    candle.style.left = (centerX * 100) + '%';
    candle.style.top = (anchorY * 100) + '%';
    candle.style.transform = 'translate(-50%, -100%)';
    candle.setAttribute('aria-hidden', 'true');

    cakeContainer.appendChild(candle);

    // persist the candle
    storedCandles.push({ x: centerX, y: anchorY });
    saveCandles();

    candleCount++;
    if (countDisplay) countDisplay.textContent = `Candles: ${candleCount} / ${maxCandles}`;

    // 🔓 Unlock and trigger confetti when reaching max
    if (candleCount === maxCandles) {
      const envelopeEl = document.getElementById("envelope");
      if (envelopeEl) envelopeEl.classList.add("unlocked");
      if (typeof launchConfetti === 'function') launchConfetti();
    }
  });
} else {
  console.warn('No #cake-container element found; candle clicks disabled');
}


function toggleFolder(headerElem) {
  const content = headerElem.nextElementSibling;
  content.classList.toggle('open');
}

// NEW: DOM elements for daily message (populated after messages array below)
const dailyMessageBox = document.getElementById('daily-message');
const messageDayElem = document.getElementById('message-day');
const dailyBoxWrapper = document.getElementById('daily-message-box');



// Daily message
const messages = [
  "START OF YOUR BIRTHDAY WEEK YAYYYYYY. (Note: Im writing all ur notes on the 21st of November expecting a whole week of celebrations and whatnot 😛) I hope you have lots of fun this week and I hope each day is filled with lots of love and laughter. I love you so very much my sweet baby. I’m so proud I get to call u my bestie 😉. Have an amazing week my love ❤️. ",
  "SECOND DAAAAYYYYY. I hope you had LOOOOAAADS of fun yesterday my love. ANOTHER 6 DAYS AWAIT. I hope you enjoy the throwbacks with the pictures I dug up some old ones. Just wanted to remind you of our early days and how I met the most amazing person ever. Love you loads kumari. Have fun today ❤️. ",
  "THE BIG DAY IS TOMORROW I CANT WAAAAAAAITTT. One more day until u become unc. Or aunty? ..Aunc?? Anyways. Hope you’ve had a lovely start of the week. Hope you’ve had LOADS of fun. And I hope that you haven’t got diabetes just yet. Can’t wait for tomorrow my love. I love you my cutie patootie. Enjoy the day ❤️.",
  "WOOOOO WOOOOOO ITS THE DAAAAAAAYYYYYY. HAPPY BIRTHDAY MY SWEET GIRL. I’m so proud of you baby. For the things that you’ve endured this last year. For the challenges u overcame this year. For the smiles u put on peoples faces this year. And I’m so honoured to have been a part of your life this last year. One year ago this month, I met the most amazing girl ever. I met someone that I soon truly loved. I met the strongest girl to ever exist. Since the day you walked into my life, you have made me become a better person. And if I'm being honest, you inspired me to be just as strong as you. You showed me love when I most needed it. You were the first person in my life to care about me this much, and I can never be greatful enough for that. I love you truly, wholeheartedly and forever for being the best girlfriend I could've ever had. I'm so proud to call you mine Rennae. And I’m so glad that I got to spend this last year with you. Hopefully we have more years to come. For now, all the best to you my dear Rennae. I wish you a year full of happiness and love and success. And I have no doubt in my mind that I’ll be even more proud of you by the same time next year. I love you 3000 Kumari. Happy birthday, from your dearest, your biggest admirer, the person you inspired to become a better person, and the person who loves you ever so much, Laku ❤️. ",
  "How’s it feel being 19?? Is ur back creaking already? Can you feel the arthritis? Unc? Aunty?? Aunc 🥹. Anyways, hope the big day was perfect. And I hope you didn’t get diabetes from all the sweets. You still got 2 more days  buddy. Make sure you don’t dance too much because I can’t give you foot massages 💔. But have fun today baby. I love you the mostest my sweet girl ❤️. ",
  "Wowza. Weeks almost over isn’t it.. Hope it all went according to plan. Hope you had more than enough fun. And I hope you ate enough fatty. Also I want to hear allllll about ur week when ur done okay?? Well, have fun today baby. I wish you yet another day of love and happiness. I love you baby ❤️. Wish I could give u a kiss and say that. ",
  "Damn.. and that’s the week. EVERYTHING WAS PERFECT I BET. And I js know your feet are killing from all the dancing (im guessing you were dancing). Yk, I do feel bad for not being able to get you a physical present so I do apologise for that… But I hope this was enough for you. And I hope it made you happy. Also hope that the pictures made you remember our fun times. Our lovely memories. I look forward to making many more with you my dear Kumari. I love you Rennae ❤️."
];


document.querySelectorAll('.heart').forEach(function (heart) {
  heart.addEventListener('animationend', function () {
    try { heart.style.display = 'none'; } catch (e) {}
  });
  // safety fallback: hide after 9 seconds in case animationend doesn't fire
  setTimeout(function () { try { heart.style.display = 'none'; } catch (e) {} }, 9000);
});

// Now populate the daily message box (messages array must be defined first)
if (dailyMessageBox) {
  const raw = messages[dayIndex - 1] || '';
  const paragraphs = raw.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');
  dailyMessageBox.innerHTML = paragraphs;
  if (dailyBoxWrapper) dailyBoxWrapper.classList.add('loaded');
}
if (messageDayElem) messageDayElem.textContent = dayIndex;

// ---------- 100 Reasons: gift box reveal ----------
const reasons = [
  "Your big smile",
  "Your beautiful eyes",
  "Your loud laughs",
  "Your lovely hair",
  "Your silly interests",
  "How smart you are",
  "How kind you are",
  "How confident you are",
  "The way you make my day",
  "The way you make me laugh",
  "The way you love everyone",
  "Your advices",
  "Your bravery",
  "How understanding you are",
  "Your support",
  "Your personality",
  "The way you look at me",
  "Your attitude",
  "Your \"flaws\"",
  "Your elite taste in music",
  "How real you are",
  "Your protectiveness",
  "How your patient with me",
  "How your hands are always cold",
  "Your warmth",
  "How you comfort me",
  "How considerate you are",
  "How close you are with God",
  "The way you talk about your day",
  "Your strength",
  "The way you say \"I love you\"",
  "How you value small things",
  "How you let me be me when im with you",
  "How you act \"nonchalant\"",
  "Your little hight pitched \"no\"s",
  "Your sarcasm",
  "Your big hugs",
  "How you always manage to amaze me",
  "How you notice the small things",
  "How you say no when i tell you to go sleep",
  "The way you miss me",
  "The way you open up to me",
  "How i can talk about anything with you",
  "How persistent you are",
  "How you get mad when i boop you",
  "How you still start doing work at silly times",
  "How beautiful you are no matter when",
  "How youre always optimistic",
  "How you loooove (barely tolerate) my music taste",
  "Your obsession with Kakegurui",
  "How much you love your friends",
  "The way your eyes glisten when you laugh",
  "The way you switch from geeked to locked in so fast",
  "Your ambitions",
  "Your freak..",
  "How you match mine..",
  "How you appreciate me",
  "How you call me laku",
  "How you never put in the bands in your teeth..",
  "How much you love to sleep",
  "Your cute little snores",
  "The way you hold me",
  "How you always get my niche references",
  "How i could never get tired of you",
  "How you meow",
  "How hard you try",
  "How youre brainrotted beyond saving (look at the number)",
  "How you say I make you feel real",
  "How you know when something is wrong",
  "How you reacted when I asked you to be my girlfriend",
  "The way you cried becauseyou missed me one night",
  "How much you love sugar",
  "How you act tough",
  "How your eyes go soft when I tell you how much i love you",
  "How innocent you are",
  "How you make me feel at home when im with you",
  "Our memories together",
  "How you play with my hair",
  "Your stubborness",
  "How lovely you look in traditional clothes",
  "How you wrap ur leg around mine when i sat in your class",
  "How you make me sit opposite to you",
  "The way you get mad at me for drinking coffee at silly o' clock",
  "How you give me butterflies when i see you",
  "How much you mean to me",
  "How youre the first person in my life to wipe my tears and say that everything will be okay",
  "Our quiet nights when we just sit on facetime",
  "How much you care for me",
  "How you were always there for me when i had stuff going on at home",
  "How much you loved Daal and how you looked when i first gave him to you",
  "How you have helped me get through so much stuff and get over stuff that ive been brought up with",
  "How much of a strong girl you are to put up with the things that you do and still keep a smile on your face",
  "How you walked into my life when i asked God for some love and a way to get close to him.",
  "How much of a beautiful person you are",
  "How much you have helped me become a better person since i met you.",
  "How you put up with everything to be with me",
  "The way you love me even when im unloveable",
  "How you stayed when times got tough",
  "How you chose me over and over again.",
  "You."
];

// render reasons into the panel
// render reasons into a target list element (id)
function renderReasons(targetId) {
  const list = document.getElementById(targetId);
  if (!list) return;
  list.innerHTML = '';
  reasons.forEach((r) => {
    const li = document.createElement('li');
    li.innerText = r;
    list.appendChild(li);
  });
}

// wire up gift press/shake behavior and 3-press reveal
const giftBox = document.getElementById('gift-box');
const reasonsModal = document.getElementById('reasons-modal');
const modalClose = document.getElementById('reasons-close');

// Image load/error fallback for the gift image so missing file doesn't break interaction
const giftImg = document.querySelector('.gift-img');
if (giftImg) {
  giftImg.addEventListener('error', () => {
    console.error('Gift image failed to load:', giftImg.src);
    if (giftBox) giftBox.classList.add('no-image');
  });
  giftImg.addEventListener('load', () => {
    console.log('Gift image loaded OK:', giftImg.src);
  });
} else {
  console.warn('No .gift-img element found in DOM');
  if (giftBox) giftBox.classList.add('no-image');
}

let giftPressCount = 0;

// Diagnostic logs to help verify handlers and press counts
console.log('Script loaded: wiring gift handlers...');
console.log('giftBox element:', giftBox);
console.log('reasonsModal element:', reasonsModal);
console.log('modalClose element:', modalClose);

// No persistent 'gift opened' state. Gift opens only on the birthday and does not stay open.

function showReasonsModal() {
  // Render the reasons into the inline panel under the gift (modal removed)
  renderReasons('reasons-list');
  const panel = document.getElementById('reasons-panel');
  if (panel) {
    panel.classList.add('show', 'expanded');
    panel.setAttribute('aria-hidden', 'false');
    // remove any existing panel-close if present (we won't use a close button)
    try { const existing = panel.querySelector('.panel-close'); if (existing) existing.remove(); } catch (err) {}
    // center the gift (and thus the panel positioned below it) in the viewport
    try {
      if (giftBox) {
        // compute a precise scroll target so the element is centered horizontally and vertically
        try {
          const rect = giftBox.getBoundingClientRect();
          const docEl = document.documentElement;
          const maxScrollX = Math.max(0, docEl.scrollWidth - window.innerWidth);
          const maxScrollY = Math.max(0, docEl.scrollHeight - window.innerHeight);
          const targetX = Math.min(maxScrollX, Math.max(0, window.scrollX + rect.left + rect.width / 2 - window.innerWidth / 2));
          const targetY = Math.min(maxScrollY, Math.max(0, window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2));
          window.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });
        } catch (calcErr) {
          // if manual calc fails for any reason, fall back to scrollIntoView
          try {
            if (typeof giftBox.scrollIntoView === 'function') giftBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (e) { /* ignore */ }
        }
      }
    } catch (err) { /* ignore */ }
  }
  // small confetti celebration
  if (typeof launchConfetti === 'function') launchConfetti();
}

// Safe confetti wrapper: supports common global names from canvas-confetti CDN
function launchConfetti() {
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
      return;
    }
    if (typeof window.confetti === 'function') {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
      return;
    }
    if (typeof window.canvasConfetti === 'function') {
      window.canvasConfetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
      return;
    }
    console.warn('No confetti function available on window');
  } catch (err) {
    console.warn('Confetti failed:', err);
  }
}

function shakeGift() {
  if (!giftBox) return;
  giftBox.classList.remove('shake');
  // force reflow to restart animation
  void giftBox.offsetWidth;
  giftBox.classList.add('shake');
}

function onGiftPress(e) {
  try { e.preventDefault(); } catch (err) {}

  // If the inline reasons panel is currently visible, toggle it closed on any gift press
  try {
    const inlinePanel = document.getElementById('reasons-panel');
    if (inlinePanel && inlinePanel.classList.contains('show')) {
      inlinePanel.classList.remove('show', 'expanded');
      inlinePanel.setAttribute('aria-hidden', 'true');
      giftPressCount = 0;
      return;
    }
  } catch (err) { /* ignore */ }

  // Only allow opening/press interactions on the actual birthday
  if (!isBirthday()) {
    // gentle feedback: small shake to indicate locked
    shakeGift();
    console.log('Gift is locked until the birthday.');
    return;
  }

  giftPressCount++;
  console.log('Gift pressed — count =', giftPressCount);
  // visual shake each press
  shakeGift();
  // optional small lid jiggle on first two presses
  if (giftPressCount < 3) {
    giftBox.classList.add('open');
    setTimeout(() => giftBox.classList.remove('open'), 260);
  }
  if (giftPressCount >= 3) {
    // reveal modal
    console.log('Reached 3 presses — showing modal');
    showReasonsModal();
    giftPressCount = 0; // reset
  }
}

if (giftBox) {
  giftBox.addEventListener('click', onGiftPress);
  // also allow keyboard activation for accessibility
  giftBox.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') onGiftPress(ev);
  });
  console.log('Attached onGiftPress to #gift-box');
} else {
  console.warn('No #gift-box found; cannot attach handler');
}
if (modalClose) modalClose.addEventListener('click', function () {
  if (reasonsModal) {
    reasonsModal.classList.remove('show');
    reasonsModal.setAttribute('aria-hidden', 'true');
  }
});

// close modal when clicking backdrop
// NOTE: We do NOT close the `reasonsModal` when clicking the backdrop or pressing Escape.
// The reasons modal is intended to behave like a mandatory popup and must be closed
// explicitly via its close button to ensure it's the focus of the page.
document.addEventListener('click', function (ev) {
  // Keep existing behavior for the messageModal (click outside to close)
  try {
    const messageModal = document.getElementById('messageModal');
    if (messageModal && messageModal.classList.contains('show')) {
      const content = messageModal.querySelector('.modal-content');
      if (content && !content.contains(ev.target)) {
        messageModal.classList.remove('show');
        messageModal.setAttribute('aria-hidden', 'true');
      }
    }
  } catch (err) {
    /* ignore */
  }
});

// Improve modal close behavior: central close function and Escape key
function closeReasonsModal() {
  if (!reasonsModal) return;
  reasonsModal.classList.remove('show');
  try { reasonsModal.style.display = 'none'; } catch (e) {}
  reasonsModal.setAttribute('aria-hidden', 'true');
  try { document.body.classList.remove('modal-open'); } catch (err) { /* ignore */ }
}

// --- Safety: ensure gift click handler is attached (diagnostic) ---
try {
  if (giftBox) {
    // attach only if not already marked
    if (!giftBox.dataset.giftHandlerAttached) {
      giftBox.addEventListener('click', onGiftPress);
      giftBox.dataset.giftHandlerAttached = '1';
      console.log('Safety: re-attached onGiftPress to #gift-box');
    }
  } else {
    console.warn('Safety: #gift-box not found during safety check');
  }
  // Expose a quick test helper in the console
  window.testShowReasonsModal = function () { console.log('testShowReasonsModal called'); showReasonsModal(); };
} catch (err) {
  console.warn('Safety attachment failed:', err);
}
// No persisted gift-opened state to reflect on load.

// ------------------ Letter modal (attachment) ------------------
// Open a simple modal when the clickable letter is pressed.
try {
  const clickableLetter = document.getElementById('clickable-letter');
  const messageModal = document.getElementById('messageModal');
  const closeModalBtn = document.getElementById('closeModal');

  if (clickableLetter && messageModal) {
    clickableLetter.addEventListener('click', function () {
      messageModal.classList.add('show');
      messageModal.setAttribute('aria-hidden', 'false');
    });

    // close button
    if (closeModalBtn) closeModalBtn.addEventListener('click', function () {
      messageModal.classList.remove('show');
      messageModal.setAttribute('aria-hidden', 'true');
    });

    // backdrop click closes modal
    messageModal.addEventListener('click', function (ev) {
      const content = messageModal.querySelector('.modal-content');
      if (content && !content.contains(ev.target)) {
        messageModal.classList.remove('show');
        messageModal.setAttribute('aria-hidden', 'true');
      }
    });

    // Escape closes
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && messageModal.classList.contains('show')) {
        messageModal.classList.remove('show');
        messageModal.setAttribute('aria-hidden', 'true');
      }
    });
  }
} catch (err) {
  console.warn('Letter modal wiring failed:', err);
}

// Envelope UI removed — instead open message modal by clicking the daily message box
try {
  const messageModal = document.getElementById('messageModal');
  const dailyBox = document.getElementById('daily-message-box');
  if (dailyBox && messageModal) {
    dailyBox.addEventListener('click', function () {
      messageModal.classList.add('show');
      messageModal.setAttribute('aria-hidden', 'false');
    });
  }
} catch (err) {
  console.warn('Daily message box open wiring failed:', err);
}

if (modalClose) {
  modalClose.addEventListener('click', function (ev) {
    ev.stopPropagation();
    closeReasonsModal();
  });
}

document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape') {
    // Only close the simple message modal with Escape. The reasons modal requires
    // the user to click its explicit close button to dismiss.
    try {
      const messageModal = document.getElementById('messageModal');
      if (messageModal && messageModal.classList.contains('show')) {
        messageModal.classList.remove('show');
        messageModal.setAttribute('aria-hidden', 'true');
      }
    } catch (err) { /* ignore */ }
  }
});

//michael was here 😎, i love seeing people in love 
