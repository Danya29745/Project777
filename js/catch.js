(function () {
  'use strict';

  var API = 'https://rybalka-catch.bothost.tech';
  // Минимум карточек в карусели: недостающие занимают заглушки «Здесь может быть ваше фото».
  var MIN_SLOTS = 6;

  var root = document.getElementById('catchRoot');
  if (!root) return;

  var track = root.querySelector('.catch-track');
  var empty = root.querySelector('.catch-empty');
  var counter = root.querySelector('.catch-counter');
  var prevBtn = root.querySelector('.catch-nav--prev');
  var nextBtn = root.querySelector('.catch-nav--next');
  var tabs = root.querySelectorAll('[data-range]');
  var items = [];
  var range = 'today';

  function mskToday() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(new Date());
  }

  function addDays(iso, n) {
    var p = iso.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)).toISOString().slice(0, 10);
  }

  function inRange(date, r) {
    var t = mskToday();
    if (r === 'today') return date === t;
    if (r === 'yesterday') return date === addDays(t, -1);
    return date >= addDays(t, -6) && date <= t;
  }

  function shortDate(iso) {
    return iso.split('-').reverse().slice(0, 2).join('.');
  }

  // Подпись администратора: первая буква заглавная, остальное как написано.
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function updateCounts() {
    tabs.forEach(function (tab) {
      var r = tab.getAttribute('data-range');
      var n = items.filter(function (it) { return inRange(it.date, r); }).length;
      tab.querySelector('.catch-count').textContent = n ? String(n) : '';
    });
  }

  function currentList() {
    return items.filter(function (it) { return inRange(it.date, range); });
  }

  function updateNav() {
    var total = track.children.length;
    if (!total) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    var max = track.scrollWidth - track.clientWidth;
    var atStart = track.scrollLeft <= 4;
    var atEnd = track.scrollLeft >= max - 4;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd || max <= 0;
  }

  function render() {
    track.textContent = '';
    var list = currentList();
    empty.hidden = true;
    updateCounts();

    list.forEach(function (it) {
      var fig = document.createElement('figure');
      fig.className = 'catch-item';

      var a = document.createElement('a');
      a.href = API + '/media/' + it.image;
      a.target = '_blank';
      a.rel = 'noopener';

      var img = document.createElement('img');
      img.src = API + '/media/' + it.thumb;
      img.alt = it.caption ? capitalize(it.caption) : 'Фото улова';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 640;
      img.height = 480;
      a.appendChild(img);
      fig.appendChild(a);

      if (it.caption || range === 'week') {
        var cap = document.createElement('figcaption');
        if (it.caption) {
          var text = document.createElement('span');
          text.className = 'catch-text';
          text.textContent = capitalize(it.caption);
          cap.appendChild(text);
        }
        if (range === 'week') {
          var meta = document.createElement('span');
          meta.className = 'catch-meta';
          meta.textContent = shortDate(it.date);
          cap.appendChild(meta);
        }
        fig.appendChild(cap);
      }

      track.appendChild(fig);
    });

    for (var n = list.length; n < MIN_SLOTS; n++) {
      var ph = document.createElement('figure');
      ph.className = 'catch-item catch-item--placeholder';
      var phImg = document.createElement('img');
      phImg.src = 'images/catch/placeholder.webp';
      phImg.srcset = 'images/catch/placeholder-640.webp 640w, images/catch/placeholder.webp 960w';
      phImg.sizes = '(max-width:760px) 74vw, 330px';
      phImg.alt = 'Здесь может быть ваше фото';
      phImg.loading = 'lazy';
      phImg.decoding = 'async';
      phImg.width = 640;
      phImg.height = 480;
      ph.appendChild(phImg);
      track.appendChild(ph);
    }

    track.scrollLeft = 0;
    updateNav();
  }

  function step(dir) {
    var card = track.children[0];
    if (!card) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' });
  }

  function load() {
    fetch(API + '/api/feed')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        items = Array.isArray(data) ? data : [];
        render();
      })
      .catch(function () {
        if (!items.length) empty.hidden = false;
      });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      range = tab.getAttribute('data-range');
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      render();
    });
  });

  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  track.addEventListener('scroll', updateNav, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  window.addEventListener('resize', updateNav);

  render();
  load();
  setInterval(load, 60000);
})();
