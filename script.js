
'use strict';

/* ============================================================
   MOHAMMED BURHANUDDEEN R. — PORTFOLIO

   Includes:
   1. Mobile navigation
   2. Copyright year
   3. Original PDF resume download
   4. Company logos on career cards
   5. Interactive Leaflet map
   6. Curved and straight career routes
   7. Directional arrows
   8. Career journey summary

   Map sequence:
   Chennai -> Villamarzana -> Chennai -> Jeddah
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

   Your original PDF remains unchanged.

   Keep exactly one PDF inside assets/cv/.
   The downloader automatically discovers its filename.
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
        throw new Error('Could not access resume folder');
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

      const anchor = document.createElement('a');

      anchor.href = downloadUrl.href;
      anchor.download = filename;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

    } catch (error) {
      alert('Resume download unavailable: ' + error.message);
    } finally {
      link.textContent = originalLabel;
    }
  });
});


/* ============================================================
   4. COMPANY LOGO CONFIGURATION

   Both image files are stored in your GitHub repository:

   assets/logos/fomas-group.png
   assets/logos/aims-holding.png

   Chennai      -> FOMAS
   Villamarzana -> FOMAS
   Jeddah       -> AIMS Holding
============================================================ */

const companyLogos = {
  chennai: {
    src: 'assets/logos/fomas-group.png',
    alt: 'FOMAS Group logo',
    className: 'logo-fomas'
  },

  villarzana: {
    src: 'assets/logos/fomas-group.png',
    alt: 'FOMAS Group logo',
    className: 'logo-fomas'
  },

  jeddah: {
    src: 'assets/logos/aims-holding.png',
    alt: 'AIMS Holding logo',
    className: 'logo-aims'
  }
};


/* ============================================================
   5. CAREER LOCATIONS
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
    name: 'Villamarzana, Italy',
    company: 'ASFO S.p.A. · FOMAS Group',
    description:
      'International engineering training and industrial work experience, followed by a return to Chennai.',
    coordinates: [45.02, 11.69]
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
   6. CAREER ROUTES

   01 -> 02 : High upward curve
   02 -> 01 : Straight diagonal return
   01 -> 03 : Deep downward curve

   These lines illustrate career transitions,
   not literal flight paths.
============================================================ */

const careerJourneys = [
  {
    id: 'chennai-to-italy',
    from: 'chennai',
    to: 'villarzana',
    color: '#377eaa',
    style: 'curve',
    control: [73, 57],
    dashArray: '9, 8'
  },

  {
    id: 'italy-to-chennai',
    from: 'villarzana',
    to: 'chennai',
    color: '#7ba8c5',
    style: 'straight',
    dashArray: '7, 9'
  },

  {
    id: 'chennai-to-jeddah',
    from: 'chennai',
    to: 'jeddah',
    color: '#176c9b',
    style: 'curve',
    control: [2, 55],
    dashArray: '9, 8'
  }
];

const mapContainer = document.getElementById('career-map');


/* ============================================================
   7. INSTALL STYLES

   Company logos:
   - Top-right position
   - Original aspect ratio preserved
   - Responsive dimensions
   - White FOMAS logo background
   - Dark AIMS logo background

   Map styles:
   - Numbered markers
   - Active states
   - Popups
============================================================ */

function installPortfolioStyles() {
  if (document.getElementById('portfolio-career-styles')) {
    return;
  }

  const style = document.createElement('style');

  style.id = 'portfolio-career-styles';

  style.textContent = `

    /* COMPANY CARDS */

    .location-card {
      position: relative;
      padding-right: 125px !important;
      overflow: hidden;
    }

    .career-company-logo {
      position: absolute;
      top: 24px;
      right: 22px;

      width: 88px;
      height: 76px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;
      overflow: hidden;

      border: 1px solid #e4e9ef;
      background: #ffffff;

      box-shadow: 0 3px 12px rgba(16,29,48,.05);

      pointer-events: none;
    }

    .career-company-logo img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .career-company-logo.logo-fomas {
      background: #ffffff;
      padding: 5px;
    }

    .career-company-logo.logo-aims {
      background: #202020;
      padding: 0;
    }

    .career-company-logo.logo-aims img {
      object-fit: contain;
    }

    .location-card.active {
      border-color: #377eaa;
      background: #f7fbff;
      box-shadow: 0 8px 25px rgba(55,126,170,.16);
    }

    /* CAREER MAP */

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

    /* POPUPS */

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

    /* CAREER SUMMARY */

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

    /* RESPONSIVE COMPANY LOGOS */

    @media (max-width: 760px) {

      .location-card {
        padding-right: 103px !important;
      }

      .career-company-logo {
        width: 68px;
        height: 62px;

        top: 18px;
        right: 15px;

        border-radius: 8px;
      }

    }

    @media (max-width: 390px) {

      .location-card {
        padding-right: 88px !important;
      }

      .career-company-logo {
        width: 58px;
        height: 54px;
        right: 12px;
      }

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
   8. ADD COMPANY LOGOS TO EXISTING CARDS

   Does not replace or rewrite the cards.
   Preserves their existing text and click behavior.
============================================================ */

function installCompanyLogos() {
  const cards = document.querySelectorAll('.location-card');

  cards.forEach(card => {
    const id = card.dataset.location;
    const config = companyLogos[id];

    if (!config) return;

    if (card.querySelector('.career-company-logo')) {
      return;
    }

    const logoBox = document.createElement('div');

    logoBox.className =
      'career-company-logo ' + config.className;

    const image = document.createElement('img');

    image.src = config.src;
    image.alt = config.alt;

    image.loading = 'lazy';
    image.decoding = 'async';

    image.onerror = () => {
      console.warn(
        'Could not load company logo:',
        config.src
      );

      logoBox.style.display = 'none';
    };

    logoBox.appendChild(image);
    card.appendChild(logoBox);
  });
}


/* ============================================================
   9. CORRECT ITALIAN LOCATION LABELS

   Updates only the displayed spelling.
   Keeps data-location="villarzana" for compatibility.
============================================================ */

function correctItalianLocationName() {
  const italyCard = document.querySelector(
    '.location-card[data-location="villarzana"]'
  );

  if (!italyCard) return;

  const walker = document.createTreeWalker(
    italyCard,
    NodeFilter.SHOW_TEXT
  );

  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach(node => {
    node.nodeValue = node.nodeValue.replace(
      /\bVillarzana\b/g,
      'Villamarzana'
    );
  });
}


/* ============================================================
   10. CAREER JOURNEY SUMMARY
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
    'Villamarzana',
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

  heading.textContent =
    'My international engineering journey: ';

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
   11. LOAD LEAFLET IF NECESSARY
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
      console.warn(
        'Leaflet source unavailable:',
        error
      );
    }
  }

  return false;
}


/* ============================================================
   12. FALLBACK MAP
============================================================ */

function showFallbackMap() {
  if (!mapContainer) return;

  mapContainer.replaceChildren();

  const iframe = document.createElement('iframe');

  iframe.title =
    'Geographical map of engineering experience';

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
   13. CREATE CAREER ROUTES

   Preserves the approved route geometry.

   Curved routes use quadratic Bezier interpolation.
   Straight return uses linear interpolation.

   Arrowheads are aligned with travel direction.
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
        lat =
          start[0] +
          (end[0] - start[0]) * t;

        lng =
          start[1] +
          (end[1] - start[1]) * t;
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

    /* DIRECTIONAL ARROW */

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
      return {
        points,
        arrow: []
      };
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


  /* CREATE ROUTE LAYERS */

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


  /* UPDATE ROUTES WHEN MAP CHANGES */

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

  return {
    update: updateRoutes
  };
}


/* ============================================================
   14. INITIALIZE INTERACTIVE MAP
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


  /* NUMBERED LOCATION ICONS */

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


  /* MARKERS AND POPUPS */

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


  /* ROUTES */

  const careerRoutes = createCareerRoutes(map);


  /* DEFAULT VIEW */

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


  /* INTERACTIVE COMPANY CARDS */

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
   15. START PORTFOLIO FEATURES
============================================================ */

async function startCareerMap() {
  installPortfolioStyles();

  installCompanyLogos();

  correctItalianLocationName();

  addCareerJourneySummary();

  if (!mapContainer) return;

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
