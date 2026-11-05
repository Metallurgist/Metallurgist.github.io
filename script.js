
'use strict';

/* =====================================================
   MOBILE NAVIGATION
===================================================== */

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

/* =====================================================
   FOOTER YEAR
===================================================== */

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =====================================================
   ORIGINAL RESUME DOWNLOAD

   Keep exactly one PDF inside assets/cv/.
   The PDF filename can change whenever you update it.
===================================================== */

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
        throw new Error('Unexpected response from GitHub');
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

/* =====================================================
   GLOBAL ENGINEERING JOURNEY MAP
   Leaflet + OpenStreetMap
===================================================== */

const careerLocations = {
  chennai: {
    name: 'Chennai, India',
    company: 'Bay Forge Ltd · FOMAS Group',
    description: 'Heavy open-die forging, metallurgy, quality assurance and heat treatment.',
    coordinates: [13.0827, 80.2707]
  },

  villarzana: {
    name: 'Villarzana, Italy',
    company: 'ASFO S.p.A. · FOMAS Group',
    description: 'International engineering training and industrial work experience.',
    coordinates: [45.95, 11.93]
  },

  jeddah: {
    name: 'Jeddah, Saudi Arabia',
    company: 'ALIF · AIMS Group',
    description: 'Manufacturing quality, fastener production and quality analytics.',
    coordinates: [21.5433, 39.1728]
  }
};

const mapContainer = document.getElementById('career-map');

if (mapContainer) {

  if (typeof L === 'undefined') {
    mapContainer.textContent =
      'Interactive map is temporarily unavailable. Please try again later.';
  } else {

    const map = L.map('career-map', {
      scrollWheelZoom: false,
      zoomControl: true,
      worldCopyJump: true
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(map);

    const markers = {};
    const bounds = L.latLngBounds([]);

    const cards = document.querySelectorAll('.location-card');

    function createMarkerIcon(selected = false) {
      return L.divIcon({
        className: '',
        html: '<div class="career-marker' +
          (selected ? ' selected' : '') +
          '"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
    }

    function selectLocation(key, zoomToLocation = true) {

      const location = careerLocations[key];
      const marker = markers[key];

      if (!location || !marker) return;

      Object.keys(markers).forEach(markerKey => {
        markers[markerKey].setIcon(
          createMarkerIcon(markerKey === key)
        );
      });

      cards.forEach(card => {
        const active = card.dataset.location === key;

        card.classList.toggle('active', active);
        card.setAttribute('aria-pressed', String(active));
      });

      if (zoomToLocation) {
        map.flyTo(location.coordinates, 6, {
          animate: true,
          duration: 1.2
        });
      }

      marker.openPopup();
    }

    Object.entries(careerLocations).forEach(([key, location]) => {

      const marker = L.marker(
        location.coordinates,
        { icon: createMarkerIcon() }
      ).addTo(map);

      const popup = document.createElement('div');
      popup.className = 'career-map-popup';

      const title = document.createElement('strong');
      title.textContent = location.name;

      const company = document.createElement('span');
      company.textContent = location.company;

      const description = document.createElement('p');
      description.textContent = location.description;

      popup.append(title, company, description);

      marker.bindPopup(popup);

      marker.on('click', () => {
        selectLocation(key, false);
      });

      markers[key] = marker;
      bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
      padding: [45, 45],
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

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }
}
