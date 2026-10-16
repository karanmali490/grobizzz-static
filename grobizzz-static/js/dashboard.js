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
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
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
      // Try user-owned rows; fall back to empty if column missing
      var q = c.from('businesses').select('id,business_name,slug,is_published,created_at').order('created_at', { ascending: false }).limit(20);
      if (user) {
        // optional owner filter if column exists later
        // q = q.eq('user_id', user.id);
      }
      var res = await q;
      if (res.error) {
        msg.textContent = 'Could not load profiles yet. Create one from the form.';
        document.getElementById('stat-profiles').textContent = '0';
        return;
      }
      var rows = res.data || [];
      document.getElementById('stat-profiles').textContent = String(rows.length);
      if (!rows.length) {
        msg.textContent = 'No profiles yet. Click “Open profile form” to create one.';
        return;
      }
      msg.textContent = '';
      rows.forEach(function (r) {
        var a = document.createElement('a');
        a.href = (cfg.PROFILE_BASE || 'profile.html?slug=') + encodeURIComponent(r.slug || '');
        a.target = '_blank';
        a.style.cssText = 'display:block;padding:12px 14px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)';
        a.innerHTML = '<strong>' + (r.business_name || r.slug || 'Profile') + '</strong>' +
          '<div style="font-size:.8rem;color:rgba(255,255,255,.55);margin-top:4px">/' + (r.slug || '') +
          (r.is_published ? ' · Published' : ' · Draft') + '</div>';
        list.appendChild(a);
      });
    } catch (e) {
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
