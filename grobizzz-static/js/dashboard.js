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
    if (name === 'subscription') loadSubscription();
    if (name === 'home') { loadProfiles(); loadSubscription(); loadAnalytics(); }
  }


  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }

  async function loadSubscription() {
    var badge = document.getElementById('sub-badge');
    var details = document.getElementById('sub-details');
    var list = document.getElementById('sub-list');
    var c = client();
    if (!c || !badge) return;
    details.innerHTML = 'Loading…';
    if (list) list.innerHTML = '';
    try {
      var userRes = await c.auth.getUser();
      var user = userRes.data && userRes.data.user;
      if (!user) {
        details.textContent = 'Please log in again.';
        return;
      }
      var res = await c
        .from('businesses')
        .select('id,business_name,slug,status,features,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (res.error) {
        details.textContent = res.error.message || 'Could not load subscription';
        return;
      }
      var rows = res.data || [];
      var paid = [];
      rows.forEach(function (r) {
        var f = r.features || {};
        if (f.payment_status === 'paid' || r.status === 'published') {
          paid.push({
            name: r.business_name || r.slug,
            slug: r.slug,
            start: f.plan_start || f.paid_at,
            end: f.plan_end,
            amount: f.payment_amount,
            plan: f.plan_name || 'Annual Publish'
          });
        }
      });

      if (!paid.length) {
        badge.textContent = 'FREE / NO ACTIVE PLAN';
        details.innerHTML = 'No purchase yet. Create a profile, preview it, then <strong>Pay & Publish</strong> for a 1-year annual plan.';
        var sp = document.getElementById('stat-plan');
        var se = document.getElementById('stat-expiry');
        if (sp) sp.textContent = 'Free';
        if (se) se.textContent = '—';
        return;
      }

      // Latest / longest plan for summary
      var best = paid[0];
      paid.forEach(function (p) {
        if (p.end && best.end && new Date(p.end) > new Date(best.end)) best = p;
        if (p.end && !best.end) best = p;
      });
      var active = best.end ? new Date(best.end) > new Date() : true;
      badge.textContent = active ? 'ANNUAL PLAN · ACTIVE' : 'ANNUAL PLAN · EXPIRED';
      badge.style.background = active ? 'rgba(52,211,153,.2)' : 'rgba(244,63,94,.2)';
      badge.style.color = active ? '#6ee7b7' : '#fda4af';

      details.innerHTML =
        '<div><strong>Plan:</strong> ' + (best.plan || 'Annual') + ' (1 year)</div>' +
        '<div><strong>Purchased (start):</strong> ' + fmtDate(best.start) + '</div>' +
        '<div><strong>Valid until:</strong> ' + fmtDate(best.end) + '</div>' +
        (best.amount != null ? '<div><strong>Amount:</strong> ₹' + best.amount + '</div>' : '');

      var sp = document.getElementById('stat-plan');
      var se = document.getElementById('stat-expiry');
      if (sp) sp.textContent = active ? 'Annual' : 'Expired';
      if (se) se.textContent = fmtDate(best.end);

      if (list) {
        list.innerHTML = '<h3 style="font-size:.95rem;margin-bottom:10px">Profiles on plan</h3>';
        paid.forEach(function (p) {
          var div = document.createElement('div');
          div.style.cssText = 'padding:12px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);font-size:.88rem';
          div.innerHTML =
            '<strong>' + p.name + '</strong>' +
            '<div style="color:rgba(255,255,255,.55);margin-top:4px">/' + (p.slug || '') + '</div>' +
            '<div style="margin-top:6px">Start: ' + fmtDate(p.start) + ' → End: ' + fmtDate(p.end) + '</div>';
          list.appendChild(div);
        });
      }
    } catch (e) {
      console.error(e);
      details.textContent = 'Could not load subscription.';
    }
  }


  async function loadAnalytics() {
    var c = client();
    if (!c) return;
    var summary = document.getElementById('analytics-summary');
    var list = document.getElementById('analytics-list');
    try {
      var userRes = await c.auth.getUser();
      var user = userRes.data && userRes.data.user;
      if (!user) return;
      var biz = await c.from('businesses').select('id,business_name,slug').eq('user_id', user.id);
      var ids = (biz.data || []).map(function (b) { return b.id; });
      if (!ids.length) {
        if (summary) summary.textContent = 'Create a profile to start collecting views and clicks.';
        return;
      }
      var ev = await c.from('profile_events').select('business_id,event_type').in('business_id', ids);
      if (ev.error) {
        if (summary) summary.textContent = 'Run supabase/profile_events.sql in Supabase to enable analytics. ' + (ev.error.message || '');
        return;
      }
      var rows = ev.data || [];
      var totals = { view: 0, call: 0, whatsapp: 0, maps: 0, share: 0 };
      var byBiz = {};
      rows.forEach(function (r) {
        totals[r.event_type] = (totals[r.event_type] || 0) + 1;
        if (!byBiz[r.business_id]) byBiz[r.business_id] = { view: 0, call: 0, whatsapp: 0 };
        if (byBiz[r.business_id][r.event_type] != null) byBiz[r.business_id][r.event_type]++;
        else if (r.event_type === 'view' || r.event_type === 'call' || r.event_type === 'whatsapp') {
          byBiz[r.business_id][r.event_type] = (byBiz[r.business_id][r.event_type] || 0) + 1;
        }
      });
      var elV = document.getElementById('stat-views');
      var elC = document.getElementById('stat-calls');
      var elW = document.getElementById('stat-wa');
      if (elV) elV.textContent = String(totals.view || 0);
      if (elC) elC.textContent = String(totals.call || 0);
      if (elW) elW.textContent = String(totals.whatsapp || 0);
      if (summary) {
        summary.textContent = 'Total — Views: ' + (totals.view || 0) + ' · Calls: ' + (totals.call || 0) + ' · WhatsApp: ' + (totals.whatsapp || 0) + ' · Maps: ' + (totals.maps || 0);
      }
      if (list) {
        list.innerHTML = '';
        (biz.data || []).forEach(function (b) {
          var s = byBiz[b.id] || { view: 0, call: 0, whatsapp: 0 };
          var div = document.createElement('div');
          div.style.cssText = 'padding:12px 14px;margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,.1);font-size:.88rem';
          div.innerHTML = '<strong>' + (b.business_name || b.slug) + '</strong>' +
            '<div style="margin-top:6px;opacity:.8">👁 ' + (s.view || 0) + ' views · 📞 ' + (s.call || 0) + ' calls · 💬 ' + (s.whatsapp || 0) + ' WhatsApp</div>';
          list.appendChild(div);
        });
      }
    } catch (e) {
      console.error(e);
      if (summary) summary.textContent = 'Could not load analytics.';
    }
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
        actions.appendChild(linkBtn('edit-profile.html?slug=' + encodeURIComponent(r.slug || ''), '✏️ Edit profile', false));

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
    loadSubscription();
    loadAnalytics();
  })();
})();
