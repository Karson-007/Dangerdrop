(function(){

  /* ════════════════════════════════════════
     皮特托坠落动画
     Phase 1: 从顶部加速落到屏幕中央偏上，同时旋转
     撞击: 画面震屏
     Phase 2: 短暂停顿后继续旋转加速落出屏幕底部
     之后: 中央内容（像素标题、进度条等）淡入
  ════════════════════════════════════════ */

  var piktoWrap = document.getElementById('ioPiktoWrap');
  var overlay   = document.getElementById('intro-overlay');

  function easeInQuart(t){ return t * t * t * t; }
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  var shakeSeq = [[-7,3],[6,-5],[-5,4],[4,-3],[-3,2],[2,-1],[0,0]];
  function shakeScreen(){
    var f = 0;
    var iv = setInterval(function(){
      if(f >= shakeSeq.length){ clearInterval(iv); overlay.style.transform = ''; return; }
      overlay.style.transform = 'translate(' + shakeSeq[f][0] + 'px,' + shakeSeq[f][1] + 'px)';
      f++;
    }, 38);
  }

  function runPikto(){
    var wh = window.innerHeight;
    var midY  = Math.floor(wh * 0.28);   /* 落到此处短暂停 */
    var outY  = wh + 180;                /* 落出屏幕底部 */

    /* ── Phase 1: 落到中央 ── */
    var p1Start = null, p1Dur = 680, midRot = 210;
    function phase1(ts){
      if(!p1Start) p1Start = ts;
      var p  = Math.min((ts - p1Start) / p1Dur, 1);
      var ep = easeInQuart(p);
      var y   = -160 + (midY + 160) * ep;
      var rot = midRot * p;
      piktoWrap.style.top       = y + 'px';
      piktoWrap.style.transform = 'translateX(-50%) rotate(' + rot + 'deg)';
      if(p < 1){ requestAnimationFrame(phase1); return; }

      /* 落地 → 震屏 */
      shakeScreen();

      /* ── Phase 2: 短暂停（100ms）后继续落出底部 ── */
      setTimeout(function(){
        var p2Start = null, p2Dur = 480;
        function phase2(ts){
          if(!p2Start) p2Start = ts;
          var p  = Math.min((ts - p2Start) / p2Dur, 1);
          var ep = easeInQuart(p);
          var y   = midY + (outY - midY) * ep;
          var rot = midRot + 200 * p;
          var op  = 1 - Math.max(0, (p - 0.5) / 0.5);
          piktoWrap.style.top       = y + 'px';
          piktoWrap.style.transform = 'translateX(-50%) rotate(' + rot + 'deg)';
          piktoWrap.style.opacity   = op;
          if(p < 1) requestAnimationFrame(phase2);
        }
        requestAnimationFrame(phase2);
      }, 100);
    }
    requestAnimationFrame(phase1);
  }

  /* 页面加载后 150ms 开始 */
  setTimeout(runPikto, 150);

  /* ════════════════════════════════════════
     像素标题 SVG（DANGERDROP）
  ════════════════════════════════════════ */
  var glyphs = {
    'D':[0x7F,0x41,0x41,0x41,0x3E],
    'A':[0x7F,0x09,0x09,0x09,0x7F],
    'N':[0x7F,0x02,0x04,0x08,0x7F],
    'G':[0x3E,0x41,0x49,0x49,0x3A],
    'E':[0x7F,0x49,0x49,0x49,0x41],
    'R':[0x7F,0x09,0x19,0x29,0x46],
    'O':[0x3E,0x41,0x41,0x41,0x3E],
    'P':[0x7F,0x09,0x09,0x09,0x06]
  };
  (function buildPixelTitle(){
    var svg    = document.getElementById('ioPixelTitle');
    var text   = 'DANGERDROP';
    var cell=7, gap=1, lGap=10, rows=7, cols=5;
    var color  = 'rgba(185,210,228,0.88)';
    var totalW = 0;
    for(var k = 0; k < text.length; k++) totalW += cols*(cell+gap)-gap+lGap;
    totalW -= lGap;
    var totalH = rows*(cell+gap)-gap;
    svg.setAttribute('viewBox', '0 0 ' + totalW + ' ' + totalH);
    svg.setAttribute('width',  totalW);
    svg.setAttribute('height', totalH);
    var x = 0;
    for(var i = 0; i < text.length; i++){
      var bitmap = glyphs[text[i]] || glyphs['E'];
      for(var c = 0; c < cols; c++){
        for(var r = 0; r < rows; r++){
          if((bitmap[c] >> r) & 1){
            var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
            rect.setAttribute('x',      x + c*(cell+gap));
            rect.setAttribute('y',      r*(cell+gap));
            rect.setAttribute('width',  cell);
            rect.setAttribute('height', cell);
            rect.setAttribute('fill',   color);
            svg.appendChild(rect);
          }
        }
      }
      x += cols*(cell+gap)-gap+lGap;
    }
  })();

  /* ════════════════════════════════════════
     开屏进度条计数
  ════════════════════════════════════════ */
  var pctEl    = document.getElementById('ioPct');
  var count    = 0;
  var pctTimer = setInterval(function(){
    if(count >= 100){ clearInterval(pctTimer); return; }
    count += Math.ceil(Math.random() * 6);
    if(count > 100) count = 100;
    if(pctEl) pctEl.textContent = count + '%';
  }, 70);

  /* ════════════════════════════════════════
     开屏关闭（点击 or 5秒后）
  ════════════════════════════════════════ */
  function dismissIntro(){
    overlay.classList.add('out');
    clearInterval(pctTimer);
    setTimeout(function(){ overlay.style.display = 'none'; }, 950);
  }
  overlay.addEventListener('click', dismissIntro);
  setTimeout(dismissIntro, 5500);

  /* ════════════════════════════════════════
     初始页面淡入
  ════════════════════════════════════════ */
  var initialPage = document.querySelector('.page.active');
  if(initialPage){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        initialPage.classList.add('visible');
      });
    });
  }

  /* ════════════════════════════════════════
     Gallery 渲染 + 升降序
  ════════════════════════════════════════ */
  var works = [
    { date:'2016/1',  year:'2016', title:'Port',                                       img:'work-01.jpg' },
    { date:'2016/3',  year:'2016', title:'U620',                                       img:'work-02.jpg' },
    { date:'2016/5',  year:'2016', title:'Bayside',                                    img:'work-03.jpg' },
    { date:'2017/2',  year:'2017', title:'994F',                                       img:'work-04.jpg' },
    { date:'2017/8',  year:'2017', title:'Junttan PMX22 / Pile Driving Rig (Finland)', img:'work-05.jpg' }
  ];

  var container   = document.getElementById('galleryItems');
  var tlContainer = document.getElementById('galleryTimeline');
  document.getElementById('galleryCount').textContent = works.length + ' works';

  var sortAsc   = true;
  var yearLabels = {};

  function renderGallery(){
    container.innerHTML = '';
    tlContainer.innerHTML = '<div class="tl-line"></div>';
    yearLabels = {};

    var ordered    = sortAsc ? works.slice() : works.slice().reverse();
    var seenYears  = {};

    ordered.forEach(function(w){
      var origIdx = works.indexOf(w);
      var entry   = document.createElement('div');
      entry.className = 'gallery-entry';
      entry.setAttribute('data-year', w.year);
      entry.innerHTML =
        '<div class="entry-date">'  + w.date  + '</div>' +
        '<div class="entry-img"><img src="' + w.img + '" alt="' + w.title + '"></div>' +
        '<div class="entry-title">' + w.title + '</div>';
      container.appendChild(entry);
      (function(idx){
        entry.querySelector('.entry-img').addEventListener('click', function(){ openLB(idx); });
      })(origIdx);

      if(!seenYears[w.year]){
        seenYears[w.year] = true;
        var yl = document.createElement('div');
        yl.className = 'tl-year' + (Object.keys(seenYears).length === 1 ? ' first' : '');
        yl.textContent = w.year;
        tlContainer.appendChild(yl);
        yearLabels[w.year] = yl;
      }
    });

    container.querySelectorAll('img').forEach(function(img){
      img.addEventListener('load', alignTimeline);
    });
    setTimeout(alignTimeline, 50);
    setTimeout(alignTimeline, 300);
  }

  function alignTimeline(){
    var wrapTop = container.getBoundingClientRect().top + window.scrollY;
    Object.keys(yearLabels).forEach(function(year){
      var firstEntry = container.querySelector('[data-year="' + year + '"]');
      if(firstEntry){
        var entryTop = firstEntry.getBoundingClientRect().top + window.scrollY - wrapTop;
        yearLabels[year].style.top = entryTop + 'px';
      }
    });
  }

  var sortBtn = document.getElementById('sortBtn');
  sortBtn.addEventListener('click', function(){
    sortAsc = !sortAsc;
    sortBtn.querySelector('.sort-label').textContent = sortAsc ? 'ASC' : 'DESC';
    sortBtn.classList.toggle('desc', !sortAsc);
    renderGallery();
    alignTimeline();
  });

  renderGallery();
  window.addEventListener('load',   alignTimeline);
  window.addEventListener('resize', alignTimeline);
  setTimeout(alignTimeline, 100);
  setTimeout(alignTimeline, 500);

  /* ════════════════════════════════════════
     Sidebar 开关
  ════════════════════════════════════════ */
  var toggleBtn = document.getElementById('toggleBtn');
  toggleBtn.addEventListener('click', function(){
    var closed = document.body.classList.toggle('closed');
    toggleBtn.innerHTML = closed ? '&#9654;' : '&#9664;';
  });

  /* ════════════════════════════════════════
     导航页面切换（fade）
  ════════════════════════════════════════ */
  var navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function(link){
    link.addEventListener('click', function(){
      var current = document.querySelector('.page.active');
      var target  = document.getElementById('page-' + link.dataset.page);
      if(!target || target === current) return;

      navLinks.forEach(function(l){ l.classList.remove('active'); });
      link.classList.add('active');

      if(current){
        current.classList.remove('visible');
        setTimeout(function(){
          current.classList.remove('active');
          target.classList.add('active');
          requestAnimationFrame(function(){
            requestAnimationFrame(function(){
              target.classList.add('visible');
              if(link.dataset.page === 'gallery') setTimeout(alignTimeline, 50);
            });
          });
        }, 220);
      } else {
        target.classList.add('active');
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){ target.classList.add('visible'); });
        });
      }
    });
  });

  /* ════════════════════════════════════════
     Lightbox
  ════════════════════════════════════════ */
  var cur = 0;
  var lb  = document.getElementById('lightbox');

  function openLB(i){ cur = i; updateLB(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeLB(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
  function updateLB(){
    var w = works[cur];
    document.getElementById('lb-date').textContent  = w.date;
    document.getElementById('lb-title').textContent = w.title;
    var slot = document.getElementById('lbSlot');
    slot.innerHTML = '<img src="' + w.img + '" alt="' + w.title + '" style="max-width:100%;max-height:100%;object-fit:contain;">';
  }

  document.getElementById('lbClose').addEventListener('click', closeLB);
  document.getElementById('lb-prev').addEventListener('click', function(){ cur = (cur - 1 + works.length) % works.length; updateLB(); });
  document.getElementById('lb-next').addEventListener('click', function(){ cur = (cur + 1) % works.length; updateLB(); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLB(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape')     closeLB();
    if(e.key === 'ArrowLeft')  { cur = (cur - 1 + works.length) % works.length; updateLB(); }
    if(e.key === 'ArrowRight') { cur = (cur + 1) % works.length; updateLB(); }
  });

})();
