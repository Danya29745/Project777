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
      besedka2:{title:'Стандартная беседка №2',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-2-640.webp']},
      besedka3:{title:'Стандартная беседка №3',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-3-640.webp']},
      besedka4:{title:'Стандартная беседка №4',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-4-640.webp']},
      besedka5:{title:'Стандартная беседка №5',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-5-640.webp']},
      besedka6:{title:'Стандартная беседка №6',meta:'до 6 человек · 6 мест',price:'3 000 / 4 000 ₽',note:'будни / выходные',photos:['./images/rooms/standard-6-640.webp']},
      medium:{title:'Средняя беседка',meta:'до 10 человек',price:'6 000 / 8 000 ₽',note:'будни / выходные',photos:['./images/rooms/medium-1-640.webp','./images/rooms/medium-2-640.webp','./images/rooms/medium-3-640.webp']},
      big:{title:'Большая беседка',meta:'до 15 человек',price:'8 000 ₽',note:'<div class="pavilion-extra-guest">Если гостей больше 15, стоимость каждого следующего - <b class="pavilion-extra-guest__price">500₽</b>.</div>',photos:['./images/rooms/large-1-640.webp','./images/rooms/large-2-640.webp']},
      vip:{title:'VIP-беседка',meta:'до 10 человек',price:'15 000 ₽',note:'любой день',photos:['./images/rooms/vip-1-640.webp','./images/rooms/vip-2-640.webp','./images/rooms/vip-3-640.webp','./images/rooms/vip-4-640.webp']},
      hotel:{title:'Гостиница для комфортного отдыха',meta:'Стоимость за сутки, двухместное размещение',price:'6 000 / 8 000 ₽',note:'будни / выходные и праздники',photos:['./images/rooms/hotel-1-640.webp','./images/rooms/hotel-2-640.webp','./images/rooms/hotel-3-640.webp','./images/rooms/hotel-4-640.webp','./images/rooms/hotel-5-640.webp','./images/rooms/hotel-6-640.webp']},
      chan:{title:'Банный чан на дровах',meta:'Продление: 1 000 ₽/час',price:'6 000 ₽',note:'за 3 часа аренды',photos:['./images/rooms/chan-1-640.webp','./images/rooms/chan-2-640.webp','./images/rooms/chan-3-640.webp','./images/rooms/chan-4-640.webp']},
      toilet:{title:'Туалет',meta:'',price:'',note:'',photos:[]},
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
  const BOOKING_EMAIL='danya.zhitnikov29@gmail.com';
  const form=document.getElementById('bookingForm'); if(!form) return;
  const $=id=>document.getElementById(id);
  const dateEl=$('bfDate'), guests=$('bfGuests'), nameEl=$('bfName'), phoneEl=$('bfPhone');
  const status=$('bfStatus'), btn=$('bfSubmit'), success=$('bfSuccess'), tackle=$('bkTackle'), step1=$('bkStep1'), guestsField=$('bkGuestsField'), fishLegend=$('bkFishLegend');
  const step2=$('bkStep2'), step3=$('bkStep3'), step4=$('bkStep4'), toast=$('bkToast');
  if(toast && toast.parentElement!==document.body) document.body.appendChild(toast);
  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const objs=()=>[...form.querySelectorAll('input[name="Объект"]')];
  const checked=n=>[...form.querySelectorAll('input[name="'+n+'"]:checked')].map(i=>i.value);

  const d=new Date(), pad=n=>String(n).padStart(2,'0');
  dateEl.min=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());

  nameEl.value=store.get('bf_name')||''; phoneEl.value=store.get('bf_phone')||'';
  const sc=store.get('bf_contact'); if(sc){const r=form.querySelector('input[name="Способ связи"][value="'+sc+'"]'); if(r) r.checked=true;}

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
    /* пользователь стирает символ маски («)», пробел, «-»): число цифр не изменилось, значит убираем последнюю цифру */
    if(e&&e.inputType&&e.inputType.indexOf('delete')===0&&digits===prevDigits&&digits.length>1){ phoneEl.value=phoneEl.value.slice(0,-1); digits=phoneEl.value.replace(/\D/g,''); }
    phoneEl.value=fmt(phoneEl.value);
    prevDigits=phoneEl.value.replace(/\D/g,'');
  });
  phoneEl.addEventListener('focus',()=>{if(!phoneEl.value) phoneEl.value='+7 (';});
  phoneEl.addEventListener('blur',()=>{if(phoneEl.value.replace(/\D/g,'').length<2) phoneEl.value='';});
  if(phoneEl.value) phoneEl.value=fmt(phoneEl.value);
  prevDigits=phoneEl.value.replace(/\D/g,'');

  const fishers=$('bfFishers'), nights=$('bfNights'), nightsBox=$('bkNights'), bar=$('bkBar'), total=$('bkTotal');
  const guestsFieldEl=guestsField;
  const noFishingPill=form.querySelector('input[name="Рыбалка"][value="Без рыбалки"]')?.closest('.bk-pill');
  let fishTouched=false;
  const clamp=(el,v)=>Math.min(parseInt(el.max,10),Math.max(parseInt(el.min,10),v||1));
  const CAP={
    'Стандартная беседка':6,
    'Средняя беседка':10,
    'Большая беседка':30,
    'VIP-беседка':10,
    'Гостиница':2,
    'Только рыбалка':30
  };
  const PRIMARY=['Стандартная беседка','Средняя беседка','Большая беседка','VIP-беседка','Гостиница','Только рыбалка'];
  function primaryObject(){return checked('Объект').filter(x=>PRIMARY.includes(x)).sort((a,b)=>CAP[b]-CAP[a])[0]||null;}
  function guestLimit(){const o=primaryObject(); return o?CAP[o]:30;}
  function guestName(n){return n===1?'гость':(n<5?'гостя':'гостей');}
  let toastTimer;
  function showToast(message){
    if(!toast)return;
    toast.textContent=message; toast.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),4200);
  }
  function syncGuestLimit({notify=false}={}){
    const o=primaryObject(), max=guestLimit(), old=parseInt(guests.value,10)||1;
    guests.max=String(max);
    guests.setAttribute('aria-valuemax',String(max));
    const plus=guests.parentElement?.querySelector('[data-step="1"]');
    if(plus) plus.disabled=old>=max;
    if(old>max){
      guests.value=max;
      if(notify && o){
        const alt=o==='Стандартная беседка'?'Если гостей больше 6, выберите «Среднюю» или «Большую беседку».':o==='Средняя беседка'||o==='VIP-беседка'?'Если гостей больше 10, выберите «Большую беседку».':o==='Гостиница'?'Для гостиницы доступно до 2 гостей.':'Для выбранного формата доступно до '+max+' гостей.';
        showToast('Для «'+o+'» максимум '+max+' '+guestName(max)+'. '+alt);
      }
    }
    return max;
  }
  form.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
    const el=$(b.dataset.for);
    if(el===guests){
      const max=guestLimit(), current=parseInt(el.value,10)||1, next=current+parseInt(b.dataset.step,10);
      if(next>max){
        const o=primaryObject();
        if(o){
          const alt=o==='Стандартная беседка'?' Если вас больше 6, выберите «Среднюю» или «Большую беседку».':o==='Средняя беседка'||o==='VIP-беседка'?' Если вас больше 10, выберите «Большую беседку».':o==='Гостиница'?' Для гостиницы максимум 2 гостя.':'';
          showToast('Для «'+o+'» максимум '+max+' '+guestName(max)+'.'+alt);
        }
        el.value=max; el.dispatchEvent(new Event('input',{bubbles:true})); return;
      }
    }
    el.value=clamp(el,(parseInt(el.value,10)||1)+parseInt(b.dataset.step,10));
    if(el===fishers) fishTouched=true;
    el.dispatchEvent(new Event('input',{bubbles:true}));
  }));
  fishers.addEventListener('input',()=>{fishTouched=true;});
  guests.addEventListener('input',()=>{
    const max=guestLimit(), v=parseInt(guests.value,10)||1;
    if(v>max){
      guests.value=max; syncGuestLimit();
      const o=primaryObject();
      if(o){
        const alt=o==='Стандартная беседка'?' Если вас больше 6, выберите «Среднюю» или «Большую беседку».':o==='Средняя беседка'||o==='VIP-беседка'?' Если гостей больше 10, выберите «Большую беседку».':o==='Гостиница'?' Для гостиницы максимум 2 гостя.':'';
        showToast('Для «'+o+'» максимум '+max+' '+guestName(max)+'.'+alt);
      }
    }
    if(!fishTouched){ fishers.value=clamp(fishers,parseInt(guests.value,10)); }
  });

  /* ---------- расчёт суммы ---------- */
  const PR={'Стандартная беседка':[3000,4000],'Средняя беседка':[6000,8000],'Большая беседка':[8000,8000],'VIP-беседка':[15000,15000],'Гостиница':[6000,8000],'Банный чан':[6000,6000]};
  const NARODNY='Народный день 07:00–18:00';
  const FP={'Полдня 12:00–18:00':3000,'День 07:00–18:00':5000,[NARODNY]:3000};
  const TP={'Подсачник':200,'Садок':200,'Поплавочная снасть':500,'Донная снасть':500,'Спиннинг':1000};
  const HOL=['01-01','01-02','01-03','01-04','01-05','01-06','01-07','01-08','02-23','03-08','05-01','05-09','06-12','11-04'];
  const rubText=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+'\u00a0₽';
  const rub=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+'\u00a0<span class="rub-symbol">₽</span>';
  const stripHtml=s=>String(s).replace(/<[^>]*>/g,'');
  const pd=s=>{const a=s.split('-');return new Date(+a[0],+a[1]-1,+a[2]);};
  const isWe=dt=>{const g=dt.getDay();return g===0||g===6||HOL.includes(pad(dt.getMonth()+1)+'-'+pad(dt.getDate()));};
  let calc={lines:[],sum:0,notes:[]};
  function compute(){
    const lines=[],notes=[]; let sum=0;
    const hasDate=!!dateEl.value, dt=hasDate?pd(dateEl.value):null;
    const o=checked('Объект'), f=checked('Рыбалка')[0], t=checked('Напрокат');
    if(o.includes('Только рыбалка')) notes.push('Только рыбалка: можно занять свободную мини-беседку 1 × 1 м в любом месте пруда бесплатно, без аренды платной беседки.');
    o.forEach(name=>{
      const p=PR[name]; if(!p) return;
      if(name==='Гостиница'){
        const n=parseInt(nights.value,10)||1; let s=0;
        for(let i=0;i<n;i++){const x=hasDate?new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+i):null; s+=x&&isWe(x)?p[1]:p[0];}
        lines.push([name+', '+n+' '+(n===1?'ночь':n<5?'ночи':'ночей'),s]); sum+=s;
      }else{
        const v=hasDate&&isWe(dt)?p[1]:p[0];
        lines.push([name,v]); sum+=v;
        if(name==='Большая беседка'){
          const g=parseInt(guests.value,10)||1, extra=Math.max(0,g-15)*500;
          if(extra){ lines.push(['Доп. гости ('+(g-15)+' × 500 ₽)',extra]); sum+=extra; }
        }
      }
      if(name==='Большая беседка') notes.push('До 15 гостей включено. С 16-го гостя — +'+rub(500)+' за каждого.');
      if(name==='Банный чан') notes.push('Чан: '+rub(6000)+' за 3 часа, продление '+rub(1000)+' в час.');
    });
    if(FP[f]){
      const n=parseInt(fishers.value,10)||1, s=FP[f]*n;
      lines.push(['Рыбалка ('+f.split(' ')[0].toLowerCase()+'), '+n+' чел. × '+rub(FP[f]),s]); sum+=s;
    }
    if(f===NARODNY){
      notes.push('Народный день — только по понедельникам, без запуска форели.');
      if(hasDate && dt.getDay()!==1) notes.push('Выбранная дата не понедельник: народный день в этот день не проводится.');
    }
    if(o.includes('Только рыбалка') && FP[f]){
      notes.push('В выбранный тариф входит только рыбалка. Мини-беседка 1 × 1 м предоставляется бесплатно и не увеличивает стоимость.');
    }
    t.forEach(x=>{lines.push([x+' напрокат',TP[x]]); sum+=TP[x];});
    if(o.some(x=>x!=='Большая беседка'&&x!=='VIP-беседка'&&x!=='Банный чан'&&x!=='Только рыбалка')&&!hasDate) notes.push('Укажите дату: в выходные и праздники беседки и гостиница дороже.');
    calc={lines,sum,notes};
    return calc;
  }
  const PREPAY=2000;
  const needsPrepay=()=>checked('Объект').some(x=>x!=='Только рыбалка');
  function upd(){
    const r=compute(), ul=$('bkLines');
    nightsBox.hidden=!checked('Объект').includes('Гостиница');
    ul.innerHTML=r.lines.length?r.lines.map(l=>'<li><span>'+l[0]+'</span><b>'+rub(l[1])+'</b></li>').join(''):'<li class="bk-empty">Выберите, что бронируем, и здесь появится сумма.</li>';
    const emptySummary=form.querySelector('.booking-summary__empty');
    if(emptySummary) emptySummary.hidden=!!r.lines.length;
    const pre=needsPrepay(), stEl=document.querySelector('.booking-summary__status'), trB=document.querySelector('.booking-summary__trust b');
    if(stEl){stEl.innerHTML=pre?'Предоплата '+rub(PREPAY):'Без предоплаты'; stEl.classList.toggle('is-prepay',pre);}
    if(trB) trB.innerHTML=pre?'Предоплата '+rub(PREPAY)+' за бронирование':'Никакой оплаты сейчас';
    $('bkSum').innerHTML=rub(r.sum); $('bkBarSum').innerHTML=rub(r.sum);
    $('bkNote').innerHTML=r.notes.concat(['Сумма ориентировочная, точную подтвердим по телефону.']).join(' ');
    showBar();
  }
  let totalVisible=false, formVisible=false;
  function showBar(){ bar.hidden=!(calc.sum>0 && formVisible && !totalVisible && !form.hidden); }
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>{totalVisible=es[0].isIntersecting;showBar();}).observe(total);
    new IntersectionObserver(es=>{formVisible=es[0].isIntersecting;showBar();},{threshold:.05}).observe(form);
  }
  bar.addEventListener('click',()=>total.scrollIntoView({behavior:'smooth',block:'center'}));
  form.addEventListener('input',upd); form.addEventListener('change',upd);
  dateEl.addEventListener('change',()=>{updateFlow(); upd();});
  /* ---------- свой календарь даты (одинаковый на ПК и телефоне) ---------- */
  const dateBtn=$('bfDateBtn'), dateText=$('bfDateText');
  const MNAMES=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const MGEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const todayStart=new Date(); todayStart.setHours(0,0,0,0);
  const curMonth=new Date(todayStart.getFullYear(),todayStart.getMonth(),1);
  let view=curMonth;
  const calPanel=document.createElement('div');
  calPanel.className='bf-cal'; calPanel.hidden=true;
  calPanel.setAttribute('role','dialog'); calPanel.setAttribute('aria-label','Выбор даты приезда');
  dateBtn.closest('.bf-field').appendChild(calPanel);
  const isoOf=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  function setDateText(){
    if(dateEl.value){ const a=dateEl.value.split('-'); dateText.textContent=(+a[2])+' '+MGEN[+a[1]-1]+' '+a[0]; }
    else dateText.textContent='Выберите дату';
    dateBtn.classList.toggle('has-value',!!dateEl.value);
  }
  function renderCal(){
    const y=view.getFullYear(), m=view.getMonth();
    const first=(new Date(y,m,1).getDay()+6)%7, days=new Date(y,m+1,0).getDate();
    const prevOff=view<=curMonth;
    let h='<div class="bf-cal__head"><button type="button" class="bf-cal__nav" data-nav="-1" aria-label="Предыдущий месяц"'+(prevOff?' disabled':'')+'>‹</button>'
      +'<b>'+MNAMES[m]+' '+y+'</b><button type="button" class="bf-cal__nav" data-nav="1" aria-label="Следующий месяц">›</button></div>';
    h+='<div class="bf-cal__grid">'+WD.map(w=>'<span class="bf-cal__wd">'+w+'</span>').join('');
    for(let i=0;i<first;i++) h+='<span></span>';
    for(let d=1; d<=days; d++){
      const dt=new Date(y,m,d), iso=isoOf(dt);
      const cls=['bf-cal__day']; if(isWe(dt)) cls.push('is-we'); if(iso===dateEl.value) cls.push('is-sel');
      h+='<button type="button" class="'+cls.join(' ')+'" data-iso="'+iso+'"'+(dt<todayStart?' disabled':'')+'>'+d+'</button>';
    }
    h+='</div><div class="bf-cal__legend"><span><i class="lg-wd"></i>будни</span><span><i class="lg-we"></i>выходные и праздники, дороже</span></div>';
    calPanel.innerHTML=h;
  }
  function openCal(open){
    if(open){ view=dateEl.value?pd(dateEl.value):curMonth; view=new Date(view.getFullYear(),view.getMonth(),1); renderCal(); }
    calPanel.hidden=!open; dateBtn.setAttribute('aria-expanded',String(open));
    const st=dateBtn.closest('.bk-step'); if(st) st.classList.toggle('cal-open',open);
  }
  dateBtn.addEventListener('click',()=>openCal(calPanel.hidden));
  calPanel.addEventListener('click',e=>{
    const nav=e.target.closest('[data-nav]'), day=e.target.closest('[data-iso]');
    if(nav){ view=new Date(view.getFullYear(),view.getMonth()+(+nav.dataset.nav),1); renderCal(); return; }
    if(day){
      dateEl.value=day.dataset.iso; setDateText(); openCal(false);
      dateEl.dispatchEvent(new Event('change',{bubbles:true}));
      dateEl.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
  document.addEventListener('click',e=>{ if(!calPanel.hidden && !e.target.closest('.bk-datefield')) openCal(false); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') openCal(false); });
  form.addEventListener('reset',()=>setTimeout(setDateText,0));
  setDateText();


  /* ---------- пошаговая бронь: на экране один шаг, кнопки «Назад» / «Далее» ---------- */
  const stepEls=[step1,step2,step3,step4];
  const asideSubmit=form.querySelector('.booking-submit');
  let cur=1;
  const hasObjectNow=()=>!!primaryObject()||checked('Объект').includes('Банный чан');
  const hasFishingNow=()=>{const f=checked('Рыбалка')[0]; return checked('Объект').includes('Только рыбалка')?!!f&&f!=='Без рыбалки':!!f;};
  function renderStep(anim){
    stepEls.forEach((el,i)=>{el.hidden=(i+1)!==cur;});
    const el=stepEls[cur-1];
    if(anim&&el){ el.classList.remove('is-open'); el.classList.add('bk-step--reveal'); void el.offsetWidth; el.classList.add('is-open'); }
    stepEls.forEach((s,i)=>{
      const cnt=s.querySelector('.bk-nav__count'); if(cnt) cnt.textContent='Шаг '+(i+1)+' из 4';
      const back=s.querySelector('[data-back]'), next=s.querySelector('[data-next]');
      if(back) back.hidden=i===0;
      if(next) next.hidden=i===3;
    });
    if(asideSubmit) asideSubmit.hidden=cur!==4;
    showBar();
  }
  function scrollToCard(){
    /* Прокрутка к шагу формы: у каждого шага своя настройка (bkstep1..4), по умолчанию - верх карточки под шапкой */
    const st=stepEls[cur-1], v=scrollOffsetFor('bkstep'+cur,null);
    if(v!==null && st){
      glide(()=>{ let ty=0; try{ ty=new DOMMatrix(getComputedStyle(st).transform).m42||0; }catch(_){}
        return Math.max(0,Math.round(st.getBoundingClientRect().top-ty+window.scrollY-v)); },()=>{});
      return;
    }
    if(!bookCard) return;
    glide(()=>Math.max(0,Math.round(bookCard.getBoundingClientRect().top+window.scrollY-hdrH()-14)),()=>{});
  }
  function gotoStep(n){ cur=n; renderStep(true); scrollToCard(); }
  function stepError(n){
    if(n===1 && !hasObjectNow()){ step1.classList.add('bf-invalid'); return 'Сначала выберите, где будете отдыхать.'; }
    if(n===2 && !hasFishingNow()) return checked('Объект').includes('Только рыбалка')?'Выберите тариф рыбалки.':'Выберите, будете ли вы рыбачить.';
    if(n===3){
      const ok=!!dateEl.value&&dateEl.value>=dateEl.min;
      dateBtn.closest('.bf-field').classList.toggle('bf-invalid',!ok);
      if(!ok) return 'Выберите дату приезда.';
    }
    return null;
  }
  form.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{
    const err=stepError(cur);
    if(err){ showToast(err); return; }
    if(cur<4) gotoStep(cur+1);
  }));
  form.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>{ if(cur>1) gotoStep(cur-1); }));

  /* Плавная прокрутка, которая останавливается точно в нужном месте; после остановки вызывается done. */
  let focusToken=0;
  ['wheel','touchstart'].forEach(ev=>window.addEventListener(ev,()=>{focusToken++;},{passive:true}));
  function glide(topFn,done){
    const token=++focusToken;
    const reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    requestAnimationFrame(()=>{
      window.scrollTo({top:topFn(),behavior:reduce?'auto':'smooth'});
      let last=-1,still=0,n=0;
      (function tick(){
        if(token!==focusToken) return;
        const y=window.scrollY; still=(y===last)?still+1:0; last=y; n++;
        if(still>=5||n>150){
          const want=topFn();
          if(Math.abs(want-window.scrollY)>2) window.scrollTo({top:want,behavior:'auto'});
          done();
        }else requestAnimationFrame(tick);
      })();
    });
  }
  function pulseEl(el,token){
    const lg=el.querySelector(':scope > legend'); el.style.setProperty('--lg',(lg?lg.offsetHeight+parseFloat(getComputedStyle(lg).marginBottom||0):0)+'px');
    el.classList.remove('bk-step--pulse'); void el.offsetWidth; el.classList.add('bk-step--pulse');
    clearTimeout(el._pulseT); el._pulseT=setTimeout(()=>el.classList.remove('bk-step--pulse'),3800);
  }
  const hdrH=()=>((document.querySelector('header')||{}).offsetHeight||62);
  /* Прокрутка к следующему шагу: останавливается точно на нём (под шапкой), после остановки шаг пульсирует. */
  function focusStep(el){
    if(!el || el.hidden) return;
    const topFor=()=>{
      let ty=0; try{ ty=new DOMMatrix(getComputedStyle(el).transform).m42||0; }catch(_){}
      return Math.max(0, Math.round(el.getBoundingClientRect().top - ty + window.scrollY - hdrH() - 30));
    };
    glide(topFor,()=>pulseEl(el));
  }
  /* Любая кнопка «Забронировать» ведёт к разделу брони, останавливается точно на нём и пульсирует карточкой формы. */
  const bookSec=document.getElementById('booking'), bookCard=document.querySelector('.booking-card');
  document.querySelectorAll('a[href="#booking"]').forEach(a=>a.addEventListener('click',e=>{
    if(!bookSec) return;
    e.preventDefault();
    glide(()=>Math.max(0,Math.round(bookSec.getBoundingClientRect().top+window.scrollY-scrollOffsetFor('booking',hdrH()+14))),()=>{ if(bookCard) pulseEl(bookCard); });
  }));

  function updateFlow(){
    if(cur>1 && !hasObjectNow()) cur=1;
    renderStep(false);
  }
  /* Логика веток: «Только рыбалка» сразу переходит к выбору тарифа рыбалки. */
  function syncFish(){
    const fishingOnly=checked('Объект').includes('Только рыбалка');
    const fishingInput=checked('Рыбалка')[0];
    const on=!!fishingInput && fishingInput!=='Без рыбалки';

    if(fishingOnly){
      /* Нельзя оставить старое значение «Без рыбалки» после смены объекта.
         Для рыбалки клиент обязан выбрать конкретный тариф. */
      const noFish=form.querySelector('input[name="Рыбалка"][value="Без рыбалки"]');
      if(noFish) noFish.checked=false;
      if(noFishingPill) noFishingPill.hidden=true;
      if(fishLegend) fishLegend.textContent='Выберите время рыбалки';
      tackle.hidden=!on;
      guestsFieldEl.hidden=true;
      guests.required=false;
      fishTouched=true;
    }else{
      if(noFishingPill) noFishingPill.hidden=false;
      if(fishLegend) fishLegend.textContent='Выберите время рыбалки';
      tackle.hidden=!on;
      guestsFieldEl.hidden=false;
      guests.required=true;
    }

    if(!on) tackle.querySelectorAll('input[name="Напрокат"]').forEach(i=>i.checked=false);
  }
  form.querySelectorAll('input[name="Рыбалка"]').forEach(i=>i.addEventListener('change',()=>{syncFish(); updateFlow(); upd(); }));
  syncFish(); syncGuestLimit(); updateFlow(); upd();
  /* Банный чан - только вместе с гостиницей (переодеться больше негде); гостиницу можно без чана. */
  function enforceChan(src){
    const chan=objs().find(x=>x.value==='Банный чан'), hotel=objs().find(x=>x.value==='Гостиница');
    if(!chan||!hotel||!chan.checked||hotel.checked) return;
    if(src==='Гостиница'){ chan.checked=false; showToast('Банный чан бронируется только вместе с гостиницей, поэтому он тоже снят.'); }
    else{ hotel.checked=true; showToast('Банный чан бронируется только вместе с гостиницей: мы добавили гостиницу, там можно переодеться.'); }
  }
  objs().forEach(i=>i.addEventListener('change',()=>{
    step1.classList.remove('bf-invalid');
    if(i.checked){
      if(i.value==='Только рыбалка'){
        objs().forEach(x=>{if(x!==i) x.checked=false;});
      }else{
        /* Можно выбрать несколько вариантов; «Только рыбалка» несовместима с остальными. */
        const only=objs().find(x=>x.value==='Только рыбалка');
        if(only) only.checked=false;
      }
    }
    enforceChan(i.value);
    syncFish();
    syncGuestLimit();
    updateFlow();
    upd();
  }));

  /* кнопки «Забронировать» в карточках выбирают объект в форме */
  document.querySelectorAll('[data-book]').forEach(a=>a.addEventListener('click',()=>{
    const i=objs().find(x=>x.value===a.dataset.book);
    if(i){i.checked=true; const only=objs().find(x=>x.value==='Только рыбалка'); if(only) only.checked=false; step1.classList.remove('bf-invalid'); const b=i.nextElementSibling; b.classList.remove('bf-flash'); void b.offsetWidth; b.classList.add('bf-flash');}
    enforceChan(a.dataset.book);
    syncFish(); syncGuestLimit(); updateFlow(); upd();
    cur=1; renderStep(true); /* остаёмся на шаге 1: клиент сам добавляет варианты и жмёт «Далее» */
  }));

  /* «Посмотреть на карте»: прокрутка к схеме, затем подсветка (стандартные беседки - все 6 сразу, один пульс) */
  function afterScroll(cb){
    let last=-1,still=0,n=0;
    (function tick(){
      const y=window.scrollY; still=(y===last)?still+1:0; last=y; n++;
      if(still>=6||n>150) cb(); else requestAnimationFrame(tick);
    })();
  }
  document.querySelectorAll('[data-map]').forEach(a=>a.addEventListener('click',e=>{
    const map=document.getElementById('territoryMap'); if(!map) return;
    e.preventDefault();
    {const tm=document.getElementById('territory-map')||map; window.scrollTo({top:Math.max(0,tm.getBoundingClientRect().top+window.scrollY-scrollOffsetFor('territory-map',parseFloat(getComputedStyle(tm).scrollMarginTop)||0)),behavior:'smooth'});}
    const key=a.dataset.map;
    afterScroll(()=>{
      if(key==='standard'){
        const list=[...map.querySelectorAll('.map-marker--standard')];
        list.forEach(m=>{m.classList.remove('map-hl'); void m.offsetWidth; m.classList.add('map-hl');});
        setTimeout(()=>list.forEach(m=>m.classList.remove('map-hl')),2800);
      }else{
        const mk=map.querySelector('[data-marker="'+key+'"]'); if(mk) mk.click();
      }
    });
  }));
  const pl=$('bfPrivacy'); if(pl) pl.addEventListener('click',e=>{e.preventDefault();const o=$('privacyOpen'); if(o) o.click();});

  const mark=(el,bad)=>el.classList.toggle('bf-invalid',bad);
  [nameEl,phoneEl,dateEl].forEach(el=>el.addEventListener('input',()=>mark(el,false)));

  function validate(){
    const noPick=checked('Объект').length===0;
    const noFishing=!checked('Рыбалка').length;
    mark(step1,noPick);
    const list=[[nameEl,nameEl.value.trim().length>=2],[phoneEl,phoneEl.value.replace(/\D/g,'').length===11],[dateEl,!!dateEl.value&&dateEl.value>=dateEl.min]];
    list.forEach(([el,ok])=>mark(el,!ok));
    if(noPick) return {el:step1,msg:'Сначала выберите, где будете отдыхать.'};
    const fishingOnly=checked('Объект').includes('Только рыбалка');
    if(noFishing) return {el:step2,msg:fishingOnly?'Выберите тариф рыбалки.':'Выберите, будете ли вы рыбачить.'};
    if(fishingOnly && checked('Рыбалка')[0]==='Без рыбалки') return {el:step2,msg:'Для варианта «Только рыбалка» нужно выбрать тариф рыбалки.'};
    const bad=list.find(x=>!x[1]);
    if(bad) return {el:bad[0],msg:'Проверьте выделенные поля.'};
    return null;
  }

  /* Номер заявки: Б-4827 (4 цифры). Он же в теме письма: в почте ищется по «Б-4827» или по слову «Заявка». */
  function makeReqId(){
    const u=new Uint32Array(1);
    if(window.crypto&&crypto.getRandomValues) crypto.getRandomValues(u); else u[0]=Math.random()*4294967296;
    return 'Б-'+(1000+u[0]%9000);
  }
  /* Защита от спама (на стороне браузера): слишком быстрая отправка = бот, пауза между заявками, лимит в час. */
  const formOpenedAt=Date.now();
  function spamCheck(){
    if(Date.now()-formOpenedAt<8000) return 'bot';
    const now=Date.now(); let log=[];
    try{ log=JSON.parse(localStorage.getItem('bf_sent')||'[]').filter(t=>now-t<3600000); }catch(_){}
    if(log.length&&now-log[log.length-1]<60000) return 'Заявка уже отправлена. Подождите минуту или позвоните нам.';
    if(log.length>=3) return 'Слишком много заявок за час. Позвоните нам: +7 926 926-78-87';
    return '';
  }
  function markSent(){
    const now=Date.now(); let log=[];
    try{ log=JSON.parse(localStorage.getItem('bf_sent')||'[]').filter(t=>now-t<3600000); log.push(now); localStorage.setItem('bf_sent',JSON.stringify(log)); }catch(_){}
  }
  $('bfIdCopy').addEventListener('click',()=>{
    const t=$('bfId').textContent, b=$('bfIdCopy');
    const ok=()=>{b.textContent='Скопировано'; setTimeout(()=>b.textContent='Скопировать',1800);};
    if(navigator.clipboard) navigator.clipboard.writeText(t).then(ok,()=>{}); else ok();
  });
  /* Возвращает 'ok' (сервер подтвердил) или 'unknown' (запрос ушёл, но ответ не дошёл: типично для мобильных сетей — письмо при этом приходит).
     Бросает ошибку только при явном отказе сервера или если нет сети. */
  let sendWhy='';
  const escT=v=>String(v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  async function sendMail(payload){
    let r;
    try{
      r=await fetch('https://formsubmit.co/ajax/'+BOOKING_EMAIL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
    }catch(e){
      console.error('formsubmit: нет ответа',e);
      sendWhy=String(e&&e.name||'')+': '+String(e&&e.message||'')+' | online='+navigator.onLine;
      if(navigator.onLine===false) throw e;
      return 'unknown';
    }
    const j=await r.json().catch(()=>null);
    console.log('formsubmit',r.status,j);
    if(!r.ok||(j&&String(j.success)==='false')){ sendWhy='HTTP '+r.status+' '+(j&&j.message||''); throw new Error('formsubmit '+r.status+' '+(j&&j.message||'')); }
    return 'ok';
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault(); status.textContent=''; status.className='bf-status';
    const err=validate();
    if(err){status.textContent=err.msg; status.classList.add('is-error'); err.el.scrollIntoView({behavior:'smooth',block:'center'}); if(err.el.focus&&err.el!==step1) err.el.focus({preventScroll:true}); return;}
    if(form.elements['_honey'].value) return;
    const spam=spamCheck();
    if(spam==='bot'){ $('bfId').textContent=makeReqId(); form.hidden=true; success.hidden=false; return; } /* бот: делаем вид, что отправлено, письмо не уходит */
    if(spam){ status.textContent=spam; status.classList.add('is-error'); return; }
    const contact=checked('Способ связи')[0];
    store.set('bf_name',nameEl.value.trim()); store.set('bf_phone',phoneEl.value); store.set('bf_contact',contact);
    const dateRu=dateEl.value.split('-').reverse().join('.');
    const o=checked('Объект'), f=checked('Рыбалка')[0], t=checked('Напрокат'); compute();
    const reqId=makeReqId();
    /* Письмо администратору: строки по порядку чтения, пустые не выводятся */
    const dObj=pd(dateEl.value), WDN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
    const onlyFish=o.includes('Только рыбалка'), fishing=f&&f!=='Без рыбалки';
    const payload={_subject:'Заявка '+reqId+' · '+nameEl.value.trim()+' · '+dateRu+' · '+(o.length?o.join(', '):'Рыбалка')+' ('+rubText(calc.sum)+')', _template:'table', _captcha:'false'};
    const put=(k,v)=>{ if(v!==undefined&&v!==null&&String(v).trim()!=='') payload[k]=v; };
    put('🔖 Номер заявки',reqId);
    put('👤 Имя',nameEl.value.trim());
    put('📞 Телефон',phoneEl.value);
    put('💬 Как связаться',contact);
    put('📅 Дата приезда',dateRu+', '+WDN[dObj.getDay()]+(isWe(dObj)?' (выходной / праздник)':' (будни)'));
    put('🏕 Что бронируют',onlyFish?'Только рыбалка':o.join(', '));
    put('👥 Гостей',onlyFish?'':guests.value);
    put('🌙 Ночей в гостинице',o.includes('Гостиница')?nights.value:'');
    put('🎣 Рыбалка',fishing?f+', '+fishers.value+' чел.':'Без рыбалки');
    put('🧰 Снасти напрокат',t.join(', '));
    put('🧮 Расчёт',calc.lines.map(l=>stripHtml(l[0])+': '+rubText(l[1])).join('  |  '));
    put('💰 Итого (ориентировочно)',rubText(calc.sum));
    put('💳 Предоплата',needsPrepay()?rubText(PREPAY):'не требуется');
    put('📝 Пожелание клиента',$('bfComment').value.trim());
    btn.disabled=true; btn.classList.add('is-loading'); btn.firstElementChild.textContent='Отправляем…';
    try{
      const res=await sendMail(payload);
      markSent();
      if(window.ym) ym(28138044,'reachGoal','booking_submit');
      $('bfUnsure').hidden=(res!=='unknown');
      $('bfId').textContent=reqId; form.hidden=true; success.hidden=false; success.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(x){
      console.error('booking send failed',x);
      status.innerHTML='Не удалось отправить. Позвоните нам: <a href="tel:+79269267887">+7 926 926-78-87</a><br><small style="opacity:.6">тех. код: '+escT(sendWhy||String(x&&x.message||x))+'</small>';
      status.classList.add('is-error');
    }finally{
      btn.disabled=false; btn.classList.remove('is-loading'); btn.firstElementChild.textContent='Отправить заявку';
    }
  });
  $('bfAgain').addEventListener('click',()=>{
    success.hidden=true; form.hidden=false; $('bfComment').value='';
    objs().forEach(i=>i.checked=false); form.querySelector('input[name="Рыбалка"][value="Без рыбалки"]').checked=true; dateEl.value=''; setDateText(); syncFish(); fishTouched=false; guests.value=2; fishers.value=2; nights.value=1; syncGuestLimit(); cur=1; updateFlow(); upd(); form.scrollIntoView({behavior:'smooth',block:'start'});
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
