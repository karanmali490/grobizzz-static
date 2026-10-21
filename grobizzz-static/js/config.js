/**
 * GROBizzz static config – edit these for your project
 * NEVER put SERVICE_ROLE_KEY or Razorpay KEY SECRET here (browser is public)
 */
window.GROBIZZZ_CONFIG = {
  // Supabase → Settings → API
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVibGxtdnVwem1vanJxb3Zqdmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTExNjEsImV4cCI6MjEwMjA4NzE2MX0.docMkiPiqSH4rpanj6We5sD42T9vv02DGOhvHTwgavA',

  // Public profile links
  // Use 'profile.html?slug=' OR '/' with domain rewrites → https://grobizzz.in/slug
  PROFILE_BASE: 'profile.html?slug=',
  PUBLIC_SITE_URL: 'https://grobizzz.in',

  // Razorpay → Settings → API Keys (use Test key first)
  // Key ID only — NEVER put Key Secret in this file
  RAZORPAY_KEY_ID: 'rzp_test_TqTIeeqhuAXMJa',

  // Publish price in INR (shown on payment page)
  PUBLISH_PRICE_INR: 9
};

