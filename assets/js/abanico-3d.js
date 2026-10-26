/* ===== abanikos · <abanico-3d> =====
   Abanico 3D interactivo con las partes del abanico.
   Uso: <abanico-3d></abanico-3d>
   - Medidas sacadas del croquis de producción (23 cm, país de 9,8 a 22,1 cm, 168° de apertura).
   - Los textos están en español; la traducción al inglés la hace el diccionario de index.html (DICT).
   - Para cambiar el diseño del país, edita LEAF_COLOR, STICK_COLOR y LOGO_SRC. */
(function () {
  if (customElements.get('abanico-3d')) return;

  var LEAF_COLOR  = '#3A1E1D';                          // color de la tela
  var STICK_COLOR = 0x151313;                           // varillas (negro lacado)
  var LOGO_SRC    = 'assets/img/abanico-3d/logo-pais.webp'; // PNG/WebP con fondo transparente
  var THREE_SRC   = 'assets/js/three.min.js';

  var ORDER = ['pais','rivete','fuente','varillas','guia','guardas','guardapulgar','ojo'];
  var PARTS = {
    pais:['País','La tela del abanico. Se corta y se plisa a mano, y es donde va el diseño: tu marca, tu fecha, tu frase.'],
    rivete:['Rivete','El borde superior del país. Remata la tela y le da un acabado limpio.'],
    fuente:['Fuente','La parte del varillaje que queda a la vista, entre el ojo y el país.'],
    varillas:['Varilla','Cada una de las piezas de madera del abanico. El conjunto de todas las varillas forma el varillaje.'],
    guia:['Guía','El segundo tramo de la varilla, más fino, sobre el que va pegado el país.'],
    guardas:['Guarda','La primera y la última varilla del varillaje. Son más gruesas y protegen el abanico cuando está cerrado.'],
    guardapulgar:['Guardapulgar','La zona ensanchada de la guarda, junto al ojo, donde se apoya el pulgar para abrir y cerrar el abanico.'],
    ojo:['Ojo','El orificio por el que pasa el clavillo que une todas las varillas. Es el eje sobre el que gira el abanico.']
  };
  var EMPTY = ['Toca una pieza','Elige una parte del abanico, en el modelo o en la lista, para ver cómo se llama y para qué sirve.'];
  var NOGL = 'Tu navegador no puede mostrar el modelo 3D, pero puedes consultar las partes en la lista.';

  function t(s){ try{ return window.abkI18n ? window.abkI18n.t(s) : s; }catch(e){ return s; } }

  var CSS = '' +
  'abanico-3d{display:block;color:#301509;}' +
  '.a3-head{max-width:640px;margin:0 auto 36px;text-align:center;}' +
  '.a3-title{font-family:"Bagel Fat One",cursive;font-weight:400;font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.08;margin:0;}' +
  '.a3-hint{font-size:1.05rem;line-height:1.6;margin:14px 0 0;color:rgba(48,21,9,.72);}' +
  '.a3-wrap{display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:stretch;}' +
  '.a3-stage{position:relative;aspect-ratio:4/3;border-radius:24px;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#FFF8E6 0%,#FBF0CE 55%,#F1DFAE 100%);}' +
  '.a3-stage canvas{width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab;}' +
  '.a3-stage canvas.is-drag{cursor:grabbing;}' +
  '.a3-tag{position:absolute;pointer-events:none;transform:translate(-50%,-140%);background:#301509;color:#FBF0CE;font:600 .85rem "Fredoka",sans-serif;padding:5px 12px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25);}' +
  '.a3-fallback{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;}' +
  '.a3-slider{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;background:rgba(48,21,9,.88);color:#FBF0CE;padding:8px 16px;border-radius:999px;font:500 .85rem "Fredoka",sans-serif;white-space:nowrap;}' +
  '.a3-slider input{width:min(170px,36vw);accent-color:#DA4435;cursor:pointer;}' +
  '.a3-panel{display:flex;flex-direction:column;gap:14px;}' +
  '.a3-parts{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;}' +
  '.a3-parts button{width:100%;display:flex;align-items:center;gap:10px;border:1.5px solid rgba(48,21,9,.16);background:#FFFBF0;color:#301509;font:500 1rem "Fredoka",sans-serif;padding:10px 12px;border-radius:12px;cursor:pointer;text-align:left;transition:background .2s,border-color .2s,color .2s;}' +
  '.a3-parts button:hover{border-color:#DA4435;}' +
  '.a3-parts button[aria-pressed="true"]{background:#DA4435;border-color:#DA4435;color:#FFFBF0;}' +
  '.a3-parts .n{font:600 .78rem "Fredoka",sans-serif;opacity:.6;}' +
  '.a3-info{background:#301509;color:#FBF0CE;border-radius:20px;padding:22px;flex:1;min-height:150px;}' +
  '.a3-info h3{font-family:"Bagel Fat One",cursive;font-weight:400;font-size:1.6rem;line-height:1.1;margin:0 0 10px;color:#F6DE8B;}' +
  '.a3-info p{margin:0;font-size:1rem;line-height:1.6;opacity:.9;}' +
  'abanico-3d [hidden]{display:none !important;}' +
  '@media (max-width:820px){.a3-wrap{grid-template-columns:1fr;}.a3-stage{aspect-ratio:1/1;}}';

  var threeReady = null;
  function loadThree(){
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeReady) return threeReady;
    threeReady = new Promise(function(res, rej){
      var s = document.createElement('script'); s.src = THREE_SRC; s.async = true;
      s.onload = function(){ window.THREE ? res(window.THREE) : rej(); };
      s.onerror = rej; document.head.appendChild(s);
    });
    return threeReady;
  }

  class Abanico3D extends HTMLElement {
    connectedCallback(){
      if (this._built) return;
      this._built = true;
      if (!document.getElementById('a3-css')){
        var st = document.createElement('style'); st.id = 'a3-css'; st.textContent = CSS; document.head.appendChild(st);
      }
      this.innerHTML =
        '<div class="a3-head"><h2 class="a3-title">Partes del abanico</h2>' +
        '<p class="a3-hint">Arrastra para girarlo y toca cada pieza para descubrir su nombre.</p></div>' +
        '<div class="a3-wrap"><div class="a3-stage"><canvas aria-label="Abanico 3D interactivo"></canvas>' +
        '<div class="a3-tag" hidden></div><div class="a3-fallback" hidden></div>' +
        '<label class="a3-slider"><span>Abrir / cerrar</span><input type="range" min="0" max="100" value="0"></label></div>' +
        '<aside class="a3-panel"><ol class="a3-parts"></ol><div class="a3-info"><h3></h3><p></p></div></aside></div>';
      this.selected = null;
      var self = this, list = this.querySelector('.a3-parts');
      ORDER.forEach(function(p,i){
        var li = document.createElement('li');
        li.innerHTML = '<button type="button" aria-pressed="false"><span class="n">0'+(i+1)+'</span><span></span></button>';
        var b = li.querySelector('button'); b.dataset.part = p;
        b.lastChild.textContent = PARTS[p][0];
        b.addEventListener('click', function(){ self.select(self.selected===p ? null : p); });
        list.appendChild(li);
      });
      this.renderInfo();
      var me = this;
      loadThree().then(function(THREE){ if (me.isConnected) me.init3D(THREE); }).catch(function(){ me.noGL(); });
    }
    disconnectedCallback(){
      this._alive = false;
      if (this._ro) this._ro.disconnect();
      if (this.renderer){ this.renderer.dispose(); this.renderer.forceContextLoss && this.renderer.forceContextLoss(); }
      this._built = false; this.renderer = null;
    }
    select(p){ this.selected = p || null; this.renderInfo(); }
    renderInfo(){
      var sel = this.selected, info = sel ? PARTS[sel] : EMPTY;
      this.querySelectorAll('.a3-parts button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.part===sel ? 'true' : 'false'); });
      var h = this.querySelector('.a3-info h3'), p = this.querySelector('.a3-info p');
      if (h.textContent !== t(info[0])) h.textContent = info[0];
      if (p.textContent !== t(info[1])) p.textContent = info[1];
    }
    noGL(){
      var fb = this.querySelector('.a3-fallback'); fb.textContent = NOGL; fb.hidden = false;
      this.querySelector('canvas').style.display = 'none';
      this.querySelector('.a3-slider').style.display = 'none';
    }

    init3D(THREE){
      var self = this;
      var stage = this.querySelector('.a3-stage'), canvas = stage.querySelector('canvas');
      var tag = stage.querySelector('.a3-tag'), slider = stage.querySelector('input');
      var renderer;
      try { renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true}); }
      catch(e){ this.noGL(); return; }
      this.renderer = renderer; this._alive = true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(32, 4/3, 0.1, 50);
      scene.add(new THREE.HemisphereLight(0xfff6e6, 0x6b4a33, 0.75));
      var key = new THREE.DirectionalLight(0xfff1dc, 1.15);
      key.position.set(1.1, 1.7, 3.6); key.castShadow = true;
      key.shadow.mapSize.set(2048,2048); key.shadow.radius = 6; key.shadow.bias = -0.0008;
      var sc = key.shadow.camera; sc.left=-1.6; sc.right=1.6; sc.top=1.4; sc.bottom=-1.4; sc.near=0.5; sc.far=8;
      scene.add(key);
      var fill = new THREE.DirectionalLight(0xffe2c4, 0.35); fill.position.set(-2.5, 0.5, 2); scene.add(fill);
      var rim  = new THREE.DirectionalLight(0xffffff, 0.45); rim.position.set(0, 1.5, -3); scene.add(rim);
      var wall = new THREE.Mesh(new THREE.PlaneGeometry(12,10), new THREE.ShadowMaterial({opacity:0.16, depthWrite:false}));
      wall.position.z = -0.6; wall.receiveShadow = true; scene.add(wall);

      function lin(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
      function canvasTex(w,h,draw){
        var c = document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'), w, h);
        var tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
        tx.anisotropy = renderer.capabilities.getMaxAnisotropy(); return tx;
      }
      var grainTex = canvasTex(256,512,function(g,w,h){
        g.fillStyle='#808080'; g.fillRect(0,0,w,h);
        for(var i=0;i<140;i++){
          var x = Math.random()*w, a = Math.random()*0.35;
          g.strokeStyle = (Math.random()<.5?'rgba(0,0,0,':'rgba(255,255,255,')+a+')';
          g.lineWidth = 0.5+Math.random()*2.5; g.beginPath(); g.moveTo(x,0);
          for(var y=0;y<=h;y+=32) g.lineTo(x+Math.sin(y/90+i)*3, y);
          g.stroke();
        }
      });
      grainTex.repeat.set(0.6, 0.06);
      var weaveTex = canvasTex(64,64,function(g,w,h){
        g.fillStyle='#808080'; g.fillRect(0,0,w,h);
        for(var y=0;y<h;y+=4) for(var x=0;x<w;x+=4){
          var odd = ((x+y)/4)%2;
          g.fillStyle = odd ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)';
          g.fillRect(x,y,odd?4:2,odd?2:4);
        }
      });
      weaveTex.repeat.set(70,70);

      // Estampado del país, pintado en la vista frontal del abanico abierto (46 x 22,5 cm)
      var DES_W = 2048, DES_H = 1024, DES_SCALE = DES_W/46;
      var designCanvas = document.createElement('canvas'); designCanvas.width=DES_W; designCanvas.height=DES_H;
      var designTex = new THREE.CanvasTexture(designCanvas);
      designTex.encoding = THREE.sRGBEncoding;
      designTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      function paintDesign(img){
        var g = designCanvas.getContext('2d');
        g.fillStyle = LEAF_COLOR; g.fillRect(0,0,DES_W,DES_H);
        if(img){
          // Logo dentro de la línea de seguridad del croquis (de 11 a 21 cm del ojo)
          var cmH = 8.2, cmW = cmH*img.width/img.height;
          if(cmW > 19){ cmW = 19; cmH = cmW*img.height/img.width; }
          var cy = 16.6;
          g.drawImage(img, (23 - cmW/2)*DES_SCALE, DES_H - (cy + cmH/2)*DES_SCALE, cmW*DES_SCALE, cmH*DES_SCALE);
        }
        designTex.needsUpdate = true;
      }
      paintDesign(null);
      var logo = new Image(); logo.onload = function(){ paintDesign(logo); }; logo.src = LOGO_SRC;

      var MAT = {
        pais:   new THREE.MeshStandardMaterial({map:designTex, bumpMap:weaveTex, bumpScale:0.0025, roughness:.88, side:THREE.DoubleSide}),
        rivete: new THREE.MeshStandardMaterial({color:lin(0x1C0E0D), roughness:.45, side:THREE.DoubleSide}),
        ojo:    new THREE.MeshStandardMaterial({color:lin(0x2A2725), metalness:.9, roughness:.32})
      };
      ['fuente','varillas','guia','guardas','guardapulgar'].forEach(function(k){
        MAT[k] = new THREE.MeshStandardMaterial({color:lin(STICK_COLOR), roughness:.5, bumpMap:grainTex, bumpScale:0.004});
      });
      var GROUPS = { varillas:['varillas','fuente','guia'] };
      var pickables = [];

      var holder = new THREE.Group(); scene.add(holder);
      var fan = new THREE.Group(); fan.scale.setScalar(1/22.5); fan.position.y = -0.46; holder.add(fan);

      // Medidas en cm (croquis de producción)
      var N = 20, GAPS = N-1, OPEN_MAX = 168;
      var R_IN = 9.8, R_OUT = 22.1, R_RIV = 21.6;
      var STACK = 0.055, T_STICK = 0.09, T_GUARD = 0.22;

      function profile(pts, roundBottom, roundTop){
        var s = new THREE.Shape(), y0 = pts[0][0], w0 = pts[0][1];
        s.moveTo(-w0, y0);
        if(roundBottom) s.absarc(0, y0, w0, Math.PI, 2*Math.PI, false); else s.lineTo(w0, y0);
        for(var i=1;i<pts.length;i++) s.lineTo(pts[i][1], pts[i][0]);
        var yl = pts[pts.length-1][0], wl = pts[pts.length-1][1];
        if(roundTop) s.absarc(0, yl, wl, 0, Math.PI, false); else s.lineTo(-wl, yl);
        for(var j=pts.length-2;j>=1;j--) s.lineTo(-pts[j][1], pts[j][0]);
        s.closePath(); return s;
      }
      function extrude(shape, depth, part){
        var g = new THREE.ExtrudeGeometry(shape, {depth:depth, bevelEnabled:true, bevelThickness:depth*0.25,
          bevelSize:Math.min(0.03,depth*0.3), bevelSegments:2, curveSegments:10});
        g.translate(0,0,-depth/2);
        var m = new THREE.Mesh(g, MAT[part]); m.userData.part = part;
        m.castShadow = true; m.receiveShadow = true; pickables.push(m); return m;
      }
      var stickHead  = profile([[-0.45,0.45],[0.6,0.42],[1.3,0.3],[1.8,0.36]], true, false);
      var stickFuent = profile([[1.8,0.36],[6,0.4],[R_IN+0.2,0.42],[R_IN+0.6,0.17]], false, false);
      var stickGuia  = profile([[R_IN+0.6,0.17],[R_RIV-0.2,0.12]], false, true);
      var guardThumb = profile([[-0.55,0.55],[0.7,0.5],[1.4,0.42],[2.6,0.72],[6.5,0.86],[8.9,0.8],[9.5,0.5]], true, false);
      var guardBody  = profile([[9.5,0.5],[R_OUT-0.4,0.42]], false, true);

      var sticks = [];
      for(var i=0;i<N;i++){
        var s = new THREE.Group(), zs = (i-(N-1)/2)*STACK;
        if(i===0 || i===N-1){
          var gg = new THREE.Group(); gg.position.z = zs + (i===N-1 ? 0.2 : -0.22);
          gg.add(extrude(guardThumb, T_GUARD, 'guardapulgar'));
          gg.add(extrude(guardBody,  T_GUARD, 'guardas'));
          s.add(gg); s.userData.guard = gg; s.userData.zs = zs;
        }else{
          var h = extrude(stickHead,  T_STICK, 'varillas'); h.position.z = zs; s.add(h);
          var f = extrude(stickFuent, T_STICK, 'fuente');   f.position.z = zs; s.add(f);
          var gd = extrude(stickGuia, T_STICK*0.8, 'guia'); gd.position.z = zs - 0.07; s.add(gd);
        }
        fan.add(s); sticks.push(s);
      }
      // Clavillo con sus arandelas (atraviesa el ojo)
      var pin = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,2.3,20), MAT.ojo);
      pin.rotation.x = Math.PI/2; pin.position.z = 0.15; pin.userData.part='ojo'; fan.add(pin); pickables.push(pin);
      [1.3,-1.0].forEach(function(zc){
        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.3,24,12,0,Math.PI*2,0,Math.PI/2), MAT.ojo);
        cap.rotation.x = zc>0 ? Math.PI/2 : -Math.PI/2; cap.scale.y = 0.45;
        cap.position.z = zc; cap.userData.part='ojo'; cap.castShadow = true; fan.add(cap); pickables.push(cap);
      });

      // País plisado: 2 pliegues entre cada par de varillas
      var FOLDS = 4, thetaMax = OPEN_MAX*Math.PI/180, segMax = thetaMax/GAPS/FOLDS*1.16;
      function foldDepth(seg){ var c = 2*Math.sin(seg/2), l = 2*Math.sin(segMax/2); return Math.sqrt(Math.max(0, l*l-c*c)); }
      function fillLeaf(L, theta, writeUV){
        var phi = theta/GAPS, seg = phi/FOLDS, depth = foldDepth(seg);
        var pos = L.pos, uv = L.uv, RS = L.radii, k = 0, u = 0;
        function V(r, ang, fold, gap){
          var z = ((gap + fold/FOLDS) - (N-1)/2)*STACK + 0.02 + ((fold%2) ? depth*r : 0);
          var x = -r*Math.sin(ang), y = r*Math.cos(ang);
          pos[k++] = x; pos[k++] = y; pos[k++] = z;
          if(writeUV){ uv[u++] = (x + 23)/46; uv[u++] = y/22.5; }
        }
        for(var g=0; g<GAPS; g++) for(var f=0; f<FOLDS; f++){
          var a0 = -theta/2 + g*phi + f*seg, a1 = a0 + seg;
          for(var j=0;j<RS.length-1;j++){
            var r0 = RS[j], r1 = RS[j+1];
            V(r0,a0,f,g); V(r1,a1,f+1,g); V(r1,a0,f,g);
            V(r0,a0,f,g); V(r0,a1,f+1,g); V(r1,a1,f+1,g);
          }
        }
        L.geo.attributes.position.needsUpdate = true;
        if(writeUV) L.geo.attributes.uv.needsUpdate = true;
        L.geo.computeVertexNormals(); L.geo.computeBoundingSphere();
      }
      function makeLeaf(part, radii){
        var nTri = GAPS*FOLDS*(radii.length-1)*2, geo = new THREE.BufferGeometry();
        var L = {geo:geo, pos:new Float32Array(nTri*9), uv:new Float32Array(nTri*6), radii:radii};
        geo.setAttribute('position', new THREE.BufferAttribute(L.pos,3));
        geo.setAttribute('uv', new THREE.BufferAttribute(L.uv,2));
        var m = new THREE.Mesh(geo, MAT[part]); m.userData.part = part;
        m.castShadow = true; m.receiveShadow = true; fan.add(m); pickables.push(m);
        fillLeaf(L, thetaMax, true); return L;
      }
      var leaves = [ makeLeaf('pais', [R_IN, 11.5, 13.5, 15.5, 17.5, 19.5, R_RIV]), makeLeaf('rivete', [R_RIV, R_OUT]) ];

      function setOpen(tt){
        var theta = (1.2 + tt*(OPEN_MAX-1.2))*Math.PI/180, phi = theta/GAPS;
        for(var i=0;i<N;i++) sticks[i].rotation.z = -theta/2 + i*phi;
        var fg = sticks[N-1].userData.guard;
        fg.position.z = sticks[N-1].userData.zs + 0.16 + foldDepth(phi/FOLDS)*8;
        leaves.forEach(function(L){ fillLeaf(L, theta, false); });
      }

      // Interacción
      var ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
      var down = null, moved = 0, touched = false, hoverPart = null, rotY = 0, rotX = -0.12, opening = null;
      function pick(e){
        var r = canvas.getBoundingClientRect();
        ptr.x = ((e.clientX-r.left)/r.width)*2-1; ptr.y = -((e.clientY-r.top)/r.height)*2+1;
        ray.setFromCamera(ptr, camera);
        var hit = ray.intersectObjects(pickables, false)[0];
        return hit ? hit.object.userData.part : null;
      }
      function showTag(e, part){
        if(!part){ tag.hidden = true; return; }
        var r = stage.getBoundingClientRect();
        tag.textContent = t(PARTS[part][0]);
        tag.style.left = (e.clientX-r.left)+'px'; tag.style.top = (e.clientY-r.top)+'px'; tag.hidden = false;
      }
      canvas.addEventListener('pointerdown', function(e){
        down = {x:e.clientX, y:e.clientY}; moved = 0; touched = true;
        canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-drag');
      });
      canvas.addEventListener('pointermove', function(e){
        if(down){
          var dx=e.clientX-down.x, dy=e.clientY-down.y; moved += Math.abs(dx)+Math.abs(dy);
          rotY += dx*0.008; rotX = Math.max(-0.9, Math.min(0.9, rotX + dy*0.006));
          down = {x:e.clientX, y:e.clientY}; tag.hidden = true;
        }else if(e.pointerType==='mouse'){
          hoverPart = pick(e); showTag(e, hoverPart);
          canvas.style.cursor = hoverPart ? 'pointer' : '';
        }
      });
      canvas.addEventListener('pointerup', function(e){
        if(down && moved < 6){ var p = pick(e); self.select(p); if(p && e.pointerType!=='mouse') showTag(e,p); }
        down = null; canvas.classList.remove('is-drag');
      });
      canvas.addEventListener('pointercancel', function(){ down=null; canvas.classList.remove('is-drag'); });
      canvas.addEventListener('pointerleave', function(){ if(!down){ tag.hidden = true; hoverPart = null; } });
      slider.addEventListener('input', function(){ opening = null; setOpen(slider.value/100); });

      function resize(){
        var w = stage.clientWidth, h = stage.clientHeight; if(!w||!h) return;
        renderer.setSize(w, h, false); camera.aspect = w/h;
        var vis = 2*Math.tan(camera.fov*Math.PI/360);
        camera.position.set(0, 0.05, Math.max(1.5/vis, 2.4/(vis*camera.aspect)));
        camera.lookAt(0,0.02,0); camera.updateProjectionMatrix();
      }
      if(window.ResizeObserver){ this._ro = new ResizeObserver(resize); this._ro.observe(stage); }
      else window.addEventListener('resize', resize);
      resize();

      // Se abre solo la primera vez que aparece en pantalla, y no se dibuja mientras está fuera de pantalla
      var visible = true;
      setOpen(0);
      if(window.IntersectionObserver){
        var started = false;
        new IntersectionObserver(function(en){
          visible = en[0].isIntersecting;
          if(visible && !started && slider.value==='0'){ started = true; opening = performance.now(); }
        },{threshold:.3}).observe(stage);
      }else opening = performance.now();

      function loop(now){
        if(!self._alive) return;
        requestAnimationFrame(loop);
        if(!visible) return;
        if(opening!==null){
          var k = Math.min(1,(now-opening)/1800), e = 1-Math.pow(1-k,3);
          setOpen(e); slider.value = Math.round(e*100);
          if(k>=1) opening = null;
        }
        holder.rotation.y = rotY + (touched ? 0 : Math.sin(now/2600)*0.3);
        holder.rotation.x = rotX;
        var active = self.selected || hoverPart;
        var lit = active ? (GROUPS[active] || [active]) : [];
        var seeThrough = lit.indexOf('guia') > -1;   // la guía va bajo la tela
        [MAT.pais, MAT.rivete].forEach(function(m){ m.transparent = seeThrough; m.opacity = seeThrough ? 0.28 : 1; m.depthWrite = !seeThrough; });
        var glow = 0.35 + 0.2*Math.sin(now/260);
        for(var name in MAT){
          var on = lit.indexOf(name) > -1;
          MAT[name].emissive.setHex(on ? 0xDA4435 : 0x000000);
          MAT[name].emissiveIntensity = on ? (self.selected ? glow : 0.25) : 0;
        }
        renderer.render(scene, camera);
      }
      requestAnimationFrame(loop);
    }
  }
  customElements.define('abanico-3d', Abanico3D);
})();
