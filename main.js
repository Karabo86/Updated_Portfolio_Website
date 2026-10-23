/* Karabo Magazi portfolio: small, dependency-free enhancements */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0B1620' : '#F6F8F8');
  }
  applyTheme(root.getAttribute('data-theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage may be blocked */ }
    });
  }

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById('site-nav');
  var navBtn = document.getElementById('nav-toggle');

  function setNav(open) {
    if (!nav || !navBtn) return;
    nav.classList.toggle('open', open);
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (navBtn) {
    navBtn.addEventListener('click', function () {
      setNav(navBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
  }

  /* ---------- Highlight the current section in the nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.removeAttribute('aria-current');
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Dialogs (case studies) ---------- */
  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-dialog]');
    if (opener) {
      openDialog(document.getElementById(opener.getAttribute('data-open-dialog')));
      return;
    }
    var closer = e.target.closest('[data-close]');
    if (closer) {
      var dlg = closer.closest('dialog');
      if (dlg) dlg.close();
      return;
    }
    // Click on the backdrop (the dialog element itself) closes it
    if (e.target.tagName === 'DIALOG') e.target.close();
  });

  /* ---------- Screenshot lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbCap = document.getElementById('lightbox-caption');
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var current = 0;

  function showShot(i) {
    if (!shots.length) return;
    current = (i + shots.length) % shots.length;
    var btn = shots[current];
    var img = btn.querySelector('img');
    var cap = btn.parentElement.querySelector('figcaption');
    lbImg.src = btn.getAttribute('data-full');
    lbImg.alt = img ? img.alt : '';
    lbCap.textContent = cap ? cap.textContent : '';
  }

  shots.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      showShot(i);
      openDialog(lb);
    });
  });
  var prev = document.getElementById('lb-prev');
  var next = document.getElementById('lb-next');
  if (prev) prev.addEventListener('click', function () { showShot(current - 1); });
  if (next) next.addEventListener('click', function () { showShot(current + 1); });
  if (lb) {
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showShot(current - 1);
      if (e.key === 'ArrowRight') showShot(current + 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var EMAIL = 'karabonompendulo86@gmail.com';

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please fill in your name, a valid email address and a message.';
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();

      if (!endpoint) {
        // No form service connected yet: open the visitor's email app instead of faking a send.
        var subject = encodeURIComponent('Portfolio enquiry from ' + data.get('name'));
        var body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + ' (' + data.get('email') + ')');
        status.textContent = 'Opening your email app with your message. If nothing opens, email ' + EMAIL + ' directly.';
        window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
        return;
      }

      status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          status.textContent = 'Message sent. Thank you, I will reply by email.';
        })
        .catch(function () {
          status.textContent = 'The message could not be sent. Please email ' + EMAIL + ' directly.';
        });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
