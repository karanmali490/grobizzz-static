/**
 * GROBizzz Dynamic Profile – Multi-template engine
 * Templates: restaurant (Hyde-Out), service (Doctor), modern (Jewellers)
 */
(function () {
  'use strict';

  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var FONTS = {
    restaurant: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Work+Sans:wght@300;400;500;600;700&display=swap',
    service: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap',
    modern: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap'
  };

  var CSS = {
    restaurant: 'css/profile-restaurant.css',
    service: 'css/profile-service.css',
    modern: 'css/profile-modern.css'
  };

  function getSlug() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('slug')) return q.get('slug');
    var parts = window.location.pathname.split('/').filter(Boolean);
    var i = parts.indexOf('p');
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
    // last segment if not profile.html
    var last = parts[parts.length - 1] || '';
    if (last && last.indexOf('profile') < 0 && last.indexOf('.html') < 0) return last;
    return '';
  }
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
  function formatPrice(price, label) {
    if (price == null) return '';
    var f = '₹' + Number(price).toLocaleString('en-IN');
    return label ? label + ' ' + f : f;
  }
  function formatTime(t) {
    if (!t) return '';
    var p = String(t).split(':');
    var hour = parseInt(p[0], 10);
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var h12 = hour % 12 || 12;
    return h12 + ':' + (p[1] || '00') + ' ' + ampm;
  }
  function waLink(num, msg) {
    if (!num) return '#';
    var cleaned = String(num).replace(/\D/g, '');
    var text = encodeURIComponent(msg || 'Hello, I found your business on Grobizzz.');
    return 'https://wa.me/' + cleaned + '?text=' + text;
  }
  function telLink(num) {
    if (!num) return '#';
    return 'tel:' + String(num).replace(/\s/g, '');
  }

  function resolveTemplate(b) {
    var slug = (b.templates && b.templates.slug) || b.template_slug || '';
    if (slug === 'service' || slug === 'restaurant' || slug === 'modern') return slug;
    // fallback from category
    var cat = (b.category || '').toLowerCase();
    if (['cafe-restaurant','cake-shops','cafe','restaurant'].indexOf(cat) >= 0) return 'restaurant';
    if (['doctors','salon-spa','automobile','education','transportation','salon','gym','clinic','service'].indexOf(cat) >= 0) return 'service';
    return 'modern';
  }

  function loadTemplateAssets(tpl) {
    var font = document.getElementById('font-link');
    if (font && FONTS[tpl]) font.href = FONTS[tpl];
    var css = document.getElementById('tpl-css');
    if (css && CSS[tpl]) css.href = CSS[tpl];
  }

  function applyColors(b, tpl) {
    var root = document.documentElement;
    var primary = b.primary_color || '#c97b3a';
    var secondary = b.secondary_color || '#1a1208';
    var accent = b.accent_color || '#f5f0e8';

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--ember', primary);
    root.style.setProperty('--ember-soft', primary);
    root.style.setProperty('--accent', primary);
    root.style.setProperty('--red', primary);
    root.style.setProperty('--gold', primary);
    root.style.setProperty('--gold-dim', primary);
    root.style.setProperty('--gold-light', primary);
    root.style.setProperty('--cta', primary);

    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--den', secondary);
    root.style.setProperty('--den-soft', secondary);
    root.style.setProperty('--ink', secondary);
    root.style.setProperty('--bg-dark', secondary);

    root.style.setProperty('--accent-bg', accent);
    root.style.setProperty('--cream', accent);
    root.style.setProperty('--surface', accent);
    root.style.setProperty('--mist', accent);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', secondary);

    var styleId = 'palette-live';
    var st = document.getElementById(styleId);
    if (!st) {
      st = document.createElement('style');
      st.id = styleId;
      document.head.appendChild(st);
    }

    var parts = [];
    parts.push('body,#app{background:' + accent + ' !important;}');
    parts.push('.about,.about-sec,.menu-sec,.order-sec,.gallery-sec,.social-sec,.reviews-sec{background:' + accent + ' !important;}');
    parts.push('.about .sec-head,.about-text .sec-head{color:' + secondary + ' !important;}');
    parts.push('.about .sec-label,.about-text .sec-label{color:' + primary + ' !important;}');
    parts.push('.about-lead{color:' + primary + ' !important;}');
    parts.push('.about-body p,.about-text p{color:#2c241c !important;}');
    parts.push('.about-body p:first-of-type{color:#1a1208 !important;font-weight:500;}');
    parts.push('.about .sec-head{color:#1a1208 !important;}');
    parts.push('.menu-sec .sec-head,.order-sec .sec-head,.gallery-sec .sec-head{color:' + secondary + ' !important;}');
    parts.push('.menu-sec .sec-label,.order-sec .sec-label,.gallery-sec .sec-label{color:' + primary + ' !important;}');
    parts.push('.item-name,.item-desc{color:' + secondary + ' !important;}');
    parts.push('.contact-sec,.mod-contact,.svc-contact{background:' + secondary + ' !important;color:' + accent + ' !important;}');
    parts.push('.hero-overlay{background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,' + secondary + 'ee 100%) !important;}');
    parts.push('.btn-primary,.action-btn.primary{background:' + primary + ' !important;border-color:' + primary + ' !important;color:' + secondary + ' !important;}');
    parts.push('.btn-ghost{border-color:rgba(255,255,255,.4) !important;}');
    parts.push('.sec-label,.eyebrow,.info-icon i,.pill i{color:' + primary + ' !important;}');
    parts.push('.logo-ring,.mod-logo{border-color:' + primary + ' !important;box-shadow:0 0 0 6px ' + primary + '22 !important;}');
    parts.push('.action-btn:hover{border-color:' + primary + ' !important;}');
    parts.push('.owner-social{border-color:' + primary + '33 !important;}');
    parts.push('.owner-social:hover{background:' + primary + ' !important;color:#fff !important;}');
    parts.push('.item-card,.o-card{border-color:' + primary + '22 !important;}');
    parts.push('.scroll-top,.share-btn{background:' + primary + ' !important;}');
    parts.push('.gbz-footer{border-top-color:' + primary + ' !important;}');
    parts.push('.info-label{color:' + primary + ' !important;}');
    parts.push('.visit-title,.sec-head{color:' + secondary + ' !important;}');
    parts.push('.contact-sec .sec-head,.contact-sec h2,.contact-sec .info-value,.contact-sec .info-value a{color:' + accent + ' !important;}');
    parts.push('.hours-sec{background:' + secondary + ' !important;color:' + accent + ' !important;}');
    parts.push('.hours-sec .sec-head,.hours-sec .sec-label{color:' + primary + ' !important;}');
    st.textContent = parts.join('\n');
  }


  function setSEO(b) {
    var title = b.seo_title || (b.business_name + (b.category ? ' · ' + b.category : '') + ' | Grobizzz');
    var desc = b.seo_description || b.description || b.tagline || '';
    var url = window.location.href;
    var image = b.og_image_url || b.cover_image_url || b.logo_url || '';
    document.title = title;
    function set(sel, attr, val) {
      var el = document.querySelector(sel);
      if (el && val) el.setAttribute(attr, val);
    }
    set('meta[name="description"]', 'content', desc);
    set('link[rel="canonical"]', 'href', url);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', desc);
    set('meta[property="og:image"]', 'content', image);
    set('meta[property="og:url"]', 'content', url);
    var ld = document.getElementById('jsonld');
    if (ld) {
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: b.business_name,
        description: desc,
        image: image || undefined,
        telephone: b.phone || undefined,
        email: b.email || undefined,
        url: url
      });
    }
  }

  function openLB(src, alt) {
    var lb = document.getElementById('lb');
    var lbImg = document.getElementById('lbImg');
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
  }
  function setupLightbox() {
    var lb = document.getElementById('lb');
    var closeBtn = document.getElementById('lbClose');
    if (!lb) return;
    if (closeBtn) closeBtn.addEventListener('click', function () { lb.classList.remove('open'); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
    window.openLB = openLB;
  }

  function hoursHtml(hours) {
    if (!hours || !hours.length) return '';
    var h = '<div class="hours-list">';
    hours.forEach(function (row) {
      var day = DAY_NAMES[row.day_of_week] || '';
      if (row.is_closed) h += '<div class="hours-row"><span>' + day + '</span><span class="hours-closed">Closed</span></div>';
      else h += '<div class="hours-row"><span>' + day + '</span><span>' + formatTime(row.open_time) + ' – ' + formatTime(row.close_time) + '</span></div>';
    });
    return h + '</div>';
  }


  
  
  function isVideoUrl(url) {
    if (!url) return false;
    return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(String(url));
  }

  function splitGallery(gallery) {
    var images = [];
    var videos = [];
    (gallery || []).forEach(function (g) {
      var u = g.image_url || g.url || '';
      if (isVideoUrl(u)) videos.push(g);
      else if (u) images.push(g);
    });
    return { images: images, videos: videos };
  }

  function mediaTile(url, alt) {
    alt = alt || '';
    return '<img src="' + esc(url) + '" alt="' + esc(alt) + '" loading="lazy" onclick="openLB(this.src,this.alt)" />';
  }

  function videoTile(url) {
    return (
      '<div class="video-tile" data-video-wrap>' +
        '<video src="' + esc(url) + '" controls playsinline preload="metadata" ' +
        'onloadedmetadata="window.fitVideoOrient&&window.fitVideoOrient(this)"></video>' +
      '</div>'
    );
  }

  window.fitVideoOrient = function (v) {
    try {
      var wrap = v.closest('[data-video-wrap]');
      if (!wrap) return;
      wrap.classList.remove('vertical', 'horizontal');
      if (v.videoHeight > v.videoWidth) wrap.classList.add('vertical');
      else wrap.classList.add('horizontal');
    } catch (e) {}
  };

  function getAboutImage(b, images) {
    var feat = b.features || {};
    if (feat.about_image_url) return feat.about_image_url;
    if (b.about_image_url) return b.about_image_url;
    if (images && images[0]) return images[0].image_url;
    return null;
  }

  function socialSection(b) {
    var links = [];
    if (b.instagram_url) links.push({ href: b.instagram_url, icon: 'fa-brands fa-instagram', label: 'Instagram' });
    if (b.facebook_url) links.push({ href: b.facebook_url, icon: 'fa-brands fa-facebook-f', label: 'Facebook' });
    if (b.youtube_url) links.push({ href: b.youtube_url, icon: 'fa-brands fa-youtube', label: 'YouTube' });
    if (!links.length) return '';
    var h = '<section class="social-sec"><p class="sec-label">Connect</p><h2 class="sec-head">Follow Us</h2><div class="owner-socials">';
    links.forEach(function (l) {
      h += '<a class="owner-social" href="' + esc(l.href) + '" target="_blank" rel="noopener"><i class="' + l.icon + '"></i><span>' + l.label + '</span></a>';
    });
    h += '</div></section>';
    return h;
  }

  function reviewsSection(b) {
    var feat = b.features || {};
    if (feat.show_reviews === false) return '';
    var url = b.google_business_url || b.google_maps_url || '';
    if (!url) return '';
    return (
      '<section class="order-sec reviews-sec">' +
        '<p class="sec-label">Reviews</p>' +
        '<h2 class="sec-head">Google Reviews</h2>' +
        '<div class="order-cards reviews-cards">' +
          '<a class="o-card o-google" href="' + esc(url) + '" target="_blank" rel="noopener">' +
            '<img class="o-logo" src="images/google-reviews-logo.png" alt="Google Reviews" />' +
            '<span>Read &amp; Write Reviews</span>' +
          '</a>' +
        '</div>' +
      '</section>'
    );
  }

  function formatAbout(text) {
    if (!text) return '';
    var parts = String(text).split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) parts = [String(text)];
    return parts.map(function (para) { return '<p>' + esc(para) + '</p>'; }).join('');
  }

  function reviewsBtn(b) {
    var url = b.google_business_url || b.google_maps_url || '';
    if (!url) return '';
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener" class="btn btn-reviews"><i class="fa-brands fa-google"></i> Google Reviews</a>';
  }

  function gbzFooter() {
    var y = new Date().getFullYear();
    return (
      '<footer class="gbz-footer">' +
        '<div class="powered">' +
          '<span>POWERED BY</span>' +
          '<a href="https://grobizzz.in/" target="_blank" rel="noopener">' +
            '<img src="images/grobizzz-logo.png" alt="Grobizzz" onerror="this.style.display=\'none\'" />' +
          '</a>' +
        '</div>' +
        '<div class="f-links">' +
          '<a href="https://grobizzz.in/" target="_blank" rel="noopener">About Us</a>' +
          '<a href="https://grobizzz.in/" target="_blank" rel="noopener">Contact Us</a>' +
        '</div>' +
        '<p class="follow-label">Follow Us</p>' +
        '<div class="f-socials">' +
          '<a href="https://www.facebook.com/profile.php?id=61571578101681" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
          '<a href="https://x.com/Grobizin" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>' +
          '<a href="https://www.instagram.com/grobizzz.in" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
          '<a href="https://www.youtube.com/channel/UC3qtz8dAlwcPCyrrYUkfmqA" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>' +
          '<a href="https://wa.me/919699544383" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>' +
        '</div>' +
        '<div class="copy">© ' + y + ' Grobizzz. All rights reserved.</div>' +
      '</footer>'
    );
  }

  function buildShareMessage(b) {
    var name = b.business_name || 'Our Business';
    var link = window.location.href;
    return (
      'Hello,\n' +
      'Now you can easily connect with our Business promotion Website of\n' +
      name + '.\n' +
      'This is Business promotion website where you can get all our information and connect with us.\n' +
      'Link:-' + link + '\n' +
      'Regards,\n' +
      name + '.'
    );
  }

  function shareScrollHtml(b) {
    var rawMsg = buildShareMessage(b);
    var text = encodeURIComponent(rawMsg);
    var url = encodeURIComponent(window.location.href);
    var subject = encodeURIComponent(b.business_name || 'Business Profile');
    var h = '';
    h += '<button type="button" class="share-btn" id="shareBtn" aria-label="Share"><i class="fa-solid fa-share-nodes"></i></button>';
    h += '<div class="share-menu" id="shareMenu">';
    h += '<a class="wa" href="https://api.whatsapp.com/send?text=' + text + '" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>';
    h += '<a class="fb" href="https://www.facebook.com/sharer.php?u=' + url + '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>';
    h += '<a class="x" href="https://twitter.com/intent/tweet?text=' + text + '" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>';
    h += '<a class="sms" href="sms:?body=' + text + '" aria-label="SMS"><i class="fa-solid fa-comment-sms"></i></a>';
    h += '<a class="mail" href="mailto:?subject=' + subject + '&body=' + text + '" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>';
    h += '</div>';
    h += '<button type="button" class="scroll-top" id="scrollTop" aria-label="Back to top"><i class="fa-solid fa-chevron-up"></i></button>';
    return h;
  }

  function bindShareScroll() {
    var scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) {
      window.addEventListener('scroll', function () {
        scrollBtn.classList.toggle('show', window.scrollY > 400);
      });
      scrollBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    var shareBtn = document.getElementById('shareBtn');
    var shareMenu = document.getElementById('shareMenu');
    if (shareBtn && shareMenu) {
      shareBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        shareMenu.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!shareMenu.contains(e.target) && e.target !== shareBtn && !shareBtn.contains(e.target)) {
          shareMenu.classList.remove('open');
        }
      });
    }
  }


  function buildVCard(b) {
    var lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push('FN:' + (b.business_name || '').replace(/[\n\r;,]/g, ' '));
    lines.push('ORG:' + (b.business_name || '').replace(/[\n\r;,]/g, ' '));
    if (b.tagline) lines.push('TITLE:' + String(b.tagline).replace(/[\n\r;,]/g, ' '));
    if (b.phone) lines.push('TEL;TYPE=CELL,VOICE:' + String(b.phone).replace(/\s/g, ''));
    if (b.whatsapp && b.whatsapp !== b.phone) lines.push('TEL;TYPE=CELL:' + String(b.whatsapp).replace(/\s/g, ''));
    if (b.email) lines.push('EMAIL;TYPE=INTERNET:' + String(b.email));
    var addr = [b.address, b.area, b.city, b.state, b.pincode].filter(Boolean).join(', ');
    if (addr) lines.push('ADR;TYPE=WORK:;;' + addr.replace(/[\n\r;]/g, ' ') + ';;;;');
    if (b.website) lines.push('URL:' + String(b.website));
    else lines.push('URL:' + window.location.href);
    if (b.google_maps_url) lines.push('URL;TYPE=Maps:' + String(b.google_maps_url));
    lines.push('NOTE:Saved from Grobizzz profile');
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }

  function downloadVCard(b) {
    try {
      var vcf = buildVCard(b);
      var safe = String(b.business_name || 'contact').replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-') || 'contact';
      var filename = safe + '.vcf';
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {
        // iOS: open data URI so user can share/save contact
        var dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcf);
        var w = window.open(dataUri, '_blank');
        if (!w) {
          // popup blocked – try location
          window.location.href = dataUri;
        }
        return;
      }

      var blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('vCard error', err);
      alert('Could not create contact file. Please try again.');
    }
  }

  function bindVCard(b) {
    // Event delegation – works on all templates
    document.querySelectorAll('[data-vcard]').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
      el.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        downloadVCard(b);
        return false;
      };
    });
  }

  function floatHtml(b, features) {
    var h = '<div class="float-btns">';
    /* Only WhatsApp on left – Call/Maps/Share are on the right or in hero (no overlap) */
    if (features.whatsapp !== false && b.whatsapp) {
      h += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener" class="float-btn float-wa" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>';
    }
    return h + '</div>';
  }

  function mapSrc(b) {
    if (b.latitude && b.longitude) return 'https://maps.google.com/maps?q=' + b.latitude + ',' + b.longitude + '&z=15&output=embed';
    var q = encodeURIComponent((b.address || '') + ' ' + (b.city || '') + ' ' + (b.business_name || ''));
    return 'https://maps.google.com/maps?q=' + q + '&z=15&output=embed';
  }

  /* ========== RESTAURANT (Hyde-Out) ========== */
  function renderRestaurant(b) {
    var features = b.features || {};
    var products = b.products || [];
    var services = b.services || [];
    var gallery = b.gallery || [];
    var hours = b.hours || [];
    var coverStyle = b.cover_image_url ? "background-image:url('" + esc(b.cover_image_url) + "')" : '';
    var logoHtml = b.logo_url
      ? '<img src="' + esc(b.logo_url) + '" alt="" />'
      : '<div class="logo-fallback">' + esc((b.business_name || 'B').charAt(0).toUpperCase()) + '</div>';
    var verified = (b.verified || features.verified) ? ' <span class="verified-pill"><i class="fa-solid fa-check"></i> Verified</span>' : '';

    var html = '';
    html += '<section class="hero"><div class="hero-bg" style="' + coverStyle + '"></div><div class="hero-overlay"></div>';
    html += '<div class="hero-content"><div class="logo-ring">' + logoHtml + '</div>';
    if (b.subcategory || b.category) html += '<p class="eyebrow">' + esc(b.subcategory || b.category) + '</p>';
    html += '<h1>' + esc(b.business_name) + verified + '</h1>';
    if (b.tagline) html += '<p class="hero-tagline">' + esc(b.tagline) + '</p>';
    html += '<div class="cta-row">';
    if (b.zomato_url || b.swiggy_url) html += '<a href="' + esc(b.zomato_url || b.swiggy_url) + '" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-solid fa-bag-shopping"></i> Order Online</a>';
    if (b.google_maps_url) html += '<a href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener" class="btn btn-ghost"><i class="fa-solid fa-location-dot"></i> Get Directions</a>';
    html += '<button type="button" class="btn btn-ghost" id="share-btn"><i class="fa-solid fa-share-nodes"></i> Share</button>';
    html += '<button type="button" class="btn btn-ghost" data-vcard><i class="fa-solid fa-address-card"></i> Add to Contact</button>';
    html += reviewsBtn(b);
    html += '</div><div class="pill-row">';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '" class="pill"><i class="fa-solid fa-phone"></i> Call Us</a>';
    if (b.whatsapp) html += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener" class="pill"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>';
    if (b.email) html += '<a href="mailto:' + esc(b.email) + '" class="pill"><i class="fa-solid fa-envelope"></i> Email</a>';
    html += '</div></div><div class="scroll-dot" aria-hidden="true"><span></span>scroll</div></section>';

    var split = splitGallery(gallery);
    var images = split.images;
    var videos = split.videos;
    var aboutImg = getAboutImage(b, images);

    if (b.about || b.description || aboutImg) {
      html += '<section class="about" id="about"><div class="about-inner">';
      html += '<div class="about-text">';
      html += '<p class="sec-label">Our Story</p><h2 class="sec-head">About ' + esc(b.business_name) + '</h2>';
      html += '<p class="about-lead">Every great place has a story — here is ours.</p>';
      if (b.about || b.description) html += '<div class="about-body">' + formatAbout(b.about || b.description) + '</div>';
      html += '</div>';
      if (aboutImg) {
        html += '<div class="about-media"><img src="' + esc(aboutImg) + '" alt="About ' + esc(b.business_name) + '" loading="lazy" /></div>';
      }
      html += '</div></section>';
    }

    if (images.length) {
      html += '<section class="gallery-sec" id="gallery"><p class="sec-label">Gallery</p><h2 class="sec-head">Photos</h2><div class="amb-grid">';
      images.forEach(function (g) {
        html += mediaTile(g.image_url, g.caption || '');
      });
      html += '</div></section>';
    }

    if (videos.length) {
      html += '<section class="video-sec" id="videos"><p class="sec-label">Videos</p><h2 class="sec-head">Watch Us</h2><div class="video-grid">';
      videos.forEach(function (g) {
        html += videoTile(g.image_url);
      });
      html += '</div></section>';
    }
    if (products.length) {
      html += '<section class="menu-sec" id="menu"><div class="menu-inner"><p class="sec-label">What We Serve</p><h2 class="sec-head">Menu</h2><div class="item-list">';
      products.forEach(function (p) {
        html += '<div class="item-card">';
        if (p.image_url) html += '<img class="item-img" src="' + esc(p.image_url) + '" alt="" loading="lazy" />';
        html += '<div class="item-body">' + (p.category ? '<div class="item-cat">' + esc(p.category) + '</div>' : '') + '<div class="item-name">' + esc(p.name) + '</div>' + (p.description ? '<div class="item-desc">' + esc(p.description) + '</div>' : '') + '</div>';
        if (p.price != null) html += '<div class="item-price">' + formatPrice(p.price) + '</div>';
        html += '</div>';
      });
      html += '</div></div></section>';
    }
    if (services.length) {
      html += '<section class="menu-sec" id="services" style="background:#fff"><div class="menu-inner"><p class="sec-label">Services</p><h2 class="sec-head">What We Offer</h2><div class="item-list">';
      services.forEach(function (s) {
        html += '<div class="item-card">';
        if (s.image_url) html += '<img class="item-img" src="' + esc(s.image_url) + '" alt="" loading="lazy" />';
        html += '<div class="item-body"><div class="item-name">' + esc(s.name) + '</div>' + (s.description ? '<div class="item-desc">' + esc(s.description) + '</div>' : '') + '</div>';
        if (s.price != null) html += '<div class="item-price">' + formatPrice(s.price, s.price_label) + '</div>';
        html += '</div>';
      });
      html += '</div></div></section>';
    }
    if (hours.length) {
      html += '<section class="hours-sec"><p class="sec-label">Hours</p><h2 class="sec-head">Opening Hours</h2>' + hoursHtml(hours) + '</section>';
    }
    if (b.zomato_url || b.swiggy_url) {
      html += '<section class="order-sec"><p class="sec-label">Order</p><h2 class="sec-head">Order Online</h2><div class="order-cards">';
      if (b.zomato_url) html += '<a class="o-card o-zomato" href="' + esc(b.zomato_url) + '" target="_blank" rel="noopener"><img class="o-logo" src="images/zomato.png" alt="Zomato" /><span>Order on Zomato</span></a>';
      if (b.swiggy_url) html += '<a class="o-card o-swiggy" href="' + esc(b.swiggy_url) + '" target="_blank" rel="noopener"><img class="o-logo" src="images/swiggy.png" alt="Swiggy" /><span>Order on Swiggy</span></a>';
      html += '</div></section>';
    }
    html += '<section class="contact-sec"><div class="contact-panel"><div class="contact-info-col">';
    html += '<h2 class="sec-head visit-title">Visit Us</h2>';
    if (b.address) html += '<div class="info-item"><div class="info-icon"><i class="fa-solid fa-location-dot"></i></div><div class="info-text"><span class="info-label">Address:</span><span class="info-value">' + esc(b.address) + (b.city ? '<br>' + esc(b.city) : '') + '</span></div></div>';
    if (b.phone) html += '<div class="info-item"><div class="info-icon"><i class="fa-solid fa-phone"></i></div><div class="info-text"><span class="info-label">Phone:</span><span class="info-value"><a href="' + telLink(b.phone) + '">' + esc(b.phone) + '</a></span></div></div>';
    html += '</div><div class="contact-actions-col">';
    if (b.google_maps_url) html += '<a href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener" class="action-btn primary"><div class="ab-icon"><i class="fa-solid fa-diamond-turn-right"></i></div><div class="ab-text"><span class="ab-title">Get Directions</span></div></a>';
    if (b.whatsapp) html += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener" class="action-btn whatsapp"><div class="ab-icon"><i class="fa-brands fa-whatsapp"></i></div><div class="ab-text"><span class="ab-title">WhatsApp</span></div></a>';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '" class="action-btn"><div class="ab-icon"><i class="fa-solid fa-phone"></i></div><div class="ab-text"><span class="ab-title">Call</span></div></a>';
    html += '</div></div>';
    html += '<div class="map-frame"><div class="map-box"><iframe src="' + mapSrc(b) + '" loading="lazy" title="Map"></iframe></div></div></section>';
    html += reviewsSection(b);
    html += socialSection(b);
    html += gbzFooter();
    html += floatHtml(b, features);
    html += shareScrollHtml(b);
    return html;
  }

  /* ========== SERVICE (Doctor style) ========== */
  function renderService(b) {
    var features = b.features || {};
    var services = b.services || [];
    var products = b.products || [];
    var gallery = b.gallery || [];
    var hours = b.hours || [];
    var split = splitGallery(gallery);
    var images = split.images;
    var videos = split.videos;
    var aboutImg = getAboutImage(b, images);
    var verified = (b.verified || features.verified) ? ' <span class="verified-pill"><i class="fa-solid fa-check"></i> Verified</span>' : '';
    var avatar = b.logo_url
      ? '<img src="' + esc(b.logo_url) + '" alt="' + esc(b.business_name || '') + '" />'
      : '<div class="fallback">' + esc((b.business_name || 'D').charAt(0).toUpperCase()) + '</div>';
    var coverStyle = b.cover_image_url
      ? "background-image:url('" + esc(b.cover_image_url) + "')"
      : '';

    var html = '';
    /* —— Impressive hero —— */
    html += '<section class="svc-hero">';
    html += '<div class="svc-hero-bg" style="' + coverStyle + '"></div>';
    html += '<div class="svc-hero-overlay"></div>';
    html += '<div class="svc-hero-content">';
    html += '<div class="svc-avatar">' + avatar + '</div>';
    if (b.subcategory || b.category) {
      html += '<p class="svc-eyebrow">' + esc(b.subcategory || b.category) + '</p>';
    }
    html += '<h1 class="svc-name">' + esc(b.business_name) + verified + '</h1>';
    if (b.tagline) html += '<p class="svc-tagline">' + esc(b.tagline) + '</p>';
    html += '<div class="svc-cta">';
    if (b.whatsapp) html += '<a class="btn-red" href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Book / Enquire</a>';
    else if (b.phone) html += '<a class="btn-red" href="' + telLink(b.phone) + '"><i class="fa-solid fa-phone"></i> Call Now</a>';
    if (b.google_maps_url) html += '<a class="btn-ghost-svc" href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i> Directions</a>';
    html += '<button type="button" class="btn-ghost-svc" data-vcard style="cursor:pointer;font-family:inherit"><i class="fa-solid fa-address-card"></i> Add to Contact</button>';
    html += '</div></div></section>';

    html += '<div class="contact-row">';
    if (b.phone) html += '<a class="contact-btn" href="' + telLink(b.phone) + '"><div class="contact-icon"><i class="fa-solid fa-phone"></i></div><span class="contact-label">Call</span></a>';
    if (b.whatsapp) html += '<a class="contact-btn" href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener"><div class="contact-icon"><i class="fa-brands fa-whatsapp"></i></div><span class="contact-label">WhatsApp</span></a>';
    if (b.email) html += '<a class="contact-btn" href="mailto:' + esc(b.email) + '"><div class="contact-icon"><i class="fa-solid fa-envelope"></i></div><span class="contact-label">Email</span></a>';
    if (b.google_maps_url) html += '<a class="contact-btn" href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener"><div class="contact-icon"><i class="fa-solid fa-map-marker-alt"></i></div><span class="contact-label">Map</span></a>';
    html += '</div>';

    /* —— About + image —— */
    if (b.about || b.description || aboutImg) {
      html += '<section class="section svc-about-sec" id="about"><div class="section-inner">';
      html += '<p class="eyebrow">About</p><h2 class="section-title">Our <span>Story</span></h2><div class="divider"></div>';
      html += '<div class="svc-about-grid">';
      html += '<div class="about-text">';
      if (b.about || b.description) html += '<div class="about-body about-text">' + formatAbout(b.about || b.description) + '</div>';
      if (b.subcategory) {
        html += '<div class="credential-row">';
        String(b.subcategory).split(/[·,|]/).forEach(function (part) {
          part = part.trim();
          if (part) html += '<span class="credential-badge"><i class="fa-solid fa-check-circle"></i> ' + esc(part) + '</span>';
        });
        html += '</div>';
      }
      html += '</div>';
      if (aboutImg) {
        html += '<div class="about-media"><img src="' + esc(aboutImg) + '" alt="About ' + esc(b.business_name) + '" loading="lazy" /></div>';
      }
      html += '</div></div></section>';
    }

    /* —— Photos only —— */
    if (images.length) {
      html += '<section class="section section-alt" id="gallery"><div class="section-inner"><p class="eyebrow">Gallery</p><h2 class="section-title">Portfolio</h2><div class="divider"></div><div class="gallery-grid">';
      images.forEach(function (g) {
        html += '<div class="gallery-item" onclick="openLB(\'' + esc(g.image_url).replace(/'/g, "\\'") + '\',\'' + esc(g.caption || '').replace(/'/g, "\\'") + '\')"><img src="' + esc(g.image_url) + '" alt="" loading="lazy" /></div>';
      });
      html += '</div></div></section>';
    }

    /* —— Videos separate —— */
    if (videos.length) {
      html += '<section class="section video-sec svc-video-sec" id="videos"><div class="section-inner"><p class="eyebrow">Videos</p><h2 class="section-title">Watch <span>Us</span></h2><div class="divider"></div><div class="video-grid">';
      videos.forEach(function (g) {
        html += videoTile(g.image_url);
      });
      html += '</div></div></section>';
    }

    if (services.length || products.length) {
      html += '<section class="section"><div class="section-inner"><p class="eyebrow">What We Offer</p><h2 class="section-title">Our <span>Services</span></h2><div class="divider"></div>';
      if (services.length) {
        html += '<div class="services-badges">';
        services.forEach(function (s) {
          html += '<div class="service-badge"><i class="fa-solid fa-circle-check"></i> ' + esc(s.name) + (s.price != null ? ' · ' + formatPrice(s.price) : '') + '</div>';
        });
        html += '</div>';
      }
      if (products.length) {
        html += '<div class="item-list" style="margin-top:24px">';
        products.forEach(function (p) {
          html += '<div class="item-card"><div class="item-body"><div class="item-name">' + esc(p.name) + '</div>' + (p.description ? '<div class="item-desc">' + esc(p.description) + '</div>' : '') + '</div>' + (p.price != null ? '<div class="item-price">' + formatPrice(p.price) + '</div>' : '') + '</div>';
        });
        html += '</div>';
      }
      html += '</div></section>';
    }

    if (hours.length) {
      html += '<section class="section section-alt"><div class="section-inner"><p class="eyebrow">Timings</p><h2 class="section-title">Opening <span>Hours</span></h2><div class="divider"></div>' + hoursHtml(hours) + '</div></section>';
    }

    html += '<section class="section"><div class="section-inner"><p class="eyebrow">Location</p><h2 class="section-title">Visit <span>Us</span></h2><div class="divider"></div><div class="contact-grid"><div>';
    html += '<div style="font-family:var(--font-display);font-size:1.4rem;color:var(--accent);margin-bottom:16px">' + esc(b.business_name) + '</div>';
    if (b.address) html += '<div class="contact-detail"><div class="contact-detail-icon"><i class="fa-solid fa-map-marker-alt"></i></div><div class="contact-detail-text">' + esc(b.address) + (b.city ? ', ' + esc(b.city) : '') + '</div></div>';
    if (b.phone) html += '<div class="contact-detail"><div class="contact-detail-icon"><i class="fa-solid fa-phone"></i></div><div class="contact-detail-text"><a href="' + telLink(b.phone) + '">' + esc(b.phone) + '</a></div></div>';
    if (b.email) html += '<div class="contact-detail"><div class="contact-detail-icon"><i class="fa-solid fa-envelope"></i></div><div class="contact-detail-text"><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></div></div>';
    html += '</div><div class="map-wrap"><iframe src="' + mapSrc(b) + '" loading="lazy" title="Map"></iframe></div></div></div></section>';

    html += reviewsSection(b);
    html += socialSection(b);
    html += gbzFooter();
    html += floatHtml(b, features);
    html += shareScrollHtml(b);
    return html;
  }

  /* ========== MODERN (Jewellers style) ========== */
  function renderModern(b) {
    var features = b.features || {};
    var services = b.services || [];
    var products = b.products || [];
    var gallery = b.gallery || [];
    var hours = b.hours || [];
    var split = splitGallery(gallery);
    var images = split.images;
    var videos = split.videos;
    var aboutImg = getAboutImage(b, images);
    var verified = (b.verified || features.verified) ? ' <span class="verified-pill">Verified</span>' : '';
    var coverStyle = b.cover_image_url ? "background-image:url('" + esc(b.cover_image_url) + "')" : '';
    var logo = b.logo_url
      ? '<img src="' + esc(b.logo_url) + '" alt="" />'
      : '<div class="fallback">' + esc((b.business_name || 'B').charAt(0).toUpperCase()) + '</div>';

    var html = '';
    html += '<div class="mod-topbar"><div class="wrap"><span>' + esc(b.subcategory || b.category || 'Grobizzz') + '</span><span>';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '"><i class="fa-solid fa-phone"></i> ' + esc(b.phone) + '</a>';
    html += '</span></div></div>';

    html += '<header class="mod-hero"><div class="mod-hero-bg" style="' + coverStyle + '"></div><div class="mod-hero-inner">';
    html += '<div class="mod-logo">' + logo + '</div>';
    html += '<h1>' + esc(b.business_name) + verified + '</h1>';
    if (b.tagline) html += '<div class="sub">' + esc(b.tagline) + '</div>';
    if (b.description || b.about) html += '<p>' + esc((b.tagline ? '' : '') + (b.description || b.about || '').slice(0, 160)) + '</p>';
    html += '<div class="mod-btns">';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '" class="btn btn-fill"><i class="fa-solid fa-phone"></i> Call Now</a>';
    if (b.whatsapp) html += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener" class="btn btn-outline"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>';
    html += '<button type="button" class="btn btn-outline" data-vcard style="cursor:pointer"><i class="fa-solid fa-address-card"></i> Add to Contact</button>';
    html += '</div></div></header>';

    html += '<nav class="quick"><div class="wrap">';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '"><i class="fa-solid fa-phone"></i>Call</a>';
    if (b.whatsapp) html += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>WhatsApp</a>';
    if (b.google_maps_url) html += '<a href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-map-marker-alt"></i>Map</a>';
    if (b.email) html += '<a href="mailto:' + esc(b.email) + '"><i class="fa-solid fa-envelope"></i>Email</a>';
    html += '<a href="#" data-vcard><i class="fa-solid fa-address-card"></i>Contact</a>';
    html += '<a href="#contact"><i class="fa-solid fa-store"></i>Visit</a></div></nav>';

    if (b.about || b.description || aboutImg) {
      html += '<section class="mod-sec" id="about"><div class="wrap">';
      html += '<div class="about-grid"><div class="about-copy">';
      html += '<div class="sec-label">Our story</div><h2 class="sec-title">About</h2>';
      html += '<p class="about-lead">Crafted with care — here is our story.</p>';
      if (b.tagline) html += '<p class="lede">' + esc(b.tagline) + '</p>';
      if (b.about || b.description) html += '<div class="about-body sec-desc">' + formatAbout(b.about || b.description) + '</div>';
      html += '</div>';
      html += '<div class="stats">';
      if (b.year_established) html += '<div class="stat"><b>' + esc(String(b.year_established)) + '</b><span>Since</span></div>';
      html += '<div class="stat"><b>★</b><span>Trusted</span></div>';
      html += '<div class="stat"><b>' + esc((b.city || 'Local').split(',')[0]) + '</b><span>Location</span></div>';
      html += '<div class="stat"><b>Open</b><span>For you</span></div>';
      html += '</div></div>';
      /* About image sits under the 4 stats */
      if (aboutImg) {
        html += '<div class="mod-about-media"><img src="' + esc(aboutImg) + '" alt="About ' + esc(b.business_name) + '" loading="lazy" /></div>';
      }
      html += '</div></section>';
    }

    if (images.length) {
      html += '<section class="mod-sec" style="background:var(--white)" id="gallery"><div class="wrap"><div class="sec-label">Gallery</div><h2 class="sec-title">Portfolio</h2><div class="gallery">';
      images.forEach(function (g) {
        html += '<div class="g-card" onclick="openLB(\'' + esc(g.image_url).replace(/'/g, "\\'") + '\',\'' + esc(g.caption || '').replace(/'/g, "\\'") + '\')"><img src="' + esc(g.image_url) + '" alt="" loading="lazy" /></div>';
      });
      html += '</div></div></section>';
    }

    if (videos.length) {
      html += '<section class="mod-sec video-sec mod-video-sec" id="videos"><div class="wrap"><div class="sec-label">Videos</div><h2 class="sec-title">Watch Us</h2><div class="video-grid">';
      videos.forEach(function (g) {
        html += videoTile(g.image_url);
      });
      html += '</div></div></section>';
    }

    if (products.length || services.length) {
      html += '<section class="band"><div class="wrap"><div class="sec-label">Offerings</div><h2 class="sec-title">' + (products.length ? 'Products' : 'Services') + '</h2><div class="item-list">';
      (products.length ? products : services).forEach(function (item) {
        html += '<div class="item-card">';
        if (item.image_url) html += '<img class="item-img" src="' + esc(item.image_url) + '" alt="" loading="lazy" />';
        html += '<div class="item-body"><div class="item-name">' + esc(item.name) + '</div>' + (item.description ? '<div class="item-desc">' + esc(item.description) + '</div>' : '') + '</div>';
        if (item.price != null) html += '<div class="item-price">' + formatPrice(item.price, item.price_label) + '</div>';
        html += '</div>';
      });
      html += '</div></div></section>';
    }

    if (hours.length) {
      html += '<section class="mod-sec"><div class="wrap"><div class="sec-label">Timings</div><h2 class="sec-title">Hours</h2>' + hoursHtml(hours) + '</div></section>';
    }

    html += '<section class="contact-strip" id="contact"><div class="wrap"><div><h3>' + esc(b.business_name) + '</h3>';
    if (b.tagline) html += '<p>' + esc(b.tagline) + '</p>';
    if (b.city) html += '<p>' + esc(b.city) + (b.state ? ', ' + esc(b.state) : '') + '</p>';
    html += '</div><div><h3>Call</h3>';
    if (b.phone) html += '<a href="' + telLink(b.phone) + '">' + esc(b.phone) + '</a>';
    if (b.whatsapp) html += '<a href="' + waLink(b.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>';
    html += '<a href="#" data-vcard style="color:var(--gold-light);margin-top:8px;display:inline-block"><i class="fa-solid fa-address-card"></i> Add to Contact</a>';
    html += '</div><div><h3>Find us</h3>';
    if (b.address) html += '<p>' + esc(b.address) + '</p>';
    if (b.google_maps_url) html += '<a href="' + esc(b.google_maps_url) + '" target="_blank" rel="noopener">Open in Google Maps →</a>';
    html += '</div></div></section>';
    html += '<div class="map-full"><iframe src="' + mapSrc(b) + '" loading="lazy" title="Map"></iframe></div>';

    html += reviewsSection(b);
    html += socialSection(b);
    html += gbzFooter();
    html += floatHtml(b, features);
    html += shareScrollHtml(b);
    return html;
  }

  function bindShare(b) {
    var shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', async function () {
      var msg = buildShareMessage(b);
      try {
        if (navigator.share) {
          await navigator.share({ title: b.business_name || 'Grobizzz', text: msg, url: window.location.href });
        } else {
          await navigator.clipboard.writeText(msg);
          alert('Share message copied!');
        }
      } catch (e) {
        try { await navigator.clipboard.writeText(msg); alert('Share message copied!'); } catch (e2) {}
      }
    });
  }

  function render(b) {
    var features = b.features || {};
    var tpl = resolveTemplate(b);
    loadTemplateAssets(tpl);
    applyColors(b, tpl);
    setSEO(b);
    setupLightbox();

    var html = '';
    if (tpl === 'service') html = renderService(b);
    else if (tpl === 'modern') html = renderModern(b);
    else html = renderRestaurant(b);

    document.getElementById('app').innerHTML = html;
    bindShare(b);
    bindShareScroll();
    // Always enable Add to Contact unless explicitly disabled
    var feat = b.features || {};
    if (feat.vcard === false) {
      document.querySelectorAll('[data-vcard]').forEach(function (el) { el.style.display = 'none'; });
    } else {
      bindVCard(b);
    }
  }

  function showError(msg) {
    document.getElementById('app').innerHTML =
      '<div class="loading-screen"><p>' + esc(msg) + '</p><a href="https://grobizzz.in" style="color:#c97b3a;margin-top:1rem;font-weight:600">Go to Grobizzz</a></div>';
  }

  function getSb() {
    if (window.__grobizzzSb) return window.__grobizzzSb;
    var cfg = window.GROBIZZZ_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') {
      showError('Configure js/config.js with your Supabase URL and anon key.');
      return null;
    }
    window.__grobizzzSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return window.__grobizzzSb;
  }

  async function init() {
    var slug = getSlug();
    if (!slug) { showError('Invalid profile URL. Use profile.html?slug=your-business'); return; }
    try {
      var sb = getSb();
      if (!sb) return;

      var res = await sb
        .from('businesses')
        .select('*, templates:template_id ( slug, name, folder )')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (res.error) throw new Error(res.error.message);
      if (!res.data) { showError('This business profile is not available.'); return; }

      var b = res.data;
      var id = b.id;
      var [services, products, gallery, hours] = await Promise.all([
        sb.from('services').select('*').eq('business_id', id).eq('is_active', true).order('display_order'),
        sb.from('products').select('*').eq('business_id', id).eq('is_available', true).order('display_order'),
        sb.from('gallery').select('*').eq('business_id', id).order('display_order'),
        sb.from('business_hours').select('*').eq('business_id', id).order('day_of_week')
      ]);
      b.services = (services.data) || [];
      b.products = (products.data) || [];
      b.gallery = (gallery.data) || [];
      b.hours = (hours.data) || [];
      render(b);
    } catch (err) {
      console.error(err);
      showError('Unable to load profile. ' + (err.message || 'Check connection and RLS policies.'));
    }
  }
  init();
})();