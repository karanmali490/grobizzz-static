(function () {
  'use strict';

  var cfg = window.GROBIZZZ_CONFIG || {};
  var sb = null;
  var mode = 'login';

  function getClient() {
    if (sb) return sb;
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_URL.indexOf('YOUR_') === 0) {
      setMsg('Configure SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js', true);
      return null;
    }
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    return sb;
  }

  function setMsg(text, isErr) {
    var el = document.getElementById('msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'msg ' + (isErr ? 'err' : 'ok');
  }

  function setMode(next) {
    mode = next;
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-mode') === mode);
    });
    var nameField = document.getElementById('name-field');
    var title = document.getElementById('title');
    var sub = document.getElementById('subtitle');
    var btn = document.getElementById('submit-btn');
    if (mode === 'signup') {
      nameField.hidden = false;
      title.textContent = 'Create account';
      sub.textContent = 'Sign up to build and manage your Grobizzz profiles.';
      btn.textContent = 'Sign up';
    } else {
      nameField.hidden = true;
      title.textContent = 'Welcome back';
      sub.textContent = 'Log in to manage your business profiles.';
      btn.textContent = 'Log in';
    }
    setMsg('');
  }

  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      setMode(t.getAttribute('data-mode'));
    });
  });

  // If already logged in → dashboard
  async function redirectIfSession() {
    var client = getClient();
    if (!client) return;
    var res = await client.auth.getSession();
    if (res.data && res.data.session) {
      window.location.href = 'dashboard.html';
    }
  }
  redirectIfSession();

  document.getElementById('auth-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var client = getClient();
    if (!client) return;

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var fullName = (document.getElementById('full_name').value || '').trim();
    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    setMsg(mode === 'signup' ? 'Creating account…' : 'Logging in…', false);

    try {
      if (mode === 'signup') {
        var sign = await client.auth.signUp({
          email: email,
          password: password,
          options: { data: { full_name: fullName || null } }
        });
        if (sign.error) throw sign.error;
        // If email confirmation is disabled, session may exist
        if (sign.data.session) {
          window.location.href = 'dashboard.html';
          return;
        }
        setMsg('Account created. Check your email to confirm, then log in.', false);
        setMode('login');
      } else {
        var login = await client.auth.signInWithPassword({ email: email, password: password });
        if (login.error) throw login.error;
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      setMsg(err.message || 'Something went wrong', true);
    } finally {
      btn.disabled = false;
    }
  });
})();
