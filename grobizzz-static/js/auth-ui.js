/**
 * Auth UI helpers – password toggle, remember me, loading, shake
 * (No intro animation)
 */
(function () {
  'use strict';

  var KEY_EMAIL = 'grobizzz_remember_email';
  var panel = document.getElementById('login-panel');

  // Password visibility
  var toggle = document.getElementById('toggle-pass');
  var pass = document.getElementById('password');
  var icon = document.getElementById('toggle-pass-icon');
  if (toggle && pass) {
    toggle.addEventListener('click', function () {
      var show = pass.type === 'password';
      pass.type = show ? 'text' : 'password';
      if (icon) {
        icon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      }
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  // Remember me – restore email
  var email = document.getElementById('email');
  var remember = document.getElementById('remember');
  try {
    var saved = localStorage.getItem(KEY_EMAIL);
    if (saved && email) {
      email.value = saved;
      if (remember) remember.checked = true;
    }
  } catch (e) {}

  window.GrobizzzAuthUI = {
    shake: function () {
      if (!panel) return;
      panel.classList.remove('shake');
      void panel.offsetWidth;
      panel.classList.add('shake');
    },
    setLoading: function (on) {
      var btn = document.getElementById('submit-btn');
      if (!btn) return;
      btn.disabled = !!on;
      var text = btn.querySelector('.btn-text');
      var loader = btn.querySelector('.btn-loader');
      if (text) text.hidden = !!on;
      if (loader) loader.hidden = !on;
    },
    saveRemember: function (emailVal) {
      try {
        if (remember && remember.checked && emailVal) {
          localStorage.setItem(KEY_EMAIL, emailVal);
        } else {
          localStorage.removeItem(KEY_EMAIL);
        }
      } catch (e) {}
    }
  };
})();