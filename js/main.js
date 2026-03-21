// Notificação local para marcar reunião de produto
window.addEventListener('load', function() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      // Aguarda a definição da variável WHATSAPP_E164
      setTimeout(function() {
        if (typeof WHATSAPP_E164 !== 'undefined') {
          const notification = new Notification('Marque uma reunião de produto!', {
            body: 'Clique aqui para falar com a Web-Engenharia pelo WhatsApp.',
            icon: '/images/icons/icon-192x192.png',
          });
          notification.onclick = function() {
            window.open('https://wa.me/' + WHATSAPP_E164, '_blank');
          };
        }
      }, 100);
    }
  }
});
(function () {
  'use strict';

  /** Número WhatsApp para envio do formulário (E.164, sem +). */
  var WHATSAPP_E164 = '5541987973270';

  var pathname = window.location.pathname || '';
  var inLocaleSubfolder = /\/(en|ja|kok)(\/|$)/.test(pathname);
  var ANIMATION_BASE = inLocaleSubfolder ? '../animacao_svg/' : 'animacao_svg/';
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

    if (reduced) {
      var fallbackLabel = inKok
        ? 'Web-Engenharia marca (system nirdhar paun animaion band)'
        : 'Marca Web-Engenharia (animação desativada por preferência do sistema)';
      var fallbackText = inKok
        ? 'Uddesh borabor integrasaun — statik rochop (chalnn ghat).'
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
      iframe.setAttribute('title', inKok ? 'Web-Engenharia lip animaion' : 'Animação da marca Web-Engenharia');
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

    function setOpen(open) {
      panel.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      var open = panel.classList.contains('hidden');
      setOpen(open);
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  function initMobileLangSelect() {
    var select = document.getElementById('lang-select-mobile');
    if (!select) return;

    var path = window.location.pathname || '';
    var isPrivacidade = /privacidade\.html$/.test(path);
    var isTermos = /termos\.html$/.test(path);
    var isCareers = /careers\.html$/.test(path);
    var inEn = /\/(en)(\/|$)/.test(path);
    var inJa = /\/(ja)(\/|$)/.test(path);
    var inKok = /\/(kok)(\/|$)/.test(path);
    var pageFile = isPrivacidade ? 'privacidade.html' : isTermos ? 'termos.html' : isCareers ? 'careers.html' : '';
    var urls = { pt: '', en: '', ja: '', kok: '' };

    if (isCareers && inEn) {
      urls.pt = '../';
      urls.en = 'careers.html';
      urls.ja = '../ja/';
      urls.kok = '../kok/';
    } else if (inEn) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile || 'index.html';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
    } else if (inJa) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.ja = pageFile || 'index.html';
      urls.kok = pageFile ? '../kok/' + pageFile : '../kok/';
    } else if (inKok) {
      urls.pt = pageFile ? '../' + pageFile : '../';
      urls.en = pageFile ? '../en/' + pageFile : '../en/';
      urls.ja = pageFile ? '../ja/' + pageFile : '../ja/';
      urls.kok = pageFile || 'index.html';
    } else {
      urls.pt = pageFile || 'index.html';
      urls.en = pageFile ? 'en/' + pageFile : 'en/';
      urls.ja = pageFile ? 'ja/' + pageFile : 'ja/';
      urls.kok = pageFile ? 'kok/' + pageFile : 'kok/';
    }

    var currentLang = inEn ? 'en' : inJa ? 'ja' : inKok ? 'kok' : 'pt';
    var options = [
      { value: urls.pt, label: '🇧🇷 Português', lang: 'pt' },
      { value: urls.en, label: '🇺🇸 English', lang: 'en' },
      { value: urls.ja, label: '🇯🇵 日本語', lang: 'ja' },
      { value: urls.kok, label: '🇮🇳 Konknni', lang: 'kok' },
    ];

    select.innerHTML = '';
    options.forEach(function (opt) {
      var option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.lang === currentLang) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      var url = select.value;
      if (url) window.location.href = url;
    });
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
      if (e.key === 'Escape') closeAll();
    });
  }

  function initFaq() {
    document.querySelectorAll('[data-faq-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('aria-controls');
        var panel = id ? document.getElementById(id) : null;
        if (!panel) return;

        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        panel.classList.toggle('hidden', expanded);
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

    var t = isKok ? {
      nameShort: 'Nav otthve 2 akshar gorje.',
      nameReq: 'Nav gorje.',
      emailReq: 'Email gorje.',
      emailInvalid: 'Valid email sang.',
      msgShort: 'Sandesh otthve 10 akshar gorje.',
      msgReq: 'Sandesh gorje.'
    } : {
      nameShort: 'Nome deve ter pelo menos 2 caracteres.',
      nameReq: 'Nome é obrigatório.',
      emailReq: 'E-mail é obrigatório.',
      emailInvalid: 'Informe um e-mail válido.',
      msgShort: 'Mensagem deve ter pelo menos 10 caracteres.',
      msgReq: 'Mensagem é obrigatória.'
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

    return { name: name, email: email, company: company, message: msg, errors: errors };
  }

  function showFieldError(fieldId, message) {
    var wrap = document.getElementById(fieldId);
    if (!wrap) return;
    wrap.classList.add('contact-field--error');
    var errEl = wrap.querySelector('.contact-field-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.removeAttribute('hidden');
    }
  }

  function clearFieldError(fieldId) {
    var wrap = document.getElementById(fieldId);
    if (!wrap) return;
    wrap.classList.remove('contact-field--error');
    var errEl = wrap.querySelector('.contact-field-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.setAttribute('hidden', '');
    }
  }

  function clearAllContactErrors(form) {
    ['name-wrap', 'email-wrap', 'company-wrap', 'message-wrap'].forEach(clearFieldError);
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
      var template;
      if (isEn) {
        template = '*Web-Engenharia Contact*\n\n*Name:* ' + result.name + '\n*Email:* ' + result.email +
          (result.company ? '\n*Company:* ' + result.company : '') + '\n\n*Message:*\n' + result.message;
      } else if (isKok) {
        template = '*Web-Engenharia Samparko*\n\n*Nav:* ' + result.name + '\n*Email:* ' + result.email +
          (result.company ? '\n*Kornni:* ' + result.company : '') + '\n\n*Sandesh:*\n' + result.message;
      } else {
        template = '*Contato Web-Engenharia*\n\n*Nome:* ' + result.name + '\n*E-mail:* ' + result.email +
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
    initMobileNav();
    initMobileLangSelect();
    initHeaderDropdowns();
    initFaq();
    initGenteWhenNearViewport();
    initContactForm();
    initScrollReveal();
  });
})();
