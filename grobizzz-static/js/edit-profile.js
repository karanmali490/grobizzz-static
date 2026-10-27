(function () {
  'use strict';
  var cfg = window.GROBIZZZ_CONFIG || {};
  var biz = null;
  var slug = new URLSearchParams(window.location.search).get('slug') || '';

  function $(id) { return document.getElementById(id); }
  function msg(t, err) {
    var el = $('ed-msg');
    if (!el) return;
    el.textContent = t || '';
    el.className = 'ed-msg ' + (err ? 'err' : 'ok');
  }
  function sb() {
    if (window.__grobizzzSb) return window.__grobizzzSb;
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || String(cfg.SUPABASE_URL).indexOf('YOUR_') === 0) {
      msg('Configure js/config.js', true);
      return null;
    }
    window.__grobizzzSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
    });
    return window.__grobizzzSb;
  }
  function profileUrl(s) {
    var base = cfg.PROFILE_BASE || 'profile.html?slug=';
    if (base === '/' || base === '') {
      return (cfg.PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '') + '/' + encodeURIComponent(s);
    }
    return base + encodeURIComponent(s);
  }
  function words(t) {
    return String(t || '').trim().split(/\s+/).filter(Boolean).length;
  }

  document.querySelectorAll('.ed-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sec = btn.getAttribute('data-sec');
      document.querySelectorAll('.ed-nav-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('.ed-sec').forEach(function (s) {
        s.classList.toggle('active', s.getAttribute('data-sec') === sec);
      });
    });
  });

  var about = $('ed_about');
  if (about) {
    about.addEventListener('input', function () {
      var el = $('ed-about-count');
      if (el) el.textContent = words(about.value) + ' words';
    });
  }

  function showPreview(url, inputId) {
    var img = $(inputId);
    if (!img) return;
    if (url) { img.src = url; img.hidden = false; }
  }
  function filePreview(input, imgId) {
    if (!input || !input.files || !input.files[0]) return;
    showPreview(URL.createObjectURL(input.files[0]), imgId);
  }
  if ($('ed_logo')) $('ed_logo').addEventListener('change', function () { filePreview(this, 'ed_logo_preview'); });
  if ($('ed_cover')) $('ed_cover').addEventListener('change', function () { filePreview(this, 'ed_cover_preview'); });

  async function upload(client, file, bucket) {
    if (!file) return null;
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    var up = await client.storage.from(bucket).upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg'
    });
    if (up.error) throw new Error(up.error.message || 'Upload failed');
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  function fill(b) {
    biz = b;
    $('ed-title').textContent = b.business_name || 'Edit profile';
    $('ed-status').textContent = (b.status === 'published' ? 'Published' : 'Draft') + ' · Editor';
    $('ed-locked-line').textContent = 'Type, template and public URL are locked for this profile.';
    $('ed_name').value = b.business_name || '';
    $('ed_tagline').value = b.tagline || '';
    $('ed_about').value = b.about || b.description || '';
    $('ed-about-count').textContent = words($('ed_about').value) + ' words';
    $('ed_type').value = b.category || '—';
    $('ed_template').value = b.template_slug || (b.templates && b.templates.slug) || '—';
    $('ed_url').value = profileUrl(b.slug || slug);
    $('ed_phone').value = b.phone || '';
    $('ed_whatsapp').value = b.whatsapp || '';
    $('ed_email').value = b.email || '';
    $('ed_address').value = b.address || '';
    $('ed_city').value = b.city || '';
    $('ed_pincode').value = b.pincode || '';
    $('ed_maps').value = b.google_maps_url || '';
    $('ed_instagram').value = b.instagram_url || '';
    $('ed_facebook').value = b.facebook_url || '';
    $('ed_youtube').value = b.youtube_url || '';
    $('ed_google').value = b.google_business_url || '';
    $('ed_zomato').value = b.zomato_url || '';
    $('ed_swiggy').value = b.swiggy_url || '';
    if (b.primary_color) $('ed_primary').value = b.primary_color;
    if (b.secondary_color) $('ed_secondary').value = b.secondary_color;
    if (b.accent_color) $('ed_accent').value = b.accent_color;
    showPreview(b.logo_url, 'ed_logo_preview');
    showPreview(b.cover_image_url, 'ed_cover_preview');
    var gStyle = (b.features && b.features.gallery_style) || 'grid';
    document.querySelectorAll('input[name="gallery_style"]').forEach(function (r) {
      r.checked = r.value === gStyle;
    });
    var prev = $('ed-preview');
    if (prev) {
      prev.href = 'profile.html?slug=' + encodeURIComponent(b.slug) + (b.status !== 'published' ? '&preview=1' : '');
    }
  }

  async function loadGallery(client, businessId) {
    var list = $('ed_gallery_list');
    if (!list) return;
    list.innerHTML = '';
    var res = await client.from('gallery').select('image_url').eq('business_id', businessId).order('display_order');
    (res.data || []).forEach(function (g) {
      if (!g.image_url) return;
      var img = document.createElement('img');
      img.src = g.image_url;
      img.alt = '';
      list.appendChild(img);
    });
  }

  async function save() {
    var client = sb();
    if (!client || !biz) return;
    var btn = $('ed-save');
    var btn2 = $('ed-save-2');
    if (btn) btn.disabled = true;
    if (btn2) btn2.disabled = true;
    msg('Saving…', false);
    try {
      var logoFile = $('ed_logo') && $('ed_logo').files && $('ed_logo').files[0];
      var coverFile = $('ed_cover') && $('ed_cover').files && $('ed_cover').files[0];
      var logo_url = logoFile ? await upload(client, logoFile, 'business-logos') : null;
      var cover_image_url = coverFile ? await upload(client, coverFile, 'business-covers') : null;

      var row = {
        business_name: $('ed_name').value.trim(),
        tagline: $('ed_tagline').value.trim() || null,
        about: $('ed_about').value.trim() || null,
        description: $('ed_about').value.trim() || null,
        phone: $('ed_phone').value.trim() || null,
        whatsapp: $('ed_whatsapp').value.trim() || null,
        email: $('ed_email').value.trim() || null,
        address: $('ed_address').value.trim() || null,
        city: $('ed_city').value.trim() || null,
        pincode: $('ed_pincode').value.trim() || null,
        google_maps_url: $('ed_maps').value.trim() || null,
        instagram_url: $('ed_instagram').value.trim() || null,
        facebook_url: $('ed_facebook').value.trim() || null,
        youtube_url: $('ed_youtube').value.trim() || null,
        google_business_url: $('ed_google').value.trim() || null,
        zomato_url: $('ed_zomato').value.trim() || null,
        swiggy_url: $('ed_swiggy').value.trim() || null,
        primary_color: $('ed_primary').value || null,
        secondary_color: $('ed_secondary').value || null,
        accent_color: $('ed_accent').value || null
      };
      if (logo_url) row.logo_url = logo_url;
      if (cover_image_url) row.cover_image_url = cover_image_url;

      var styleEl = document.querySelector('input[name="gallery_style"]:checked');
      var galleryStyle = styleEl ? styleEl.value : 'grid';
      var features = Object.assign({}, biz.features || {}, { gallery_style: galleryStyle });
      row.features = features;

      var up = await client.from('businesses').update(row).eq('id', biz.id).select().single();
      if (up.error) throw up.error;

      var gInput = $('ed_gallery');
      if (gInput && gInput.files && gInput.files.length) {
        var files = Array.from(gInput.files).slice(0, 20);
        var rows = [];
        for (var i = 0; i < files.length; i++) {
          msg('Uploading gallery ' + (i + 1) + '/' + files.length + '…', false);
          var url = await upload(client, files[i], 'business-gallery');
          if (url) rows.push({ business_id: biz.id, image_url: url, display_order: Date.now() + i });
        }
        if (rows.length) await client.from('gallery').insert(rows);
        await loadGallery(client, biz.id);
        gInput.value = '';
      }

      biz = Object.assign({}, biz, up.data || row);
      fill(biz);
      msg('Saved successfully.', false);
    } catch (err) {
      console.error(err);
      msg(err.message || 'Save failed', true);
    } finally {
      if (btn) btn.disabled = false;
      if (btn2) btn2.disabled = false;
    }
  }

  if ($('ed-save')) $('ed-save').addEventListener('click', save);
  if ($('ed-save-2')) $('ed-save-2').addEventListener('click', save);

  async function boot() {
    if (!slug) {
      msg('Missing profile. Open Edit from your dashboard.', true);
      return;
    }
    var client = sb();
    if (!client) return;
    var session = await client.auth.getSession();
    if (!session.data || !session.data.session) {
      window.location.href = 'auth.html?next=' + encodeURIComponent('edit-profile.html?slug=' + slug);
      return;
    }
    var user = session.data.session.user;
    var res = await client
      .from('businesses')
      .select('*, templates:template_id ( slug, name )')
      .eq('slug', slug)
      .maybeSingle();
    if (res.error) { msg(res.error.message, true); return; }
    if (!res.data) { msg('Profile not found.', true); return; }
    if (res.data.user_id && res.data.user_id !== user.id) {
      msg('You can only edit your own profile.', true);
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 1500);
      return;
    }
    fill(res.data);
    await loadGallery(client, res.data.id);
    msg('', false);
  }
  boot();
})();