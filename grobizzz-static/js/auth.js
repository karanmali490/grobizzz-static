/**
 * Grobizzz Auth – Supabase email/password + password reset via email link
 */
(function () {
  'use strict';

  var cfg = window.GROBIZZZ_CONFIG || {};
  var sb = null;
  var mode = 'login';
  var recoveryMode = false;

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

  function setResetMsg(text, isErr) {
    var el = document.getElementById('reset-msg');
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

  /** URL used in the reset email – must be allowed in Supabase Auth redirect URLs */
  function resetRedirectUrl() {
    var base = (cfg.PUBLIC_SITE_URL || window.location.origin || '').replace(/\/$/, '');
    if (!base) base = window.location.origin;
    return base + '/auth.html';
  }

  function showResetPanel(show) {
    recoveryMode = !!show;
    var loginView = document.getElementById('login-view');
    var resetPanel = document.getElementById('reset-panel');
    if (loginView) loginView.hidden = !!show;
    if (resetPanel) resetPanel.hidden = !show;
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
      if (title) title.textContent = 'Welcome back';
      if (sub) sub.textContent = 'Sign in to continue to your dashboard.';
      if (btnText) btnText.textContent = 'Sign in';
      if (opts) opts.style.display = '';
    }
    setMsg('');
  }

  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      setMode(t.getAttribute('data-mode'));
    });
  });

  // --- Forgot password: send Supabase email with link ---
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
        var res = await client.auth.resetPasswordForEmail(email, {
          redirectTo: resetRedirectUrl()
        });
        if (res.error) throw res.error;
        setMsg('Password reset link sent to ' + email + '. Open the email and click the link.', false);
      } catch (err) {
        setMsg(err.message || 'Could not send reset email', true);
        ui().shake && ui().shake();
      } finally {
        ui().setLoading && ui().setLoading(false);
      }
    });
  }

  // --- Detect recovery session from Supabase email link ---
  async function handleRecoveryFromUrl() {
    var client = getClient();
    if (!client) return false;

    // Supabase puts tokens in hash: #access_token=...&type=recovery
    var hash = window.location.hash || '';
    var isRecoveryHash = /type=recovery/i.test(hash) || /type=recovery/i.test(window.location.search || '');

    // Also listen once for PASSWORD_RECOVERY event
    client.auth.onAuthStateChange(function (event) {
      if (event === 'PASSWORD_RECOVERY') {
        showResetPanel(true);
        setResetMsg('Enter your new password below.', false);
      }
    });

    var sessionRes = await client.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;

    if (isRecoveryHash || (session && isRecoveryHash)) {
      showResetPanel(true);
      setResetMsg('Enter your new password below.', false);
      // Clean hash from URL without reload
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
      return true;
    }

    // If user landed with session only from recovery, PASSWORD_RECOVERY event handles it
    return false;
  }

  // --- Submit new password after email link ---
  var resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var client = getClient();
      if (!client) return;

      var p1 = document.getElementById('new_password').value;
      var p2 = document.getElementById('confirm_password').value;
      var btn = document.getElementById('reset-btn');

      if (!p1 || p1.length < 6) {
        setResetMsg('Password must be at least 6 characters.', true);
        return;
      }
      if (p1 !== p2) {
        setResetMsg('Passwords do not match.', true);
        return;
      }

      if (btn) btn.disabled = true;
      var text = btn && btn.querySelector('.btn-text');
      var loader = btn && btn.querySelector('.btn-loader');
      if (text) text.hidden = true;
      if (loader) loader.hidden = false;
      setResetMsg('Updating password…', false);

      try {
        var res = await client.auth.updateUser({ password: p1 });
        if (res.error) throw res.error;
        setResetMsg('Password updated. Redirecting to dashboard…', false);
        setTimeout(function () {
          window.location.href = nextUrl();
        }, 1000);
      } catch (err) {
        setResetMsg(err.message || 'Could not update password', true);
        if (btn) btn.disabled = false;
        if (text) text.hidden = false;
        if (loader) loader.hidden = true;
      }
    });
  }

  async function boot() {
    var inRecovery = await handleRecoveryFromUrl();
    if (inRecovery) return;

    // Normal session → dashboard (but not during recovery)
    var client = getClient();
    if (!client) return;
    var res = await client.auth.getSession();
    if (res.data && res.data.session && !recoveryMode) {
      // Only redirect if not in password recovery flow
      var hash = window.location.hash || '';
      if (!/type=recovery/i.test(hash)) {
        window.location.href = nextUrl();
      }
    }
  }
  boot();

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