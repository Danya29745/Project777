/* Бывшие inline-скрипты из конца index.html, в прежнем порядке. */
/* SCROLL_CFG: отступ секции от верха окна после прокрутки, px. Отдельно для ПК и телефона (<=680px).
   Нет значения - работает прежнее поведение (высота шапки + 14). */
window.SCROLL_CFG={"pc":{"price":32,"hotel":35,"tips":35,"catch":54,"contacts":300,"booking":34,"territory-map":93,"bkstep2":265,"bkstep3":263,"bkstep4":261},"mobile":{"price":30,"hotel":32,"tips":24,"catch":32,"contacts":49,"booking":40,"territory-map":78}};
window.scrollOffsetFor=function(key,fallback){
  var d=window.matchMedia('(max-width:680px)').matches?'mobile':'pc';
  var v=(window.SCROLL_CFG[d]||{})[key];
  return typeof v==='number'?v:fallback;
};
;
  /* keep scroll-stop position accurate under the sticky header (fixes mobile links landing past the heading) */
  const topBar=document.querySelector('.top');
  function syncHeaderHeight(){ document.documentElement.style.setProperty('--header-h', topBar.getBoundingClientRect().height+'px'); }
  syncHeaderHeight();
  let headerRaf=0;
  function scheduleHeaderSync(){
    cancelAnimationFrame(headerRaf);
    headerRaf=requestAnimationFrame(syncHeaderHeight);
  }
  window.addEventListener('resize',scheduleHeaderSync,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(syncHeaderHeight,150),{passive:true});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

  /* photo carousels: домик / банный чан */
  document.querySelectorAll('.stay-carousel').forEach(carousel=>{
    const track=carousel.querySelector('.stay-track');
    const slides=[...carousel.querySelectorAll('.stay-slide')];
    const prevBtn=carousel.querySelector('.stay-nav--prev');
    const nextBtn=carousel.querySelector('.stay-nav--next');
    const dotsWrap=carousel.querySelector('[data-dots]');
    const counter=carousel.querySelector('[data-counter]');
    let index=0;
    slides.forEach((_,i)=>{
      const dot=document.createElement('button');
      dot.type='button';
      dot.setAttribute('aria-label','Фото '+(i+1)+' из '+slides.length);
      if(i===0) dot.classList.add('is-active');
      dot.addEventListener('click',()=>go(i));
      dotsWrap.appendChild(dot);
    });
    const dots=[...dotsWrap.children];
    function go(i){
      index=(i+slides.length)%slides.length;
      track.style.transform='translateX(-'+(index*100)+'%)';
      dots.forEach((d,di)=>d.classList.toggle('is-active',di===index));
      if(counter) counter.textContent=(index+1)+' / '+slides.length;
    }
    prevBtn.addEventListener('click',()=>go(index-1));
    nextBtn.addEventListener('click',()=>go(index+1));
    /* touch swipe */
    let startX=null,startY=null;
    track.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; startY=e.touches[0].clientY; },{passive:true});
    track.addEventListener('touchend',e=>{
      if(startX===null) return;
      const dx=e.changedTouches[0].clientX-startX;
      const dy=e.changedTouches[0].clientY-startY;
      /* листаем только при явном горизонтальном жесте, чтобы скролл страницы не переключал фото */
      if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)*1.5) go(index+(dx<0?1:-1));
      startX=startY=null;
    },{passive:true});
    track.addEventListener('touchcancel',()=>{ startX=startY=null; },{passive:true});
    go(0);
  });


  /* interactive territory map: mini-banner on marker click  */
  (function(){
    const map=document.getElementById('territoryMap');
    if(!map) return;
    const data={
      besedka1:{title:'Стандартная беседка №1',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-1-640.webp']},
      besedka2:{title:'Стандартная беседка №7',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-2-640.webp']},
      besedka3:{title:'Стандартная беседка №8',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-3-640.webp']},
      besedka4:{title:'Стандартная беседка №2',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-4-640.webp']},
      besedka5:{title:'Стандартная беседка №4',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-5-640.webp']},
      besedka6:{title:'Стандартная беседка №3',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-6-640.webp']},
      medium:{title:'Средняя беседка',meta:'до 10 человек',price:'6 000 / 8 000 ₽',note:'будни / выходные',photos:['./images/rooms/medium-1-640.webp','./images/rooms/medium-2-640.webp','./images/rooms/medium-3-640.webp']},
      big:{title:'Большая беседка',meta:'до 15 человек',price:'8 000 ₽',note:'<div class="pavilion-extra-guest">Если гостей больше 15, стоимость каждого следующего - <b class="pavilion-extra-guest__price">500₽</b>.</div>',photos:['./images/rooms/large-1-640.webp','./images/rooms/large-2-640.webp']},
      vip:{title:'VIP-беседка',meta:'до 10 человек',price:'15 000 ₽',note:'любой день',photos:['./images/rooms/vip-1-640.webp','./images/rooms/vip-2-640.webp','./images/rooms/vip-3-640.webp','./images/rooms/vip-4-640.webp']},
      hotel:{title:'Гостиница для комфортного отдыха',meta:'Стоимость за сутки, двухместное размещение',price:'6 000 / 8 000 ₽',note:'будни / выходные и праздники',photos:['./images/rooms/hotel-1-640.webp','./images/rooms/hotel-2-640.webp','./images/rooms/hotel-3-640.webp','./images/rooms/hotel-4-640.webp','./images/rooms/hotel-5-640.webp','./images/rooms/hotel-6-640.webp']},
      chan:{title:'Банный чан на дровах',meta:'Продление: 1 000 ₽/час',price:'6 000 ₽',note:'за 3 часа аренды',photos:['./images/rooms/chan-1-640.webp','./images/rooms/chan-2-640.webp','./images/rooms/chan-3-640.webp','./images/rooms/chan-4-640.webp']},
      toilet:{title:'Туалет',meta:'',price:'',note:'',photos:['./images/facilities/toilet-640.webp']},
      parking:{title:'Парковка',meta:'',price:'',note:'',photos:['./images/facilities/parking-640.webp']},
      admin:{title:'Администрация',meta:'Администратор встречает гостей при въезде',price:'',note:'<a href="tel:+79269267887">+7 926 926-78-87</a> · <a href="tel:+79269119407">+7 926 911-94-07</a>',photos:['./images/facilities/admin-640.webp']},
      banya1:{title:'В процессе',meta:'',price:'',note:'',photos:['./images/facilities/banya-640.webp']},
      banya2:{title:'В процессе',meta:'',price:'',note:'',photos:['./images/facilities/banya-640.webp']}
    };
    const variant=(new URLSearchParams(location.search).get('banner')||'1').replace(/[^1-3]/g,'')||'1';
    const el=document.createElement('aside');
    el.className='mb'; el.dataset.v=variant; el.setAttribute('role','dialog'); el.setAttribute('aria-live','polite');
    el.innerHTML='<div class="mb-photo" data-photo><span class="mb-logo"><img src="./images/embedded/embedded-0.webp" width="180" height="180" alt="Рыбалка у Иваныча" decoding="async"></span><span class="mb-count" data-count></span></div>'+
      '<div class="mb-body"><p class="mb-kicker" data-kicker></p><h3 data-title></h3><p class="mb-meta" data-meta></p>'+
      '<div class="mb-row" data-row><div class="mb-price" data-price></div><div class="mb-note" data-note></div></div>'+
      '<div class="mb-actions"><button type="button" class="mb-btn mb-btn--ghost" data-close>Закрыть</button><button type="button" class="mb-btn mb-btn--go" data-go>Перейти <span aria-hidden="true">→</span></button></div></div>';
    document.body.appendChild(el);
    const $=s=>el.querySelector(s);
    const cards=[...document.querySelectorAll('.accom-card')];
    const stay=[...document.querySelectorAll('.stay-info')].map(n=>n.parentElement);
    const std={kicker:'Отдых и проживание',go:'К беседкам',t:()=>cards[0]};
    const T={medium:{kicker:'Отдых и проживание',go:'К описанию беседки',t:()=>cards[1]},big:{kicker:'Отдых и проживание',go:'К описанию беседки',t:()=>cards[2]},vip:{kicker:'VIP-беседка',go:'К описанию беседки',t:()=>cards[3]},
      hotel:{kicker:'Гостиница',go:'К описанию гостиницы',t:()=>stay[0]},chan:{kicker:'Банный чан',go:'К описанию чана',t:()=>stay[1]}};
    T.admin={kicker:'Территория',go:'К контактам',t:()=>document.getElementById('contacts')};
    for(let i=1;i<=6;i++) T['besedka'+i]=std;
    const markers=[...map.querySelectorAll('.map-marker')];
    const rub=s=>String(s||'').replace(/&(?!amp;)/g,'&amp;').replace(/₽/g,' <span class="rub-symbol">₽</span>');
    let cur=null, curMarker=null;
    function open(m){
      const id=m.dataset.marker, d=data[id]; if(!d) return;
      cur=T[id]||null; curMarker=m;
      markers.forEach(x=>x.classList.toggle('is-selected',x===m));
      const ph=d.photos||[];
      $('[data-photo]').style.backgroundImage=ph.length?'url("'+ph[0]+'")':'';
      el.classList.toggle('no-photo',!ph.length);
      $('[data-count]').textContent=ph.length>1?ph.length+' фото':''; $('[data-count]').hidden=ph.length<2;
      $('[data-kicker]').textContent=cur?cur.kicker:'Территория';
      $('[data-title]').textContent=d.title;
      $('[data-meta]').innerHTML=rub(d.meta); $('[data-meta]').hidden=!d.meta;
      $('[data-price]').innerHTML=rub(d.price); $('[data-note]').innerHTML=rub(d.note);
      $('[data-row]').hidden=!d.price;
      const go=$('[data-go]'); go.hidden=!cur; if(cur) go.innerHTML=cur.go+' <span aria-hidden="true">→</span>';
      el.classList.add('is-open');
    }
    function close(){el.classList.remove('is-open');markers.forEach(x=>x.classList.remove('is-selected'));}
    function settle(cb){let last=-1,t=0,n=0;(function tick(){const y=scrollY;if(y===last)t++;else t=0;last=y;if(t>=6||++n>120)cb();else requestAnimationFrame(tick);})();}
    function go(){
      const node=cur&&cur.t(); if(!node) return;
      const h=document.querySelector('.top');
      const off=(h?h.offsetHeight:70)+16;
      const y=node.getBoundingClientRect().top+scrollY-off;
      const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
      close();
      scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
      const pulse=()=>{back.classList.toggle('is-up',node.getBoundingClientRect().top+scrollY>map.getBoundingClientRect().top+scrollY);back.classList.add('is-show');node.classList.remove('mb-pulse');void node.offsetWidth;node.classList.add('mb-pulse');node.addEventListener('animationend',()=>node.classList.remove('mb-pulse'),{once:true});};
      settle(()=>{const dy=node.getBoundingClientRect().top-off;if(Math.abs(dy)>10){scrollBy({top:dy,behavior:reduce?'auto':'smooth'});settle(pulse);}else pulse();});
    }
    /* "Назад к схеме" button: appears after jumping to a description */
    const back=document.createElement('button');
    back.type='button'; back.className='mb-back'; back.setAttribute('aria-label','Назад к схеме территории');
    back.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg><span>Назад к схеме</span>';
    document.body.appendChild(back);
    function hideBack(){back.classList.remove('is-show');}
    back.addEventListener('click',()=>{
      const m=curMarker; hideBack();
      const h=document.querySelector('.top');
      const r=(m||map).getBoundingClientRect();
      const y=r.top+scrollY-Math.max(0,(innerHeight-r.height)/2);
      const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
      scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
      if(m){settle(()=>{m.classList.add('is-selected');setTimeout(()=>m.classList.remove('is-selected'),2200);});}
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting) hideBack();});},{threshold:.6}).observe(map);
    }
    markers.forEach(m=>{
      m.addEventListener('click',e=>{e.stopPropagation();open(m);});
      m.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(m);}});
    });
    $('[data-close]').addEventListener('click',close);
    $('[data-go]').addEventListener('click',go);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  })();

  /* hamburger */
  const navToggle=document.querySelector('#nav-toggle'), navMenu=document.querySelector('#nav-menu');
  navToggle.addEventListener('click',()=>{
    const open=navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded',String(open));
    navToggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  });
  function closeNav(){ if(!navMenu.classList.contains('open')) return; navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); navToggle.setAttribute('aria-label','Открыть меню'); }
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeNav(); });
  document.addEventListener('click',e=>{ if(!e.target.closest('#nav-menu')&&!e.target.closest('#nav-toggle')) closeNav(); });
  /* Плавный переход к якорю с добором позиции: пока идёт прокрутка, ленивые картинки и блоки выше
     меняют высоту страницы, и раздел оказывается не там. После остановки подправляем точно. */
  let navToken=0;
  ['wheel','touchstart'].forEach(ev=>window.addEventListener(ev,()=>{navToken++;},{passive:true}));
  function goTo(target){
    const token=++navToken;
    const margin=()=>scrollOffsetFor(target.id,parseFloat(getComputedStyle(target).scrollMarginTop)||0);
    window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-margin()),behavior:'smooth'});
    const t0=performance.now(); let last=-1, still=0, fixes=0;
    const settle=()=>{
      if(token!==navToken||performance.now()-t0>5000) return;
      const y=window.scrollY;
      still=Math.abs(y-last)<1?still+1:0; last=y;
      if(still>=8){
        const delta=target.getBoundingClientRect().top-margin();
        if(Math.abs(delta)<=3||++fixes>3) return;
        window.scrollTo({top:y+delta,behavior:'instant'});
        still=0;
      }
      requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  }
  navMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{
    const href=a.getAttribute('href')||'';
    const target=href.length>1&&href.charAt(0)==='#'?document.querySelector(href):null;
    /* close the menu right away (no collapse animation), then scroll */
    navMenu.style.transition='none';
    navMenu.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); navToggle.setAttribute('aria-label','Открыть меню');
    void navMenu.offsetHeight; navMenu.style.transition='';
    if(target){
      e.preventDefault();
      requestAnimationFrame(()=>{ goTo(target); try{history.replaceState(null,'',href);}catch(_){} });
    }
  }));
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    if(navMenu.contains(a)) return;
    const href=a.getAttribute('href')||'';
    if(href.length<2||href==='#booking') return;
    const target=document.querySelector(href);
    if(!target||!target.matches('section, body')) return;
    a.addEventListener('click',e=>{
      e.preventDefault();
      goTo(target); try{history.replaceState(null,'',href);}catch(_){}
    });
  });
;
(function(){
  const modal=document.getElementById('contactModal');
  const open=document.getElementById('contactOpen');
  const close=document.getElementById('contactClose');
  if(!modal||!open||!close)return;
  function show(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
  function hide(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';open.focus();}
  open.addEventListener('click',show); close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
})();
;
(function(){
  const modal=document.getElementById('faqModal');
  const open=document.getElementById('faqOpenHero');
  const close=document.getElementById('faqClose');
  if(!modal||!open||!close)return;
  function show(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
  function hide(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';open.focus();}
  open.addEventListener('click',show); close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
})();
;
(function(){
  const modal=document.getElementById('rulesModal');
  const open=document.getElementById('rulesOpenHero');
  const close=document.getElementById('rulesClose');
  if(!modal||!open||!close)return;
  const rTabs=modal.querySelectorAll('.rules-tab');
  rTabs.forEach(t=>t.addEventListener('click',()=>{
    rTabs.forEach(x=>{const on=x===t;x.classList.toggle('is-active',on);x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;
      const pane=document.getElementById(x.getAttribute('aria-controls'));if(pane)pane.hidden=!on;});
  }));
  function show(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
  function hide(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';open.focus();}
  open.addEventListener('click',show); close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
})();
;
(function(){
  const modal=document.getElementById('aboutModal');
  const open=document.getElementById('aboutOpen');
  const close=document.getElementById('aboutClose');
  if(!modal||!open||!close)return;
  function show(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
  function hide(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';open.focus();}
  open.addEventListener('click',show); close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
})();
;
(function(){
  const modal=document.getElementById('privacyModal');
  const open=document.getElementById('privacyOpen');
  const close=document.getElementById('privacyClose');
  if(!modal||!open||!close)return;
  function show(e){if(e)e.preventDefault();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
  function hide(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';open.focus();}
  open.addEventListener('click',show); close.addEventListener('click',hide);
  modal.addEventListener('click',e=>{if(e.target===modal)hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))hide();});
})();
;
(function(){
const BOOKING_EMAIL='danya.zhitnikov29@gmail.com', BOT_URL='https://rybalka-catch.bothost.tech/api/booking';
const form=document.getElementById('bookingForm'); if(!form) return;
const $=id=>document.getElementById(id);
const nameEl=$('bfName'), phoneEl=$('bfPhone'), dateEl=$('bfDate'), dateBtn=$('bfDateBtn'), cal=$('bfCal'), guests=$('bfGuests'), fishers=$('bfFishers'), nights=$('bfNights'), status=$('bfStatus'), btn=$('bfSubmit'), success=$('bfSuccess'), info=$('bfInfo'), chips=$('bfChips'), warnEl=$('bfWarn');
const BOT_BASE=BOT_URL.replace(/\/api\/booking$/,'');
let busy={};
/* Занятые даты с сервера: объект -> список дней, где свободных мест нет */
function loadBusy(){
return fetch(BOT_BASE+'/api/availability',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.busy) busy=j.busy; }).catch(()=>{});
}
function dayShift(s,n){ const x=dparse(s); return iso(new Date(x.getFullYear(),x.getMonth(),x.getDate()+n)); }
/* Каждая стандартная беседка у пруда бронируется как отдельное место (совпадает с номерами на карте и на /gazebos/) */
const GAZEBO_UNITS=[1,2,3,4,7,8];
let selectedUnit=null;
const unitKey=n=>'Беседка №'+n;
/* Объекты как их видит бот: «Стандартная беседка» подменяется на конкретный выбранный номер */
const bookObjects=()=>checked().map(o=>o==='Стандартная беседка'&&selectedUnit?unitKey(selectedUnit):o);
/* Дата занята, если хотя бы один выбранный объект недоступен (гостиница: на все ночи) */
function blockedFor(s){
return bookObjects().some(o=>{ const b=busy[o]; if(!b||!b.length) return false; const n=o==='Гостиница'?(parseInt(nights.value,10)||1):1; for(let i=0;i<n;i++) if(b.includes(dayShift(s,i))) return true; return false; });
}
const OBJ_NAME={'Стандартная беседка':'Стандартные беседки'};
function objBusy(o,s){
const n=o==='Гостиница'?(parseInt(nights.value,10)||1):1;
const hit=k=>{ const b=busy[k]; if(!b||!b.length) return false; for(let i=0;i<n;i++) if(b.includes(dayShift(s,i))) return true; return false; };
return o==='Стандартная беседка'?GAZEBO_UNITS.every(x=>hit(unitKey(x))):hit(o);
}
function markBusy(){
const s=dateEl.value, pd=$('bfPickDate'), note=$('bfBusyNote'); if(!pd||!note) return;
pd.hidden=!!s; const names=[];
objs().forEach(i=>{
const lab=i.parentElement, sp=lab.querySelector('span'), old=lab.querySelector('em'); if(old) old.remove();
const b=!!s&&objBusy(i.value,s); lab.classList.toggle('bw-chip--busy',b); i.disabled=b;
if(b){ if(i.checked) i.checked=false; sp.appendChild(Object.assign(document.createElement('em'),{textContent:'занято на эту дату'})); names.push(OBJ_NAME[i.value]||i.value); }
});
if(s&&selectedUnit&&busy[unitKey(selectedUnit)]&&busy[unitKey(selectedUnit)].includes(s)) selectedUnit=null;
const d=dparse(s||minISO), nm=d.getDate()+' '+MONG[d.getMonth()];
note.hidden=!names.length; note.textContent=names.length?(names.length===objs().length?'На '+nm+' всё занято. Выберите другую дату (можно только порыбачить).':'На '+nm+' занято: '+names.join(', ')+'.'):'';
}
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const objs=()=>[...form.querySelectorAll('input[name="Объект"]')];
const checked=()=>objs().filter(i=>i.checked).map(i=>i.value);
const pad=n=>String(n).padStart(2,'0'), d=new Date();
const iso=x=>x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()), minISO=iso(d);
nameEl.value=store.get('bf_name')||''; phoneEl.value=store.get('bf_phone')||'';

function fmt(v){
let x=v.replace(/\D/g,''); if(!x) return '';
if(x[0]==='8') x='7'+x.slice(1); else if(x[0]!=='7') x='7'+x;
x=x.slice(0,11);
let o='+7'; if(x.length>1) o+=' ('+x.slice(1,4); if(x.length>=4) o+=')'; if(x.length>4) o+=' '+x.slice(4,7); if(x.length>7) o+='-'+x.slice(7,9); if(x.length>9) o+='-'+x.slice(9,11);
return o;
}
let prevDigits='';
phoneEl.addEventListener('input',e=>{
let digits=phoneEl.value.replace(/\D/g,'');
if(e&&e.inputType&&e.inputType.indexOf('delete')===0&&digits===prevDigits&&digits.length>1){ phoneEl.value=phoneEl.value.slice(0,-1); digits=phoneEl.value.replace(/\D/g,''); }
phoneEl.value=fmt(phoneEl.value);
prevDigits=phoneEl.value.replace(/\D/g,'');
});
phoneEl.addEventListener('focus',()=>{if(!phoneEl.value) phoneEl.value='+7 (';});
phoneEl.addEventListener('blur',()=>{if(phoneEl.value.replace(/\D/g,'').length<2) phoneEl.value='';});
if(phoneEl.value) phoneEl.value=fmt(phoneEl.value);
prevDigits=phoneEl.value.replace(/\D/g,'');

let mode='req';
function setMode(m){
mode=m;
document.querySelectorAll('.bw-tab').forEach(t=>{const on=t.dataset.m===m; t.classList.toggle('is-on',on); t.setAttribute('aria-selected',on);});
form.classList.toggle('is-call',m==='call');
btn.firstElementChild.textContent=m==='call'?'Перезвоните мне':'Отправить заявку';
status.textContent=''; status.className='bf-status';
}
document.querySelectorAll('.bw-tab').forEach(t=>t.addEventListener('click',()=>setMode(t.dataset.m)));

const PR={'Стандартная беседка':[3000,4000],'Средняя беседка':[6000,8000],'Большая беседка':[8000,8000],'VIP-беседка':[15000,15000],'Гостиница':[6000,8000],'Банный чан':[6000,6000]};
const CAP={'Стандартная беседка':6,'Средняя беседка':30,'Большая беседка':30,'VIP-беседка':10};
const FREE_LIMIT={'Средняя беседка':10,'Большая беседка':15};
const OVERAGE=500, HOTEL_CAP=2, HOTEL_ROOMS=3;
const NARODNY='Народный день 07:00–18:00 (по понедельникам)';
const WDN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const HOL=['01-01','01-02','01-03','01-04','01-05','01-06','01-07','01-08','02-23','03-08','05-01','05-09','06-12','11-04'];
const MON=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const rub=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+'\u00a0₽';
const plural=(n,a,b,c)=>{const m=n%10,h=n%100; return (m===1&&h!==11)?a:(m>=2&&m<=4&&(h<12||h>14))?b:c;};
const gname=n=>plural(n,'гость','гостя','гостей'), fname=n=>plural(n,'рыбак','рыбака','рыбаков'), nname=n=>plural(n,'ночь','ночи','ночей');
const isWe=x=>x.getDay()===0||x.getDay()===6||HOL.includes(pad(x.getMonth()+1)+'-'+pad(x.getDate()));
const dparse=s=>{const a=s.split('-'); return new Date(+a[0],+a[1]-1,+a[2]);};
const fishRadio=()=>form.querySelector('input[name="Рыбалка"]:checked');
const fishVal=()=>{const r=fishRadio(); return r?r.value:'Без рыбалки';};
const tackle=()=>[...form.querySelectorAll('input[name="Напрокат"]:checked')].map(i=>({name:i.value,p:+i.dataset.p}));
let fishTouched=false, warnT, calc={lines:[],sum:0,notes:[]};
function primary(){ return checked().filter(x=>CAP[x]).sort((a,b)=>CAP[a]-CAP[b])[0]||null; }
function limit(){ const o=primary(); if(o) return CAP[o]; return checked().includes('Гостиница')?HOTEL_CAP*HOTEL_ROOMS:30; }
function warn(msg){ clearTimeout(warnT); warnEl.textContent=msg; warnEl.hidden=!msg; if(msg) warnT=setTimeout(()=>{warnEl.hidden=true;},8000); }
function overMsg(){
const o=primary(), max=limit();
if(!o) return 'В одном номере гостиницы максимум '+HOTEL_CAP+' человека. Если вас больше, уточните в пожеланиях — распределим по нескольким номерам (всего '+HOTEL_ROOMS+').';
return 'В «'+o+'» максимум '+max+' '+gname(max)+'. Выберите другую беседку: '+(o==='Стандартная беседка'?'«Среднюю» или «Большую»':'«Большую»')+'.';
}
function hint(extra){ info.textContent=extra||''; info.hidden=!extra; }
const unitBox=$('bfUnitBox'), unitWrap=$('bfUnits');
function renderUnits(){
const want=objs().some(i=>i.value==='Стандартная беседка'&&i.checked);
unitBox.hidden=!want;
if(!want){ return; }
const s=dateEl.value;
unitWrap.innerHTML=GAZEBO_UNITS.map(n=>{
const k=unitKey(n), busyNow=s&&busy[k]&&busy[k].includes(s);
const on=selectedUnit===n;
return '<label class="bw-chip'+(busyNow?' bw-chip--busy':'')+'"><input type="radio" name="bfUnit" value="'+n+'"'+(on?' checked':'')+(busyNow?' disabled':'')+'><span>№'+n+(busyNow?'<b>занято</b>':'')+'</span></label>';
}).join('');
}
unitWrap.addEventListener('change',e=>{ const r=e.target.closest('input[name="bfUnit"]'); if(!r) return; selectedUnit=parseInt(r.value,10); warnEl.hidden=true; });
/* Банный чан - только вместе с гостиницей */
function chan(src){
const c=objs().find(x=>x.value==='Банный чан'), h=objs().find(x=>x.value==='Гостиница'); if(!c||!h) return '';
if(src==='Гостиница'&&!h.checked&&c.checked){ c.checked=false; return 'Банный чан бронируется только вместе с гостиницей, поэтому он тоже снят.'; }
if(c.checked&&!h.checked){ h.checked=true; return 'Банный чан бронируется только вместе с гостиницей, мы её добавили.'; }
return '';
}
function pick(i){ chips.classList.remove('bf-invalid'); hint(chan(i.value)); syncAll(true); }

function compute(){
const lines=[], notes=[]; let sum=0;
const hasDate=!!dateEl.value, dt=hasDate?dparse(dateEl.value):null, o=checked(), fv=fishVal(), fish=fv!=='Без рыбалки';
const g=parseInt(guests.value,10)||1, nn=parseInt(nights.value,10)||1;
if(!o.length&&fish) notes.push('Только рыбалка: можно занять свободную мини-беседку 1 × 1 м в любом месте пруда бесплатно.');
o.forEach(name=>{
const p=PR[name]; if(!p) return;
if(name==='Гостиница'){
let sm=0; for(let i=0;i<nn;i++){ const x=hasDate?new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+i):null; sm+=x&&isWe(x)?p[1]:p[0]; }
lines.push([name+', '+nn+' '+nname(nn),sm]); sum+=sm;
}else{
const v=hasDate&&isWe(dt)?p[1]:p[0]; lines.push([name,v]); sum+=v;
const free=FREE_LIMIT[name];
if(free){ const ex=Math.max(0,g-free)*OVERAGE; if(ex){ lines.push(['Доп. гости ('+(g-free)+' × '+rub(OVERAGE)+')',ex]); sum+=ex; } }
}
if(FREE_LIMIT[name]) notes.push('До '+FREE_LIMIT[name]+' гостей включено. С '+(FREE_LIMIT[name]+1)+'-го гостя — +'+rub(OVERAGE)+' за каждого.');
if(name==='Банный чан') notes.push('Чан: 6 000 ₽ за 3 часа, продление 1 000 ₽ в час.');
});
if(o.includes('Гостиница')) notes.push('Один номер гостиницы — до '+HOTEL_CAP+' человек, всего номеров: '+HOTEL_ROOMS+'.');
if(fish){
const n=parseInt(fishers.value,10)||1, pr=+fishRadio().dataset.p;
lines.push(['Рыбалка ('+fv.split(' ')[0].toLowerCase()+'), '+n+' '+fname(n)+' × '+rub(pr),pr*n]); sum+=pr*n;
tackle().forEach(x=>{ lines.push([x.name+' напрокат',x.p]); sum+=x.p; });
if(fv===NARODNY){ notes.push('Народный день — только по понедельникам, без запуска форели.'); if(hasDate&&dt.getDay()!==1) notes.push('Выбранная дата не понедельник: народный день в этот день не проводится.'); }
}
if(o.some(x=>x!=='Большая беседка'&&x!=='VIP-беседка'&&x!=='Банный чан')&&!hasDate) notes.push('Укажите дату: в выходные и праздники беседки и гостиница дороже.');
calc={lines,sum,notes}; return calc;
}
function renderCalc(){
const r=compute(), pre=$('bfPre');
$('bfLines').innerHTML=r.lines.length?r.lines.map(l=>'<li><span>'+l[0]+'</span><b>'+rub(l[1])+'</b></li>').join(''):'<li class="bw-empty">Выберите рыбалку или беседку, и здесь появится сумма.</li>';
$('bfTotal').textContent=rub(r.sum);
$('bfNote').textContent=r.notes.concat(['Сумма ориентировочная, точную подтвердим по телефону.']).join(' ');
pre.hidden=!checked().length; pre.textContent='Бронь станет активной после предоплаты 2 000 ₽: после подтверждения заявки мы пришлём QR-код для оплаты.';
}
function syncAll(notify){
const o=checked(), has=o.length>0, fish=fishVal()!=='Без рыбалки';
if(!o.includes('Стандартная беседка')) selectedUnit=null;
renderUnits();
$('bfGuestsBox').hidden=!has; $('bfNightsBox').hidden=!o.includes('Гостиница'); $('bfFishBox').hidden=!fish;
const max=limit(); guests.max=max;
let g=Math.max(1,parseInt(guests.value,10)||1);
if(g>max){ g=max; if(notify) warn(overMsg()); }
guests.value=g;
{const po=primary(), cp=$('bfCap'); let m='';
if(po&&g>=max&&max<30){ m=po==='Стандартная беседка'?'Стандартная беседка вмещает до 6 гостей. Если вас больше, выберите другую беседку: «Среднюю» или «Большую» (доплата за гостей сверх нормы).':'«'+po+'» вмещает до '+max+' гостей. Если вас больше, выберите «Большую беседку».'; }
cp.textContent=m; cp.hidden=!m;}
const fmax=30; fishers.max=fmax;
if(!fishTouched&&has) fishers.value=g;
fishers.value=Math.min(fmax,Math.max(1,parseInt(fishers.value,10)||1));
nights.value=Math.min(14,Math.max(1,parseInt(nights.value,10)||1));
document.querySelectorAll('.bw-step').forEach(st=>{ const el=$(st.dataset.for), v=+el.value; st.children[0].disabled=v<=+el.min; st.children[2].disabled=v>=+el.max; });
markBusy();
if(!cal.hidden) renderCal();
renderCalc();
}
objs().forEach(i=>i.addEventListener('change',()=>pick(i)));
form.querySelectorAll('input[name="Рыбалка"],input[name="Напрокат"]').forEach(i=>i.addEventListener('change',()=>{ chips.classList.remove('bf-invalid'); syncAll(false); }));
[nameEl,phoneEl].forEach(el=>el.addEventListener('input',()=>el.classList.remove('bf-invalid')));
form.querySelectorAll('.bw-step button').forEach(b=>b.addEventListener('click',()=>{
const el=$(b.parentElement.dataset.for), cur=parseInt(el.value,10)||1, next=cur+(+b.dataset.step);
if(el===fishers) fishTouched=true;
if(next>+el.max){ if(el===guests) warn(overMsg());  }
el.value=Math.min(+el.max,Math.max(+el.min,next)); syncAll(false);
}));
guests.addEventListener('input',()=>{ const v=parseInt(guests.value,10)||0; syncAll(v>limit()); });
fishers.addEventListener('input',()=>{ fishTouched=true; syncAll(false); });
nights.addEventListener('input',()=>syncAll(false));

/* календарь */
let view=new Date(d.getFullYear(),d.getMonth(),1);
function setDate(v){
dateEl.value=v;
if(!v){ dateBtn.textContent='Выберите дату'; dateBtn.classList.remove('has-val'); syncAll(false); return; }
const dt=dparse(v), w=WDN[dt.getDay()];
dateBtn.textContent=w[0].toUpperCase()+w.slice(1)+', '+dt.getDate()+' '+MONG[dt.getMonth()]+(isWe(dt)?' · выходной / праздник':'');
dateBtn.classList.add('has-val'); dateBtn.classList.remove('bf-invalid'); syncAll(false);
}
function renderCal(){
const y=view.getFullYear(), m=view.getMonth(), lead=(new Date(y,m,1).getDay()+6)%7, days=new Date(y,m+1,0).getDate();
const atMin=y===d.getFullYear()&&m===d.getMonth();
let h='<div class="bw-cal__head"><button type="button" data-nav="-1" aria-label="Предыдущий месяц"'+(atMin?' disabled':'')+'>‹</button><b>'+MON[m]+' '+y+'</b><button type="button" data-nav="1" aria-label="Следующий месяц">›</button></div><div class="bw-cal__grid">';
['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(x=>{h+='<span>'+x+'</span>';});
for(let i=0;i<lead;i++) h+='<i></i>';
for(let n=1;n<=days;n++){
const dt=new Date(y,m,n), s=iso(dt);
h+='<button type="button" class="bw-d'+(isWe(dt)?' is-we':'')+(s===minISO?' is-today':'')+(s===dateEl.value?' is-sel':'')+(s>=minISO&&blockedFor(s)?' is-busy':'')+'" data-iso="'+s+'"'+(s<minISO?' disabled':'')+(blockedFor(s)?' aria-disabled="true" title="Занято"':'')+'>'+n+'</button>';
}
cal.innerHTML=h+'</div><p class="bw-legend"><b>Красные</b> — выходные и праздники, цены на беседки и гостиницу выше.'+(checked().length?' <b style="color:#b3261e">Розовые с надписью «занято»</b> — выбранный объект на эту дату недоступен, нажмите, чтобы узнать причину.':' Выберите объект ниже, и занятые даты подсветятся.')+'</p><p class="bw-cal__msg" id="bfCalMsg" role="alert"></p>';
}
dateBtn.addEventListener('click',()=>{
if(cal.hidden){ loadBusy().then(()=>{ if(!cal.hidden) renderCal(); }); view=dateEl.value?new Date(dparse(dateEl.value).getFullYear(),dparse(dateEl.value).getMonth(),1):new Date(d.getFullYear(),d.getMonth(),1); renderCal(); }
cal.hidden=!cal.hidden; dateBtn.setAttribute('aria-expanded',String(!cal.hidden));
});
cal.addEventListener('click',e=>{
const nv=e.target.closest('[data-nav]'), dy=e.target.closest('[data-iso]');
if(nv){ view=new Date(view.getFullYear(),view.getMonth()+(+nv.dataset.nav),1); renderCal(); }
else if(dy&&dy.classList.contains('is-busy')){ const m=$('bfCalMsg'); if(m) m.textContent='На '+dy.dataset.iso.split('-').reverse().join('.')+' занято: '+bookObjects().filter(o=>objBusy(o==='Стандартная беседка'?o:o,dy.dataset.iso)||(busy[o]&&busy[o].includes(dy.dataset.iso))).join(', ')+'. Выберите другую дату или другой объект.'; }
else if(dy&&!dy.disabled){ setDate(dy.dataset.iso); cal.hidden=true; dateBtn.setAttribute('aria-expanded','false'); }
});
form.querySelectorAll('.bw-q').forEach(b=>b.addEventListener('click',()=>{
const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()), q=b.dataset.q;
if(q==='tomorrow') x.setDate(x.getDate()+1);
else if(q==='sat'||q==='sun') x.setDate(x.getDate()+(((q==='sat'?6:0)-x.getDay()+7)%7));
setDate(iso(x)); cal.hidden=true;
}));
/* кнопки «Забронировать» в карточках выбирают объект */
document.querySelectorAll('[data-book]').forEach(a=>a.addEventListener('click',()=>{
setMode('req'); const i=objs().find(x=>x.value===a.dataset.book); if(i){ i.checked=true; pick(i); }
}));
const pl=$('bfPrivacy'); if(pl) pl.addEventListener('click',e=>{e.preventDefault();const o=$('privacyOpen'); if(o) o.click();});

function validate(){
const bad=[], req=mode==='req';
if(req&&!checked().length&&fishVal()==='Без рыбалки'){ chips.classList.add('bf-invalid'); return {el:chips,msg:'Выберите рыбалку, беседку или гостиницу.'}; }
if(req&&checked().includes('Стандартная беседка')&&!selectedUnit){ return {el:unitBox,msg:'Выберите номер беседки у пруда.'}; }
if(req&&(!dateEl.value||dateEl.value<minISO||blockedFor(dateEl.value))) bad.push(dateBtn);
if(req&&nameEl.value.trim().length<2) bad.push(nameEl);
if(phoneEl.value.replace(/\D/g,'').length!==11) bad.push(phoneEl);
bad.forEach(el=>el.classList.add('bf-invalid'));
return bad.length?{el:bad[0],msg:'Проверьте выделенные поля.'}:null;
}
loadBusy().then(()=>syncAll(false)); showManage();
syncAll(false);
/* Номер заявки: Б-4827 */
function makeReqId(){
const u=new Uint32Array(1);
if(window.crypto&&crypto.getRandomValues) crypto.getRandomValues(u); else u[0]=Math.random()*4294967296;
return 'Б-'+(1000+u[0]%9000);
}
/* Защита от спама: слишком быстрая отправка = бот, пауза между заявками, лимит в час */
const formOpenedAt=Date.now();
function spamCheck(){
if(Date.now()-formOpenedAt<8000) return 'bot';
const now=Date.now(); let log=[];
try{ log=JSON.parse(localStorage.getItem('bf_sent')||'[]').filter(t=>now-t<3600000); }catch(_){}
if(log.length&&now-log[log.length-1]<20000) return 'Заявка только что отправлена. Подождите несколько секунд.';
if(log.length>=3) return 'Слишком много заявок за час. Позвоните нам: +7 926 926-78-87';
return '';
}
function markSent(){
const now=Date.now(); let log=[];
try{ log=JSON.parse(localStorage.getItem('bf_sent')||'[]').filter(t=>now-t<3600000); log.push(now); localStorage.setItem('bf_sent',JSON.stringify(log)); }catch(_){}
}
let sendWhy='';
const escT=v=>String(v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
async function sendMail(payload){
let r;
try{
r=await fetch('https://formsubmit.co/ajax/'+BOOKING_EMAIL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
}catch(e){
sendWhy=String(e&&e.name||'')+': '+String(e&&e.message||'')+' | online='+navigator.onLine;
if(navigator.onLine===false) throw e;
return 'unknown';
}
const j=await r.json().catch(()=>null);
if(!r.ok||(j&&String(j.success)==='false')){ sendWhy='HTTP '+r.status+' '+(j&&j.message||''); throw new Error('formsubmit '+r.status+' '+(j&&j.message||'')); }
return 'ok';
}



form.addEventListener('submit',async e=>{
e.preventDefault(); status.textContent=''; status.className='bf-status';
[nameEl,phoneEl,dateBtn,chips].forEach(el=>el.classList.remove('bf-invalid'));
const err=validate();
if(err){ status.textContent=err.msg; status.classList.add('is-error'); err.el.scrollIntoView({behavior:'smooth',block:'center'}); if(err.el.focus&&err.el!==chips) err.el.focus({preventScroll:true}); return; }
if(form.elements['_honey'].value) return;
const call=mode==='call', nm=nameEl.value.trim(); let reqId=makeReqId();
const spam=spamCheck();
if(spam==='bot'){ showDone(call,reqId,false); return; }
if(spam){ status.textContent=spam; status.classList.add('is-error'); return; }
store.set('bf_name',nm); store.set('bf_phone',phoneEl.value);
const payload={_template:'table',_captcha:'false'};
const put=(k,v)=>{ if(v!==undefined&&v!==null&&String(v).trim()!=='') payload[k]=v; };
put('🔖 Номер заявки',reqId);
if(call){
payload._subject='Перезвонить '+reqId+' · '+(nm||phoneEl.value);
put('📞 Нужно позвонить','Да, клиент просит перезвонить');
put('👤 Имя',nm); put('📞 Телефон',phoneEl.value);
}else{
renderCalc();
const dt=dparse(dateEl.value), dateRu=dateEl.value.split('-').reverse().join('.'), o=checked(), ob=bookObjects(), fv=fishVal(), fish=fv!=='Без рыбалки', n=parseInt(fishers.value,10)||1, r=calc;
payload._subject='Заявка '+reqId+' · '+nm+' · '+dateRu+' · '+(ob.length?ob.join(', '):'Рыбалка')+' ('+rub(r.sum)+')';
put('👤 Имя',nm); put('📞 Телефон',phoneEl.value);
put('📅 Дата приезда',dateRu+', '+WDN[dt.getDay()]+(isWe(dt)?' (выходной / праздник)':' (будни)'));
put('🏕 Что бронируют',ob.length?ob.join(', '):'Только рыбалка');
if(o.length) put('👥 Гостей',guests.value);
if(o.includes('Гостиница')) put('🌙 Ночей в гостинице',nights.value);
put('🎣 Рыбалка',fish?fv+', '+n+' '+fname(n):'Без рыбалки');
put('🧰 Снасти напрокат',tackle().map(x=>x.name).join(', '));
put('🧮 Расчёт',r.lines.map(l=>l[0]+': '+rub(l[1])).join('  |  '));
put('💰 Итого (ориентировочно)',rub(r.sum));
put('💳 Предоплата',o.length?'2 000 ₽':'не требуется');
put('📝 Пожелание клиента',$('bfComment').value.trim());
}
btn.disabled=true; btn.classList.add('is-loading'); const lbl=btn.firstElementChild.textContent; btn.firstElementChild.textContent='Отправляем…';
try{
/* Сначала бот: он проверяет занятость и держит дату. Если бот недоступен, заявка всё равно уходит на почту. */
try{
const bot=Object.fromEntries(Object.entries(payload).filter(([k])=>k[0]!=='_'&&k!=='📞 Нужно позвонить'));
bot.type=call?'callback':'request';
if(!call){ bot._id=reqId; bot._date=dateEl.value; bot._objects=bookObjects(); bot._nights=parseInt(nights.value,10)||1; }
const ctrl=new AbortController(), tm=setTimeout(()=>ctrl.abort(),8000);
const br=await fetch(BOT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(bot),signal:ctrl.signal});
clearTimeout(tm);
if(br.status===409){
const cj=await br.clone().json().catch(()=>null);
if(cj&&cj.error==='own'){ status.innerHTML='У вас уже есть заявка <b>'+escT(cj.id)+'</b> на эти даты и объекты. Её можно проверить или отменить выше, на странице заявки.'; status.classList.add('is-error'); rememberLast(cj.id,phoneEl.value); showManage(); $('bfManage').scrollIntoView({behavior:'smooth',block:'center'}); return; }
await loadBusy(); syncAll(false);
status.textContent='К сожалению, на эту дату уже занято. Выберите другую дату или другой объект.'; status.classList.add('is-error');
cal.hidden=false; dateBtn.setAttribute('aria-expanded','true'); renderCal(); dateBtn.scrollIntoView({behavior:'smooth',block:'center'});
return;
}
const bj=br.ok?await br.json().catch(()=>null):null;
if(bj&&bj.ok&&bj.id&&bj.id!==reqId){ payload['🔖 Номер заявки']=bj.id; payload._subject=payload._subject.replace(reqId,bj.id); reqId=bj.id; }
}catch(_){}
const res=await sendMail(payload);
markSent();
if(window.ym) ym(28138044,'reachGoal','booking_submit');
if(!call) rememberLast(reqId,phoneEl.value);
showDone(call,reqId,res==='unknown');
}catch(x){
console.error('booking send failed',x);
status.innerHTML='Не удалось отправить. Позвоните нам: <a href="tel:+79269267887">+7 926 926-78-87</a><br><small style="opacity:.6">тех. код: '+escT(sendWhy||String(x&&x.message||x))+'</small>';
status.classList.add('is-error');
}finally{
btn.disabled=false; btn.classList.remove('is-loading'); btn.firstElementChild.textContent=lbl;
}
});
function rememberLast(id,phone){ store.set('bf_last',JSON.stringify({id:id,phone:phone})); }
const ST_TXT={new:'ждёт решения администратора',wait_pay:'одобрена, ждём предоплату',paid:'подтверждена, оплата получена',rejected:'отклонена',cancelled:'отменена',expired:'время ожидания истекло, место освобождено'};
async function showManage(){
const box=$('bfManage'); let last=null; try{ last=JSON.parse(store.get('bf_last')||'null'); }catch(_){}
if(!box||!last){ if(box) box.hidden=true; return; }
let j=null; try{ const r=await fetch(BOT_BASE+'/api/booking/status?id='+encodeURIComponent(last.id)+'&phone='+encodeURIComponent(last.phone),{cache:'no-store'}); j=r.ok?await r.json():null; }catch(_){}
if(!j||!j.ok||['rejected','cancelled','expired'].includes(j.status)&&dparse(j.date)<dparse(minISO)){ box.hidden=true; return; }
const dd=dparse(j.date), hold=j.hold_until&&(j.status==='new'||j.status==='wait_pay')?new Date(j.hold_until*1000):null;
const canCancel=j.status==='new'||j.status==='wait_pay';
box.innerHTML='<b>Ваша заявка '+escT(last.id)+'</b><p>'+escT(j.objects.join(', '))+' · '+dd.getDate()+' '+MONG[dd.getMonth()]+' · '+ST_TXT[j.status]+(hold?'. Место держим до '+(iso(hold)===minISO?'':hold.getDate()+' '+MONG[hold.getMonth()]+', ')+pad(hold.getHours())+':'+pad(hold.getMinutes()):'')+(j.status==='paid'?'. Чтобы изменить или отменить, позвоните нам.':'')+'</p>'
+'<button type="button" id="bfRef">Обновить статус</button>'+(canCancel?'<button type="button" class="bw-cancel" id="bfCan">Отменить заявку</button>':'');
box.hidden=false;
$('bfRef').onclick=showManage;
if(canCancel) $('bfCan').onclick=async()=>{ if(!confirm('Отменить заявку '+last.id+'? Место освободится.')) return;
try{ await fetch(BOT_BASE+'/api/booking/cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(last)}); }catch(_){}
await loadBusy(); syncAll(false); showManage(); };
}
function showDone(call,id,unsure){
$('bfTitle').textContent=call?'Ждите звонка':'Заявка отправлена';
$('bfText').textContent=call?'Мы получили ваш номер и перезвоним в рабочее время: ежедневно 07:00–18:00.':'Мы получили заявку и свяжемся с вами в рабочее время (07:00–18:00). Место за вами держим 40 минут рабочего времени: если заявка пришла вечером или ночью, отсчёт начнётся в 07:00. Бронь станет активной после предоплаты 2\u00a0000\u00a0₽: пришлём QR-код для оплаты, дата за вами закрепляется после подтверждения.';
$('bfId').textContent=id; $('bfUnsure').hidden=!unsure;
form.hidden=true; document.querySelector('.bw-tabs').hidden=true; success.hidden=false; success.scrollIntoView({behavior:'smooth',block:'center'});
}
$('bfAgain').addEventListener('click',()=>{ showManage();
success.hidden=true; form.hidden=false; document.querySelector('.bw-tabs').hidden=false;
$('bfComment').value=''; objs().forEach(i=>i.checked=false); form.querySelectorAll('input[name="Напрокат"]').forEach(i=>i.checked=false);
form.querySelector('input[name="Рыбалка"][value="Без рыбалки"]').checked=true;
guests.value=2; fishers.value=2; nights.value=1; fishTouched=false; cal.hidden=true; hint(''); setDate(''); setMode('req');
});
})();
;
(function(){
  var cards=document.querySelectorAll('.fish-card');
  cards.forEach(function(card){
    var front=card.querySelector('.fish-card__front');
    var back=card.querySelector('.fish-card__back');
    function toggle(){
      var on=card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed',on?'true':'false');
      back.setAttribute('aria-hidden',on?'false':'true');
      front.setAttribute('aria-hidden',on?'true':'false');
    }
    card.addEventListener('click',toggle);
    card.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
    });
  });
})();
;
(function(){
  document.querySelectorAll('.accom-mini-gallery').forEach(gallery => {
    const images = gallery.querySelectorAll('img');
    if(images.length <= 1) return;
    
    gallery.classList.add('slider-mode');
    let currentIndex = 0;
    images[0].classList.add('active');
    
    const nav = document.createElement('div');
    nav.className = 'gallery-nav';
    nav.innerHTML = `<button aria-label="Предыдущее фото">‹</button><span style="color:#eef1e6;font-size:12px;min-width:60px;text-align:center;"><span class="img-count-current">1</span>/<span class="img-count-total">${images.length}</span></span><button aria-label="Следующее фото">›</button>`;
    
    // Navigation belongs to the photo viewport itself.
    // This prevents the absolute-positioned arrows from jumping below the photo
    // on desktop/mobile layouts.
    const media = gallery.closest('.accom-media');
    if(media){
      media.appendChild(nav);
    } else {
      gallery.parentElement.insertBefore(nav, gallery.nextSibling);
    }
    
    const [prevBtn, nextBtn] = nav.querySelectorAll('button');
    const countDisplay = nav.querySelector('.img-count-current');
    
    function showImage(index) {
      images.forEach(img => img.classList.remove('active'));
      images[index].classList.add('active');
      countDisplay.textContent = index + 1;
    }
    
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    });
    
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    });
  });
})();
;
/* Фото грузятся по порядку сверху вниз: блок подтягивается, когда до него ~500px.
   Скрытые слайды галереи с loading="lazy" сами не грузятся, поэтому первый слайд грузим сразу, остальные чуть позже. */
(function(){
  const lazy=[...document.querySelectorAll('img[loading="lazy"]')];
  if(!lazy.length) return;
  const groups=new Map();
  lazy.forEach(img=>{
    const host=img.closest('.accom-mini-gallery, .stay-carousel')||img;
    if(!groups.has(host)) groups.set(host,[]);
    groups.get(host).push(img);
  });
  const later=window.requestIdleCallback||function(f){ return setTimeout(f,300); };
  const load=host=>{
    const imgs=groups.get(host)||[];
    groups.delete(host);
    if(imgs[0]) imgs[0].loading='eager';
    if(imgs.length>1) later(()=>imgs.slice(1).forEach(img=>{ img.loading='eager'; }));
  };
  if(!('IntersectionObserver' in window)){ groups.forEach((_,h)=>load(h)); return; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ io.unobserve(e.target); load(e.target); } }),{rootMargin:'500px 0px'});
  groups.forEach((_,host)=>io.observe(host));
})();
;
(function(){
  const map=document.getElementById('territoryMap');
  if(!map) return;
  const markers=[...map.querySelectorAll('.map-marker')];
  function placeLabels(){
    const mobile=window.matchMedia('(max-width:760px)').matches;
    markers.forEach(marker=>{
      const label=marker.querySelector('.map-label');
      if(!label) return;
      label.style.left='50%';
      label.style.right='auto';
      label.style.transform='translateX(-50%)';
      label.style.top='auto';
      label.style.bottom='calc(100% + '+(mobile?1:4)+'px)';
      const x=parseFloat(marker.style.left)||50;
      if(mobile && x<15){
        label.style.left='0'; label.style.transform='translateX(0)';
      } else if(mobile && x>85){
        label.style.left='auto'; label.style.right='0'; label.style.transform='translateX(0)';
      }
    });
  }
  placeLabels();
  window.addEventListener('resize',placeLabels,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(placeLabels,120),{passive:true});
})();
/* Пункт меню «Правила» открывает окно с правилами на главной (без перехода на отдельную страницу) */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('#navRules'); if(!a) return;
  var btn=document.getElementById('rulesOpenHero'); if(!btn) return;
  e.preventDefault(); e.stopImmediatePropagation();
  var nm=document.getElementById('nav-menu'), nt=document.getElementById('nav-toggle');
  if(nm) nm.classList.remove('open'); if(nt){ nt.setAttribute('aria-expanded','false'); nt.setAttribute('aria-label','Открыть меню'); }
  btn.click();
},true);
