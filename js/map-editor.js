/* Редактор меток карты. Работает только при открытии страницы с ?edit=1
   Публичные посетители его не загружают. После фиксации пресета этот файл и загрузчик в index.html удаляются. */
(function () {
  'use strict';
  var map = document.getElementById('territoryMap');
  if (!map || window.__mapEdit) return;
  window.__mapEdit = 1;

  var KEY = 'mapEditorState_v1';
  var ICON_DIR = './images/map-icons/', N_ICONS = 15;
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  var mq = window.matchMedia('(max-width:760px)');

  var state = [], base = [], sel = null, hist = [], linkOpts = [];

  function r2(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lsGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function lsDel() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ---------- состояние ---------- */
  function readDom() {
    return [].map.call(map.querySelectorAll('.map-marker'), function (m) {
      var img = m.querySelector('.map-pin img');
      var mt = img && /(\d+)\.png/.exec(img.getAttribute('src') || '');
      var lb = m.querySelector('.map-label');
      var cm = /map-marker--\w+/.exec(m.className);
      return {
        id: m.dataset.marker, cls: cm ? cm[0] : '',
        x: r2(parseFloat(m.style.left)), y: r2(parseFloat(m.style.top)),
        icon: mt ? +mt[1] : 1, label: lb ? lb.textContent.trim() : '', showLabel: true,
        sd: parseFloat(m.style.getPropertyValue('--s')) || 1,
        sm: parseFloat(m.style.getPropertyValue('--sm')) || 1,
        link: m.dataset.marker, name: m.getAttribute('aria-label') || ''
      };
    });
  }
  function normalize(a) {
    if (!Array.isArray(a)) throw new Error('нужен массив меток');
    return a.map(function (o, i) {
      if (typeof o.x !== 'number' || typeof o.y !== 'number') throw new Error('у метки ' + (i + 1) + ' нет x/y');
      return {
        id: String(o.id || ('m' + i + Date.now().toString(36))), cls: o.cls || '',
        x: r2(clamp(o.x, 0, 100)), y: r2(clamp(o.y, 0, 100)),
        icon: clamp(parseInt(o.icon, 10) || 1, 1, N_ICONS), label: String(o.label == null ? '' : o.label),
        showLabel: o.showLabel !== false, sd: +o.sd > 0 ? +o.sd : 1, sm: +o.sm > 0 ? +o.sm : 1,
        link: o.link || '', name: o.name || ''
      };
    });
  }
  function persist() { lsSet(JSON.stringify(state)); if (P && P.json && P.more.style.display !== 'none') P.json.value = exportJson(); }
  function push() { hist.push(JSON.stringify(state)); if (hist.length > 60) hist.shift(); }
  function undo() {
    if (!hist.length) return;
    state = JSON.parse(hist.pop());
    if (!cur()) sel = null;
    persist(); render(); refreshPanel();
  }
  function cur() { for (var i = 0; i < state.length; i++) if (state[i].id === sel) return state[i]; return null; }
  function byId(id) { for (var i = 0; i < state.length; i++) if (state[i].id === id) return state[i]; return null; }
  function exportJson() { return '[\n' + state.map(function (o) { return ' ' + JSON.stringify(o); }).join(',\n') + '\n]'; }

  /* ---------- метки на карте ---------- */
  function build(o) {
    var d = document.createElement('div');
    d.className = 'map-marker ' + (o.cls || 'map-marker--custom');
    d.dataset.eid = o.id;
    d.tabIndex = 0;
    d.setAttribute('role', 'button');
    d.innerHTML = '<div class="map-pin"><img alt="" draggable="false"></div><div class="map-label"></div>';
    apply(o, d);
    return d;
  }
  function apply(o, d) {
    d.dataset.marker = o.link || '';
    d.setAttribute('aria-label', o.name || ('Метка ' + o.label));
    d.style.left = o.x + '%';
    d.style.top = o.y + '%';
    d.style.setProperty('--s', o.sd);
    d.style.setProperty('--sm', o.sm);
    var img = d.querySelector('.map-pin img'), src = ICON_DIR + o.icon + '.png';
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    var lb = d.querySelector('.map-label');
    lb.textContent = o.label;
    d.classList.toggle('mapedit-nolabel', o.showLabel === false);
    d.classList.toggle('mapedit-sel', o.id === sel);
    lb.style.top = 'auto';
    lb.style.bottom = 'calc(100% + ' + (mq.matches ? 1 : 4) + 'px)';
    lb.style.left = '50%'; lb.style.right = 'auto'; lb.style.transform = 'translateX(-50%)';
    if (mq.matches) {
      if (o.x < 15) { lb.style.left = '0'; lb.style.transform = 'none'; }
      else if (o.x > 85) { lb.style.left = 'auto'; lb.style.right = '0'; lb.style.transform = 'none'; }
    }
  }
  function el(o) { return map.querySelector('[data-eid="' + o.id + '"]'); }
  function sync(o) { var d = el(o); if (d) apply(o, d); }
  function render() {
    [].forEach.call(map.querySelectorAll('.map-marker'), function (n) { n.remove(); });
    state.forEach(function (o) { map.appendChild(build(o)); });
  }
  function select(id) {
    sel = id;
    state.forEach(function (o) { var d = el(o); if (d) d.classList.toggle('mapedit-sel', o.id === sel); });
    refreshPanel();
  }

  /* ---------- перетаскивание ---------- */
  map.addEventListener('pointerdown', function (e) {
    var t = e.target.closest ? e.target.closest('.map-marker') : null;
    if (!t) { select(null); return; }
    var o = byId(t.dataset.eid); if (!o) return;
    e.preventDefault();
    select(o.id);
    var r = map.getBoundingClientRect();
    var offx = e.clientX - (r.left + o.x / 100 * r.width);
    var offy = e.clientY - (r.top + o.y / 100 * r.height);
    var moved = false;
    function mv(ev) {
      if (!moved) {
        if (Math.abs(ev.clientX - e.clientX) < 3 && Math.abs(ev.clientY - e.clientY) < 3) return;
        moved = true; push();
      }
      o.x = r2(clamp((ev.clientX - offx - r.left) / r.width * 100, 0, 100));
      o.y = r2(clamp((ev.clientY - offy - r.top) / r.height * 100, 0, 100));
      sync(o); refreshCoords();
    }
    function up() {
      document.removeEventListener('pointermove', mv);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      if (moved) persist();
    }
    document.addEventListener('pointermove', mv);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });

  /* ---------- стили редактора ---------- */
  var st = document.createElement('style');
  st.textContent =
    '.map-marker{cursor:grab!important;touch-action:none!important;-webkit-user-select:none;user-select:none}' +
    '.territory-map{touch-action:none!important;outline:2px dashed rgba(240,207,131,.7);outline-offset:-2px}' +
    '.map-marker.mapedit-sel{z-index:30!important}' +
    '.map-marker.mapedit-sel .map-pin{outline:2px dashed #f0cf83;outline-offset:3px}' +
    '.map-marker.mapedit-sel::after{content:"";position:absolute;left:50%;bottom:-3px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:#ff3b30;z-index:5}' +
    '.map-marker.mapedit-nolabel .map-label{opacity:.3}' +
    '.mapedit{position:fixed;left:0;right:0;bottom:0;z-index:2500;max-height:58vh;overflow:auto;background:#0f2622;color:#f4eddf;border-top:2px solid #cbab6c;padding:8px 10px 10px;font:12px/1.35 system-ui,sans-serif;box-shadow:0 -8px 30px rgba(0,0,0,.4)}' +
    '.mapedit,.mapedit *{box-sizing:border-box}' +
    '.mapedit button,.mapedit select,.mapedit input[type=text],.mapedit textarea{font:inherit;color:#f4eddf;background:#1c3b35;border:1px solid #4d6f64;border-radius:7px;padding:5px 8px;margin:0}' +
    '.mapedit button{cursor:pointer}' +
    '.mapedit button.on{background:#cbab6c;color:#17352e;border-color:#cbab6c}' +
    '.mapedit .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}' +
    '.mapedit .row>label{white-space:nowrap}' +
    '.mapedit input[type=range]{flex:1;min-width:90px;margin:0}' +
    '.mapedit .am{color:#f0cf83;font-weight:700}' +
    '.mapedit .val{min-width:42px;text-align:right}' +
    '.mapedit .icons{display:flex;gap:4px;overflow-x:auto;padding:2px 0;width:100%}' +
    '.mapedit .icons button{padding:2px;flex:0 0 auto;width:38px;height:32px}' +
    '.mapedit .icons img{width:100%;height:100%;object-fit:contain;display:block}' +
    '.mapedit textarea{width:100%;height:90px;font-family:monospace;font-size:10px}' +
    '.mapedit input[type=text]{width:70px}' +
    '.mapedit select{max-width:170px}' +
    '.mapedit .muted{opacity:.7}' +
    '.mapedit-phone{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center}' +
    '.mapedit-phone__frame{position:relative;width:390px;max-width:100%;height:min(844px,92vh);border:10px solid #111;border-radius:36px;overflow:hidden;background:#fff}' +
    '.mapedit-phone__frame iframe{width:100%;height:100%;border:0;display:block}' +
    '.mapedit-phone__x{position:absolute;right:18px;top:18px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#000;font-size:22px;cursor:pointer}';
  document.head.appendChild(st);

  /* ---------- панель ---------- */
  var P = {};
  var panel = document.createElement('div');
  panel.className = 'mapedit';
  panel.innerHTML =
    '<div class="row" style="margin-top:0">' +
      '<b>Редактор меток</b>' +
      '<button data-a="add">+ Метка</button>' +
      '<button data-a="undo">↶ Отмена</button>' +
      '<button data-a="phone" id="me_phone">📱 Как на телефоне</button>' +
      '<button data-a="more">⋯ Пресет</button>' +
      '<span class="muted" id="me_mode"></span>' +
    '</div>' +
    '<div id="me_none" class="row muted">Нажми на метку, чтобы выбрать. Тащи пальцем/мышкой, чтобы двигать. Красная точка — точка привязки метки к карте.</div>' +
    '<div id="me_sel">' +
      '<div class="row"><b id="me_title"></b><span class="muted" id="me_xy"></span></div>' +
      '<div class="row" id="me_rd"><label>💻 Компьютер</label><input type="range" id="me_sd" min="0.3" max="3" step="0.05"><span class="val" id="me_sdv"></span></div>' +
      '<div class="row" id="me_rm"><label>📱 Телефон</label><input type="range" id="me_sm" min="0.3" max="4" step="0.05"><span class="val" id="me_smv"></span></div>' +
      '<div class="row"><div class="icons" id="me_icons"></div></div>' +
      '<div class="row"><label>Номер/текст</label><input type="text" id="me_lab"><label><input type="checkbox" id="me_show"> показывать</label>' +
        '<label>Карточка</label><select id="me_link"></select></div>' +
      '<div class="row"><button data-a="dup">Дублировать</button><button data-a="del">Удалить</button><span class="muted">Стрелки на клавиатуре двигают метку (Shift — быстрее)</span></div>' +
    '</div>' +
    '<div id="me_more" style="display:none">' +
      '<div class="row"><button data-a="copy">Скопировать пресет</button><button data-a="dl">Скачать .json</button><button data-a="applyjson">Применить текст</button><button data-a="reset">Сбросить к исходному</button><button data-a="exit" id="me_exit">Выйти из редактора</button></div>' +
      '<div class="row"><textarea id="me_json" spellcheck="false"></textarea></div>' +
    '</div>';
  document.body.appendChild(panel);
  ['none', 'sel', 'title', 'xy', 'rd', 'rm', 'sd', 'sdv', 'sm', 'smv', 'icons', 'lab', 'show', 'link', 'more', 'json', 'mode', 'phone', 'exit'].forEach(function (k) { P[k] = panel.querySelector('#me_' + k); });

  function fit() { document.body.style.paddingBottom = (panel.offsetHeight + 8) + 'px'; }
  function refreshCoords() { var o = cur(); if (o) P.xy.textContent = 'x ' + o.x + '% · y ' + o.y + '%'; }
  function refreshPanel() {
    var o = cur();
    P.sel.style.display = o ? '' : 'none';
    P.none.style.display = o ? 'none' : '';
    P.mode.textContent = mq.matches ? 'режим: телефон' : 'режим: компьютер';
    P.rd.querySelector('label').classList.toggle('am', !mq.matches);
    P.rm.querySelector('label').classList.toggle('am', mq.matches);
    if (o) {
      P.title.textContent = '№ ' + o.label + (o.name ? ' · ' + o.name : '');
      P.sd.value = o.sd; P.sdv.textContent = o.sd.toFixed(2) + '×';
      P.sm.value = o.sm; P.smv.textContent = o.sm.toFixed(2) + '×';
      if (document.activeElement !== P.lab) P.lab.value = o.label;
      P.show.checked = o.showLabel !== false;
      P.link.value = o.link || '';
      [].forEach.call(P.icons.children, function (b) { b.classList.toggle('on', +b.dataset.i === o.icon); });
      refreshCoords();
    }
    fit();
  }

  /* список иконок и карточек */
  for (var i = 1; i <= N_ICONS; i++) {
    var b = document.createElement('button');
    b.dataset.i = i; b.dataset.a = 'icon'; b.title = 'Иконка ' + i;
    b.innerHTML = '<img src="' + ICON_DIR + i + '.png" alt="">';
    P.icons.appendChild(b);
  }
  function buildLinks() {
    P.link.innerHTML = '<option value="">— без карточки —</option>' + linkOpts.map(function (l) {
      return '<option value="' + esc(l.id) + '">' + esc(l.name || l.id) + '</option>';
    }).join('');
  }

  /* ---------- действия ---------- */
  function nextLabel() { var n = 0; state.forEach(function (o) { var v = parseInt(o.label, 10); if (v > n) n = v; }); return String(n + 1); }
  function uid() { return 'm' + Date.now().toString(36) + Math.floor(Math.random() * 99); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return fallbackCopy(t); });
    return Promise.resolve(fallbackCopy(t));
  }
  function fallbackCopy(t) { P.json.value = t; P.json.select(); try { return document.execCommand('copy'); } catch (e) { return false; } }
  function flash(btn, txt) { var o = btn.textContent; btn.textContent = txt; setTimeout(function () { btn.textContent = o; }, 1400); }

  function openPhone() {
    var url = location.href.split('#')[0].split('?')[0] + '?edit=1&phone=1#territory-map';
    var w = document.createElement('div');
    w.className = 'mapedit-phone';
    w.innerHTML = '<div class="mapedit-phone__frame"><button class="mapedit-phone__x" aria-label="Закрыть">×</button><iframe src="' + url + '"></iframe></div>';
    function close() { w.remove(); var s = lsGet(); if (s) { try { state = normalize(JSON.parse(s)); render(); refreshPanel(); } catch (e) {} } }
    w.querySelector('button').addEventListener('click', close);
    w.addEventListener('click', function (e) { if (e.target === w) close(); });
    document.body.appendChild(w);
  }

  panel.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.dataset.a, o = cur();
    if (a === 'add') {
      push();
      var n = { id: uid(), cls: '', x: 50, y: 50, icon: 1, label: nextLabel(), showLabel: true, sd: 1, sm: 1, link: '', name: '' };
      state.push(n); persist(); render(); select(n.id);
    } else if (a === 'undo') { undo(); }
    else if (a === 'phone') { openPhone(); }
    else if (a === 'more') { var open = P.more.style.display === 'none'; P.more.style.display = open ? '' : 'none'; if (open) P.json.value = exportJson(); fit(); }
    else if (a === 'icon' && o) { push(); o.icon = +t.dataset.i; persist(); sync(o); refreshPanel(); }
    else if (a === 'dup' && o) {
      push();
      var c = clone(o); c.id = uid(); c.x = r2(clamp(o.x + 3, 0, 100)); c.y = r2(clamp(o.y + 3, 0, 100)); c.label = nextLabel(); c.link = ''; c.name = '';
      state.push(c); persist(); render(); select(c.id);
    } else if (a === 'del' && o) {
      push(); state = state.filter(function (x) { return x.id !== o.id; }); sel = null; persist(); render(); refreshPanel();
    } else if (a === 'copy') { copyText(exportJson()).then(function (ok) { flash(t, ok ? 'Скопировано ✓' : 'Выдели текст ниже'); }); }
    else if (a === 'dl') {
      var blob = new Blob([exportJson()], { type: 'application/json' });
      var l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = 'map-preset.json';
      document.body.appendChild(l); l.click(); l.remove();
    } else if (a === 'applyjson') {
      try { var ns = normalize(JSON.parse(P.json.value)); push(); state = ns; sel = null; persist(); render(); refreshPanel(); flash(t, 'Применено ✓'); }
      catch (err) { alert('Не получилось прочитать пресет: ' + err.message); }
    } else if (a === 'reset') {
      if (!confirm('Сбросить все метки к тому, что сейчас зашито в сайте?')) return;
      push(); lsDel(); state = clone(base); sel = null; render(); refreshPanel();
    } else if (a === 'exit') { location.href = location.pathname + '#territory-map'; }
  });

  function bindRange(inp, key, out) {
    inp.addEventListener('pointerdown', push);
    inp.addEventListener('keydown', function () { push(); });
    inp.addEventListener('input', function () {
      var o = cur(); if (!o) return;
      o[key] = r2(+inp.value); out.textContent = o[key].toFixed(2) + '×'; sync(o); persist();
    });
  }
  bindRange(P.sd, 'sd', P.sdv);
  bindRange(P.sm, 'sm', P.smv);
  P.lab.addEventListener('focus', push);
  P.lab.addEventListener('input', function () { var o = cur(); if (!o) return; o.label = P.lab.value; P.title.textContent = '№ ' + o.label + (o.name ? ' · ' + o.name : ''); sync(o); persist(); });
  P.show.addEventListener('change', function () { var o = cur(); if (!o) return; push(); o.showLabel = P.show.checked; sync(o); persist(); });
  P.link.addEventListener('change', function () { var o = cur(); if (!o) return; push(); o.link = P.link.value; sync(o); persist(); });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      if (!(tag === 'input' && e.target.type === 'range')) return;
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
    var o = cur(); if (!o) return;
    var step = e.shiftKey ? 1 : 0.2, dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step; else return;
    e.preventDefault(); push();
    o.x = r2(clamp(o.x + dx, 0, 100)); o.y = r2(clamp(o.y + dy, 0, 100));
    sync(o); refreshCoords(); persist();
  });

  /* синхронизация между окном и предпросмотром телефона */
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try { state = normalize(JSON.parse(e.newValue)); if (!cur()) sel = null; render(); refreshPanel(); } catch (err) {}
  });
  var onMq = function () { render(); refreshPanel(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  window.addEventListener('resize', fit, { passive: true });

  /* ---------- старт ---------- */
  base = readDom();
  linkOpts = base.map(function (o) { return { id: o.id, name: o.name }; });
  buildLinks();
  var saved = lsGet();
  try { state = saved ? normalize(JSON.parse(saved)) : clone(base); } catch (e) { state = clone(base); }
  if (inFrame || mq.matches) P.phone.style.display = 'none';
  if (inFrame) P.exit.style.display = 'none';
  render();
  refreshPanel();
})();
