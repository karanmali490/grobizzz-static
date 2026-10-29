/**
 * Grobizzz profile analytics
 */
(function (w) {
  'use strict';
  var cfg = w.GROBIZZZ_CONFIG || {};
  var trackedView = false;

  function client() {
    if (w.__grobizzzSb) return w.__grobizzzSb;
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
    if (!w.supabase) return null;
    w.__grobizzzSb = w.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storage: w.localStorage }
    });
    return w.__grobizzzSb;
  }

  async function track(eventType, business) {
    try {
      if (!business || !eventType) return;
      // skip noisy preview traffic optional: still track
      var c = client();
      if (!c) return;
      await c.from('profile_events').insert({
        business_id: business.id || null,
        slug: business.slug || null,
        event_type: eventType
      });
    } catch (e) {
      console.warn('analytics', e);
    }
  }

  function trackViewOnce(business) {
    if (trackedView) return;
    trackedView = true;
    track('view', business);
  }

  function bindClickTracking(business) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href.indexOf('wa.me') >= 0 || href.indexOf('whatsapp') >= 0 || a.classList.contains('float-wa') || a.classList.contains('nav-wa')) {
        track('whatsapp', business);
      } else if (href.indexOf('tel:') === 0 || a.classList.contains('nav-call') || a.classList.contains('float-call')) {
        track('call', business);
      } else if (href.indexOf('google.com/maps') >= 0 || href.indexOf('maps.app') >= 0 || href.indexOf('goo.gl/maps') >= 0) {
        track('maps', business);
      }
    }, true);

    var shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () { track('share', business); });
    }
  }

  w.GrobizzzAnalytics = {
    track: track,
    trackViewOnce: trackViewOnce,
    bindClickTracking: bindClickTracking
  };
})(window);
