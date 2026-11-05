
'use strict';

/* ==========================================================
   MOHAMMED BURHANUDDEEN R.
   PROFESSIONAL ENGINEERING PORTFOLIO

   Features:
   - Mobile navigation
   - Automatic copyright year
   - Original PDF resume download
   - Interactive global career map
   - Numbered location markers
   - Curved directional career paths
   - Interactive location cards
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

   The original resume PDF is never modified.

   Keep exactly one PDF inside assets/cv/.
   Its filename may change whenever you update it.
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

   Approximate geographical coordinates.
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
   5. LEAFLET FALLBACK LOADER

   Normally Leaflet is loaded by index.html.
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
   6. CAREER MAP STYLES

   These styles apply only to the career map.
   No changes to styles.css are required.
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

    #career-map .career-route {
      pointer-events: none;
    }

    #career-map .career-route-arrow {
      pointer-events: none;
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

   Displays OpenStreetMap if Leaflet is unavailable.
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
   8. CURVED GEOGRAPHICAL PATHS

   Uses quadratic Bezier curves.

   Each path is generated from geographic coordinates
   and recalculated as the map zooms or moves.

   The curve is visual career progression,
   not an actual travel route.
========================================================== */

function createCurvedCareerRoute(map, locations) {

  const svgNS = 'http://www.w3.org/2000/svg';

  const overlay = L.svg({
    padding: 0.5,
    interactive: false
  }).addTo(map);

  const renderer = overlay._container;

  if (!renderer) return;

  const routeGroup = document.createElementNS(svgNS, 'g');

  routeGroup.setAttribute('class', 'career-route');
  renderer.appendChild(routeGroup);

  const segments = [];

  function createSVGElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNS, tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });

    return element;
  }

  for (let i = 0; i < locations.length - 1; i++) {

    const background = createSVGElement('path', {
      fill: 'none',
      stroke: '#ffffff',
      'stroke-width': 6,
      'stroke-linecap': 'round',
      opacity: 0.9
    });

    const route = createSVGElement('path', {
      fill: 'none',
      stroke: '#377eaa',
      'stroke-width': 3,
      'stroke-dasharray': '8 9',
      'stroke-linecap': 'round',
      opacity: 0.95
    });

    const arrow = createSVGElement('path', {
      fill: '#377eaa',
      stroke: '#ffffff',
      'stroke-width': 1.5,
      'stroke-linejoin': 'round',
      class: 'career-route-arrow'
    });

    routeGroup.appendChild(background);
    routeGroup.appendChild(route);
    routeGroup.appendChild(arrow);

    segments.push({
      start: locations[i],
      end: locations[i + 1],
      background,
      route,
      arrow,
      index: i
    });
  }

  function updateRoutes() {

    segments.forEach(segment => {

      const start = map.latLngToLayerPoint(
        segment.start.coordinates
      );

      const end = map.latLngToLayerPoint(
        segment.end.coordinates
      );

      const dx = end.x - start.x;
      const dy = end.y - start.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) return;

      const midpointX = (start.x + end.x) / 2;
      const midpointY = (start.y + end.y) / 2;

      const normalX = -dy / distance;
      const normalY = dx / distance;

      /*
         Curve direction:
         First segment curves northward.
         Second segment curves eastward.

         The curvature scales with map distance.
      */

      const curveAmount = Math.min(
        Math.max(distance * 0.18, 25),
        110
      );

      const direction = segment.index === 0 ? -1 : 1;

      const controlX =
        midpointX + normalX * curveAmount * direction;

      const controlY =
        midpointY + normalY * curveAmount * direction;

      const pathData =
        `M ${start.x} ${start.y} ` +
        `Q ${controlX} ${controlY} ${end.x} ${end.y}`;

      segment.background.setAttribute('d', pathData);
      segment.route.setAttribute('d', pathData);

      /*
         Arrowhead positioned at 75% of the curve.
         Its direction follows the curve tangent.
      */

      const t = 0.75;
      const oneMinusT = 1 - t;

      const arrowX =
        oneMinusT * oneMinusT * start.x +
        2 * oneMinusT * t * controlX +
        t * t * end.x;

      const arrowY =
        oneMinusT * oneMinusT * start.y +
        2 * oneMinusT * t * controlY +
        t * t * end.y;

      const tangentX =
        2 * oneMinusT * (controlX - start.x) +
        2 * t * (end.x - controlX);

      const tangentY =
        2 * oneMinusT * (controlY - start.y) +
        2 * t * (end.y - controlY);

      const tangentLength = Math.sqrt(
        tangentX * tangentX + tangentY * tangentY
      );

      if (tangentLength < 1) return;

      const unitX = tangentX / tangentLength;
      const unitY = tangentY / tangentLength;

      const perpendicularX = -unitY;
      const perpendicularY = unitX;

      const arrowLength = 15;
      const arrowWidth = 7;

      const tipX = arrowX + unitX * arrowLength / 2;
      const tipY = arrowY + unitY * arrowLength / 2;

      const baseX = arrowX - unitX * arrowLength / 2;
      const baseY = arrowY - unitY * arrowLength / 2;

      const leftX = baseX + perpendicularX * arrowWidth;
      const leftY = baseY + perpendicularY * arrowWidth;

      const rightX = baseX - perpendicularX * arrowWidth;
      const rightY = baseY - perpendicularY * arrowWidth;

      const arrowData =
        `M ${tipX} ${tipY} ` +
        `L ${leftX} ${leftY} ` +
        `L ${rightX} ${rightY} Z`;

      segment.arrow.setAttribute('d', arrowData);

    });
  }

  map.on('moveend zoomend resize viewreset', updateRoutes);

  requestAnimationFrame(updateRoutes);

  return {
    update: updateRoutes
  };
}


/* ==========================================================
   9. INITIALIZE INTERACTIVE CAREER MAP
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


  /* ========================================================
     NUMBERED MARKER ICONS
  ======================================================== */

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


  /* ========================================================
     LOCATION SELECTION
  ======================================================== */

  function selectLocation(id, moveMap = true) {

    const location = careerLocations.find(
      item => item.id === id
    );

    const marker = markers[id];

    if (!location || !marker) return;

    careerLocations.forEach(item => {
      const active = item.id === id;

      markers[item.id].setIcon(
        createNumberedIcon(item.number, active)
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


  /* ========================================================
     ADD MARKERS AND POPUPS
  ======================================================== */

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


  /* ========================================================
     ADD CURVED DIRECTIONAL PATHS
  ======================================================== */

  const careerRoute = createCurvedCareerRoute(
    map,
    careerLocations
  );


  /* ========================================================
     SHOW COMPLETE JOURNEY
  ======================================================== */

  function showEntireJourney() {

    map.invalidateSize();

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 5,
      animate: false
    });

    if (careerRoute) {
      careerRoute.update();
    }
  }

  showEntireJourney();


  /* ========================================================
     LOCATION CARD INTERACTIONS
  ======================================================== */

  cards.forEach(card => {

    card.addEventListener('click', () => {

      selectLocation(
        card.dataset.location,
        true
      );

      if (window.innerWidth <= 760) {
        mapContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

    });

  });


  /* ========================================================
     RESIZE AND INITIAL RENDER
  ======================================================== */

  window.addEventListener('resize', () => {
    map.invalidateSize();

    if (careerRoute) {
      careerRoute.update();
    }
  });

  requestAnimationFrame(() => {
    showEntireJourney();
  });

  setTimeout(() => {
    showEntireJourney();
  }, 350);

}


/* ==========================================================
   10. START MAP
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
