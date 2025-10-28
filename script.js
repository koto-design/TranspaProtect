function toggleHelp() {
  const menu = document.getElementById('help-menu');
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}
document.addEventListener("DOMContentLoaded", () => {
  // === CONFIGURARE GALERII ===
  const galleryData = {
    terasa: [
      ...Array.from({ length: 12 }, (_, i) => `img/terasa/${i + 1}.jpg`),
      "img/terasa/video1.mp4",
      ...Array.from({ length: 46 }, (_, i) => `img/terasa/${i + 13}.jpg`)
    ],
    foisor: [
      ...Array.from({ length: 15 }, (_, i) => `img/foisor/${i + 1}.jpg`)
    ],
    copertina: [
      ...Array.from({ length: 13 }, (_, i) => `img/copertina/${i + 1}.jpg`)
    ],
    pergola: [
      ...Array.from({ length: 12 }, (_, i) => `img/pergola/${i + 1}.jpg`),
      "img/pergola/video1.mp4",
      "img/pergola/video2.mp4"
    ],
    "rulouri-manivela": [
      ...Array.from({ length: 12 }, (_, i) => `img/rulouri-manivela/${i + 1}.jpg`)
    ],
    "rulouri-incasetate": [
      ...Array.from({ length: 14 }, (_, i) => `img/rulouri-incasetate/${i + 1}.jpg`),
      "img/rulouri-incasetate/video1.mp4" // poți muta asta mai sus dacă vrei să fie în mijloc
    ]
  };

  // === MODAL ===
  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.innerHTML = `
    <div class="gallery-content">
      <span class="close-gallery">&times;</span>
      <div class="gallery-inner">
        <img id="currentImage" src="" alt="">
        <video id="currentVideo" autoplay muted playsinline loop style="display:none; width:100%; height:auto; border-radius:10px; object-fit:cover;">
          <source src="" type="video/mp4">
          Browserul tău nu suportă video.
        </video>
      </div>
      <div class="gallery-controls">
        <button class="nav prev">&#10094; Înapoi</button>
        <button class="nav next">Înainte &#10095;</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close-gallery");
  const imgEl = modal.querySelector("#currentImage");
  const vidEl = modal.querySelector("#currentVideo");
  const vidSource = vidEl.querySelector("source");
  const nextBtn = modal.querySelector(".next");
  const prevBtn = modal.querySelector(".prev");

  let currentGallery = [];
  let currentIndex = 0;

  // === DESCHIDERE GALERIE ===
  document.querySelectorAll(".gallery-item").forEach(figure => {
    figure.style.cursor = "pointer";
    figure.addEventListener("click", () => {
      const id = figure.id;
      currentGallery = galleryData[id];
      if (!currentGallery) return;
      currentIndex = 0;
      openMedia();
      modal.classList.add("active");
    });
  });

 // === helper: verifică dacă resursa există (HEAD) ===
async function urlExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// === NAVIGARE (robustă, cu skip la resurse inexistente) ===
nextBtn.addEventListener("click", async e => {
  e.stopPropagation();
  if (currentGallery.length === 0) return;

  // încercăm până la currentGallery.length pași (ca să nu intrăm în loop infinit)
  for (let step = 0; step < currentGallery.length; step++) {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    const candidate = currentGallery[currentIndex];
    if (!candidate) continue;
    const ok = await urlExists(candidate);
    console.log("next -> index:", currentIndex, "candidate:", candidate, "exists:", ok);
    if (ok) {
      openMedia();
      return;
    }
    // dacă nu există, continuăm la următorul
  }
  console.warn("Next: nu am găsit nicio resursă validă în galerie.");
});

prevBtn.addEventListener("click", async e => {
  e.stopPropagation();
  if (currentGallery.length === 0) return;

  for (let step = 0; step < currentGallery.length; step++) {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    const candidate = currentGallery[currentIndex];
    if (!candidate) continue;
    const ok = await urlExists(candidate);
    console.log("prev -> index:", currentIndex, "candidate:", candidate, "exists:", ok);
    if (ok) {
      openMedia();
      return;
    }
  }
  console.warn("Prev: nu am găsit nicio resursă validă în galerie.");
});

// === AFIȘARE MEDIA (bazat pe resursa validă) ===
async function openMedia() {
  // debug: arată galeria curentă și indexul
  console.log("openMedia -> index:", currentIndex, "gallery:", currentGallery);

  const item = currentGallery[currentIndex];
  if (!item) {
    console.warn("openMedia: item lipsește la index", currentIndex);
    return;
  }

  // dacă nu există resursa (ex: 404), încercăm să găsim următorul valid
  const exists = await urlExists(item);
  if (!exists) {
    console.warn("openMedia: resursa nu există:", item);
    // încercăm să găsim următorul valid (ca fallback)
    for (let i = 1; i <= currentGallery.length; i++) {
      const nextIndex = (currentIndex + i) % currentGallery.length;
      const cand = currentGallery[nextIndex];
      if (!cand) continue;
      if (await urlExists(cand)) {
        currentIndex = nextIndex;
        console.log("openMedia: mutat la index valid:", currentIndex, cand);
        break;
      }
    }
  }

  const finalItem = currentGallery[currentIndex];
  if (!finalItem) {
    console.error("openMedia: nu am găsit niciun element valid în galerie.");
    return;
  }

  if (finalItem.toLowerCase().endsWith(".mp4")) {
    // afișăm video
    imgEl.style.display = "none";
    vidEl.style.display = "block";

    vidSource.src = finalItem;
    // asigurări pentru autoplay
    vidEl.muted = true;
    vidEl.playsInline = true;
    vidEl.autoplay = true;

    vidEl.load();
    vidEl.play().catch(() => {
      console.warn("Autoplay blocat. Așteaptă click pe player pentru play.");
    });
  } else {
    // afișăm imagine
    vidEl.pause();
    vidEl.style.display = "none";
    imgEl.style.display = "block";
    imgEl.src = finalItem;
  }
}


  // === CLICK pe video ===
  vidEl.addEventListener("click", () => {
    if (vidEl.paused) vidEl.play();
    else vidEl.pause();
  });

  // === ÎNCHIDERE ===
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.classList.remove("active");
    vidEl.pause();
    vidEl.currentTime = 0;
  }
});

// === Scroll corect către secțiune (cu centrare) ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = window.innerHeight / 2 - target.offsetHeight / 2; // centrează pe ecran
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});
// === HIGHLIGHT DUBLU PENTRU "Capse și bride" ===
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", function (e) {
    let a = e.target;
    while (a && a.tagName && a.tagName.toLowerCase() !== 'a') {
      a = a.parentElement;
    }
    if (!a) return;

    const href = a.getAttribute('href') || '';
    const txt = (a.innerText || '').trim().toLowerCase();

    if (href === '#terasa' || txt.includes('capse')) {
      e.preventDefault();
      e.stopPropagation();

      const elTerasa = document.getElementById('terasa');
      const elFoisor = document.getElementById('foisor');

      if (!elTerasa && !elFoisor) return;

      // curățăm highlight-urile vechi
      document.querySelectorAll('.gallery-item.highlight-gallery').forEach(x => {
        x.classList.remove('highlight-gallery');
      });

      // scroll către portofoliu
      const scrollTarget = document.getElementById('portofoliu') || elTerasa;
      if (scrollTarget) {
        const offset = Math.max((window.innerHeight / 2) - (scrollTarget.offsetHeight / 2), 80);
        const top = scrollTarget.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // 🕒 adăugăm efectul după ce scroll-ul s-a terminat (~0.9 secunde)
      setTimeout(() => {
        if (elTerasa) elTerasa.classList.add('highlight-gallery');
        if (elFoisor) elFoisor.classList.add('highlight-gallery');

        // eliminăm highlight-ul după 2.5s
        setTimeout(() => {
          if (elTerasa) elTerasa.classList.remove('highlight-gallery');
          if (elFoisor) elFoisor.classList.remove('highlight-gallery');
        }, 2500);
      }, 400);
    }
  }, { capture: true });
});

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-right ul');

// Deschidere / închidere la click pe iconiță
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // previne închiderea imediată
  menu.classList.toggle('active');
});

// Închidere când dai click pe un link din meniu
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('active');
  });
});

// Închidere când dai click în afara meniului
document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
    menu.classList.remove('active');
  }
});

// ===== ÎNCHIDERE AUTOMATĂ A GALERIEI CÂND DAI CLICK ÎN AFARA CONȚINUTULUI =====
document.addEventListener('click', function(e) {
  const modal = document.querySelector('.gallery-modal');
  if (!modal || !modal.classList.contains('active')) return;

  const content = modal.querySelector('.gallery-content');
  const video = modal.querySelector('#currentVideo');

  // Dacă s-a dat click în afara conținutului și nu pe butoane
  if (!content.contains(e.target) && !e.target.closest('.nav') && !e.target.closest('.close-gallery')) {
    modal.classList.remove('active');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }
});
// ===== ÎNCHIDERE LIGHTBOX CÂND DAI CLICK ÎN AFARA CONȚINUTULUI =====
document.addEventListener('click', function(e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.style.display !== 'flex') return;

  const image = document.querySelector('.lightbox-image');
  const video = document.querySelector('.lightbox-video');
  const isInside = image.contains(e.target) || video.contains(e.target);
  const isButton = e.target.closest('.nav') || e.target.closest('.close');

  if (!isInside && !isButton) {
    lightbox.style.display = 'none';
    if (video) {
      video.pause();
      video.src = '';
    }
  }
});

// ===== ÎNCHIDERE LIGHTBOX CU X =====
document.querySelectorAll('.close').forEach(btn => {
  btn.addEventListener('click', () => {
    const lightbox = document.getElementById('lightbox');
    const video = document.querySelector('.lightbox-video');
    lightbox.style.display = 'none';
    if (video) {
      video.pause();
      video.src = '';
    }
  });
});

