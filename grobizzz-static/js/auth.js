/**
 * Grobizzz Auth – Supabase email/password (existing system)
 */
(function () {
  'use strict';

  var cfg = window.GROBIZZZ_CONFIG || {};
  var sb = null;
  var mode = 'login';

  function getClient() {
    if (window.__grobizzzSb) return window.__grobizzzSb;
    if (sb) return sb;
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || String(cfg.SUPABASE_URL).indexOf('YOUR_') === 0) {
      setMsg('Configure SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js', true);
      return null;
    }
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

  function setMsg(text, isErr) {
    var el = document.getElementById('msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'msg ' + (isErr ? 'err' : 'ok');
  }

  function ui() {
    return window.GrobizzzAuthUI || {};
  }

  function nextUrl() {
    return new URLSearchParams(window.location.search).get('next') || 'dashboard.html';
  }

  function setMode(next) {
    mode = next;
    document.querySelectorAll('.tab').forEach(function (t) {
      var on = t.getAttribute('data-mode') === mode;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var nameField = document.getElementById('name-field');
    var title = document.getElementById('title');
    var sub = document.getElementById('subtitle');
    var btnText = document.querySelector('#submit-btn .btn-text');
    var opts = document.getElementById('login-opts');
    if (mode === 'signup') {
      if (nameField) nameField.hidden = false;
      if (title) title.textContent = 'Create account';
      if (sub) sub.textContent = 'Sign up to build and manage your Grobizzz profiles.';
      if (btnText) btnText.textContent = 'Sign up';
      if (opts) opts.style.display = 'none';
    } else {
      if (nameField) nameField.hidden = true;
      if (title) title.textContent = 'Welcome Back';
      if (sub) sub.textContent = 'Sign in to continue to your account.';
      if (btnText) btnText.textContent = 'Sign In';
      if (opts) opts.style.display = '';
    }
    setMsg('');
  }

  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      setMode(t.getAttribute('data-mode'));
    });
  });

  // Forgot password
  var forgotBtn = document.getElementById('forgot-btn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async function () {
      var client = getClient();
      if (!client) return;
      var email = (document.getElementById('email').value || '').trim();
      if (!email) {
        setMsg('Enter your email above, then click Forgot password.', true);
        return;
      }
      ui().setLoading && ui().setLoading(true);
      setMsg('Sending reset link…', false);
      try {
        var redirectTo = (cfg.PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '') + '/auth.html';
        var res = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
        if (res.error) throw res.error;
        setMsg('Password reset email sent. Check your inbox.', false);
      } catch (err) {
        setMsg(err.message || 'Could not send reset email', true);
        ui().shake && ui().shake();
      } finally {
        ui().setLoading && ui().setLoading(false);
      }
    });
  }

  async function redirectIfSession() {
    var client = getClient();
    if (!client) return;
    var res = await client.auth.getSession();
    if (res.data && res.data.session) {
      window.location.href = nextUrl();
    }
  }
  redirectIfSession();

  var form = document.getElementById('auth-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var client = getClient();
    if (!client) return;

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var fullName = (document.getElementById('full_name') && document.getElementById('full_name').value || '').trim();

    if (!email || !password) {
      setMsg('Email and password are required.', true);
      ui().shake && ui().shake();
      return;
    }

    ui().setLoading && ui().setLoading(true);
    setMsg(mode === 'signup' ? 'Creating account…' : 'Signing in…', false);

    try {
      if (mode === 'signup') {
        var sign = await client.auth.signUp({
          email: email,
          password: password,
          options: { data: { full_name: fullName || null } }
        });
        if (sign.error) throw sign.error;
        ui().saveRemember && ui().saveRemember(email);
        if (sign.data.session) {
          window.location.href = nextUrl();
          return;
        }
        setMsg('Account created. Check your email to confirm, then log in.', false);
        setMode('login');
      } else {
        var login = await client.auth.signInWithPassword({ email: email, password: password });
        if (login.error) throw login.error;
        ui().saveRemember && ui().saveRemember(email);
        window.location.href = nextUrl();
      }
    } catch (err) {
      setMsg(err.message || 'Something went wrong', true);
      ui().shake && ui().shake();
    } finally {
      ui().setLoading && ui().setLoading(false);
    }
  });
})();