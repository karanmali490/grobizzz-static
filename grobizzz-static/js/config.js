/**
 * GROBizzz static config – edit these for your project
 * NEVER put SERVICE_ROLE_KEY here (browser is public)
 */
window.GROBIZZZ_CONFIG = {
  // From Supabase → Settings → API
  SUPABASE_URL: 'https://ebllmvupzmojrqovjvlz.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVibGxtdnVwem1vanJxb3Zqdmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTExNjEsImV4cCI6MjEwMjA4NzE2MX0.docMkiPiqSH4rpanj6We5sD42T9vv02DGOhvHTwgavA',

  // Where public profile is opened after create
  // Relative path from form, or absolute URL on your domain
  PROFILE_BASE: 'profile.html?slug=',

  // Optional: full public site URL for share messages
  PUBLIC_SITE_URL: '' // e.g. 'https://grobizzz.in' – leave '' to use current origin
};
