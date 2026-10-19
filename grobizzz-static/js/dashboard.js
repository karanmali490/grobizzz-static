(function () {
  'use strict';

  var cfg = window.GROBIZZZ_CONFIG || {};
  var sb = null;
  var titles = {
    home: 'Home',
    profiles: 'Manage / Create profile',
    subscription: 'View subscription',
    settings: 'Settings'
  };

  function client() {
    if (sb) return sb;
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || String(cfg.SUPABASE_URL).indexOf('YOUR_') === 0) {
      document.getElementById('boot').textContent = 'Configure js/config.js with Supabase keys';
      return null;
    }
    if (window.__grobizzzSb) { sb = window.__grobizzzSb; return sb; }
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    window.__grobizzzSb = sb;
    return sb;
  }

  function showApp(email) {
    document.getElementById('boot').style.display = 'none';
    var app = document.getElementById('app');
    app.hidden = false;
    app.style.display = 'flex';
    document.getElementById('user-email').textContent = email || 'Signed in';
    document.getElementById('settings-email').textContent = email || '—';
  }

  function setPanel(name) {
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'panel-' + name);
    });
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-panel') === name);
    });
    document.getElementById('page-title').textContent = titles[name] || 'Dashboard';
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
    if (name === 'profiles') loadProfiles();
  }

  async function loadProfiles() {
    var list = document.getElementById('profiles-list');
    var msg = document.getElementById('profiles-list-msg');
    var c = client();
    if (!c) return;
    msg.textContent = 'Loading…';
    list.innerHTML = '';
    try {
      var userRes = await c.auth.getUser();
      var user = userRes.data && userRes.data.user;
      if (!user) {
        msg.textContent = 'Please log in again.';
        return;
      }

      // Use status (not is_published) — drafts + published for this user
      var res = await c
        .from('businesses')
        .select('id,business_name,slug,status,created_at,user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // If user_id column missing or RLS blocks, retry without filter (dev fallback)
      if (res.error) {
        console.warn('profiles by user_id failed:', res.error.message);
        res = await c
          .from('businesses')
          .select('id,business_name,slug,status,created_at')
          .order('created_at', { ascending: false })
          .limit(20);
      }

      if (res.error) {
        msg.textContent = 'Could not load profiles: ' + (res.error.message || 'Check Supabase columns & RLS');
        document.getElementById('stat-profiles').textContent = '0';
        return;
      }

      var rows = res.data || [];
      document.getElementById('stat-profiles').textContent = String(rows.length);
      if (!rows.length) {
        msg.textContent = 'No profiles yet. Click “Open profile form” to create a draft.';
        return;
      }
      msg.textContent = '';
      rows.forEach(function (r) {
        var isLive = r.status === 'published';
        var href = isLive
          ? ((cfg.PROFILE_BASE || 'profile.html?slug=') + encodeURIComponent(r.slug || ''))
          : ('profile.html?slug=' + encodeURIComponent(r.slug || '') + '&preview=1');
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.cssText = 'display:block;padding:12px 14px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)';
        a.innerHTML =
          '<strong>' + (r.business_name || r.slug || 'Profile') + '</strong>' +
          '<div style="font-size:.8rem;color:rgba(255,255,255,.55);margin-top:4px">/' + (r.slug || '') +
          (isLive
            ? ' · <span style="color:#6ee7b7">Published</span>'
            : ' · <span style="color:#fbbf24">Draft</span> — click to preview') +
          '</div>';
        list.appendChild(a);

        // Pay button for drafts
        if (!isLive) {
          var pay = document.createElement('a');
          pay.href = 'payment.html?slug=' + encodeURIComponent(r.slug || '');
          pay.textContent = '💳 Pay & Publish';
          pay.style.cssText = 'display:inline-block;margin:0 0 14px 4px;font-size:.82rem;font-weight:700;color:#fda4af';
          list.appendChild(pay);
        }
      });
    } catch (e) {
      console.error(e);
      msg.textContent = 'Could not load profiles.';
    }
  }

  async function logout() {
    var c = client();
    if (c) await c.auth.signOut();
    window.location.href = 'auth.html';
  }

  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      setPanel(b.getAttribute('data-panel'));
    });
  });
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('settings-logout').addEventListener('click', logout);
  document.getElementById('menu-toggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
  });
  document.getElementById('overlay').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  });

  (async function init() {
    var c = client();
    if (!c) return;
    var session = await c.auth.getSession();
    if (!session.data || !session.data.session) {
      window.location.href = 'auth.html';
      return;
    }
    var email = session.data.session.user && session.data.session.user.email;
    showApp(email);
    loadProfiles();
  })();
})();
