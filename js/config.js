// ===== Site settings =====
// 1. Create a free project at https://supabase.com
// 2. Run supabase/setup.sql in the Supabase SQL Editor
// 3. Paste your Project URL and anon (public) key below
// The anon key is safe to put in a public website. Never put the service_role key here.
window.APP_CONFIG = {
  SUPABASE_URL: "https://jajntkqqctwgusvzlind.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impham50a3FxY3R3Z3VzdnpsaW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxOTc3NDIsImV4cCI6MjEwOTc3Mzc0Mn0._hLjYl20ZCN-5N6EMWFTsWeJ8qlOP_dZP0FR95HyVlM",

  // Usernames are turned into a hidden login email: username@USERNAME_DOMAIN
  // No email is ever sent. Keep this the same after friends sign up.
  // Supabase only accepts emails on a real domain that can receive mail.
  // Set this to an inbox YOU control, e.g. "yourname+{username}@gmail.com".
  // Keep it the same after friends sign up, or their logins stop matching.
  LOGIN_EMAIL_TEMPLATE: "michelleaiccount+{username}@gmail.com",
  USERNAME_DOMAIN: "aiexam-revision.app",

  // Feedback form sends to this address through formsubmit.co (free, no account).
  // The FIRST message sends you an "Activate form" email. Click it once, then feedback arrives.
  // After that, formsubmit emails you a random alias. Paste it here instead of your email
  // so your real address is not visible in the site's code.
  FEEDBACK_EMAIL: "michellgun29@gmail.com",

  // Random seed for generated practice questions
  SEED: 67
};
