
'use strict';

/* ============================================================
   MOHAMMED BURHANUDDEEN R. — PROFESSIONAL PORTFOLIO

   Global engineering journey:
   Chennai -> Villarzana -> Chennai -> Jeddah

   Features:
   - Mobile navigation
   - Automatic copyright year
   - Original PDF resume download
   - Interactive Leaflet map
   - Numbered location markers
   - Three curved directional journeys
   - Interactive location cards
   - Professional career journey explanation
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

   Keep exactly one original PDF inside assets/cv/.
   The filename may change when you update the resume.
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
      alert(
        'Resume download unavailable: ' +
        error.message
      );
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
      'Heavy open-die forging, metallurgy, quality assurance and heat treatment. Returned here after the Italy assignment and continued working before moving to Saudi Arabia.',
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
   5. CAREER JOURNEY ROUTES

   Curve design:

   1. Chennai -> Villarzana
      Upper/northern curve

   2. Villarzana -> Chennai
      Lower/southern return curve

   3. Chennai -> Jeddah
      Separate curve toward Saudi Arabia

   Routes illustrate career movements, not actual flights.
============================================================ */

const careerJourneys = [
  {
    id: 'india-to-italy',
    from: 'chennai',
    to: 'villarzana',
    color: '#377eaa',
    bend: 0.30
  },
  {
    id: 'italy-to-india',
    from: 'villarzana',
    to: 'chennai',
    color: '#629bbd',
    bend: 0.18
  },
  {
    id: 'india-to-saudi',
    from: 'chennai',
    to: 'jeddah',
    color: '#16709d',
    bend: 0.15
  }
];

const mapContainer = document.getElementById('career-map');


/* ============================================================
   6. CAREER MAP STYLES
============================================================ */

function installCareerMapStyles() {
  if (document.getElementById('career-map-styles-v6')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'career-map-styles-v6';

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
   7. ADD PROFESSIONAL CAREER SUMMARY

   Automatically inserted below the map section.
   No HTML edits required.
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

  const stageNames = [
    'Chennai',
    'Villarzana',
    'Chennai',
    'Jeddah'
  ];

  stageNames.forEach((name, index) => {
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


/* ============================================================
   10. CREATE CURVED DIRECTIONAL ROUTES

   Curves use quadratic Bezier geometry.
   Arrowheads are oriented from start to destination.

   Separate bend values keep the return journey distinct.
============================================================ */

function createCareerRoutes(map) {
  const routeLayers = [];

  function getLocation(id) {
    return careerLocations.find(item => item.id === id);
  }

  function calculateCurve(journey) {
    const from = getLocation(journey.from);
    const to = getLocation(journey.to);

    if (!from || !to) return null;

    const start = map.latLngToLayerPoint(from.coordinates);
    const end = map.latLngToLayerPoint(to.coordinates);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 1) return null;

    const normalX = -dy / distance;
    const normalY = dx / distance;

    const bendDistance = Math.min(
      Math.abs(journey.bend) * distance,
      150
    );

    const sign = Math.sign(journey.bend);

    const control = L.point(
      (start.x + end.x) / 2 +
        normalX * bendDistance * sign,
      (start.y + end.y) / 2 +
        normalY * bendDistance * sign
    );

    function pointAt(t) {
      const u = 1 - t;

      return L.point(
        u * u * start.x +
          2 * u * t * control.x +
          t * t * end.x,

        u * u * start.y +
          2 * u * t * control.y +
          t * t * end.y
      );
    }

    const points = [];

    for (let i = 0; i <= 80; i++) {
      points.push(
        map.layerPointToLatLng(pointAt(i / 80))
      );
    }

    const before = pointAt(0.70);
    const after = pointAt(0.74);
    const arrowCenter = pointAt(0.72);

    const arrowDX = after.x - before.x;
    const arrowDY = after.y - before.y;
    const arrowDistance = Math.hypot(
      arrowDX,
      arrowDY
    );

    if (arrowDistance < 0.001) {
      return { points, arrow: [] };
    }

    const unitX = arrowDX / arrowDistance;
    const unitY = arrowDY / arrowDistance;

    const normalArrowX = -unitY;
    const normalArrowY = unitX;

    const arrowLength = 17;
    const arrowWidth = 7;

    const tip = L.point(
      arrowCenter.x + unitX * arrowLength / 2,
      arrowCenter.y + unitY * arrowLength / 2
    );

    const base = L.point(
      arrowCenter.x - unitX * arrowLength / 2,
      arrowCenter.y - unitY * arrowLength / 2
    );

    const left = L.point(
      base.x + normalArrowX * arrowWidth,
      base.y + normalArrowY * arrowWidth
    );

    const right = L.point(
      base.x - normalArrowX * arrowWidth,
      base.y - normalArrowY * arrowWidth
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
      opacity: 0.85,
      interactive: false,
      smoothFactor: 0
    }).addTo(map);

    const route = L.polyline([], {
      color: journey.color,
      weight: 3,
      opacity: 0.95,
      dashArray: '8, 9',
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
      const geometry = calculateCurve(item.journey);

      if (!geometry) return;

      item.background.setLatLngs(geometry.points);
      item.route.setLatLngs(geometry.points);
      item.arrow.setLatLngs(geometry.arrow);
    });
  }

  map.on('zoomend viewreset resize', updateRoutes);

  updateRoutes();

  return {
    update: updateRoutes
  };
}


/* ============================================================
   11. INITIALIZE INTERACTIVE CAREER MAP
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


  /* NUMBERED MARKERS */

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


  /* LOCATION SELECTION */

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


  /* CREATE MARKERS AND POPUPS */

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

    popup.append(
      heading,
      company,
      description
    );

    marker.bindPopup(popup);

    marker.on('click', () => {
      selectLocation(location.id, false);
    });

    markers[location.id] = marker;
    bounds.extend(location.coordinates);
  });


  /* ADD THREE CAREER JOURNEYS */

  const careerRoutes = createCareerRoutes(map);


  /* SHOW ALL THREE COUNTRIES */

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


  /* INTERACTIVE LOCATION CARDS */

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


  /* RESPONSIVE MAP */

  window.addEventListener('resize', () => {
    map.invalidateSize();
    careerRoutes.update();
  });

  requestAnimationFrame(showEntireJourney);

  setTimeout(showEntireJourney, 350);
}


/* ============================================================
   12. START THE MAP AND ADD JOURNEY SUMMARY
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
    console.error(
      'Career map initialization failed:',
      error
    );

    showFallbackMap();
  }
}

startCareerMap();
