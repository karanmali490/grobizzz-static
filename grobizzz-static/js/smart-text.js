/**
 * Smart text helper — tagline & about from name + type (no external API required)
 */
(function (w) {
  'use strict';

  var ABOUT = {
    default:
      '{name} is a trusted local business dedicated to quality service and customer satisfaction. ' +
      'We focus on reliable solutions, friendly support, and a smooth experience for every visitor. ' +
      'Visit us or connect on WhatsApp to know more about what we offer.',
    'cafe-restaurant':
      'Welcome to {name} — a warm spot for fresh food, great flavours, and good company. ' +
      'From everyday favourites to special plates, we prepare each order with care. ' +
      'Dine in with family or order online. We look forward to serving you.',
    doctors:
      '{name} provides careful, patient-first care with clear guidance and modern practices. ' +
      'Our focus is comfort, hygiene, and honest advice for every visitor. ' +
      'Book a visit or message us on WhatsApp for appointments and queries.',
    'gym-fitness':
      '{name} helps you build strength, energy, and consistency with guided training and a motivating space. ' +
      'Whether you are starting out or levelling up, our team supports your goals. ' +
      'Come for a session or ask about memberships on WhatsApp.'
  };

  var TAG = {
    default: 'Quality · Trust · Service',
    'cafe-restaurant': 'Fresh flavours · Warm hospitality',
    doctors: 'Care you can trust',
    'gym-fitness': 'Train stronger every day',
    jewellers: 'Tradition · Trust · Purity',
    education: 'Learn · Grow · Succeed'
  };

  function improveAbout(name, type, current) {
    var key = type || 'default';
    var tpl = ABOUT[key] || ABOUT.default;
    var text = tpl.replace(/\{name\}/g, name || 'Our business');
    if (current && current.trim().length > 40) {
      // light polish: trim spaces, ensure ends with period
      text = current.trim().replace(/\s+/g, ' ');
      if (!/[.!?]$/.test(text)) text += '.';
      if (text.split(/\s+/).length < 40) {
        text = text + ' ' + tpl.replace(/\{name\}/g, name || 'We');
      }
    }
    // keep roughly 80-100 words max trim
    var words = text.split(/\s+/);
    if (words.length > 110) text = words.slice(0, 100).join(' ') + '.';
    return text;
  }

  function writeTagline(name, type) {
    var t = TAG[type] || TAG.default;
    if (name) return name.split(/\s+/).slice(0, 3).join(' ') + ' — ' + t;
    return t;
  }

  w.GrobizzzSmartText = { improveAbout: improveAbout, writeTagline: writeTagline };
})(window);
