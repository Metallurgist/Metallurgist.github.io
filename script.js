
'use strict';

/* ============================================================
   PROFESSIONAL PORTFOLIO — MOHAMMED BURHANUDDEEN R.

   CAREER JOURNEY:
   01 Chennai -> 02 Villarzana (high upward curve)
   02 Villarzana -> 01 Chennai (straight return)
   01 Chennai -> 03 Jeddah (deep downward curve)

   Map routes are illustrative career paths, not flight tracks.
============================================================ */


/* ============================================================
   1. MOBILE NAVIGATION
============================================================ */

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


/* ============================================================
   2. COPYRIGHT YEAR
============================================================ */

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* ============================================================
   3. ORIGINAL RESUME DOWNLOAD

   Keeps your original PDF untouched.
   Finds the single PDF in assets/cv/.
============================================================ */

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
        throw new Error('Could not access the resume folder');
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
          'Expected exactly one PDF in assets/cv; found ' +
          pdfs.length
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
      alert('Resume download unavailable: ' + error.message);
    } finally {
      link.textContent = originalLabel;
    }
  });
});


/* ============================================================
   4. CAREER LOCATIONS

   Approximate city/locality coordinates.
============================================================ */

const careerLocations = [
  {
    id: 'chennai',
    number: '01',
    name: 'Chennai, India',
    company: 'Bay Forge Ltd · FOMAS Group',
    description:
      'Heavy open-die forging, metallurgy, quality assurance and heat treatment. Returned after the Italy assignment and continued working before moving to Saudi Arabia.',
    coordinates: [13.0827, 80.2707]
  },
  {
    id: 'villarzana',
    number: '02',
    name: 'Villarzana, Italy',
    company: 'ASFO S.p.A. · FOMAS Group',
    description:
      'International engineering training and industrial work experience, followed by a return to Chennai.',
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


/* ============================================================
   5. ROUTE SETTINGS

   CUSTOMIZATION:

   highCurveOffset:
     Higher number = taller upward curve.

   lowerCurveOffset:
     Higher number = deeper downward curve.

   Straight return route has no curve.

   These are geographic control points in latitude/longitude,
   chosen to reproduce the red-marked illustration.
============================================================ */

const careerJourneys = [
  {
    id: 'chennai-to-italy',
    from: 'chennai',
    to: 'villarzana',
    label: '01 → 02 · Chennai to Villarzana',
    color: '#377eaa',
    style: 'curve',
    control: [73, 57],
    dashArray: '9, 8'
  },
  {
    id: 'italy-to-chennai',
    from: 'villarzana',
    to: 'chennai',
    label: '02 → 01 · Villarzana to Chennai',
    color: '#7ba8c5',
    style: 'straight',
    dashArray: '7, 9'
  },
  {
    id: 'chennai-to-jeddah',
    from: 'chennai',
    to: 'jeddah',
    label: '01 → 03 · Chennai to Jeddah',
    color: '#176c9b',
    style: 'curve',
    control: [2, 55],
    dashArray: '9, 8'
  }
];

const mapContainer = document.getElementById('career-map');


/* ============================================================
   6. MAP STYLES
============================================================ */

function installCareerMapStyles() {
  if (document.getElementById('career-map-custom-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'career-map-custom-styles';

  style.textContent = `
    #career-map {
      position: relative;
      overflow: hidden;
      background: #dce6ed;
    }

    #career-map .career-marker-wrapper {
      background: transparent;
      border: none;
    }

    #career-map .career-marker-numbered {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #377eaa;
      color: #ffffff;
      border: 3px solid #ffffff;
      box-shadow:
        0 0 0 2px rgba(55,126,170,.4),
        0 5px 16px rgba(16,29,48,.3);
      font-family: Manrope, sans-serif;
      font-size: 11px;
      font-weight: 800;
      transition: background .2s, transform .2s;
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
      color: #101d30;
      font-size: 15px;
      font-weight: 800;
    }

    #career-map .career-map-popup span {
      display: block;
      margin-top: 5px;
      color: #377eaa;
      font-size: 12px;
      font-weight: 700;
    }

    #career-map .career-map-popup p {
      color: #637286;
      font-size: 12px;
      line-height: 1.6;
      margin: 8px 0 0;
    }

    .location-card.active {
      border-color: #377eaa;
      background: #f7fbff;
      box-shadow: 0 8px 25px rgba(55,126,170,.16);
    }

    .career-journey-summary {
      margin-top: 24px;
      padding: 20px 24px;
      background: #ffffff;
      border: 1px solid #dce4ec;
      border-left: 4px solid #377eaa;
      border-radius: 8px;
      color: #536377;
      font-size: 14px;
      line-height: 1.8;
    }

    .career-journey-summary strong {
      color: #101d30;
    }

    .career-journey-steps {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 9px;
      margin-bottom: 12px;
      color: #377eaa;
      font-family: Manrope, sans-serif;
      font-size: 12px;
      font-weight: 800;
    }

    .career-journey-steps .step-arrow {
      color: #8da6b8;
    }

    .career-journey-summary p {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      #career-map .career-marker-numbered {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);
}


/* ============================================================
   7. CAREER JOURNEY SUMMARY
============================================================ */

function addCareerJourneySummary() {
  const section = document.getElementById('journey');

  if (!section) return;

  if (document.getElementById('career-journey-summary')) {
    return;
  }

  const container = section.querySelector('.container');

  if (!container) return;

  const summary = document.createElement('div');

  summary.id = 'career-journey-summary';
  summary.className = 'career-journey-summary';

  const steps = document.createElement('div');
  steps.className = 'career-journey-steps';

  ['Chennai', 'Villarzana', 'Chennai', 'Jeddah']
    .forEach((name, index) => {
      if (index > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'step-arrow';
        arrow.textContent = '→';
        steps.appendChild(arrow);
      }

      const stage = document.createElement('span');
      stage.textContent = name;
      steps.appendChild(stage);
    });

  const description = document.createElement('p');

  const heading = document.createElement('strong');
  heading.textContent = 'My international engineering journey: ';

  description.appendChild(heading);

  description.appendChild(
    document.createTextNode(
      'I began my professional career at Bay Forge in Chennai, ' +
      'gained international industrial experience at ASFO in Italy, ' +
      'and returned to Chennai to continue working with FOMAS Group. ' +
      'I subsequently moved to Jeddah, Saudi Arabia, where I worked ' +
      'with ALIF in manufacturing quality and process improvement.'
    )
  );

  summary.append(steps, description);

  const note = container.querySelector('.journey-note');

  if (note) {
    note.before(summary);
  } else {
    container.appendChild(summary);
  }
}


/* ============================================================
   8. LEAFLET LOADER
============================================================ */

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
      console.warn('Leaflet source unavailable:', error);
    }
  }

  return false;
}


/* ============================================================
   9. FALLBACK MAP
============================================================ */

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
    });
  });
}


/* ============================================================
   10. ROUTE GEOMETRY

   Uses quadratic Bezier curves in geographical coordinates.

   01 -> 02: high arc through northern Asia
   02 -> 01: direct straight line
   01 -> 03: deep arc south of the Arabian Peninsula

   Arrowheads follow the actual movement direction.
============================================================ */

function createCareerRoutes(map) {
  const routeLayers = [];

  function getLocation(id) {
    return careerLocations.find(item => item.id === id);
  }

  function calculateGeometry(journey) {
    const from = getLocation(journey.from);
    const to = getLocation(journey.to);

    if (!from || !to) return null;

    const start = from.coordinates;
    const end = to.coordinates;

    const points = [];

    const count = 100;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const u = 1 - t;

      let lat;
      let lng;

      if (journey.style === 'straight') {
        lat = start[0] + (end[0] - start[0]) * t;
        lng = start[1] + (end[1] - start[1]) * t;
      } else {
        const control = journey.control;

        lat =
          u * u * start[0] +
          2 * u * t * control[0] +
          t * t * end[0];

        lng =
          u * u * start[1] +
          2 * u * t * control[1] +
          t * t * end[1];
      }

      points.push(L.latLng(lat, lng));
    }

    /*
       Arrow positioned at approximately 65% of route.

       Compute the direction using map pixel coordinates,
       ensuring the arrow faces the destination.
    */

    const centerIndex = 65;
    const previous = map.latLngToLayerPoint(
      points[centerIndex - 2]
    );

    const next = map.latLngToLayerPoint(
      points[centerIndex + 2]
    );

    const center = map.latLngToLayerPoint(
      points[centerIndex]
    );

    const dx = next.x - previous.x;
    const dy = next.y - previous.y;

    const distance = Math.hypot(dx, dy);

    if (distance < 0.001) {
      return { points, arrow: [] };
    }

    const ux = dx / distance;
    const uy = dy / distance;

    const nx = -uy;
    const ny = ux;

    const length = 18;
    const width = 7;

    const tip = L.point(
      center.x + ux * length / 2,
      center.y + uy * length / 2
    );

    const base = L.point(
      center.x - ux * length / 2,
      center.y - uy * length / 2
    );

    const left = L.point(
      base.x + nx * width,
      base.y + ny * width
    );

    const right = L.point(
      base.x - nx * width,
      base.y - ny * width
    );

    const arrow = [tip, left, right].map(point =>
      map.layerPointToLatLng(point)
    );

    return { points, arrow };
  }

  careerJourneys.forEach(journey => {
    const background = L.polyline([], {
      color: '#ffffff',
      weight: 6,
      opacity: 0.9,
      interactive: false,
      smoothFactor: 0
    }).addTo(map);

    const route = L.polyline([], {
      color: journey.color,
      weight: 3,
      opacity: 0.98,
      dashArray: journey.dashArray,
      lineCap: 'round',
      interactive: false,
      smoothFactor: 0
    }).addTo(map);

    const arrow = L.polygon([], {
      color: '#ffffff',
      weight: 1.5,
      fillColor: journey.color,
      fillOpacity: 1,
      interactive: false,
      smoothFactor: 0
    }).addTo(map);

    routeLayers.push({
      journey,
      background,
      route,
      arrow
    });
  });

  function updateRoutes() {
    routeLayers.forEach(item => {
      const geometry = calculateGeometry(item.journey);

      if (!geometry) return;

      item.background.setLatLngs(geometry.points);
      item.route.setLatLngs(geometry.points);
      item.arrow.setLatLngs(geometry.arrow);
    });
  }

  map.on('zoomend viewreset resize', updateRoutes);

  updateRoutes();

  return { update: updateRoutes };
}


/* ============================================================
   11. INITIALIZE CAREER MAP
============================================================ */

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


  function createNumberedIcon(number, active = false) {
    return L.divIcon({
      className: 'career-marker-wrapper',
      html:
        '<div class="career-marker-numbered' +
        (active ? ' active' : '') +
        '">' + number + '</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -23]
    });
  }


  function selectLocation(id, moveMap = true) {
    const location = careerLocations.find(
      item => item.id === id
    );

    const marker = markers[id];

    if (!location || !marker) return;

    careerLocations.forEach(item => {
      markers[item.id].setIcon(
        createNumberedIcon(
          item.number,
          item.id === id
        )
      );
    });

    cards.forEach(card => {
      const active = card.dataset.location === id;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', String(active));
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


  const careerRoutes = createCareerRoutes(map);


  function showEntireJourney() {
    map.invalidateSize();

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 5,
      animate: false
    });

    careerRoutes.update();
  }

  showEntireJourney();


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
    careerRoutes.update();
  });

  requestAnimationFrame(showEntireJourney);

  setTimeout(showEntireJourney, 350);
}


/* ============================================================
   12. START MAP AND CAREER SUMMARY
============================================================ */

async function startCareerMap() {
  if (!mapContainer) return;

  installCareerMapStyles();
  addCareerJourneySummary();

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
