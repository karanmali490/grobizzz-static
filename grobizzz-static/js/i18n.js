/**
 * Profile UI language: en | hi | mr
 * Translates UI labels only (not business content).
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
      address: 'Address',
      lang: 'Language'
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
      address: 'पता',
      lang: 'भाषा'
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
      address: 'पत्ता',
      lang: 'भाषा'
    }
  };

  // English phrases → key (longest first)
  var PHRASES = [
    ['Menu / Services', 'menu'],
    ['Get Directions', 'get_directions'],
    ['Add to Contact', 'add_contact'],
    ['Order Online', 'order'],
    ['Book / Enquire', 'book'],
    ['Call Now', 'call_now'],
    ['Call Us', 'call_us'],
    ['Visit Us', 'visit'],
    ['Follow Us', 'follow'],
    ['Find us', 'find_us'],
    ['WhatsApp', 'whatsapp'],
    ['Portfolio', 'portfolio'],
    ['Directions', 'directions'],
    ['Gallery', 'gallery'],
    ['Contact', 'contact'],
    ['Reviews', 'reviews'],
    ['Photos', 'photos'],
    ['About', 'about'],
    ['Share', 'share'],
    ['Hours', 'hours'],
    ['Phone', 'phone'],
    ['Address', 'address'],
    ['Call', 'call']
  ];

  function getLang() {
    try { return localStorage.getItem('grobizzz_lang') || 'en'; } catch (e) { return 'en'; }
  }
  function setLang(code) {
    try { localStorage.setItem('grobizzz_lang', code); } catch (e) {}
  }
  function t(key) {
    var lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  }

  function translateTextNode(raw) {
    var s = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    for (var i = 0; i < PHRASES.length; i++) {
      var en = PHRASES[i][0];
      var key = PHRASES[i][1];
      if (s === en) return t(key);
      // "Call Us" inside longer? exact only for safety
    }
    // "i Call" patterns with icons stripped already as textContent
    if (/^Call\s*Us$/i.test(s)) return t('call_us');
    if (/^Call\s*Now$/i.test(s)) return t('call_now');
    if (/^WhatsApp$/i.test(s)) return t('whatsapp');
    return null;
  }

  function applyToProfile() {
    // 1) explicit data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    // 2) nav links
    document.querySelectorAll('.nav-links a, .site-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === '#about') a.childNodes.forEach(function (n) { if (n.nodeType === 3) n.textContent = t('about'); });
      if (href === '#menu') { a.textContent = t('menu'); }
      if (href === '#gallery') a.textContent = t('gallery');
      if (href === '#contact') a.textContent = t('contact');
      if (a.classList.contains('nav-call') || a.classList.contains('nav-cta') && href.indexOf('tel:') === 0) {
        var span = a.querySelector('span');
        if (span) span.textContent = t('call');
      }
      if (a.classList.contains('nav-wa')) {
        var span2 = a.querySelector('span');
        if (span2) span2.textContent = t('whatsapp');
      }
    });

    // 3) common headings / buttons / labels
    var selectors = [
      'h2', 'h3', '.sec-head', '.sec-title', '.sec-label', '.eyebrow',
      '.section-title', '.pill', '.btn', '.action-btn', '.contact-label',
      '.ab-title', '.info-label', 'button', 'a.btn', '.btn-primary', '.btn-ghost',
      '.btn-red', '.btn-ghost-svc', '.contact-btn span', '.nav-links a'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (el) {
      // don't touch inputs
      if (el.closest('#gbz-lang')) return;
      if (el.children.length === 0) {
        var next = translateTextNode(el.textContent);
        if (next) el.textContent = next;
      } else {
        // translate pure text leaves
        Array.prototype.forEach.call(el.childNodes, function (n) {
          if (n.nodeType === 3) {
            var next2 = translateTextNode(n.textContent);
            if (next2) n.textContent = ' ' + next2 + ' ';
          }
        });
      }
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
    var cur = getLang();
    box.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === cur);
      b.onclick = function () {
        setLang(b.getAttribute('data-lang'));
        box.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        applyToProfile();
      };
    });
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
