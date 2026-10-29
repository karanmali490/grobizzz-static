/**
 * Profile UI language: en | hi | mr
 */
(function (w) {
  'use strict';
  var DICT = {
    en: {
      about: 'About', menu: 'Menu / Services', gallery: 'Gallery', contact: 'Contact',
      call: 'Call', whatsapp: 'WhatsApp', share: 'Share', directions: 'Directions',
      visit: 'Visit Us', order: 'Order Online', reviews: 'Reviews', follow: 'Follow Us',
      photos: 'Photos', portfolio: 'Portfolio', hours: 'Hours', lang: 'Language'
    },
    hi: {
      about: 'हमारे बारे में', menu: 'मेनू / सेवाएँ', gallery: 'गैलरी', contact: 'संपर्क',
      call: 'कॉल', whatsapp: 'व्हाट्सऐप', share: 'शेयर', directions: 'दिशा',
      visit: 'हमसे मिलें', order: 'ऑनलाइन ऑर्डर', reviews: 'समीक्षाएँ', follow: 'फॉलो करें',
      photos: 'तस्वीरें', portfolio: 'पोर्टफोलियो', hours: 'समय', lang: 'भाषा'
    },
    mr: {
      about: 'आमच्याबद्दल', menu: 'मेनू / सेवा', gallery: 'गॅलरी', contact: 'संपर्क',
      call: 'कॉल', whatsapp: 'व्हाट्सअॅप', share: 'शेअर', directions: 'दिशा',
      visit: 'भेट द्या', order: 'ऑनलाइन ऑर्डर', reviews: 'पुनरावलोकने', follow: 'फॉलो करा',
      photos: 'फोटो', portfolio: 'पोर्टफोलिओ', hours: 'वेळ', lang: 'भाषा'
    }
  };

  function getLang() {
    try { return localStorage.getItem('grobizzz_lang') || 'en'; } catch (e) { return 'en'; }
  }
  function setLang(code) {
    try { localStorage.setItem('grobizzz_lang', code); } catch (e) {}
  }
  function t(key) {
    var lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || (DICT.en[key] || key);
  }

  function applyToProfile() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
  }

  function mountToggle() {
    if (document.getElementById('gbz-lang')) return;
    var box = document.createElement('div');
    box.id = 'gbz-lang';
    box.innerHTML =
      '<button type="button" data-lang="en" title="English">EN</button>' +
      '<button type="button" data-lang="hi" title="Hindi">हि</button>' +
      '<button type="button" data-lang="mr" title="Marathi">मर</button>';
    document.body.appendChild(box);
    var cur = getLang();
    box.querySelectorAll('button').forEach(function (b) {
      if (b.getAttribute('data-lang') === cur) b.classList.add('on');
      b.addEventListener('click', function () {
        setLang(b.getAttribute('data-lang'));
        box.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        applyToProfile();
      });
    });
  }

  w.GrobizzzI18n = { t: t, getLang: getLang, setLang: setLang, applyToProfile: applyToProfile, mountToggle: mountToggle, DICT: DICT };
})(window);
