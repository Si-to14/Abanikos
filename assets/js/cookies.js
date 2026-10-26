/* ===== abanikos · aviso de cookies =====
   Muestra el aviso la primera vez, guarda la elección del visitante 12 meses y
   permite cambiarla desde el enlace "Cookies" del pie (href="#cookies").

   Para añadir analítica o publicidad en el futuro, cárgala SOLO con consentimiento:
     abkConsent.onChange(function (c) { if (c.analytics) { ...cargar Google Analytics... } });
   c.analytics y c.marketing son true/false. */
(function () {
  if (window.abkConsent) return;
  var KEY = 'abk-consent', VERSION = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
  var listeners = [];
  var C = { red: '#DA4435', brown: '#301509', cream: '#FBF0CE', paper: '#FFFBF0' };

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.v === VERSION && Date.now() - c.date < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function save(analytics, marketing) {
    var c = { v: VERSION, date: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    for (var i = 0; i < listeners.length; i++) { try { listeners[i](c); } catch (e) {} }
    close();
  }

  var root, panel;
  function btn(label, primary, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'flex:1 1 auto;cursor:pointer;font-family:Fredoka,sans-serif;font-weight:600;font-size:0.9rem;padding:11px 20px;border-radius:999px;border:2px solid ' +
      (primary ? C.red : C.cream) + ';background:' + (primary ? C.red : 'transparent') + ';color:' + (primary ? C.paper : C.cream) + ';';
    b.addEventListener('click', onClick);
    return b;
  }
  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }
  function toggleRow(title, desc, checked, locked) {
    var row = el('label', 'display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-top:1px solid rgba(251,240,206,0.15);cursor:' + (locked ? 'default' : 'pointer') + ';');
    var box = document.createElement('input');
    box.type = 'checkbox'; box.checked = checked; box.disabled = !!locked;
    box.style.cssText = 'margin-top:3px;width:18px;height:18px;accent-color:' + C.red + ';flex:none;';
    var txt = el('div', '');
    txt.appendChild(el('div', 'font-family:Fredoka,sans-serif;font-weight:600;font-size:0.95rem;', title));
    txt.appendChild(el('div', 'font-size:0.84rem;line-height:1.5;opacity:0.75;margin-top:3px;', desc));
    row.appendChild(box); row.appendChild(txt);
    return { row: row, box: box };
  }

  function open(showSettings) {
    close();
    var cur = read() || { analytics: false, marketing: false };
    root = el('div', 'position:fixed;left:16px;right:16px;bottom:16px;z-index:100;display:flex;justify-content:center;pointer-events:none;');
    root.id = 'abk-cookies';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Cookies');
    panel = el('div', 'pointer-events:auto;width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;background:' + C.brown + ';color:' + C.cream +
      ';border-radius:24px;padding:24px;box-shadow:0 14px 40px rgba(0,0,0,0.35);font-family:Outfit,sans-serif;');
    panel.appendChild(el('div', 'font-family:"Bagel Fat One",cursive;font-size:1.35rem;color:#F6DE8B;margin-bottom:8px;', 'Cookies'));
    panel.appendChild(el('p', 'margin:0 0 16px;font-size:0.92rem;line-height:1.55;opacity:0.85;',
      'Usamos almacenamiento técnico para que la web funcione (por ejemplo, recordar tu idioma). Si nos das permiso, también podremos usar cookies de analítica y de marketing para mejorar la web. Puedes aceptarlas, rechazarlas o elegir cuáles.'));

    var settings = el('div', 'display:' + (showSettings ? 'block' : 'none') + ';margin-bottom:16px;');
    settings.appendChild(toggleRow('Necesarias', 'Imprescindibles para que la web funcione, como guardar tu idioma y esta elección. Siempre activas.', true, true).row);
    var an = toggleRow('Analítica', 'Nos ayudan a saber cuántas personas visitan la web y qué páginas ven, de forma anónima.', cur.analytics);
    var mk = toggleRow('Marketing', 'Permiten medir nuestras campañas en redes sociales y mostrarte anuncios relevantes.', cur.marketing);
    settings.appendChild(an.row); settings.appendChild(mk.row);
    var info = el('details', 'border-top:1px solid rgba(251,240,206,0.15);padding-top:12px;font-size:0.84rem;line-height:1.55;opacity:0.8;');
    info.appendChild(el('summary', 'cursor:pointer;font-family:Fredoka,sans-serif;font-weight:600;', 'Más información'));
    info.appendChild(el('p', 'margin:10px 0 0;',
      'Ahora mismo la web solo guarda en tu navegador tu idioma y tu elección de cookies; no usamos analítica ni publicidad. Las tipografías se cargan desde Google Fonts y los botones de WhatsApp e Instagram te llevan a esos servicios, que tienen sus propias políticas. Tu elección se guarda 12 meses y puedes cambiarla cuando quieras desde el enlace «Cookies» al pie de la página. Para cualquier duda: abanikos.corporate@gmail.com.'));
    settings.appendChild(info);
    panel.appendChild(settings);

    var row = el('div', 'display:flex;flex-wrap:wrap;gap:10px;');
    row.appendChild(btn('Rechazar', false, function () { save(false, false); }));
    var cfg = btn('Configurar', false, function () {
      if (settings.style.display === 'none') { settings.style.display = 'block'; cfg.textContent = 'Guardar selección'; }
      else save(an.box.checked, mk.box.checked);
    });
    if (showSettings) cfg.textContent = 'Guardar selección';
    row.appendChild(cfg);
    row.appendChild(btn('Aceptar', true, function () { save(true, true); }));
    panel.appendChild(row);

    root.appendChild(panel);
    document.body.appendChild(root);
  }
  function close() {
    var old = document.querySelectorAll('#abk-cookies');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    root = null;
  }

  window.abkConsent = {
    get: function () { var c = read(); return c ? { analytics: c.analytics, marketing: c.marketing } : null; },
    onChange: function (fn) { listeners.push(fn); var c = read(); if (c) { try { fn(c); } catch (e) {} } },
    open: function () { open(true); }
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href="#cookies"]');
    if (a) { e.preventDefault(); open(true); }
  });
  function start() { if (!read()) open(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
