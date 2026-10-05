(function () {
  'use strict';

  var API = 'https://rybalka-catch.bothost.tech';

  var root = document.getElementById('catchRoot');
  if (!root) return;

  var grid = root.querySelector('.catch-grid');
  var empty = root.querySelector('.catch-empty');
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
    return date >= addDays(t, -6) && date <= t; // последние 7 дней
  }

  function shortDate(iso) {
    return iso.split('-').reverse().slice(0, 2).join('.');
  }

  function updateCounts() {
    tabs.forEach(function (tab) {
      var r = tab.getAttribute('data-range');
      var n = items.filter(function (it) { return inRange(it.date, r); }).length;
      tab.querySelector('.catch-count').textContent = n ? String(n) : '';
    });
  }

  function render() {
    grid.textContent = '';
    var list = items.filter(function (it) { return inRange(it.date, range); });
    empty.hidden = list.length > 0;
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
      img.alt = it.caption || 'Фото улова';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 640;
      img.height = 480;
      a.appendChild(img);
      fig.appendChild(a);

      var cap = document.createElement('figcaption');
      if (it.caption) {
        var text = document.createElement('span');
        text.className = 'catch-text';
        text.textContent = it.caption;
        cap.appendChild(text);
        var meta = document.createElement('span');
        meta.className = 'catch-meta';
        meta.textContent = (range === 'week' ? shortDate(it.date) + ', ' : '') + 'отправлено в ' + it.time;
        cap.appendChild(meta);
      } else {
        var only = document.createElement('span');
        only.className = 'catch-text';
        only.textContent = (range === 'week' ? shortDate(it.date) + ', ' : '') + 'отправлено в ' + it.time;
        cap.appendChild(only);
      }
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
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

  load();
  setInterval(load, 60000);
})();
