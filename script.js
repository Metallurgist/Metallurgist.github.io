
'use strict';

/* ==========================================================
   MOHAMMED BURHANUDDEEN R. — PORTFOLIO
   Navigation, resume download and global career map
========================================================== */

/* ==========================================================
   1. MOBILE NAVIGATION
========================================================== */

const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');

    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '✕' : '☰';
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });
}

/* ==========================================================
   2. FOOTER YEAR
========================================================== */

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ==========================================================
   3. ORIGINAL RESUME DOWNLOAD

   Keeps the original PDF unchanged.
   Finds the single PDF inside assets/cv/
   regardless of its filename.
========================================================== */

document.querySelectorAll('.resume-download').forEach(link => {
  link.addEventListener('click', async event => {
    event.preventDefault();

    const originalLabel = link.textContent;
    link.textContent = 'Finding resume…';

    try {
      const response = await fetch(
        'https://api.github.com/repos/metallurgist/metallurgist.github.io/contents/assets/cv',
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Could not access the public resume folder');
      }

      const entries = await response.json();

      if (!Array.isArray(entries)) {
        throw new Error('Unexpected GitHub response');
      }

      const pdfs = entries.filter(file =>
        file.type === 'file' &&
        file.name.toLowerCase().endsWith('.pdf')
      );

      if (pdfs.length !== 1) {
        throw new Error(
          'Expected exactly one PDF in assets/cv; found ' + pdfs.length
        );
      }

      const filename = pdfs[0].name;

      const downloadUrl = new URL(
        'assets/cv/' + encodeURIComponent(filename),
        window.location.href
      );

      const a = document.createElement('a');
      a.href = downloadUrl.href;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      alert(
        'Resume download unavailable: ' +
        error.message +
        '. Please try again shortly.'
      );
    } finally {
      link.textContent = originalLabel;
    }
  });
});

/* ==========================================================
   4. GLOBAL CAREER LOCATIONS

   Coordinates represent approximate locations.
   The route indicates career progression, not travel.
========================================================== */

const careerLocations = [
  {
    id: 'chennai',
    number: '01',
    name: 'Chennai, India',
    company: 'Bay Forge Ltd · FOMAS Group',
    description:
      'Heavy open-die forging, metallurgy, quality assurance and heat treatment.',
    coordinates: [13.0827, 80.2707]
  },
  {
    id: 'villarzana',
    number: '02',
    name: 'Villarzana, Italy',
    company: 'ASFO S.p.A. · FOMAS Group',
    description:
      'International engineering training and industrial work experience.',
    coordinates: [45.95, 11.93]
  },
  {
    id: 'jeddah',
    number: '03',
    name: 'Jeddah, Saudi Arabia',
    company: 'ALIF · AIMS Group',
    description:
      'Manufacturing quality, fastener production and quality analytics.',
    coordinates: [21.5433, 39.1728]
  }
];

const mapContainer = document.getElementById('career-map');

/* ==========================================================
   5. LOAD LEAFLET CSS AND JAVASCRIPT

   Uses the Leaflet files already included in index.html.
   Alternative providers are available if needed.
========================================================== */

function loadExternalStylesheet(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
}

function loadExternalScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

async function ensureLeaflet() {
  if (typeof window.L !== 'undefined') {
    return true;
  }

  const providers = [
    {
      css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
      js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
    },
    {
      css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
      js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
    }
  ];

  for (const provider of providers) {
    try {
      await loadExternalStylesheet(provider.css);
      await loadExternalScript(provider.js);

      if (typeof window.L !== 'undefined') {
        return true;
      }
    } catch (error) {
      console.warn('Leaflet provider unavailable:', error);
    }
  }

  return false;
}

/* ==========================================================
   6. MAP-SPECIFIC DESIGN

   Does not modify the rest of the portfolio.
========================================================== */

function installCareerMapStyles() {
  if (document.getElementById('career-map-upgrade-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'career-map-upgrade-styles';

  style.textContent = `
    #career-map {
      position: relative;
      overflow: hidden;
      background: #dce6ed;
    }

    #career-map .leaflet-container {
      font-family: 'DM Sans', sans-serif;
    }

    #career-map .leaflet-div-icon {
      background: transparent;
      border: none;
    }

    #career-map .career-marker-wrapper {
      background: transparent;
      border: none;
    }

    #career-map .career-marker-numbered {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #377eaa;
      border: 3px solid #ffffff;
      box-shadow:
        0 0 0 2px rgba(55,126,170,.4),
        0 5px 16px rgba(16,29,48,.3);
      color: #ffffff;
      font-family: Manrope, sans-serif;
      font-size: 11px;
      font-weight: 800;
      transition:
        background .2s ease,
        box-shadow .2s ease,
        transform .2s ease;
    }

    #career-map .career-marker-numbered.active {
      background: #f2b85b;
      color: #101d30;
      box-shadow:
        0 0 0 5px rgba(242,184,91,.25),
        0 6px 20px rgba(16,29,48,.35);
      transform: scale(1.12);
    }

    #career-map .career-map-popup {
      min-width: 190px;
      font-family: 'DM Sans', sans-serif;
    }

    #career-map .career-map-popup strong {
      display: block;
      font-size: 15px;
      font-weight: 800;
      color: #101d30;
      margin-bottom: 5px;
    }

    #career-map .career-map-popup span {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #377eaa;
    }

    #career-map .career-map-popup p {
      font-size: 12px;
      line-height: 1.6;
      color: #637286;
      margin: 8px 0 0;
    }

    .location-card.active {
      border-color: #377eaa;
      background: #f7fbff;
      box-shadow: 0 8px 25px rgba(55,126,170,.16);
    }

    .location-card.active .location-number {
      color: #176895;
    }

    .location-card.active .location-arrow {
      color: #176895;
    }

    #career-map .leaflet-control-zoom a {
      color: #101d30;
    }

    @media (prefers-reduced-motion: reduce) {
      #career-map .career-marker-numbered {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================================
   7. FALLBACK MAP

   Used only if Leaflet is unavailable.
========================================================== */

function showFallbackMap() {
  if (!mapContainer) return;

  mapContainer.replaceChildren();

  const iframe = document.createElement('iframe');

  iframe.title = 'Geographical map of engineering experience';
  iframe.src =
    'https://www.openstreetmap.org/export/embed.html' +
    '?bbox=5%2C5%2C85%2C52&layer=mapnik';

  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.loading = 'lazy';

  mapContainer.appendChild(iframe);

  const cards = document.querySelectorAll('.location-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const location = careerLocations.find(
        item => item.id === card.dataset.location
      );

      if (!location) return;

      const lat = location.coordinates[0];
      const lon = location.coordinates[1];

      const bbox = [
        lon - 1.5,
        lat - 1.5,
        lon + 1.5,
        lat + 1.5
      ].join(',');

      iframe.src =
        'https://www.openstreetmap.org/export/embed.html' +
        '?bbox=' + encodeURIComponent(bbox) +
        '&layer=mapnik' +
        '&marker=' + encodeURIComponent(lat + ',' + lon);

      cards.forEach(item => {
        const active = item === card;

        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });
}

/* ==========================================================
   8. INITIALIZE INTERACTIVE CAREER MAP
========================================================== */

function initializeCareerMap() {
  if (!mapContainer || typeof window.L === 'undefined') {
    return;
  }

  const map = L.map(mapContainer, {
    center: [30, 43],
    zoom: 3,
    zoomControl: true,
    scrollWheelZoom: false,
    worldCopyJump: true
  });

  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map);

  const markers = {};
  const bounds = L.latLngBounds([]);
  const cards = document.querySelectorAll('.location-card');

  /* Numbered marker design */

  function createNumberedIcon(number, active = false) {
    return L.divIcon({
      className: 'career-marker-wrapper',
      html:
        '<div class="career-marker-numbered' +
        (active ? ' active' : '') +
        '">' +
        number +
        '</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -23]
    });
  }

  /* Career progression route */

  const routeCoordinates = careerLocations.map(
    location => location.coordinates
  );

  L.polyline(routeCoordinates, {
    color: '#ffffff',
    weight: 6,
    opacity: 0.85,
    interactive: false,
    lineJoin: 'round'
  }).addTo(map);

  L.polyline(routeCoordinates, {
    color: '#377eaa',
    weight: 3,
    opacity: 0.85,
    dashArray: '7, 10',
    interactive: false,
    lineJoin: 'round'
  }).addTo(map);

  /* Selection and card highlighting */

  function selectLocation(id, moveMap = true) {
    const location = careerLocations.find(
      item => item.id === id
    );

    const marker = markers[id];

    if (!location || !marker) return;

    careerLocations.forEach(item => {
      const isActive = item.id === id;

      markers[item.id].setIcon(
        createNumberedIcon(item.number, isActive)
      );
    });

    cards.forEach(card => {
      const isActive = card.dataset.location === id;

      card.classList.toggle('active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });

    if (moveMap) {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reducedMotion) {
        map.setView(location.coordinates, 6, {
          animate: false
        });
      } else {
        map.flyTo(location.coordinates, 6, {
          animate: true,
          duration: 1.1
        });
      }
    }

    marker.openPopup();
  }

  /* Add markers and popups */

  careerLocations.forEach(location => {
    const marker = L.marker(location.coordinates, {
      icon: createNumberedIcon(location.number),
      keyboard: true,
      title: location.name,
      alt: location.name
    }).addTo(map);

    const popup = document.createElement('div');
    popup.className = 'career-map-popup';

    const heading = document.createElement('strong');
    heading.textContent = location.name;

    const company = document.createElement('span');
    company.textContent = location.company;

    const description = document.createElement('p');
    description.textContent = location.description;

    popup.append(heading, company, description);

    marker.bindPopup(popup);

    marker.on('click', () => {
      selectLocation(location.id, false);
    });

    markers[location.id] = marker;
    bounds.extend(location.coordinates);
  });

  /* Show all three locations on initial load */

  function showEntireJourney() {
    map.invalidateSize();

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 5,
      animate: false
    });
  }

  showEntireJourney();

  /* Make the location cards interactive */

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.location;

      selectLocation(id, true);

      if (window.innerWidth <= 760) {
        mapContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });

  /* Keep the map correctly sized */

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  requestAnimationFrame(() => {
    showEntireJourney();
  });

  setTimeout(() => {
    showEntireJourney();
  }, 350);

  /* Optional double-click to reset the entire journey */

  map.on('dblclick', () => {
    showEntireJourney();
  });
}

/* ==========================================================
   9. START CAREER MAP
========================================================== */

async function startCareerMap() {
  if (!mapContainer) return;

  installCareerMapStyles();

  mapContainer.textContent = 'Loading geographical map…';

  const available = await ensureLeaflet();

  if (!available) {
    showFallbackMap();
    return;
  }

  try {
    mapContainer.replaceChildren();
    initializeCareerMap();
  } catch (error) {
    console.error('Career map initialization failed:', error);
    showFallbackMap();
  }
}

startCareerMap();
