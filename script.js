/* ============================================================
   CURSOR
   ============================================================ */
(function(){
  var c=document.getElementById('cur');
  if(!c)return;
  var fine=window.matchMedia('(pointer:fine)').matches;
  if(!fine)return;
  var mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,vis=false;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    if(!vis){c.classList.add('on');vis=true;}
  });
  document.addEventListener('mousedown',function(){c.classList.add('clk');});
  document.addEventListener('mouseup',function(){c.classList.remove('clk');});
  document.addEventListener('mouseleave',function(){c.classList.remove('on');vis=false;});
  (function anim(){
    cx+=(mx-cx)*0.12;cy+=(my-cy)*0.12;
    c.style.left=cx+'px';c.style.top=cy+'px';
    requestAnimationFrame(anim);
  })();
  document.querySelectorAll('a,button,.si,.pcard,.btn,.ilink').forEach(function(el){
    el.addEventListener('mouseenter',function(){c.classList.add('hov');});
    el.addEventListener('mouseleave',function(){c.classList.remove('hov');});
  });
})();

/* ============================================================
   SPACE BACKGROUND
   ============================================================ */
(function(){
  var cv=document.getElementById('bgc');
  var ctx=cv.getContext('2d');
  function resize(){cv.width=innerWidth;cv.height=innerHeight;}
  resize();
  window.addEventListener('resize',resize);

  // Stars
  var S=[];
  for(var i=0;i<220;i++){
    S.push({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      z:Math.random()*900+100,
      sz:Math.random()*1.4+0.2,
      tw:Math.random()*Math.PI*2,
      sp:Math.random()*0.2+0.04,
      red:Math.random()<0.08
    });
  }

  // Nebulae
  var N=[];
  for(var i=0;i<6;i++){
    N.push({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*350+120,
      a:Math.random()*0.022+0.004,
      red:Math.random()<0.45
    });
  }

  // Particles
  var P=[];
  for(var i=0;i<55;i++){
    P.push({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      vx:(Math.random()-.5)*0.3,vy:(Math.random()-.5)*0.3,
      sz:Math.random()*2+0.5,a:Math.random()*0.35+0.1,
      pu:Math.random()*Math.PI*2,red:Math.random()<0.18
    });
  }

  // Shooters
  var SH=[],st=0;
  function spawn(){
    SH.push({
      x:Math.random()*cv.width,y:Math.random()*cv.height*0.5,
      len:Math.random()*90+50,sp:Math.random()*9+5,
      ang:Math.PI/4+(Math.random()-.5)*0.5,life:1
    });
  }

  function drawConns(){
    for(var i=0;i<P.length;i++){
      for(var j=i+1;j<P.length;j++){
        var dx=P[i].x-P[j].x,dy=P[i].y-P[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){
          var a=(1-d/110)*0.07;
          ctx.beginPath();
          ctx.strokeStyle='rgba(232,0,13,'+a+')';
          ctx.lineWidth=0.4;
          ctx.moveTo(P[i].x,P[i].y);ctx.lineTo(P[j].x,P[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    // Deep space bg
    var bg=ctx.createRadialGradient(cv.width*.35,cv.height*.3,0,cv.width*.5,cv.height*.5,cv.width*.9);
    bg.addColorStop(0,'rgba(12,6,20,.6)');bg.addColorStop(.5,'rgba(7,7,7,.4)');bg.addColorStop(1,'rgba(3,3,10,.7)');
    ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
    // Nebulae
    N.forEach(function(n){
      var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      var col=n.red?'rgba(232,0,13,':'rgba(80,0,130,';
      g.addColorStop(0,col+n.a+')');g.addColorStop(1,col+'0)');
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    });
    // Stars warp
    var CX=cv.width/2,CY=cv.height/2;
    S.forEach(function(s){
      s.z-=s.sp;s.tw+=0.02;
      if(s.z<=0){s.z=1000;s.x=Math.random()*cv.width;s.y=Math.random()*cv.height;}
      var px=CX+(s.x-CX)*(1000/s.z);
      var py=CY+(s.y-CY)*(1000/s.z);
      if(px<0||px>cv.width||py<0||py>cv.height)return;
      var r=s.sz*(1000/s.z)*0.5;
      var br=0.5+Math.sin(s.tw)*0.5;
      ctx.beginPath();ctx.arc(px,py,Math.max(.2,r),0,Math.PI*2);
      ctx.fillStyle=s.red?'rgba(232,0,13,'+(br*.8)+')':'rgba(255,255,255,'+(br*.9)+')';
      ctx.fill();
    });
    // Particles
    P.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;p.pu+=0.015;
      if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;
      if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;
      var a=p.a*(0.6+Math.sin(p.pu)*0.4);
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);
      ctx.fillStyle=p.red?'rgba(232,0,13,'+a+')':'rgba(255,255,255,'+a+')';
      ctx.fill();
    });
    drawConns();
    // Shooting stars
    st++;if(st>200+Math.random()*120){spawn();st=0;}
    for(var i=SH.length-1;i>=0;i--){
      var s=SH[i];
      s.x+=Math.cos(s.ang)*s.sp;s.y+=Math.sin(s.ang)*s.sp;s.life-=0.014;
      if(s.life<=0){SH.splice(i,1);continue;}
      var tx=s.x-Math.cos(s.ang)*s.len,ty=s.y-Math.sin(s.ang)*s.len;
      var g=ctx.createLinearGradient(tx,ty,s.x,s.y);
      g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,'+(s.life*.8)+')');
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(s.x,s.y);
      ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.stroke();
    }
    // Vignette
    var vg=ctx.createRadialGradient(cv.width/2,cv.height/2,cv.height*.25,cv.width/2,cv.height/2,cv.height*.95);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(7,7,7,.6)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,cv.width,cv.height);
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ============================================================
   SKILL SPHERE
   ============================================================ */
(function(){
  var cv=document.getElementById('sph');
  if(!cv)return;
  var ctx=cv.getContext('2d');
  var W=cv.width,H=cv.height,CX=W/2,CY=H/2,R=170;

  var nodes=[
    {l:'React',c:'#61DAFB'},{l:'Node.js',c:'#68A063'},{l:'Python',c:'#FFD43B'},
    {l:'TypeScript',c:'#007ACC'},{l:'Tailwind',c:'#38BDF8'},{l:'Next.js',c:'#ffffff'},
    {l:'Supabase',c:'#3ECF8E'},{l:'PostgreSQL',c:'#336791'},{l:'MongoDB',c:'#47A248'},
    {l:'Docker',c:'#2496ED'},{l:'Express',c:'#c0c0c0'},{l:'Git',c:'#F05032'},
    {l:'Linux',c:'#FCC624'},{l:'Vercel',c:'#ffffff'},{l:'Redis',c:'#DC382D'},
    {l:'C#',c:'#9B4993'},{l:'REST API',c:'#FF6B35'},{l:'MySQL',c:'#00758F'},
    {l:'HTML5',c:'#E34F26'},{l:'CSS3',c:'#1572B6'}
  ];

  function fib(n){
    var p=[],phi=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<n;i++){
      var y=1-(i/(n-1))*2,r=Math.sqrt(1-y*y),t=phi*i;
      p.push({x:Math.cos(t)*r,y:y,z:Math.sin(t)*r});
    }
    return p;
  }
  var pts=fib(nodes.length);
  nodes.forEach(function(n,i){n.ox=pts[i].x;n.oy=pts[i].y;n.oz=pts[i].z;});

  var rings=[
    {radius:.55,tilt:.4,speed:.008,col:'rgba(232,0,13,.25)',pl:{l:'React',c:'#61DAFB',s:8}},
    {radius:.70,tilt:-.6,speed:-.006,col:'rgba(97,218,251,.2)',pl:{l:'Node',c:'#68A063',s:7}},
    {radius:.85,tilt:.8,speed:.005,col:'rgba(104,160,99,.2)',pl:{l:'Python',c:'#FFD43B',s:7}}
  ];
  rings.forEach(function(r){r.a=Math.random()*Math.PI*2;});

  var rx=0.3,ry=0,drag=false,lx=0,ly=0;

  cv.addEventListener('mousedown',function(e){drag=true;lx=e.clientX;ly=e.clientY;e.preventDefault();});
  window.addEventListener('mouseup',function(){drag=false;});
  window.addEventListener('mousemove',function(e){
    if(!drag)return;ry+=(e.clientX-lx)*.008;rx+=(e.clientY-ly)*.008;lx=e.clientX;ly=e.clientY;
  });
  cv.addEventListener('touchstart',function(e){drag=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;},{passive:true});
  window.addEventListener('touchend',function(){drag=false;});
  window.addEventListener('touchmove',function(e){
    if(!drag)return;ry+=(e.touches[0].clientX-lx)*.01;rx+=(e.touches[0].clientY-ly)*.01;lx=e.touches[0].clientX;ly=e.touches[0].clientY;
  },{passive:true});

  function rot(x,y,z,arx,ary){
    var nx=x*Math.cos(ary)+z*Math.sin(ary);
    var nz=-x*Math.sin(ary)+z*Math.cos(ary);
    var ny=y*Math.cos(arx)-nz*Math.sin(arx);
    var nz2=y*Math.sin(arx)+nz*Math.cos(arx);
    return{x:nx,y:ny,z:nz2};
  }

  function drawRing(ring){
    ctx.save();ctx.translate(CX,CY);
    var a=R*ring.radius,b=a*Math.abs(Math.cos(ring.tilt));
    ctx.beginPath();ctx.ellipse(0,0,a,b,0,0,Math.PI*2);
    ctx.strokeStyle=ring.col;ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);
    var px=Math.cos(ring.a)*a,py=Math.sin(ring.a)*b,pz=Math.sin(ring.a)*a*Math.sin(ring.tilt);
    var dep=(pz+R)/(2*R),sz=ring.pl.s*(0.6+dep*0.8);
    var g=ctx.createRadialGradient(px,py,0,px,py,sz*2.5);
    g.addColorStop(0,ring.pl.c+'60');g.addColorStop(1,'transparent');
    ctx.beginPath();ctx.arc(px,py,sz*2.5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);ctx.fillStyle=ring.pl.c;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=0.5;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='600 10px Space Mono,monospace';
    ctx.textAlign='center';ctx.fillText(ring.pl.l,px,py-sz-5);
    ctx.restore();
  }

  function anim(){
    ctx.clearRect(0,0,W,H);
    if(!drag){ry+=0.004;rx+=0.001;}
    rings.forEach(function(r){r.a+=r.speed;drawRing(r);});
    // wireframe
    ctx.save();ctx.translate(CX,CY);
    for(var lat=-80;lat<=80;lat+=40){
      var lr=lat*Math.PI/180,y0=R*Math.sin(lr),cr=R*Math.cos(lr);
      ctx.beginPath();
      for(var lon=0;lon<=360;lon+=5){
        var lonr=lon*Math.PI/180,p=rot(cr*Math.cos(lonr),y0,cr*Math.sin(lonr),rx,ry);
        var sc=(p.z+R*2)/(R*3);
        lon===0?ctx.moveTo(p.x*sc,p.y*sc):ctx.lineTo(p.x*sc,p.y*sc);
      }
      ctx.strokeStyle='rgba(232,0,13,.06)';ctx.lineWidth=.5;ctx.stroke();
    }
    for(var lon=0;lon<360;lon+=40){
      var lonr=lon*Math.PI/180;
      ctx.beginPath();
      for(var lat=-90;lat<=90;lat+=5){
        var lr=lat*Math.PI/180,y0=R*Math.sin(lr),cr=R*Math.cos(lr);
        var p=rot(cr*Math.cos(lonr),y0,cr*Math.sin(lonr),rx,ry);
        var sc=(p.z+R*2)/(R*3);
        lat===-90?ctx.moveTo(p.x*sc,p.y*sc):ctx.lineTo(p.x*sc,p.y*sc);
      }
      ctx.strokeStyle='rgba(232,0,13,.04)';ctx.lineWidth=.5;ctx.stroke();
    }
    ctx.restore();
    // nodes
    nodes.forEach(function(n){
      var p=rot(n.ox*R,n.oy*R,n.oz*R,rx,ry);n.rx=p.x;n.ry=p.y;n.rz=p.z;
    });
    var sorted=nodes.slice().sort(function(a,b){return a.rz-b.rz;});
    sorted.forEach(function(n){
      var dep=(n.rz+R)/(2*R),front=n.rz>0;
      var sc=0.6+dep*0.6,sx=CX+n.rx*sc,sy=CY+n.ry*sc;
      if(!front){
        var al=0.1+dep*0.15;
        ctx.beginPath();ctx.arc(sx,sy,3*sc,0,Math.PI*2);ctx.fillStyle=n.c+'40';ctx.fill();
        ctx.fillStyle='rgba(255,255,255,'+al+')';ctx.font=Math.floor(9*sc)+'px Space Mono,monospace';
        ctx.textAlign='center';ctx.fillText(n.l,sx,sy+3);
      } else {
        var al=0.4+dep*0.6,dr=(3+dep*3)*sc;
        var g=ctx.createRadialGradient(sx,sy,0,sx,sy,dr*3);
        g.addColorStop(0,n.c+Math.floor(al*80).toString(16).padStart(2,'0'));g.addColorStop(1,'transparent');
        ctx.beginPath();ctx.arc(sx,sy,dr*3,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        ctx.beginPath();ctx.arc(sx,sy,dr,0,Math.PI*2);ctx.fillStyle=n.c;ctx.fill();
        ctx.font='700 '+Math.floor((9+dep*4)*sc)+'px Space Mono,monospace';
        ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,'+al+')';
        ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=6;
        ctx.fillText(n.l,sx,sy-dr-4);ctx.shadowBlur=0;
      }
    });
    requestAnimationFrame(anim);
  }
  anim();
})();

/* ============================================================
   NAV
   ============================================================ */
(function(){
  var nav=document.getElementById('nav');
  var hbg=document.getElementById('hbg');
  var nl=document.getElementById('nl');
  window.addEventListener('scroll',function(){nav.classList.toggle('sc',scrollY>30);});
  hbg.addEventListener('click',function(){
    hbg.classList.toggle('op');nl.classList.toggle('op');
    document.body.style.overflow=nl.classList.contains('op')?'hidden':'';
  });
  nl.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      hbg.classList.remove('op');nl.classList.remove('op');
      document.body.style.overflow='';
    });
  });
  var secs=document.querySelectorAll('section[id]');
  var links=document.querySelectorAll('.nav-link[data-s]');
  var ob=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting) links.forEach(function(l){l.classList.toggle('act',l.dataset.s===e.target.id);});
    });
  },{rootMargin:'-64px 0px -60% 0px'});
  secs.forEach(function(s){ob.observe(s);});
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function(){
  var ob=new IntersectionObserver(function(es,obs){
    es.forEach(function(e,i){
      if(e.isIntersecting){setTimeout(function(){e.target.classList.add('vis');},i*80);obs.unobserve(e.target);}
    });
  },{threshold:.1});
  document.querySelectorAll('.rev').forEach(function(el){ob.observe(el);});
})();

/* ============================================================
   COUNTERS
   ============================================================ */
(function(){
  var ob=new IntersectionObserver(function(es,obs){
    es.forEach(function(e){
      if(e.isIntersecting){
        var el=e.target,tgt=parseInt(el.dataset.count),cur=0,step=Math.ceil(tgt/30);
        var t=setInterval(function(){cur=Math.min(cur+step,tgt);el.textContent=cur;if(cur>=tgt)clearInterval(t);},50);
        obs.unobserve(el);
      }
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ob.observe(el);});
})();

/* ============================================================
   TERMINAL TYPING
   ============================================================ */
(function(){
  var outs=document.querySelectorAll('.to');
  outs.forEach(function(el,i){
    var txt=el.textContent,isCursor=el.classList.contains('tgreen');
    el.innerHTML='';el.style.opacity='0';
    setTimeout(function(){
      el.style.opacity='1';var j=0;
      var iv=setInterval(function(){
        if(j<txt.length){
          if(isCursor&&j===txt.length-1) el.innerHTML=txt.substring(0,j)+'<span class="cblink">▋</span>';
          else el.textContent+=txt[j];
          j++;
        } else {
          if(isCursor) el.innerHTML=txt.replace('▋','')+'<span class="cblink">▋</span>';
          clearInterval(iv);
        }
      },18);
    },500+i*220);
  });
})();

/* ============================================================
   CV DOWNLOAD FEEDBACK
   ============================================================ */
(function(){
  var btn=document.getElementById('dlBtn');
  var note=document.getElementById('cvNote');
  if(!btn||!note)return;
  btn.addEventListener('click',function(){
    setTimeout(function(){
      note.textContent='✓ Download started! Check your downloads folder.';
      setTimeout(function(){note.textContent='';},5000);
    },400);
  });
})();