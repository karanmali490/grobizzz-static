/**
 * Profile UI language: en | hi | mr
 * Can switch any number of times (key-based, not English-only match).
 */
(function (w) {
  'use strict';

  var DICT = {
    en: {
      about: 'About',
      menu: 'Menu / Services',
      gallery: 'Gallery',
      contact: 'Contact',
      call: 'Call',
      whatsapp: 'WhatsApp',
      share: 'Share',
      directions: 'Directions',
      visit: 'Visit Us',
      order: 'Order Online',
      reviews: 'Reviews',
      follow: 'Follow Us',
      photos: 'Photos',
      portfolio: 'Portfolio',
      hours: 'Hours',
      call_us: 'Call Us',
      get_directions: 'Get Directions',
      add_contact: 'Add to Contact',
      book: 'Book / Enquire',
      call_now: 'Call Now',
      find_us: 'Find us',
      phone: 'Phone',
      address: 'Address'
    },
    hi: {
      about: 'हमारे बारे में',
      menu: 'मेनू / सेवाएँ',
      gallery: 'गैलरी',
      contact: 'संपर्क',
      call: 'कॉल',
      whatsapp: 'व्हाट्सऐप',
      share: 'शेयर',
      directions: 'दिशा',
      visit: 'हमसे मिलें',
      order: 'ऑनलाइन ऑर्डर',
      reviews: 'समीक्षाएँ',
      follow: 'फॉलो करें',
      photos: 'तस्वीरें',
      portfolio: 'पोर्टफोलियो',
      hours: 'समय',
      call_us: 'कॉल करें',
      get_directions: 'दिशा देखें',
      add_contact: 'संपर्क में जोड़ें',
      book: 'बुक / पूछताछ',
      call_now: 'अभी कॉल करें',
      find_us: 'पता',
      phone: 'फ़ोन',
      address: 'पता'
    },
    mr: {
      about: 'आमच्याबद्दल',
      menu: 'मेनू / सेवा',
      gallery: 'गॅलरी',
      contact: 'संपर्क',
      call: 'कॉल',
      whatsapp: 'व्हाट्सअॅप',
      share: 'शेअर',
      directions: 'दिशा',
      visit: 'भेट द्या',
      order: 'ऑनलाइन ऑर्डर',
      reviews: 'पुनरावलोकने',
      follow: 'फॉलो करा',
      photos: 'फोटो',
      portfolio: 'पोर्टफोलिओ',
      hours: 'वेळ',
      call_us: 'कॉल करा',
      get_directions: 'दिशा पाहा',
      add_contact: 'संपर्कात जोडा',
      book: 'बुक / चौकशी',
      call_now: 'आता कॉल करा',
      find_us: 'पत्ता',
      phone: 'फोन',
      address: 'पत्ता'
    }
  };

  function getLang() {
    try { return localStorage.getItem('grobizzz_lang') || 'en'; } catch (e) { return 'en'; }
  }
  function setLang(code) {
    try { localStorage.setItem('grobizzz_lang', code); } catch (e) {}
  }
  function t(key, lang) {
    lang = lang || getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  }

  /** Map any known label (en/hi/mr) back to key */
  function keyFromText(text) {
    var s = String(text || '').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    var langs = ['en', 'hi', 'mr'];
    for (var li = 0; li < langs.length; li++) {
      var d = DICT[langs[li]];
      for (var k in d) {
        if (Object.prototype.hasOwnProperty.call(d, k) && d[k] === s) return k;
      }
    }
    return null;
  }

  function setElementLabel(el, key) {
    if (!el || !key) return;
    el.setAttribute('data-i18n', key);
    var lang = getLang();
    var label = t(key, lang);

    // Prefer updating a text span if present (keeps icons)
    var span = el.querySelector('span:not(.icon):not([class*="fa"])');
    var textNodes = [];
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3 && n.textContent.replace(/\s/g, '').length) textNodes.push(n);
    });

    if (span && !span.querySelector('i') && span.children.length === 0) {
      span.textContent = label;
    } else if (textNodes.length === 1 && el.querySelector('i, svg')) {
      textNodes[0].textContent = ' ' + label + ' ';
    } else if (el.children.length === 0) {
      el.textContent = label;
    } else if (textNodes.length) {
      textNodes[0].textContent = ' ' + label + ' ';
    } else {
      el.setAttribute('aria-label', label);
    }
  }

  function discoverAndTag() {
    // Nav by href
    document.querySelectorAll('a[href="#about"]').forEach(function (a) { a.setAttribute('data-i18n', 'about'); });
    document.querySelectorAll('a[href="#menu"]').forEach(function (a) { a.setAttribute('data-i18n', 'menu'); });
    document.querySelectorAll('a[href="#gallery"]').forEach(function (a) { a.setAttribute('data-i18n', 'gallery'); });
    document.querySelectorAll('a[href="#contact"]').forEach(function (a) { a.setAttribute('data-i18n', 'contact'); });
    document.querySelectorAll('a.nav-call, a.float-call').forEach(function (a) { a.setAttribute('data-i18n', 'call'); });
    document.querySelectorAll('a.nav-wa, a.float-wa').forEach(function (a) { a.setAttribute('data-i18n', 'whatsapp'); });

    // Tag unknown elements by matching current text to any language
    var sel = 'h2,h3,.sec-head,.sec-title,.sec-label,.section-title,.pill,.btn,.ab-title,.contact-label,.info-label,a.btn,button,.btn-ghost,.btn-primary,.btn-red,.btn-ghost-svc,.action-btn';
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.closest('#gbz-lang')) return;
      if (el.getAttribute('data-i18n')) return;
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      // strip leading icon-only noise
      var key = keyFromText(text);
      if (key) el.setAttribute('data-i18n', key);
    });
  }

  function applyToProfile() {
    discoverAndTag();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      setElementLabel(el, el.getAttribute('data-i18n'));
    });
  }

  function mountToggle() {
    var box = document.getElementById('gbz-lang');
    if (!box) {
      box = document.createElement('div');
      box.id = 'gbz-lang';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', 'Language');
      box.innerHTML =
        '<button type="button" data-lang="en" title="English">EN</button>' +
        '<button type="button" data-lang="hi" title="Hindi">हि</button>' +
        '<button type="button" data-lang="mr" title="Marathi">मर</button>';
      document.body.appendChild(box);
    }
    function syncButtons() {
      var cur = getLang();
      box.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-lang') === cur);
      });
    }
    box.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        setLang(b.getAttribute('data-lang'));
        syncButtons();
        applyToProfile();
      };
    });
    syncButtons();
    applyToProfile();
  }

  w.GrobizzzI18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    applyToProfile: applyToProfile,
    mountToggle: mountToggle,
    DICT: DICT
  };
})(window);
