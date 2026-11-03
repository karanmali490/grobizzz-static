
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

  async function upload(client, file, buckets) {
    if (!file) return null;
    var list = Array.isArray(buckets) ? buckets : [buckets];
    var name = file.name || 'file';
    var ext = (name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    var isVid = (file.type && file.type.indexOf('video/') === 0) ||
      /\.(mp4|webm|mov|m4v)$/i.test(name);

    if (isVid) {
      if (!ext || ['mp4', 'webm', 'mov', 'm4v'].indexOf(ext) < 0) ext = 'mp4';
    } else {
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].indexOf(ext) < 0) ext = 'jpg';
    }

    // Same path style as create form
    var path = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext;

    var typeAttempts = [];
    if (file.type) typeAttempts.push(file.type);
    if (isVid) {
      typeAttempts.push('video/mp4');
      typeAttempts.push('video/webm');
      typeAttempts.push('application/octet-stream');
    } else {
      typeAttempts.push('image/jpeg');
      typeAttempts.push('image/png');
    }
    // unique
    typeAttempts = typeAttempts.filter(function (t, i, a) { return t && a.indexOf(t) === i; });

    var lastErr = null;
    for (var b = 0; b < list.length; b++) {
      var bucket = list[b];
      for (var t = 0; t < typeAttempts.length; t++) {
        var up = await client.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: typeAttempts[t]
        });
        if (!up.error) {
          var pub = client.storage.from(bucket).getPublicUrl(path);
          var url = pub.data && pub.data.publicUrl;
          if (url) return url;
        }
        lastErr = (up.error && (up.error.message || up.error.error)) || lastErr;
      }
      // try without contentType
      var up2 = await client.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (!up2.error) {
        var pub2 = client.storage.from(bucket).getPublicUrl(path);
        if (pub2.data && pub2.data.publicUrl) return pub2.data.publicUrl;
      }
      lastErr = (up2.error && (up2.error.message || up2.error.error)) || lastErr;
      console.warn('Upload failed bucket=', bucket, lastErr);
    }
    throw new Error(
      (lastErr || 'Upload failed') +
      (isVid
        ? ' — For videos: Supabase Storage → business-gallery → allow MIME video/mp4, video/webm (or turn off MIME restriction).'
        : ' — Check Storage bucket policies.')
    );
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
    var prev = $('ed-preview');
    if (prev) {
      prev.href = 'profile.html?slug=' + encodeURIComponent(b.slug) + (b.status !== 'published' ? '&preview=1' : '');
    }
  }

  function isVideoUrl(url) {
    var u = String(url || '').toLowerCase();
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/.test(u)) return true;
    if (u.indexOf('video/') >= 0) return true;
    if (/\/(profiles\/)?\d+-[a-z0-9]+\.mp4/.test(u)) return true;
    return false;
  }


  async function deleteGalleryItem(client, g, cardEl) {
    if (!g || !g.id) {
      alert('Cannot delete: missing image id. Reload the page and try again.');
      return false;
    }
    if (!confirm('Remove this from your profile?')) return false;
    try {
      var del = await client.from('gallery').delete().eq('id', g.id).select('id');
      if (del.error) {
        // fallback by url + business
        var del2 = await client.from('gallery').delete().eq('business_id', biz.id).eq('image_url', g.image_url).select('id');
        if (del2.error) {
          alert('Delete failed: ' + (del.error.message || del2.error.message) + '. Run supabase/gallery_delete_policy.sql in Supabase.');
          return false;
        }
        if (!del2.data || !del2.data.length) {
          alert('Delete blocked by database security (RLS). Run the SQL in supabase/gallery_delete_policy.sql');
          return false;
        }
      } else if (!del.data || !del.data.length) {
        // no row returned — often RLS blocked silently
        var del3 = await client.from('gallery').delete().eq('business_id', biz.id).eq('image_url', g.image_url).select('id');
        if (!del3.data || !del3.data.length) {
          alert('Delete blocked by database security (RLS). Run supabase/gallery_delete_policy.sql in Supabase SQL Editor.');
          return false;
        }
      }
      if (cardEl) cardEl.remove();
      return true;
    } catch (e) {
      console.error(e);
      alert(e.message || 'Delete failed');
      return false;
    }
  }

  async function loadGallery(client, businessId) {
    var list = $('ed_gallery_list');
    var vlist = $('ed_video_list');
    if (list) list.innerHTML = '';
    if (vlist) vlist.innerHTML = '';
    var res = await client
      .from('gallery')
      .select('id,image_url,display_order')
      .eq('business_id', businessId)
      .order('display_order');
    if (res.error) {
      console.error(res.error);
      if (list) list.innerHTML = '<p style="color:#dc2626;font-size:.85rem">Could not load gallery: ' + (res.error.message || '') + '</p>';
      return;
    }
    (res.data || []).forEach(function (g) {
      if (!g.image_url) return;
      if (isVideoUrl(g.image_url)) {
        if (!vlist) return;
        var card = document.createElement('div');
        card.className = 'ed-vid-card';
        card.dataset.galleryId = g.id || '';
        var vid = document.createElement('video');
        vid.src = g.image_url;
        vid.controls = true;
        vid.playsInline = true;
        vid.preload = 'metadata';
        card.appendChild(vid);
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'ed-vid-remove';
        rm.title = 'Remove video';
        rm.innerHTML = '&times;';
        rm.addEventListener('click', async function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          await deleteGalleryItem(client, g, card);
        });
        card.appendChild(rm);
        vlist.appendChild(card);
      } else if (list) {
        var wrap = document.createElement('div');
        wrap.className = 'ed-ph-card ed-ph-saved';
        wrap.dataset.galleryId = g.id || '';
        wrap.style.cssText = 'position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;background:#f8fafc';
        var img = document.createElement('img');
        img.src = g.image_url;
        img.alt = '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
        wrap.appendChild(img);
        var rm2 = document.createElement('button');
        rm2.type = 'button';
        rm2.className = 'ed-vid-remove';
        rm2.title = 'Remove image';
        rm2.innerHTML = '&times;';
        rm2.addEventListener('click', async function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          await deleteGalleryItem(client, g, wrap);
        });
        wrap.appendChild(rm2);
        list.appendChild(wrap);
      }
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
      var logo_url = logoFile ? await upload(client, logoFile, ['business-logos', 'logos']) : null;
      var cover_image_url = coverFile ? await upload(client, coverFile, ['business-covers', 'covers']) : null;

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

      var up = await client.from('businesses').update(row).eq('id', biz.id).select().single();
      if (up.error) throw up.error;


      biz = Object.assign({}, biz, up.data || row);
      if (logo_url) biz.logo_url = logo_url;
      if (cover_image_url) biz.cover_image_url = cover_image_url;
      fill(biz);
      if ($('ed_logo')) $('ed_logo').value = '';
      if ($('ed_cover')) $('ed_cover').value = '';
      msg('Saved successfully. Open Preview (hard refresh) to see new images.', false);
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

  // Smart text
  (function () {
    function addBtn(id, label, kind) {
      var el = $(id);
      if (!el || el.dataset.smart) return;
      el.dataset.smart = '1';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ed-btn ghost';
      btn.style.marginTop = '8px';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        if (!window.GrobizzzSmartText) return;
        var name = ($('ed_name') || {}).value || '';
        var type = ($('ed_type') || {}).value || '';
        if (kind === 'about') el.value = window.GrobizzzSmartText.improveAbout(name, type, el.value);
        else el.value = window.GrobizzzSmartText.writeTagline(name, type);
        el.dispatchEvent(new Event('input'));
      });
      el.parentNode.appendChild(btn);
    }
    addBtn('ed_about', '✨ Improve About', 'about');
    addBtn('ed_tagline', '✨ Write tagline', 'tagline');
  })();



  // —— Photos: select → preview → Add ——
  var pendingPhotos = [];

  function photoMsg(t, err) {
    var el = $('ed_photo_msg');
    if (!el) return;
    el.textContent = t || '';
    el.className = 'ed-msg ' + (err ? 'err' : 'ok');
  }

  function renderPendingPhotos() {
    var box = $('ed_photo_pending');
    var btn = $('ed_photo_add_btn');
    if (!box) return;
    box.innerHTML = '';
    pendingPhotos.forEach(function (item, idx) {
      var card = document.createElement('div');
      card.className = 'ed-ph-card';
      card.innerHTML = '<img src="' + item.url + '" alt="" />';
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'ed-vid-remove';
      rm.innerHTML = '&times;';
      rm.addEventListener('click', function () {
        try { URL.revokeObjectURL(item.url); } catch (e) {}
        pendingPhotos.splice(idx, 1);
        renderPendingPhotos();
      });
      card.appendChild(rm);
      box.appendChild(card);
    });
    if (btn) btn.disabled = pendingPhotos.length === 0;
  }

  var pPick = $('ed_gallery');
  if (pPick) {
    pPick.addEventListener('change', function () {
      Array.from(pPick.files || []).forEach(function (f) {
        if (f.size > 8 * 1024 * 1024) {
          photoMsg('Too large (max 8MB): ' + f.name, true);
          return;
        }
        pendingPhotos.push({ file: f, url: URL.createObjectURL(f) });
      });
      pPick.value = '';
      renderPendingPhotos();
      if (pendingPhotos.length) photoMsg(pendingPhotos.length + ' photo(s) ready — click Add photo(s)', false);
    });
  }

  var photoAddBtn = $('ed_photo_add_btn');
  if (photoAddBtn) {
    photoAddBtn.addEventListener('click', async function () {
      if (!pendingPhotos.length || !biz) {
        photoMsg('Select a photo first', true);
        return;
      }
      var client = sb();
      if (!client) return;
      photoAddBtn.disabled = true;
      photoMsg('Uploading…', false);
      try {
        var maxOrder = 0;
        try {
          var existing = await client.from('gallery').select('display_order').eq('business_id', biz.id).order('display_order', { ascending: false }).limit(1);
          if (existing.data && existing.data[0] && existing.data[0].display_order != null) {
            maxOrder = Number(existing.data[0].display_order) || 0;
          }
        } catch (e0) {}
        var rows = [];
        for (var i = 0; i < pendingPhotos.length; i++) {
          photoMsg('Uploading photo ' + (i + 1) + '/' + pendingPhotos.length + '…', false);
          var url = await upload(client, pendingPhotos[i].file, ['business-gallery', 'gallery']);
          if (url) rows.push({ business_id: biz.id, image_url: url, display_order: maxOrder + i + 1 });
        }
        if (!rows.length) throw new Error('Upload failed — check Storage bucket business-gallery or gallery');
        var ins = await client.from('gallery').insert(rows);
        if (ins.error) throw new Error(ins.error.message || 'Could not save photos');
        pendingPhotos.forEach(function (p) { try { URL.revokeObjectURL(p.url); } catch (e) {} });
        pendingPhotos = [];
        renderPendingPhotos();
        await loadGallery(client, biz.id);
        photoMsg('Photo(s) added. Open Preview to check.', false);
      } catch (err) {
        console.error(err);
        photoMsg(err.message || 'Upload failed', true);
        photoAddBtn.disabled = pendingPhotos.length === 0;
      }
    });
  }


  // —— Video select → preview → Add button ——
  var pendingVideos = [];

  function videoMsg(t, err) {
    var el = $('ed_video_msg');
    if (!el) return;
    el.textContent = t || '';
    el.className = 'ed-msg ' + (err ? 'err' : 'ok');
  }

  function renderPendingVideos() {
    var box = $('ed_video_pending');
    var btn = $('ed_video_add_btn');
    if (!box) return;
    box.innerHTML = '';
    pendingVideos.forEach(function (item, idx) {
      var card = document.createElement('div');
      card.className = 'ed-vid-card';
      card.innerHTML =
        '<span class="ed-vid-badge">Preview</span>' +
        '<video src="' + item.url + '" controls playsinline preload="metadata"></video>';
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'ed-vid-remove';
      rm.innerHTML = '&times;';
      rm.title = 'Remove from selection';
      rm.addEventListener('click', function () {
        try { URL.revokeObjectURL(item.url); } catch (e) {}
        pendingVideos.splice(idx, 1);
        renderPendingVideos();
      });
      card.appendChild(rm);
      box.appendChild(card);
    });
    if (btn) btn.disabled = pendingVideos.length === 0;
  }

  var vPick = $('ed_videos');
  if (vPick) {
    vPick.addEventListener('change', function () {
      var files = Array.from(vPick.files || []);
      files.forEach(function (f) {
        if (!f.type || f.type.indexOf('video') !== 0) {
          // still allow if extension ok
          var n = (f.name || '').toLowerCase();
          if (!/\\.(mp4|webm|mov|m4v)$/.test(n)) {
            videoMsg('Skip non-video: ' + f.name, true);
            return;
          }
        }
        if (f.size > 30 * 1024 * 1024) {
          videoMsg('Too large (max 30MB): ' + f.name, true);
          return;
        }
        pendingVideos.push({ file: f, url: URL.createObjectURL(f) });
      });
      vPick.value = '';
      renderPendingVideos();
      if (pendingVideos.length) videoMsg(pendingVideos.length + ' video(s) ready — click Add video(s)', false);
    });
  }

  var addBtn = $('ed_video_add_btn');
  if (addBtn) {
    addBtn.addEventListener('click', async function () {
      if (!pendingVideos.length || !biz) {
        videoMsg('Select a video first', true);
        return;
      }
      var client = sb();
      if (!client) return;
      addBtn.disabled = true;
      videoMsg('Uploading…', false);
      try {
        var maxOrder = 0;
        try {
          var existing = await client.from('gallery').select('display_order').eq('business_id', biz.id).order('display_order', { ascending: false }).limit(1);
          if (existing.data && existing.data[0] && existing.data[0].display_order != null) {
            maxOrder = Number(existing.data[0].display_order) || 0;
          }
        } catch (e0) {}

        var rows = [];
        for (var i = 0; i < pendingVideos.length; i++) {
          videoMsg('Uploading video ' + (i + 1) + '/' + pendingVideos.length + '…', false);
          var url = await upload(client, pendingVideos[i].file, ['business-gallery', 'gallery', 'videos']);
          if (url) {
            rows.push({ business_id: biz.id, image_url: url, display_order: maxOrder + i + 1 });
          }
        }
        if (!rows.length) throw new Error('Upload returned no URL — check Storage buckets (business-gallery or gallery)');
        var ins = await client.from('gallery').insert(rows);
        if (ins.error) throw new Error(ins.error.message || 'Could not save video');

        pendingVideos.forEach(function (p) { try { URL.revokeObjectURL(p.url); } catch (e) {} });
        pendingVideos = [];
        renderPendingVideos();
        await loadGallery(client, biz.id);
        var check = await client.from('gallery').select('id,image_url').eq('business_id', biz.id).order('display_order', { ascending: false }).limit(5);
        console.log('gallery after video', check.data);
        videoMsg('Video(s) added (' + rows.length + '). Scroll down to “Videos on profile”, then Preview.', false);
      } catch (err) {
        console.error(err);
        videoMsg(err.message || 'Upload failed', true);
        addBtn.disabled = pendingVideos.length === 0;
      }
    });
  }


  boot();
})();
