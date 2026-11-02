const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const isOpen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.textContent = isOpen ? '✕' : '☰';
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = '☰';
}));
document.getElementById('year').textContent = new Date().getFullYear();


// Find the single, original PDF in assets/cv/ by its current filename.
// Works when you replace the PDF with a new dated filename.
document.querySelectorAll('.resume-download').forEach(link => {
  link.addEventListener('click', async event => {
    event.preventDefault();
    const originalLabel = link.textContent;
    link.textContent = 'Finding resume…';
    try {
      const response = await fetch('https://api.github.com/repos/metallurgist/metallurgist.github.io/contents/assets/cv', {cache: 'no-store'});
      if (!response.ok) throw new Error('Could not access the public resume folder');
      const entries = await response.json();
      const pdfs = entries.filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.pdf'));
      if (pdfs.length !== 1) throw new Error('Expected exactly one PDF in assets/cv; found ' + pdfs.length);
      const filename = pdfs[0].name;
      const downloadUrl = new URL('assets/cv/' + encodeURIComponent(filename), window.location.href);
      const a = document.createElement('a');
      a.href = downloadUrl.href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert('Resume download unavailable: ' + error.message + '. Please try again shortly.');
    } finally {
      link.textContent = originalLabel;
    }
  });
});
