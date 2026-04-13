(function(){
  // ── Intro pixel title ──
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
  var text='DANGERDROP', cell=7, gap=1, lGap=10, rows=7, cols=5;
  var color='rgba(185,210,228,0.88)';
  var svg=document.getElementById('ioPixelTitle');
  var totalW=0;
  for(var k=0;k<text.length;k++) totalW+=cols*(cell+gap)-gap+lGap;
  totalW-=lGap;
  svg.setAttribute('viewBox','0 0 '+totalW+' '+(rows*(cell+gap)-gap));
  svg.setAttribute('width',totalW);
  svg.setAttribute('height',rows*(cell+gap)-gap);
  var x=0;
  for(var i=0;i<text.length;i++){
    var bitmap=glyphs[text[i]]||glyphs['E'];
    for(var c=0;c<cols;c++){
      for(var r=0;r<rows;r++){
        if((bitmap[c]>>r)&1){
          var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
          rect.setAttribute('x',x+c*(cell+gap));
          rect.setAttribute('y',r*(cell+gap));
          rect.setAttribute('width',cell);
          rect.setAttribute('height',cell);
          rect.setAttribute('fill',color);
          rect.setAttribute('rx','0');
          svg.appendChild(rect);
        }
      }
    }
    x+=cols*(cell+gap)-gap+lGap;
  }

  // ── Intro dismiss ──
  var overlay=document.getElementById('intro-overlay');
  var pctEl=document.getElementById('ioPct');
  var count=0;
  var pctTimer=setInterval(function(){
    if(count>=100){clearInterval(pctTimer);return;}
    count+=Math.ceil(Math.random()*6);
    if(count>100)count=100;
    if(pctEl)pctEl.textContent=count+'%';
  },70);
  function dismissIntro(){
    overlay.classList.add('out');
    clearInterval(pctTimer);
    setTimeout(function(){overlay.style.display='none';},950);
  }
  overlay.addEventListener('click',dismissIntro);
  setTimeout(dismissIntro,5000);

  // ── Initial page fade in ──
  var initialPage = document.querySelector('.page.active');
  if(initialPage){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        initialPage.classList.add('visible');
      });
    });
  }

  // ── Gallery ──
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

  var seenYears  = {};
  var yearLabels = {};

  works.forEach(function(w, i){
    var entry = document.createElement('div');
    entry.className = 'gallery-entry';
    entry.setAttribute('data-year', w.year);
    entry.innerHTML =
      '<div class="entry-date">' + w.date + '</div>' +
      '<div class="entry-img"><img src="' + w.img + '" alt="' + w.title + '"></div>' +
      '<div class="entry-title">' + w.title + '</div>';
    container.appendChild(entry);
    entry.querySelector('.entry-img').addEventListener('click', function(){ openLB(i); });

    if(!seenYears[w.year]){
      seenYears[w.year] = true;
      var yl = document.createElement('div');
      yl.className = 'tl-year' + (Object.keys(seenYears).length === 1 ? ' first' : '');
      yl.textContent = w.year;
      tlContainer.appendChild(yl);
      yearLabels[w.year] = yl;
    }
  });

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

  window.addEventListener('load', alignTimeline);
  window.addEventListener('resize', alignTimeline);
  setTimeout(alignTimeline, 100);
  setTimeout(alignTimeline, 500);
  container.querySelectorAll('img').forEach(function(img){
    img.addEventListener('load', alignTimeline);
  });

  // ── Sidebar toggle ──
  var toggleBtn = document.getElementById('toggleBtn');
  toggleBtn.addEventListener('click', function(){
    var closed = document.body.classList.toggle('closed');
    toggleBtn.innerHTML = closed ? '&#9654;' : '&#9664;';
  });

  // ── Nav with page fade transition ──
  var navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function(link){
    link.addEventListener('click', function(){
      var current = document.querySelector('.page.active');
      var target = document.getElementById('page-' + link.dataset.page);
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
          requestAnimationFrame(function(){
            target.classList.add('visible');
          });
        });
      }
    });
  });

  // ── Lightbox ──
  var cur = 0;
  var lb  = document.getElementById('lightbox');

  function openLB(i){ cur=i; updateLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); document.body.style.overflow=''; }
  function updateLB(){
    var w = works[cur];
    document.getElementById('lb-date').textContent  = w.date;
    document.getElementById('lb-title').textContent = w.title;
    var slot = document.getElementById('lbSlot');
    slot.innerHTML = '<img src="' + w.img + '" alt="' + w.title + '" style="max-width:100%;max-height:100%;object-fit:contain;">';
  }

  document.getElementById('lbClose').addEventListener('click', closeLB);
  document.getElementById('lb-prev').addEventListener('click', function(){ cur=(cur-1+works.length)%works.length; updateLB(); });
  document.getElementById('lb-next').addEventListener('click', function(){ cur=(cur+1)%works.length; updateLB(); });
  lb.addEventListener('click', function(e){ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') closeLB();
    if(e.key==='ArrowLeft'){ cur=(cur-1+works.length)%works.length; updateLB(); }
    if(e.key==='ArrowRight'){ cur=(cur+1)%works.length; updateLB(); }
  });

})();
