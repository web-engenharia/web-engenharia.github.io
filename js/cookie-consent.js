/**
 * Cookie consent + deferred Google Analytics (G-YX5SDYB2M6).
 * Expects #cookie-consent-banner and #cookie-consent-accept in the DOM.
 */
(function () {
  'use strict';

  var GA_ID = 'G-YX5SDYB2M6';
  var consentKey = 'cookieConsentGiven';

  function loadGA() {
    if (window.gtagLoaded) return;
    window.gtagLoaded = true;
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments);
    };
    gtag('js', new Date());
    gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
    });
    gtag('config', GA_ID);
  }

  function init() {
    var banner = document.getElementById('cookie-consent-banner');
    var acceptBtn = document.getElementById('cookie-consent-accept');
    if (!banner || !acceptBtn) return;

    if (localStorage.getItem(consentKey)) {
      loadGA();
      return;
    }

    banner.style.display = 'block';
    function revealAndFocus() {
      banner.classList.add('cookie-consent-banner--visible');
      acceptBtn.focus();
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealAndFocus();
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(revealAndFocus);
      });
    }

    acceptBtn.addEventListener('click', function () {
      localStorage.setItem(consentKey, 'true');
      banner.classList.remove('cookie-consent-banner--visible');
      banner.style.display = 'none';
      loadGA();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
