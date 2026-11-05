
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

   Exactly one PDF must exist in assets/cv/.
   The PDF filename may change without editing this code.
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
   4. GLOBAL ENGINEERING JOURNEY
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
   5. LEAFLET LIBRARY LOADER
========================================================== */

function loadStylesheet(url) {
  return new Promise((resolve, reject) => {
    const stylesheet = document.createElement('link');

    stylesheet.rel = 'stylesheet';
    stylesheet.href = url;

    stylesheet.onload = resolve;
    stylesheet.onerror = reject;

    document.head.appendChild(stylesheet);
  });
}

function loadScript(url) {
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
      await loadStylesheet(provider.css);
      await loadScript(provider.js);

      if (typeof window.L !== 'undefined') {
        return true;
      }
    } catch (error) {
      console.warn('Map provider unavailable:', error);
    }
  }

  return false;
}

/* ==========================================================
   6. FALLBACK MAP
========================================================== */

function showFallbackMap() {
  if (!mapContainer) return;

  mapContainer.replaceChildren();

  const iframe = document.createElement('iframe');

  iframe.title = 'Geographical map of engineering experience';
  iframe.src =
    'https://www.openstreetmap.org/export/embed.html' +
    '?bbox=5%2C5%2C85%2C52' +
    '&layer=mapnik';

  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';

  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

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
   7. INTERACTIVE LEAFLET MAP
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
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
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
        duration: 1
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
      const key = card.dataset.location;

      selectLocation(key, true);

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

  setTimeout(() => {
    map.invalidateSize();
  }, 350);
}

/* ==========================================================
   8. START MAP
========================================================== */

async function startCareerMap() {
  if (!mapContainer) return;

  mapContainer.textContent = 'Loading geographical map…';

  const available = await ensureLeaflet();

  if (available) {
    try {
      mapContainer.replaceChildren();
      initializeCareerMap();
    } catch (error) {
      console.error('Map initialization error:', error);
      showFallbackMap();
    }
  } else {
    showFallbackMap();
  }
}

startCareerMap();
