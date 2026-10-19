(function () {
  'use strict';
  var cfg = window.GROBIZZZ_CONFIG || {};
  var slug = new URLSearchParams(window.location.search).get('slug') || '';

  function msg(t, err) {
    var el = document.getElementById('msg');
    el.textContent = t || '';
    el.className = 'msg ' + (err ? 'err' : 'ok');
  }

  function sb() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      msg('Configure js/config.js', true);
      return null;
    }
    if (window.__grobizzzSb) return window.__grobizzzSb;
    window.__grobizzzSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return window.__grobizzzSb;
  }

  document.getElementById('preview-btn').onclick = function () {
    if (!slug) { window.location.href = 'dashboard.html'; return; }
    window.location.href = 'profile.html?slug=' + encodeURIComponent(slug) + '&preview=1';
  };

  (async function boot() {
    var client = sb();
    if (!client) return;
    var session = await client.auth.getSession();
    if (!session.data || !session.data.session) {
      window.location.href = 'auth.html?next=' + encodeURIComponent('payment.html?slug=' + slug);
      return;
    }
    if (slug) {
      var res = await client.from('businesses').select('business_name,slug,status').eq('slug', slug).maybeSingle();
      if (res.data) {
        document.getElementById('biz-line').textContent =
          'Publish “' + (res.data.business_name || slug) + '” after payment. Currently: ' + (res.data.status || 'draft');
        if (res.data.status === 'published') {
          msg('Already published. Opening live page…', false);
          setTimeout(function () {
            window.location.href = (cfg.PROFILE_BASE || 'profile.html?slug=') + encodeURIComponent(slug);
          }, 1200);
        }
      }
    }
  })();

  document.getElementById('pay-btn').addEventListener('click', async function () {
    var btn = document.getElementById('pay-btn');
    var client = sb();
    if (!client || !slug) {
      msg('Missing profile slug', true);
      return;
    }
    btn.disabled = true;
    msg('Processing payment & publishing…', false);
    try {
      var session = await client.auth.getSession();
      if (!session.data || !session.data.session) {
        window.location.href = 'auth.html';
        return;
      }
      var user = session.data.session.user;

      // Load business
      var found = await client.from('businesses').select('id,features,user_id,status').eq('slug', slug).maybeSingle();
      if (found.error) throw found.error;
      if (!found.data) throw new Error('Profile not found');

      // Optional owner check if user_id set
      if (found.data.user_id && found.data.user_id !== user.id) {
        throw new Error('Only the owner can publish this profile');
      }

      var features = Object.assign({}, found.data.features || {}, {
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        is_live: true,
        payment_amount: 999,
        payment_currency: 'INR'
      });

      var upd = await client.from('businesses').update({
        status: 'published',
        published_at: new Date().toISOString(),
        features: features
      }).eq('id', found.data.id).select().single();

      if (upd.error) throw upd.error;

      msg('Payment recorded. Your website is live!', false);
      setTimeout(function () {
        window.location.href = (cfg.PROFILE_BASE || 'profile.html?slug=') + encodeURIComponent(slug);
      }, 1200);
    } catch (e) {
      console.error(e);
      msg(e.message || 'Publish failed', true);
      btn.disabled = false;
    }
  });
})();
