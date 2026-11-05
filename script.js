
'use strict';

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
   Keeps your existing single-PDF system unchanged.
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
   4. CAREER LOCATIONS
========================================================== */

const careerLocations = {
  chennai: {
    name: 'Chennai, India',
    company: 'Bay Forge Ltd · FOMAS Group',
    description:
      'Heavy open-die forging, metallurgy, quality assurance and heat treatment.',
    coordinates: [13.0827, 80.2707]
  },

  villarzana: {
    name: 'Villarzana, Italy',
    company: 'ASFO S.p.A. · FOMAS Group',
    description:
      'International engineering training and industrial work experience.',
    coordinates: [45.95, 11.93]
  },

  jeddah: {
    name: 'Jeddah, Saudi Arabia',
    company: 'ALIF · AIMS Group',
    description:
      'Manufacturing quality, fastener production and quality analytics.',
    coordinates: [21.5433, 39.1728]
  }
};

const mapContainer = document.getElementById('career-map');

/* ==========================================================
   5. LEAFLET CSS REPAIR

   Applies essential positioning rules locally.
   This prevents scattered tiles and invisible markers.
========================================================== */

function installLeafletLayoutFix() {
  if (document.getElementById('leaflet-layout-fix')) return;

  const style = document.createElement('style');
  style.id = 'leaflet-layout-fix';

  style.textContent = `
    #career-map {
      position: relative !important;
      overflow: hidden !important;
      width: 100% !important;
      height: 485px !important;
      background: #dce6ed;
      z-index: 1;
    }

    #career-map .leaflet-pane,
    #career-map .leaflet-tile,
    #career-map .leaflet-marker-icon,
    #career-map .leaflet-marker-shadow,
    #career-map .leaflet-tile-container,
    #career-map .leaflet-pane > svg,
    #career-map .leaflet-pane > canvas {
      position: absolute !important;
      left: 0;
      top: 0;
    }

    #career-map .leaflet-map-pane,
    #career-map .leaflet-tile-pane,
    #career-map .leaflet-overlay-pane,
    #career-map .leaflet-shadow-pane,
    #career-map .leaflet-marker-pane,
    #career-map .leaflet-tooltip-pane,
    #career-map .leaflet-popup-pane {
      position: absolute;
      left: 0;
      top: 0;
    }

    #career-map .leaflet-tile {
      visibility: inherit;
      max-width: none !important;
      max-height: none !important;
      width: 256px;
      height: 256px;
      border: 0;
      padding: 0;
    }

    #career-map .leaflet-container img {
      max-width: none !important;
      max-height: none !important;
    }

    #career-map .leaflet-tile-container {
      pointer-events: none;
    }

    #career-map .leaflet-pane {
      z-index: 400;
    }

    #career-map .leaflet-tile-pane {
      z-index: 200;
    }

    #career-map .leaflet-overlay-pane {
      z-index: 400;
    }

    #career-map .leaflet-shadow-pane {
      z-index: 500;
    }

    #career-map .leaflet-marker-pane {
      z-index: 600;
    }

    #career-map .leaflet-tooltip-pane {
      z-index: 650;
    }

    #career-map .leaflet-popup-pane {
      z-index: 700;
    }

    #career-map .leaflet-control {
      position: relative;
      z-index: 800;
      pointer-events: auto;
    }

    #career-map .leaflet-top,
    #career-map .leaflet-bottom {
      position: absolute;
      z-index: 1000;
      pointer-events: none;
    }

    #career-map .leaflet-top {
      top: 0;
    }

    #career-map .leaflet-bottom {
      bottom: 0;
    }

    #career-map .leaflet-left {
      left: 0;
    }

    #career-map .leaflet-right {
      right: 0;
    }

    #career-map .leaflet-top .leaflet-control {
      margin-top: 12px;
    }

    #career-map .leaflet-left .leaflet-control {
      margin-left: 12px;
    }

    #career-map .leaflet-right .leaflet-control {
      margin-right: 12px;
    }

    #career-map .leaflet-bottom .leaflet-control {
      margin-bottom: 12px;
    }

    #career-map .leaflet-control-zoom {
      border: 2px solid rgba(0,0,0,.15);
      border-radius: 5px;
      overflow: hidden;
    }

    #career-map .leaflet-control-zoom a {
      display: block;
      width: 32px;
      height: 32px;
      line-height: 30px;
      text-align: center;
      background: white;
      color: #101d30;
      font-size: 21px;
      font-weight: 700;
      border-bottom: 1px solid #ddd;
    }

    #career-map .leaflet-control-attribution {
      background: rgba(255,255,255,.85);
      padding: 2px 6px;
      font-size: 10px;
      color: #333;
    }

    #career-map .leaflet-control-attribution a {
      color: #377eaa;
    }

    #career-map .leaflet-popup {
      position: absolute;
      text-align: center;
      margin-bottom: 20px;
    }

    #career-map .leaflet-popup-content-wrapper {
      background: white;
      border-radius: 9px;
      box-shadow: 0 5px 25px rgba(0,0,0,.22);
      text-align: left;
    }

    #career-map .leaflet-popup-content {
      margin: 15px 18px;
      line-height: 1.5;
    }

    #career-map .leaflet-popup-tip-container {
      width: 40px;
      height: 20px;
      position: absolute;
      left: 50%;
      margin-left: -20px;
      overflow: hidden;
      pointer-events: none;
    }

    #career-map .leaflet-popup-tip {
      width: 17px;
      height: 17px;
      background: white;
      transform: rotate(45deg);
      margin: -10px auto 0;
      box-shadow: 0 3px 12px rgba(0,0,0,.12);
    }

    #career-map .leaflet-popup-close-button {
      position: absolute;
      top: 4px;
      right: 8px;
      font-size: 20px;
      color: #637286;
      z-index: 2;
    }

    #career-map .leaflet-div-icon {
      background: transparent;
      border: none;
    }

    #career-map .career-marker {
      width: 22px;
      height: 22px;
      background: #377eaa;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px #377eaa, 0 4px 14px #0004;
    }

    #career-map .career-marker.selected {
      background: #f2b85b;
      box-shadow: 0 0 0 3px #f2b85b, 0 4px 18px #0005;
    }

    #career-map .career-map-popup {
      min-width: 180px;
      font-family: 'DM Sans', sans-serif;
    }

    #career-map .career-map-popup strong {
      display: block;
      color: #101d30;
      font-size: 15px;
    }

    #career-map .career-map-popup span {
      display: block;
      color: #377eaa;
      font-size: 12px;
      font-weight: 700;
      margin-top: 4px;
    }

    #career-map .career-map-popup p {
      color: #637286;
      font-size: 12px;
      margin: 7px 0 0;
    }

    @media (max-width: 760px) {
      #career-map {
        height: 380px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================================
   6. LOAD LEAFLET IF NECESSARY
========================================================== */

function loadExternalScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureLeaflet() {
  if (typeof window.L !== 'undefined') return true;

  const sources = [
    'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
  ];

  for (const source of sources) {
    try {
      await loadExternalScript(source);

      if (typeof window.L !== 'undefined') {
        return true;
      }
    } catch (error) {
      console.warn('Leaflet source unavailable:', source);
    }
  }

  return false;
}

/* ==========================================================
   7. FALLBACK MAP
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

  document.querySelectorAll('.location-card').forEach(card => {
    card.addEventListener('click', () => {
      const location = careerLocations[card.dataset.location];

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

      document.querySelectorAll('.location-card').forEach(item => {
        const active = item === card;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });
}

/* ==========================================================
   8. INITIALIZE CAREER MAP
========================================================== */

function initializeCareerMap() {
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

  function markerIcon(selected = false) {
    return L.divIcon({
      className: 'career-marker-wrapper',
      html:
        '<div class="career-marker' +
        (selected ? ' selected' : '') +
        '"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -15]
    });
  }

  function selectLocation(key, moveMap = true) {
    const location = careerLocations[key];
    const marker = markers[key];

    if (!location || !marker) return;

    Object.keys(markers).forEach(markerKey => {
      markers[markerKey].setIcon(
        markerIcon(markerKey === key)
      );
    });

    cards.forEach(card => {
      const active = card.dataset.location === key;

      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', String(active));
    });

    if (moveMap) {
      map.flyTo(location.coordinates, 6, {
        animate: true,
        duration: 1.2
      });
    }

    marker.openPopup();
  }

  Object.entries(careerLocations).forEach(([key, location]) => {
    const marker = L.marker(location.coordinates, {
      icon: markerIcon()
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
      selectLocation(key, false);
    });

    markers[key] = marker;
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: [40, 40],
    maxZoom: 5
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      selectLocation(card.dataset.location, true);

      if (window.innerWidth <= 760) {
        mapContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  requestAnimationFrame(() => {
    map.invalidateSize();

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 5,
      animate: false
    });
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 500);
}

/* ==========================================================
   9. START THE MAP
========================================================== */

async function startCareerMap() {
  if (!mapContainer) return;

  installLeafletLayoutFix();

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
