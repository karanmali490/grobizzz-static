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
        var card = document.createElement('div');
        card.style.cssText = 'padding:14px 16px;margin-bottom:12px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)';
        card.innerHTML =
          '<strong style="font-size:1rem">' + (r.business_name || r.slug || 'Profile') + '</strong>' +
          '<div style="font-size:.8rem;color:rgba(255,255,255,.55);margin:6px 0 12px">/' + (r.slug || '') +
          (isLive
            ? ' · <span style="color:#6ee7b7">Published (public)</span>'
            : ' · <span style="color:#fbbf24">Draft (private — not public)</span>') +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px"></div>';
        var actions = card.querySelector('div:last-child');

        function linkBtn(href, label, primary) {
          var a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          a.style.cssText = primary
            ? 'padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;font-size:.8rem;font-weight:700;text-decoration:none'
            : 'padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:#fff;font-size:.8rem;font-weight:600;text-decoration:none';
          return a;
        }

        // Edit always
        actions.appendChild(linkBtn('form.html?edit=' + encodeURIComponent(r.slug || ''), '✏️ Edit', false));

        if (isLive) {
          actions.appendChild(linkBtn((cfg.PROFILE_BASE || 'profile.html?slug=') + encodeURIComponent(r.slug || ''), '🌐 View live', true));
        } else {
          actions.appendChild(linkBtn('profile.html?slug=' + encodeURIComponent(r.slug || '') + '&preview=1', '👀 Preview', false));
          actions.appendChild(linkBtn('payment.html?slug=' + encodeURIComponent(r.slug || ''), '💳 Pay & Publish', true));
        }

        list.appendChild(card);
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