/* ВРЕМЕННЫЙ ИНСТРУМЕНТ настройки прокрутки. После настройки удаляется вместе с <script src="scroll-tuner.js">. */
(function(){
  var POINTS=[
    {key:'price',label:'Цены',hint:'меню «Цены», кнопка «Посмотреть цены»'},
    {key:'hotel',label:'Беседки и отдых',hint:'меню «Беседки и отдых»'},
    {key:'tips',label:'Что ловится',hint:'меню «Что ловится»'},
    {key:'catch',label:'Улов',hint:'меню «Улов»'},
    {key:'contacts',label:'Контакты',hint:'меню «Контакты»'},
    {key:'booking',label:'Бронирование',hint:'все кнопки «Забронировать»'},
    {key:'territory-map',label:'Карта',hint:'кнопки «Посмотреть на карте»'},
    {key:'bkstep2',label:'Шаг 2: время рыбалки',sel:'#bkStep2',hint:'в форме дойди «Далее» до шага «Выберите время рыбалки», подкрути как надо'},
    {key:'bkstep3',label:'Шаг 3: Когда приезжаете?',sel:'#bkStep3',hint:'дойди «Далее» до шага «Когда приезжаете?», подкрути как надо'},
    {key:'bkstep4',label:'Шаг 4: контакты',sel:'#bkStep4',hint:'дойди «Далее» до шага «Оставьте контакты», подкрути как надо'},
    {key:'bkstep1',label:'Шаг 1 (кнопка «Назад»)',sel:'#bkStep1',hint:'на шаге 2 нажми «Назад», подкрути как надо'}
  ];
  var LS='scrollTunerCfg.v2';
  var base=window.SCROLL_CFG||{pc:{},mobile:{}};
  var cfg={pc:Object.assign({},base.pc),mobile:Object.assign({},base.mobile)};
  try{var saved=JSON.parse(localStorage.getItem(LS)||'null'); if(saved&&saved.pc&&saved.mobile){Object.assign(cfg.pc,saved.pc,base.pc);Object.assign(cfg.mobile,saved.mobile,base.mobile);}}catch(_){}
  window.SCROLL_CFG=cfg;

  var mq=window.matchMedia('(max-width:680px)');
  var dev=function(){return mq.matches?'mobile':'pc';};
  var active=null, collapsed=false;

  var css=document.createElement('style');
  css.textContent=
  '#stn{position:fixed;z-index:2147483647;right:12px;bottom:12px;width:330px;max-width:calc(100vw - 24px);background:#14181cf2;color:#f2f2f2;font:13px/1.35 system-ui,sans-serif;border:1px solid #ffffff30;border-radius:14px;box-shadow:0 10px 40px #000a;padding:12px;box-sizing:border-box}'+
  '#stn *{box-sizing:border-box;font-family:inherit}'+
  '#stn .h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}'+
  '#stn .t{font-weight:700;font-size:14px}'+
  '#stn .m{padding:3px 9px;border-radius:99px;background:#2e7d4f;font-weight:700;font-size:12px}'+
  '#stn .m.mob{background:#b5651d}'+
  '#stn .pts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}'+
  '#stn .pt{border:1px solid #ffffff40;background:#ffffff0f;color:inherit;border-radius:9px;padding:7px 10px;font-size:13px;cursor:pointer}'+
  '#stn .pt.ok{border-color:#4caf7a}'+
  '#stn .pt.ok::after{content:" ✓";color:#4caf7a}'+
  '#stn .pt.on{background:#e8b04a;color:#111;border-color:#e8b04a;font-weight:700}'+
  '#stn .pt.on::after{color:#111}'+
  '#stn .info{background:#0006;border-radius:9px;padding:8px 10px;margin-bottom:10px;min-height:56px}'+
  '#stn .info b{color:#e8b04a}'+
  '#stn .row{display:flex;gap:6px;flex-wrap:wrap}'+
  '#stn .b{flex:1 1 auto;border:0;border-radius:9px;padding:10px 12px;font-weight:700;font-size:13px;cursor:pointer;color:#fff;background:#ffffff22}'+
  '#stn .b.go{background:#2e7d4f}'+
  '#stn .b.sv{background:#2f6fb5}'+
  '#stn .b:disabled{opacity:.4;cursor:default}'+
  '#stn .x{background:none;border:0;color:#fff;font-size:18px;cursor:pointer;padding:0 4px}'+
  '#stn.c .pts,#stn.c .info p,#stn.c .row .b:not(.go){display:none}'+
  '#stn.c .info{min-height:0;margin-bottom:8px}'+
  '@media (max-width:680px){#stn{left:8px;right:8px;bottom:8px;width:auto;max-width:none;padding:10px}#stn .pt{padding:8px 10px}}';
  document.head.appendChild(css);

  var box=document.createElement('div'); box.id='stn';
  box.innerHTML=
    '<div class="h"><span class="t">Настройка прокрутки</span><span><span class="m" id="stnM"></span> <button class="x" id="stnC" title="Свернуть">▾</button></span></div>'+
    '<div class="pts" id="stnP"></div>'+
    '<div class="info"><div id="stnI"></div><p id="stnH" style="margin:4px 0 0;opacity:.75"></p></div>'+
    '<div class="row"><button class="b go" id="stnFix" disabled>Зафиксировать</button><button class="b" id="stnTest" disabled>Проверить</button><button class="b" id="stnReset" disabled>Сбросить</button></div>'+
    '<div class="row" style="margin-top:6px"><button class="b sv" id="stnSave">Сохранить файл настроек</button></div>';
  document.body.appendChild(box);

  var $=function(id){return document.getElementById(id);};
  var el=function(p){return document.querySelector(p.sel||('#'+p.key));};
  var curTop=function(p){var e=el(p); return e?Math.round(e.getBoundingClientRect().top):null;};
  function persist(){try{localStorage.setItem(LS,JSON.stringify(cfg));}catch(_){}}

  function renderPts(){
    var d=dev(), h='';
    POINTS.forEach(function(p){
      h+='<button class="pt'+(typeof cfg[d][p.key]==='number'?' ok':'')+(active&&active.key===p.key?' on':'')+'" data-k="'+p.key+'">'+p.label+'</button>';
    });
    $('stnP').innerHTML=h;
  }
  function renderInfo(){
    var d=dev(); $('stnM').textContent=d==='pc'?'ПК':'Телефон'; $('stnM').className='m'+(d==='mobile'?' mob':'');
    var i=$('stnI'), hh=$('stnH');
    ['stnFix','stnTest','stnReset'].forEach(function(id){$(id).disabled=!active;});
    if(!active){
      i.innerHTML='Выбери пункт из списка. Режим: <b>'+(d==='pc'?'ПК':'Телефон')+'</b> (до 680px = телефон).';
      hh.textContent=''; return;
    }
    var t=curTop(active), s=cfg[d][active.key];
    i.innerHTML='<b>'+active.label+'</b>: сейчас '+(t===null?'—':t+' px от верха')+(typeof s==='number'?' · сохранено '+s+' px':'');
    hh.textContent='Прокрути как нужно и нажми «Зафиксировать». ('+active.hint+')';
  }
  function refresh(){renderPts();renderInfo();}

  $('stnP').addEventListener('click',function(e){
    var b=e.target.closest('.pt'); if(!b) return;
    active=POINTS.filter(function(p){return p.key===b.dataset.k;})[0];
    if(active.key.indexOf('bkstep')!==0) window.scrollTo({top:0,left:0,behavior:'instant'});
    refresh();
  });
  $('stnFix').addEventListener('click',function(){
    if(!active) return; var e0=el(active); if(e0&&e0.hidden){$('stnH').textContent='Этот шаг сейчас не открыт: дойди до него кнопкой «Далее».';return;} var t=curTop(active); if(t===null) return;
    cfg[dev()][active.key]=t; persist(); refresh();
  });
  $('stnTest').addEventListener('click',function(){
    if(!active) return; var e=el(active); if(!e||e.hidden){$('stnH').textContent='Этот шаг сейчас не открыт.';return;}
    var v=cfg[dev()][active.key];
    if(typeof v!=='number'){ $('stnH').textContent='Сначала зафиксируй положение.'; return; }
    window.scrollTo({top:0,left:0,behavior:'instant'});
    setTimeout(function(){window.scrollTo({top:Math.max(0,e.getBoundingClientRect().top+window.scrollY-v),behavior:'smooth'});},60);
  });
  $('stnReset').addEventListener('click',function(){
    if(!active) return; delete cfg[dev()][active.key]; persist(); refresh();
  });
  $('stnC').addEventListener('click',function(){
    collapsed=!collapsed; box.classList.toggle('c',collapsed); $('stnC').textContent=collapsed?'▴':'▾';
  });
  $('stnSave').addEventListener('click',function(){
    var blob=new Blob([JSON.stringify({pc:cfg.pc,mobile:cfg.mobile},null,2)],{type:'application/json'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='scroll-settings.json';
    document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  });
  window.addEventListener('scroll',function(){ if(active) renderInfo(); },{passive:true});
  window.addEventListener('resize',refresh,{passive:true});
  refresh();
})();
