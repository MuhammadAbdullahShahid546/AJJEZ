/**
 * AJJEZ 3-in-1 Social Super App
 * In-Menu Account & Guest Session Engine
 */

(function () {
  const STORAGE_KEY = 'ajjez_user_session';

  window.AJJEZ_SESSION = {
    // 1. Get current session
    getSession() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error("AJJEZ Session read error:", e);
      }
      return null;
    },

    // 2. Save session
    setSession(session) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        this.renderDrawerAuth();
        this.dispatchSessionChange(session);
      } catch (e) {
        console.error("AJJEZ Session save error:", e);
      }
    },

    // 3. Login with Gmail & Password
    loginWithGmail(email, password) {
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        alert('Please enter a valid Gmail / Email address (e.g. yourname@gmail.com).');
        const emailInput = document.getElementById('drawerInputEmail');
        if (emailInput) emailInput.focus();
        return false;
      }

      if (!cleanPassword || cleanPassword.length < 3) {
        alert('Please enter your password.');
        const passInput = document.getElementById('drawerInputPassword');
        if (passInput) passInput.focus();
        return false;
      }

      const username = cleanEmail.split('@')[0];
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);

      const session = {
        type: 'user',
        email: cleanEmail,
        name: displayName,
        id: 'user_' + Date.now(),
        badge: 'Verified Gmail',
        avatar: '✉️'
      };

      this.setSession(session);
      return true;
    },

    // 4. Continue with Guest ID
    loginAsGuest() {
      const guestNum = Math.floor(1000 + Math.random() * 9000);
      const session = {
        type: 'guest',
        email: `guest${guestNum}@ajjez.io`,
        name: `Guest #${guestNum}`,
        id: `guest_${guestNum}`,
        badge: 'Guest Preview',
        avatar: '👤'
      };

      this.setSession(session);
      return true;
    },

    // 5. Logout / Switch
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      this.renderDrawerAuth();
      this.dispatchSessionChange(null);
    },

    // 6. Notify listeners
    dispatchSessionChange(session) {
      window.dispatchEvent(new CustomEvent('ajjez_session_change', { detail: session }));
    },

    // 7. Render directly into the menu drawer
    renderDrawerAuth() {
      const container = document.getElementById('drawerAuthCard');
      if (!container) return;

      const session = this.getSession();

      if (!session) {
        // Show Gmail + Password inputs and Guest ID option
        container.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-evergreen/60 border border-sage/40 space-y-2.5 shadow-md">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-wider text-lightGreen font-semibold flex items-center gap-1.5">
                <span class="size-1.5 rounded-full bg-lightGreen"></span>
                Account / Guest Access
              </span>
              <span class="text-[9px] font-mono text-mutedOlive">AJJEZ</span>
            </div>

            <!-- Gmail & Password Form -->
            <div class="space-y-1.5">
              <div class="relative">
                <input 
                  type="email" 
                  id="drawerInputEmail" 
                  placeholder="yourname@gmail.com" 
                  class="w-full h-8 bg-background/90 border border-border focus:border-lightGreen rounded-lg pl-7 pr-2.5 text-xs text-foreground placeholder-zinc-500 focus:outline-none transition-all font-mono"
                >
                <span class="absolute left-2.5 top-2 text-mutedOlive text-xs">✉</span>
              </div>
              <div class="relative">
                <input 
                  type="password" 
                  id="drawerInputPassword" 
                  placeholder="Enter password..." 
                  class="w-full h-8 bg-background/90 border border-border focus:border-lightGreen rounded-lg pl-7 pr-2.5 text-xs text-foreground placeholder-zinc-500 focus:outline-none transition-all"
                  onkeydown="if(event.key === 'Enter') window.AJJEZ_SESSION.handleFormSubmit()"
                >
                <span class="absolute left-2.5 top-2 text-mutedOlive text-xs">🔒</span>
              </div>
              <button 
                type="button" 
                onclick="window.AJJEZ_SESSION.handleFormSubmit()" 
                class="w-full h-8 rounded-lg bg-sage hover:bg-sage/90 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <span>Sign In with Gmail</span>
                <span>→</span>
              </button>
            </div>

            <!-- Divider -->
            <div class="relative flex items-center justify-center py-0.5">
              <div class="border-t border-border/80 w-full"></div>
              <span class="bg-card px-2 text-[9px] font-mono text-mutedOlive uppercase relative z-10">or explore instantly</span>
            </div>

            <!-- Guest ID Option -->
            <button 
              type="button" 
              onclick="window.AJJEZ_SESSION.handleGuestClick()" 
              class="w-full h-8 rounded-lg border border-sage/40 hover:border-lightGreen bg-background/80 hover:bg-muted text-zinc-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer group shadow-sm active:scale-[0.98]"
            >
              <span>👤</span>
              <span>Continue with Guest ID</span>
              <span class="text-[10px] text-lightGreen font-mono group-hover:translate-x-0.5 transition-transform">⚡</span>
            </button>
          </div>
        `;
      } else {
        // Show Logged-in / Active Guest status
        const isGuest = session.type === 'guest';
        container.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-evergreen/70 border border-sage/50 flex items-center justify-between shadow-md">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="size-9 rounded-xl bg-background border border-sage/60 flex items-center justify-center text-sm font-bold shrink-0">
                ${isGuest ? '👤' : '✉️'}
              </div>
              <div class="min-w-0">
                <div class="font-bold text-xs text-white truncate max-w-[130px]" title="${session.name}">${session.name}</div>
                <div class="text-[10px] font-mono text-lightGreen flex items-center gap-1 truncate">
                  <span class="size-1.5 rounded-full bg-lightGreen animate-ping shrink-0"></span>
                  <span>${session.badge}</span>
                </div>
              </div>
            </div>
            <button 
              type="button" 
              onclick="window.AJJEZ_SESSION.logout()" 
              class="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-border hover:border-rose-400/50 bg-background/90 text-mutedOlive hover:text-rose-400 transition-colors cursor-pointer shrink-0" 
              title="Switch account or guest"
            >
              Switch
            </button>
          </div>
        `;
      }
    },

    handleFormSubmit() {
      const emailInput = document.getElementById('drawerInputEmail');
      const passInput = document.getElementById('drawerInputPassword');
      const email = emailInput ? emailInput.value : '';
      const pass = passInput ? passInput.value : '';
      this.loginWithGmail(email, pass);
    },

    handleGuestClick() {
      this.loginAsGuest();
    },

    init() {
      this.renderDrawerAuth();
    }
  };

  // Run on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AJJEZ_SESSION.init());
  } else {
    window.AJJEZ_SESSION.init();
  }
})();
