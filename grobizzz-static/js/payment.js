/**
 * Grobizzz – Razorpay Pay & Publish
 * Put only RAZORPAY_KEY_ID in config.js (never Key Secret in browser).
 */
(function () {
  'use strict';

  var cfg = window.GROBIZZZ_CONFIG || {};
  var slug = new URLSearchParams(window.location.search).get('slug') || '';
  var AMOUNT_INR = Number(cfg.PUBLISH_PRICE_INR) || 999;
  var AMOUNT_PAISE = Math.round(AMOUNT_INR * 100);
  var bizName = '';

  function msg(t, err) {
    var el = document.getElementById('msg');
    if (!el) return;
    el.textContent = t || '';
    el.className = 'msg ' + (err ? 'err' : 'ok');
  }

  function profileUrl(s) {
    var base = cfg.PROFILE_BASE || 'profile.html?slug=';
    if (base === '/' || base === '') {
      return (cfg.PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '') + '/' + encodeURIComponent(s);
    }
    return base + encodeURIComponent(s);
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

  async function publishAfterPayment(payment) {
    var client = sb();
    if (!client) throw new Error('Supabase not configured');

    var session = await client.auth.getSession();
    if (!session.data || !session.data.session) {
      window.location.href = 'auth.html?next=' + encodeURIComponent('payment.html?slug=' + slug);
      return;
    }
    var user = session.data.session.user;

    var found = await client
      .from('businesses')
      .select('id,features,user_id,status,business_name')
      .eq('slug', slug)
      .maybeSingle();

    if (found.error) throw found.error;
    if (!found.data) throw new Error('Profile not found');
    if (found.data.user_id && found.data.user_id !== user.id) {
      throw new Error('Only the owner can publish this profile');
    }

    var paidAt = new Date();
    var planEnd = new Date(paidAt);
    planEnd.setFullYear(planEnd.getFullYear() + 1); // annual = 1 year

    var features = Object.assign({}, found.data.features || {}, {
      payment_status: 'paid',
      paid_at: paidAt.toISOString(),
      is_live: true,
      payment_amount: AMOUNT_INR,
      payment_currency: 'INR',
      payment_provider: 'razorpay',
      razorpay_payment_id: payment.razorpay_payment_id || null,
      razorpay_order_id: payment.razorpay_order_id || null,
      razorpay_signature: payment.razorpay_signature || null,
      plan_name: 'Annual Publish',
      plan_type: 'annual',
      plan_duration_years: 1,
      plan_start: paidAt.toISOString(),
      plan_end: planEnd.toISOString()
    });

    var upd = await client
      .from('businesses')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        features: features
      })
      .eq('id', found.data.id)
      .select()
      .single();

    if (upd.error) throw upd.error;
    return upd.data;
  }

  function openRazorpay() {
    var key = cfg.RAZORPAY_KEY_ID;
    if (!key || key.indexOf('YOUR_') === 0) {
      msg('Add RAZORPAY_KEY_ID in js/config.js (from Razorpay Dashboard → API Keys)', true);
      return;
    }
    if (typeof window.Razorpay !== 'function') {
      msg('Razorpay script not loaded. Check internet / script tag.', true);
      return;
    }

    var options = {
      key: key,
      amount: AMOUNT_PAISE,
      currency: 'INR',
      name: 'Grobizzz',
      description: 'Publish profile: ' + (bizName || slug),
      image: 'images/grobizzz-logo.png',
      prefill: {},
      notes: {
        slug: slug,
        product: 'grobizzz_publish'
      },
      theme: { color: '#e11d48' },
      handler: function (response) {
        msg('Payment received. Publishing…', false);
        publishAfterPayment(response)
          .then(function () {
            msg('Published! Opening your live site…', false);
            setTimeout(function () {
              window.location.href = profileUrl(slug);
            }, 1000);
          })
          .catch(function (e) {
            console.error(e);
            msg(
              'Paid, but publish failed: ' + (e.message || e) +
              '. Contact support with payment id: ' + (response.razorpay_payment_id || ''),
              true
            );
            document.getElementById('pay-btn').disabled = false;
          });
      },
      modal: {
        ondismiss: function () {
          msg('Payment cancelled.', true);
          document.getElementById('pay-btn').disabled = false;
        }
      }
    };

    // Prefill email if logged in
    sb().auth.getUser().then(function (u) {
      if (u.data && u.data.user && u.data.user.email) {
        options.prefill.email = u.data.user.email;
      }
      var rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        var err = (resp && resp.error) || {};
        msg('Payment failed: ' + (err.description || err.reason || 'Try again'), true);
        document.getElementById('pay-btn').disabled = false;
      });
      rzp.open();
    });
  }

  document.getElementById('preview-btn').onclick = function () {
    if (!slug) {
      window.location.href = 'dashboard.html';
      return;
    }
    window.location.href = 'profile.html?slug=' + encodeURIComponent(slug) + '&preview=1';
  };

  (async function boot() {
    var priceEl = document.getElementById('price-amount');
    if (priceEl) priceEl.textContent = '₹' + AMOUNT_INR;
    var btn = document.getElementById('pay-btn');
    if (btn) btn.textContent = 'Pay ₹' + AMOUNT_INR + ' with Razorpay';

    var client = sb();
    if (!client) return;
    var session = await client.auth.getSession();
    if (!session.data || !session.data.session) {
      window.location.href = 'auth.html?next=' + encodeURIComponent('payment.html?slug=' + slug);
      return;
    }
    if (!slug) {
      msg('Missing profile slug. Open Pay & Publish from your draft.', true);
      return;
    }
    var res = await client
      .from('businesses')
      .select('business_name,slug,status')
      .eq('slug', slug)
      .maybeSingle();
    if (res.data) {
      bizName = res.data.business_name || slug;
      document.getElementById('biz-line').textContent =
        'Publish “' + bizName + '” after payment. Currently: ' + (res.data.status || 'draft');
      if (res.data.status === 'published') {
        msg('Already published. Opening live page…', false);
        setTimeout(function () {
          window.location.href = profileUrl(slug);
        }, 1200);
      }
    }
  })();

  document.getElementById('pay-btn').addEventListener('click', function () {
    var btn = document.getElementById('pay-btn');
    btn.disabled = true;
    msg('Opening Razorpay…', false);
    openRazorpay();
  });
})();