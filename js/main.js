(function () {
  'use strict';

  function getFocusableElements(container) {
    if (!container) return [];
    var sel =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(container.querySelectorAll(sel), function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });
  }

  function getMenuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
  }

  /** Número WhatsApp para envio do formulário (E.164, sem +). */
  var WHATSAPP_E164 = '5541987973270';

  var pathname = window.location.pathname || '';
  var inLocaleSubfolder = /\/(en|es|ja|kok|sv)(\/|$)/.test(pathname);
  var inProdutosFolder = /\/produtos(\/|$)/.test(pathname);
  var ANIMATION_BASE =
    inLocaleSubfolder || inProdutosFolder ? '../animacao_svg/' : 'animacao_svg/';
  var ANIMATION_FILES = [
    'animacao_v1.html',
    'animacao_v2.html',
    'animacao_v3.html',
    'animacao_v4.html',
    'animacao_v5.html',
    'animacao_v6.html',
    'animacao_v7.html',
    'animacao_v8.html',
    'animacao_v9.html',
    'animacao_v10.html',
  ];

  function pickAnimationIndex() {
    return Math.floor(Math.random() * ANIMATION_FILES.length);
  }

  function initHeroAnimation() {
    var container = document.getElementById('hero-animation');
    if (!container) return;

    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var inKok = /\/(kok)(\/|$)/.test(pathname);
    var inEs = /\/(es)(\/|$)/.test(pathname);
    var inSv = /\/(sv)(\/|$)/.test(pathname);

    if (reduced) {
      var fallbackLabel = inKok
        ? 'Web-Engenharia marca (system nirdhar paun animaion band)'
        : inEs
          ? 'Marca Web-Engenharia (animación desactivada por preferencia del sistema)'
          : inSv
            ? 'Web-Engenharia-varumärke (animation avstängd p.g.a. systeminställning)'
        : 'Marca Web-Engenharia (animação desativada por preferência do sistema)';
      var fallbackText = inKok
        ? 'Uddesh borabor integrasaun — statik rochop (chalnn ghat).'
        : inEs
          ? 'Integraciones con propósito — vista estática (reducción de movimiento activa).'
          : inSv
            ? 'Integrationer med syfte — statisk vy (nedsatt rörelse aktiv).'
        : 'Integrações com propósito — visual estático (redução de movimento ativa).';
      container.innerHTML =
        '<div class="hero-static-fallback flex h-full min-h-[240px] w-full flex-col items-center justify-center rounded-2xl px-6 text-center text-white shadow-inner sm:min-h-[280px]" role="img" aria-label="' + fallbackLabel + '">' +
        '<span class="font-display text-2xl font-light tracking-[0.35em] sm:text-3xl">WEB-ENGENHARIA</span>' +
        '<span class="mt-3 max-w-xs text-sm font-light text-white/90">' + fallbackText + '</span>' +
        '</div>';
      return;
    }

    function injectHeroIframe() {
      if (!document.getElementById('hero-animation')) return;
      var src = ANIMATION_BASE + ANIMATION_FILES[pickAnimationIndex()];
      var iframe = document.createElement('iframe');
      iframe.setAttribute(
        'title',
        inKok
          ? 'Web-Engenharia lip animaion'
          : inEs
            ? 'Animación de marca Web-Engenharia'
            : inSv
              ? 'Web-Engenharia varumärkesanimation'
              : 'Animação da marca Web-Engenharia'
      );
      iframe.className = 'min-h-0 flex-1 overflow-hidden rounded-2xl';
      iframe.setAttribute('src', src);
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      container.appendChild(iframe);
    }

    var scheduleIdle =
      window.requestIdleCallback ||
      function (cb) {
        return setTimeout(function () {
          cb({ didTimeout: true, timeRemaining: function () { return 0; } });
        }, 200);
    };
    scheduleIdle(injectHeroIframe, { timeout: 2000 });
  }

  function initMobileNav() {
    var btn = document.getElementById('mobile-menu-btn');
    var panel = document.getElementById('mobile-menu');
    if (!btn || !panel) return;

    function openMenu() {
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () {
        var focusables = getFocusableElements(panel);
        if (focusables.length) focusables[0].focus();
      });
    }

    function closeMenu(focusButton) {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      if (focusButton) btn.focus();
    }

    btn.addEventListener('click', function () {
      if (panel.classList.contains('hidden')) openMenu();
      else closeMenu(true);
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        closeMenu(false);
      });
    });

    document.addEventListener(
      'keydown',
      function (e) {
        if (panel.classList.contains('hidden')) return;
        if (e.key === 'Escape') {
          closeMenu(true);
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        if (e.key !== 'Tab') return;
        var focusables = getFocusableElements(panel);
        if (focusables.length < 2) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      true
    );
  }

  var LANG_SWITCH_META = [
    { key: 'pt', label: '🇧🇷 Português', ariaLabel: 'Português', short: 'PT', hreflang: 'pt-BR' },
    { key: 'en', label: '🇺🇸 English', ariaLabel: 'English', short: 'EN', hreflang: 'en' },
    { key: 'es', label: '🇪🇸 Español', ariaLabel: 'Español', short: 'ES', hreflang: 'es' },
    { key: 'ja', label: '🇯🇵 日本語', ariaLabel: '日本語', short: '日本語', hreflang: 'ja' },
    { key: 'kok', label: '🇮🇳 Konknni', ariaLabel: 'Konknni', short: 'Konknni', hreflang: 'kok' },
    { key: 'sv', label: '🇸🇪 Svenska', ariaLabel: 'Svenska', short: 'SV', hreflang: 'sv' },
  ];

  function getLangSwitchState(path) {
    var isPrivacidade = /privacidade\.html$/.test(path);
    var isTermos = /termos\.html$/.test(path);
    var isCareers = /careers\.html$/.test(path);
    var isCarreirasPt = /carreiras\.html$/.test(path);
    var isCookies = /cookies\.html$/.test(path);
    var artigosMatch = path.match(/\/artigos\/([^/]+\.html)$/);
    var inEn = /\/(en)(\/|$)/.test(path);
    var inJa = /\/(ja)(\/|$)/.test(path);
    var inKok = /\/(kok)(\/|$)/.test(path);
    var inEs = /\/(es)(\/|$)/.test(path);
    var inSv = /\/(sv)(\/|$)/.test(path);
    var pageFile = isPrivacidade
      ? 'privacidade.html'
      : isTermos
        ? 'termos.html'
        : isCareers
          ? 'careers.html'
          : isCookies
            ? 'cookies.html'
            : '';
    var urls = { pt: '', en: '', es: '', ja: '', kok: '', sv: '' };

    if (isCareers && inEn) {
      urls.pt = '../carreiras.html';
      urls.en = 'careers.html';
      urls.es = '../es/careers.html';
      urls.ja = '../ja/';
      urls.kok = '../kok/';
      urls.sv = '../sv/careers.html';
    } else if (isCareers && inEs) {
      urls.pt = '../carreiras.html';
      urls.en = '../en/careers.html';
      urls.es = 'careers.html';
      urls.ja = '../ja/';
      urls.kok = '../kok/';
      urls.sv = '../sv/careers.html';
    } else if (isCareers && inSv) {
      urls.pt = '../carreiras.html';
      urls.en = '../en/careers.html';
      urls.es = '../es/careers.html';
      urls.ja = '../ja/';
      urls.kok = '../kok/';
      urls.sv = 'careers.html';
    } else if (isCarreirasPt && !inEn && !inEs && !inJa && !inKok && !inSv) {
      urls.pt = 'carreiras.html';
      urls.en = 'en/careers.html';
      urls.es = 'es/careers.html';
      urls.ja = 'ja/';
      urls.kok = 'kok/';
      urls.sv = 'sv/careers.html';
    } else if (artigosMatch) {
      var artigosFile = artigosMatch[1];
      if (inEn) {
        urls.pt = '../../artigos/' + artigosFile;
        urls.en = artigosFile;
        urls.es = '../../es/artigos/' + artigosFile;
        urls.ja = '../../ja/artigos/' + artigosFile;
        urls.kok = '../../kok/artigos/' + artigosFile;
        urls.sv = '../../sv/artigos/' + artigosFile;
      } else if (inJa) {
        urls.pt = '../../artigos/' + artigosFile;
        urls.en = '../../en/artigos/' + artigosFile;
        urls.es = '../../es/artigos/' + artigosFile;
        urls.ja = artigosFile;
        urls.kok = '../../kok/artigos/' + artigosFile;
        urls.sv = '../../sv/artigos/' + artigosFile;
      } else if (inKok) {
        urls.pt = '../../artigos/' + artigosFile;
        urls.en = '../../en/artigos/' + artigosFile;
        urls.es = '../../es/artigos/' + artigosFile;
        urls.ja = '../../ja/artigos/' + artigosFile;
        urls.kok = artigosFile;
        urls.sv = '../../sv/artigos/' + artigosFile;
      } else if (inEs) {
        urls.pt = '../../artigos/' + artigosFile;
        urls.en = '../../en/artigos/' + artigosFile;
        urls.es = artigosFile;
        urls.ja = '../../ja/artigos/' + artigosFile;
        urls.kok = '../../kok/artigos/' + artigosFile;
        urls.sv = '../../sv/artigos/' + artigosFile;
      } else if (inSv) {
        urls.pt = '../../artigos/' + artigosFile;
        urls.en = '../../en/artigos/' + artigosFile;
        urls.es = '../../es/artigos/' + artigosFile;
        urls.ja = '../../ja/artigos/' + artigosFile;
        urls.kok = '../../kok/artigos/' + artigosFile;
        urls.sv = artigosFile;
      } else {
        urls.pt = artigosFile === 'index.html' ? 'index.html' : artigosFile;
        urls.en = '../en/artigos/' + artigosFile;
        urls.es = '../es/artigos/' + artigosFile;
        urls.ja = '../ja/artigos/' + artigosFile;
        urls.kok = '../kok/artigos/' + artigosFile;
        urls.sv = '../sv/artigos/' + artigosFile;
      }
    } else if (inEn) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile || 'index.html';
      urls.es = pageFile ? '../es/' + pageFile : '../es/';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
      urls.sv = pageFile ? '../sv/' + pageFile : '../sv/';
    } else if (inJa) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.es = pageFile ? '../es/' + pageFile : '../es/';
      urls.ja = pageFile || 'index.html';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
      urls.sv = pageFile ? '../sv/' + pageFile : '../sv/';
    } else if (inKok) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.es = pageFile ? '../es/' + pageFile : '../es/';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile || 'index.html';
      urls.sv = pageFile ? '../sv/' + pageFile : '../sv/';
    } else if (inEs) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.es = pageFile || 'index.html';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
      urls.sv = pageFile ? '../sv/' + pageFile : '../sv/';
    } else if (inSv) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.es = pageFile ? '../es/' + pageFile : '../es/';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
      urls.sv = pageFile || 'index.html';
    } else {
      urls.pt = pageFile || 'index.html';
      urls.en = pageFile ? 'en/' + pageFile : 'en/';
      urls.es = pageFile ? 'es/' + pageFile : 'es/';
      urls.ja = pageFile ? 'ja/' + pageFile : 'ja/';
      urls.kok = pageFile ? 'kok/' + pageFile : 'kok/';
      urls.sv = pageFile ? 'sv/' + pageFile : 'sv/';
    }

    var currentLang = inEn ? 'en' : inJa ? 'ja' : inKok ? 'kok' : inEs ? 'es' : inSv ? 'sv' : 'pt';
    return { urls: urls, currentLang: currentLang };
  }

  function initLangSelectors() {
    var desktopMenu = document.getElementById('lang-menu-desktop');
    var btnLabel = document.getElementById('lang-menu-btn-label');
    var mobileList = document.getElementById('lang-list-mobile');
    if (!desktopMenu && !mobileList) return;

    var state = getLangSwitchState(window.location.pathname || '');

    var currentMeta = null;
    for (var mi = 0; mi < LANG_SWITCH_META.length; mi++) {
      if (LANG_SWITCH_META[mi].key === state.currentLang) {
        currentMeta = LANG_SWITCH_META[mi];
        break;
      }
    }
    var shortLabel = currentMeta ? currentMeta.short : 'PT';
    if (btnLabel) btnLabel.textContent = shortLabel;

    function appendDesktopMenuLink(parent, meta) {
      var url = state.urls[meta.key];
      var isCurrent = state.currentLang === meta.key;
      var rowClass =
        'block w-full rounded-lg px-4 py-2.5 text-left text-sm text-brand-dark/90 hover:bg-brand-pulse/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-mid/30';
      if (isCurrent) rowClass += ' font-medium text-brand-dark bg-brand-pulse/40';

      var el = document.createElement('a');
      el.href = url;
      el.setAttribute('role', 'menuitem');
      el.setAttribute('hreflang', meta.hreflang);
      el.className = rowClass;
      el.textContent = meta.label;
      if (isCurrent) el.setAttribute('aria-current', 'page');
      parent.appendChild(el);
    }

    function appendMobileRow(ul, meta) {
      var url = state.urls[meta.key];
      var isCurrent = state.currentLang === meta.key;
      var rowClass =
        'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-brand-dark hover:bg-brand-pulse/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-mid/30';
      if (isCurrent) rowClass += ' bg-brand-pulse/40 text-brand-dark';

      var li = document.createElement('li');
      li.setAttribute('role', 'none');

      var el = document.createElement('a');
      el.href = url;
      el.setAttribute('hreflang', meta.hreflang);
      el.setAttribute('aria-label', meta.ariaLabel);
      el.className = rowClass;
      el.textContent = meta.label;
      if (isCurrent) el.setAttribute('aria-current', 'page');
      li.appendChild(el);
      ul.appendChild(li);
    }

    if (desktopMenu) {
      desktopMenu.innerHTML = '';
      LANG_SWITCH_META.forEach(function (meta) {
        appendDesktopMenuLink(desktopMenu, meta);
      });
    }

    if (mobileList) {
      mobileList.innerHTML = '';
      LANG_SWITCH_META.forEach(function (meta) {
        appendMobileRow(mobileList, meta);
      });
    }
  }

  function initHeaderDropdowns() {
    var dropdowns = document.querySelectorAll('.header-dropdown');
    if (!dropdowns.length) return;

    var HOVER_DELAY_MS = 150;
    var hoverTimers = {};
    var isTouch = 'ontouchstart' in window;

    function closeAll() {
      dropdowns.forEach(function (dd) {
        var menu = dd.querySelector('[role="menu"]');
        var btn = dd.querySelector('button');
        if (menu) menu.classList.add('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        dd.removeAttribute('data-open');
      });
    }

    function closeOne(dd) {
      var menu = dd.querySelector('[role="menu"]');
      var btn = dd.querySelector('button');
      if (menu) menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      dd.removeAttribute('data-open');
    }

    function openOne(dd) {
      closeAll();
      var menu = dd.querySelector('[role="menu"]');
      var btn = dd.querySelector('button');
      if (menu) menu.classList.remove('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      dd.setAttribute('data-open', 'true');
    }

    function focusMenuItem(menu, delta) {
      var items = getMenuItems(menu);
      if (!items.length) return;
      var active = document.activeElement;
      var idx = items.indexOf(active);
      if (idx < 0) idx = delta > 0 ? -1 : 0;
      var next = (idx + delta + items.length) % items.length;
      items[next].focus();
    }

    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('button');
      var menu = dd.querySelector('[role="menu"]');
      if (!btn || !menu) return;

      var id = dd.getAttribute('data-dropdown') || 'dd';

      if (isTouch) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = menu.classList.contains('hidden');
          if (open) openOne(dd);
          else closeOne(dd);
        });
      } else {
        dd.addEventListener('mouseenter', function () {
          if (hoverTimers[id]) clearTimeout(hoverTimers[id]);
          hoverTimers[id] = setTimeout(function () {
            openOne(dd);
            hoverTimers[id] = null;
          }, HOVER_DELAY_MS);
        });
        dd.addEventListener('mouseleave', function () {
          if (hoverTimers[id]) {
            clearTimeout(hoverTimers[id]);
            hoverTimers[id] = null;
          }
          hoverTimers[id] = setTimeout(function () {
            closeOne(dd);
            hoverTimers[id] = null;
          }, 120);
        });
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (menu.classList.contains('hidden')) openOne(dd);
          else closeOne(dd);
        });
      }

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          var open = !menu.classList.contains('hidden');
          if (!open) openOne(dd);
          var items = getMenuItems(menu);
          if (!items.length) return;
          if (e.key === 'ArrowDown') items[0].focus();
          else items[items.length - 1].focus();
        }
      });

      menu.addEventListener('keydown', function (e) {
        if (menu.classList.contains('hidden')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeOne(dd);
          btn.focus();
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusMenuItem(menu, 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusMenuItem(menu, -1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          var items = getMenuItems(menu);
          if (items.length) items[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          var itemsEnd = getMenuItems(menu);
          if (itemsEnd.length) itemsEnd[itemsEnd.length - 1].focus();
        }
      });

      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          closeAll();
        });
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.header-dropdown') && !e.target.closest('#mobile-menu-btn')) {
        closeAll();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openDd = document.querySelector('.header-dropdown[data-open="true"]');
      if (openDd) {
        var b = openDd.querySelector('button');
        closeAll();
        if (b) b.focus();
        e.preventDefault();
      }
    });
  }

  function initFaq() {
    document.querySelectorAll('[data-faq-toggle]').forEach(function (btn) {
      var id = btn.getAttribute('aria-controls');
      var panel = id ? document.getElementById(id) : null;
      if (panel) {
        var initiallyHidden = panel.classList.contains('hidden');
        panel.setAttribute('aria-hidden', initiallyHidden ? 'true' : 'false');
      }
      btn.addEventListener('click', function () {
        var pid = btn.getAttribute('aria-controls');
        var p = pid ? document.getElementById(pid) : null;
        if (!p) return;

        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        p.classList.toggle('hidden', expanded);
        p.setAttribute('aria-hidden', expanded ? 'true' : 'false');
      });
    });
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initialsFromName(nome) {
    var parts = nome.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = parts[0];
    var a = first[0] || '?';
    var b = '';
    for (var i = 1; i < parts.length; i++) {
      var p = parts[i];
      if (p && /[A-Za-zÀ-ÿ]/.test(p[0])) {
        b = p[0];
        break;
      }
    }
    if (!b && first.length > 1) b = first[1];
    return (a + (b || '')).toUpperCase();
  }

  function initialsAvatarDataUrl(nome) {
    var ini = initialsFromName(nome);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<rect fill="#062A1B" width="400" height="400"/>' +
      '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#E2F2E4" font-family="system-ui,sans-serif" font-size="72" font-weight="600">' +
      escapeXml(ini) +
      '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initGenteWhenNearViewport() {
    var track = document.getElementById('gente-track');
    if (!track) return;
    var root = track.closest('section') || track;

    function mount() {
      initGente();
    }

    if (!('IntersectionObserver' in window)) {
      mount();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            io.disconnect();
            mount();
          }
        });
      },
      { rootMargin: '320px 0px', threshold: 0 }
    );
    io.observe(root);
  }

  function initGente() {
    var track = document.getElementById('gente-track');
    var list = window.WEDESENVOLVEDORES;
    if (!track || !list || !list.length) return;

    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    list = shuffleArray(list);

    var cargosPortfolio = window.WECARGOS_PORTFOLIO || [];
    var nCargos = cargosPortfolio.length;
    var servicosCatalogo = window.WESERVICOS_CATALOGO || [];
    var nServicos = servicosCatalogo.length;

    function pickRandomServicos(count) {
      if (!nServicos) return [];
      var shuffled = shuffleArray(servicosCatalogo.slice());
      return shuffled.slice(0, Math.min(count, nServicos));
    }

    track.innerHTML = '';
    list.forEach(function (p) {
      var cargoPortfolio = nCargos
        ? cargosPortfolio[Math.floor(Math.random() * nCargos)]
        : null;
      var servicos = pickRandomServicos(1 + Math.floor(Math.random() * 2));

      var article = document.createElement('article');
      article.setAttribute('role', 'listitem');
      article.className =
        'gente-card flex flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-brand-circuit/35 bg-white shadow-sm';

      var imgWrap = document.createElement('div');
      imgWrap.className =
        'gente-card__img-wrap relative w-full overflow-hidden bg-brand-pulse/40';

      var base = window.WE_ASSETS_BASE || '';
      var altText =
        (window.WE_UI && window.WE_UI.fotoDe ? window.WE_UI.fotoDe : 'Photo of ') + p.nome;
      var img = document.createElement('img');
      img.alt = altText;
      img.className = 'h-full w-full object-cover';
      img.width = 400;
      img.height = 400;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function onImgErr() {
        img.removeEventListener('error', onImgErr);
        img.src = initialsAvatarDataUrl(p.nome);
      });

      if (p.fotoFallback) {
        var picture = document.createElement('picture');
        if (p.fotoAvif) {
          var srcAvif = document.createElement('source');
          srcAvif.type = 'image/avif';
          srcAvif.srcset = encodeURI(base + p.fotoAvif);
          picture.appendChild(srcAvif);
        }
        var source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = encodeURI(base + p.foto);
        img.src = encodeURI(base + p.fotoFallback);
        picture.appendChild(source);
        picture.appendChild(img);
        imgWrap.appendChild(picture);
      } else {
        img.src = encodeURI(base + p.foto);
        imgWrap.appendChild(img);
      }

      var overlay = document.createElement('div');
      overlay.className =
        'pointer-events-none absolute inset-0 bg-brand-mid/30';
      overlay.setAttribute('aria-hidden', 'true');
      imgWrap.appendChild(overlay);

      var body = document.createElement('div');
      body.className = 'gente-card__body flex flex-1 flex-col p-5';

      if (cargoPortfolio && cargoPortfolio.tag) {
        var tag = document.createElement('span');
        tag.className = 'text-xs font-semibold uppercase tracking-wide text-brand-mid';
        tag.textContent = cargoPortfolio.tag;
        body.appendChild(tag);
      }

      var title = document.createElement('h4');
      title.className = 'gente-card__title font-display text-base font-semibold text-brand-dark' + (cargoPortfolio && cargoPortfolio.tag ? ' mt-2' : '');
      title.textContent = p.nome;

      var meta = document.createElement('p');
      meta.className = 'mt-1 text-xs text-brand-mid';
      var metaBits = [];
      metaBits.push(cargoPortfolio ? cargoPortfolio.cargo : p.cargo);
      if (p.pronomes) metaBits.push(p.pronomes);
      if (p.local) metaBits.push(p.local);
      meta.textContent = metaBits.filter(Boolean).join(' · ');

      body.appendChild(title);
      body.appendChild(meta);

      if (servicos.length) {
        var servicosWrap = document.createElement('div');
        servicosWrap.className = 'mt-2 flex flex-wrap gap-1.5';
        servicos.forEach(function (s) {
          var pill = document.createElement('span');
          pill.className =
            'inline-flex items-center rounded-full bg-brand-pulse/50 px-2 py-0.5 text-xs text-brand-dark/80';
          pill.textContent = s.nome;
          servicosWrap.appendChild(pill);
        });
        body.appendChild(servicosWrap);
      }

      if (p.bio) {
        var bio = document.createElement('p');
        bio.className = 'gente-card__bio mt-3 flex-1 text-sm text-brand-dark/75';
        bio.textContent = p.bio;
        body.appendChild(bio);
      }

      article.appendChild(imgWrap);
      article.appendChild(body);
      track.appendChild(article);
    });

    if (!reduced) {
      initGenteCarousel();
    } else {
      track.parentElement.classList.add('gente-carousel--static');
    }
  }

  function initGenteCarousel() {
    var track = document.getElementById('gente-track');
    var prevBtn = document.getElementById('gente-prev');
    var nextBtn = document.getElementById('gente-next');
    if (!track || !prevBtn || !nextBtn) return;

    var cards = track.querySelectorAll('.gente-card');
    if (!cards.length) return;

    var gap = 24;

    function getStep() {
      var card = cards[0];
      return card ? card.offsetWidth + gap : 320;
    }

    function scrollBy(direction) {
      var step = getStep();
      track.scrollBy({
        left: direction * step,
        behavior: 'smooth',
      });
    }

    function updateButtons() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft <= 1;
      nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
    }

    prevBtn.addEventListener('click', function () {
      scrollBy(-1);
    });
    nextBtn.addEventListener('click', function () {
      scrollBy(1);
    });

    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    var carousel = track.closest('.gente-carousel');
    if (carousel) {
      if (!carousel.hasAttribute('tabindex')) carousel.setAttribute('tabindex', '0');
      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollBy(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollBy(1);
        }
      });
    }

    updateButtons();
  }

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateContactForm(form) {
    var fd = new FormData(form);
    var name = (fd.get('name') || '').trim();
    var email = (fd.get('email') || '').trim();
    var company = (fd.get('company') || '').trim();
    var msg = (fd.get('message') || '').trim();
    var errors = {};
    var lang = (document.documentElement.getAttribute('lang') || 'pt-BR').toLowerCase();
    var isKok = lang.startsWith('kok');
    var isEs = lang === 'es' || lang.startsWith('es-');
    var isEn = lang.startsWith('en');
    var isSv = lang === 'sv' || lang.startsWith('sv-');

    var t = isKok
      ? {
          nameShort: 'Nav otthve 2 akshar gorje.',
          nameReq: 'Nav gorje.',
          emailReq: 'Email gorje.',
          emailInvalid: 'Valid email sang.',
          msgShort: 'Sandesh otthve 10 akshar gorje.',
          msgReq: 'Sandesh gorje.',
        }
      : isEs
        ? {
            nameShort: 'El nombre debe tener al menos 2 caracteres.',
            nameReq: 'El nombre es obligatorio.',
            emailReq: 'El correo es obligatorio.',
            emailInvalid: 'Indique un correo válido.',
            msgShort: 'El mensaje debe tener al menos 10 caracteres.',
            msgReq: 'El mensaje es obligatorio.',
          }
        : isEn
          ? {
              nameShort: 'Name must be at least 2 characters.',
              nameReq: 'Name is required.',
              emailReq: 'Email is required.',
              emailInvalid: 'Enter a valid email address.',
              msgShort: 'Message must be at least 10 characters.',
              msgReq: 'Message is required.',
            }
          : isSv
            ? {
                nameShort: 'Namnet måste ha minst 2 tecken.',
                nameReq: 'Namn är obligatoriskt.',
                emailReq: 'E-post är obligatoriskt.',
                emailInvalid: 'Ange en giltig e-postadress.',
                msgShort: 'Meddelandet måste ha minst 10 tecken.',
                msgReq: 'Meddelande är obligatoriskt.',
              }
            : {
                nameShort: 'Nome deve ter pelo menos 2 caracteres.',
                nameReq: 'Nome é obrigatório.',
                emailReq: 'E-mail é obrigatório.',
                emailInvalid: 'Informe um e-mail válido.',
                msgShort: 'Mensagem deve ter pelo menos 10 caracteres.',
                msgReq: 'Mensagem é obrigatória.',
              };

    if (name.length < 2) {
      errors.name = name ? t.nameShort : t.nameReq;
    }

    if (!email) {
      errors.email = t.emailReq;
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = t.emailInvalid;
    }

    if (msg.length < 10) {
      errors.message = msg ? t.msgShort : t.msgReq;
    }

    var productContext = (fd.get('product_context') || '').trim();
    return {
      name: name,
      email: email,
      company: company,
      message: msg,
      product_context: productContext,
      errors: errors,
    };
  }

  function wrapToErrorId(wrapId) {
    return wrapId.replace(/-wrap$/, '') + '-error';
  }

  function showFieldError(fieldId, message) {
    var wrap = document.getElementById(fieldId);
    if (!wrap) return;
    wrap.classList.add('contact-field--error');
    var errId = wrapToErrorId(fieldId);
    var errEl = document.getElementById(errId) || wrap.querySelector('.contact-field-error');
    var input = wrap.querySelector('input, textarea');
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      if (errEl && errEl.id) input.setAttribute('aria-describedby', errEl.id);
    }
    if (errEl) {
      errEl.textContent = message;
      errEl.removeAttribute('hidden');
    }
  }

  function clearFieldError(fieldId) {
    var wrap = document.getElementById(fieldId);
    if (!wrap) return;
    wrap.classList.remove('contact-field--error');
    var errId = wrapToErrorId(fieldId);
    var errEl = document.getElementById(errId) || wrap.querySelector('.contact-field-error');
    var input = wrap.querySelector('input, textarea');
    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    if (errEl) {
      errEl.textContent = '';
      errEl.setAttribute('hidden', '');
    }
  }

  function clearAllContactErrors(form) {
    ['name-wrap', 'email-wrap', 'company-wrap', 'message-wrap'].forEach(clearFieldError);
  }

  /** Foco no primeiro campo do formulário quando a página abre ou navega para #contato (acessibilidade). */
  function focusContactFormIfHash() {
    if (window.location.hash !== '#contato') return;
    var form = document.getElementById('contact-form');
    var nameInput = document.getElementById('name');
    if (!form || !nameInput) return;
    window.setTimeout(function () {
      try {
        nameInput.focus({ preventScroll: true });
      } catch (e) {
        nameInput.focus();
      }
    }, 100);
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        var wrap = el.closest('[id$="-wrap"]');
        if (wrap && wrap.id) clearFieldError(wrap.id);
      });
      el.addEventListener('blur', function () {
        var wrap = el.closest('[id$="-wrap"]');
        if (wrap && wrap.id) clearFieldError(wrap.id);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllContactErrors(form);

      var result = validateContactForm(form);
      var hasErrors = Object.keys(result.errors).length > 0;

      if (hasErrors) {
        if (result.errors.name) showFieldError('name-wrap', result.errors.name);
        if (result.errors.email) showFieldError('email-wrap', result.errors.email);
        if (result.errors.company) showFieldError('company-wrap', result.errors.company);
        if (result.errors.message) showFieldError('message-wrap', result.errors.message);

        var firstError = Object.keys(result.errors)[0];
        var firstWrap = document.getElementById(firstError + '-wrap');
        if (firstWrap) {
          var input = firstWrap.querySelector('input, textarea');
          if (input) {
            input.focus();
          }
        }
        return;
      }

      var lang = (document.documentElement.getAttribute('lang') || 'pt-BR').toLowerCase();
      var isEn = lang.startsWith('en');
      var isKok = lang.startsWith('kok');
      var isSv = lang === 'sv' || lang.startsWith('sv-');
      var pc = result.product_context;
      var preEn = pc ? '*Product / page:* ' + pc + '\n\n' : '';
      var preSv = pc ? '*Produkt / sida:* ' + pc + '\n\n' : '';
      var prePt = pc ? '*Produto / página:* ' + pc + '\n\n' : '';
      var template;
      if (isEn) {
        template = '*Web-Engenharia Contact*\n\n' + preEn + '*Name:* ' + result.name + '\n*Email:* ' + result.email +
          (result.company ? '\n*Company:* ' + result.company : '') + '\n\n*Message:*\n' + result.message;
      } else if (isKok) {
        template = '*Web-Engenharia Samparko*\n\n' + prePt + '*Nav:* ' + result.name + '\n*Email:* ' + result.email +
          (result.company ? '\n*Kornni:* ' + result.company : '') + '\n\n*Sandesh:*\n' + result.message;
      } else if (isSv) {
        template = '*Web-Engenharia — kontakt*\n\n' + preSv + '*Namn:* ' + result.name + '\n*E-post:* ' + result.email +
          (result.company ? '\n*Företag:* ' + result.company : '') + '\n\n*Meddelande:*\n' + result.message;
      } else {
        template = '*Contato Web-Engenharia*\n\n' + prePt + '*Nome:* ' + result.name + '\n*E-mail:* ' + result.email +
          (result.company ? '\n*Empresa:* ' + result.company : '') + '\n\n*Mensagem:*\n' + result.message;
      }
      var text = template;

      var url = 'https://wa.me/' + WHATSAPP_E164 + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  function initScrollReveal() {
    var reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var sections = document.querySelectorAll('main > section');
    sections.forEach(function (section, index) {
      if (index === 0) return;
      section.classList.add('reveal-section', 'reveal-cv');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        rootMargin: '120px 0px -48px 0px',
        threshold: 0.02,
      }
    );

    sections.forEach(function (section, index) {
      if (index === 0) return;
      observer.observe(section);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initYear();
    initHeroAnimation();
    initLangSelectors();
    initMobileNav();
    initHeaderDropdowns();
    initFaq();
    initGenteWhenNearViewport();
    initContactForm();
    focusContactFormIfHash();
    initScrollReveal();
  });

  window.addEventListener('hashchange', function () {
    focusContactFormIfHash();
  });
})();
