/* ===== abanikos · Google Analytics 4 =====
   Solo se carga si el visitante acepta las cookies de "Analítica" (ver cookies.js).
   La web es una sola página: cada cambio de sección se envía como una página vista.
     abkPage('b2b')                           → página vista de la sección
     abkTrack('generate_lead', { origen: … }) → evento
   Para activarlo, pon el ID de medición de GA4 (empieza por "G-") en GA_ID. */
(function () {
  if (window.abkPage) return;
  var GA_ID = '';

  var NAMES = {
    home: 'Inicio', b2b: 'Abanikos', bodas: 'Bodas', proyectos: 'Historias', conceptos: 'Inspiración',
    proyecto: 'Historia', contacto: 'Contacto', marca: 'Marca'
  };
  var loaded = false, current = null;

  function gtag() { window.dataLayer.push(arguments); }

  function load() {
    if (loaded || !GA_ID) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { send_page_view: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    if (current) send(current);
  }

  function send(p) {
    gtag('event', 'page_view', { page_title: p.title, page_location: location.origin + p.path });
  }

  window.abkPage = function (view, detail) {
    var title = (NAMES[view] || view) + (detail ? ' · ' + detail : '');
    current = { title: title, path: '/' + (view === 'home' ? '' : view) + (detail ? '/' + encodeURIComponent(detail) : '') };
    if (loaded) send(current);
  };

  window.abkTrack = function (name, params) {
    if (loaded) gtag('event', name, params || {});
  };

  // Clics en WhatsApp (botón flotante y enlaces wa.me)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (a) window.abkTrack('whatsapp_click');
  });

  function start() {
    if (!window.abkConsent) return;
    window.abkConsent.onChange(function (c) {
      // Si retira el permiso, GA deja de enviar datos hasta que lo vuelva a dar
      if (GA_ID) window['ga-disable-' + GA_ID] = !c.analytics;
      if (c.analytics) load();
    });
  }
  start();
})();
