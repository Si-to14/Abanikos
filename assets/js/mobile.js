/* ===== abanikos · menú móvil =====
   Abre y cierra el menú de la cabecera en pantallas pequeñas (estilos en assets/css/mobile.css).
   Se usa delegación de eventos porque la cabecera la pinta la plantilla. */
(function () {
  if (window.abkMobileMenu) return; // la plantilla puede cargar este script más de una vez
  window.abkMobileMenu = true;
  var OPEN = 'abk-menu-open', root = document.documentElement;

  function label(open) {
    var t = open ? 'Cerrar menú' : 'Menú';
    return window.abkI18n && window.abkI18n.t ? window.abkI18n.t(t) : t;
  }
  function set(open) {
    root.classList.toggle(OPEN, open);
    var b = document.querySelector('.abk-burger');
    if (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', label(open)); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.abk-burger')) { set(!root.classList.contains(OPEN)); return; }
    if (!root.classList.contains(OPEN)) return;
    // Cerrar al elegir un enlace o al tocar fuera de la cabecera (el idioma deja el menú abierto)
    if (t.closest('.abk-nav-lang')) return;
    if (t.closest('.abk-nav-link, .abk-nav-cta, .abk-head-cta, .abk-logo') || !t.closest('.abk-header')) set(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains(OPEN)) set(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 860 && root.classList.contains(OPEN)) set(false); });
})();
