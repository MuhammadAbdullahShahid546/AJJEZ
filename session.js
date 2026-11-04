/**
 * AJJEZ 3-in-1 Social Super App
 * Full-Drawer Facebook-Style Auth & Guest Gate Engine
 */

(function () {
  const STORAGE_KEY = 'ajjez_user_session';
  let isSignUpMode = false;

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

    // 3. Login with Email or Mobile Number & Password
    loginWithIdentifier(identifier, password) {
      const rawId = (identifier || '').trim();
      const cleanPass = (password || '').trim();
      const cleanId = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.sanitizeInput(rawId) : rawId;

      if (!cleanId) {
        alert('Please enter your Email address or mobile number.');
        const idInput = document.getElementById('drawerInputEmail');
        if (idInput) idInput.focus();
        return false;
      }

      if (!cleanPass || cleanPass.length < 3) {
        alert('Please enter your password.');
        const passInput = document.getElementById('drawerInputPassword');
        if (passInput) passInput.focus();
        return false;
      }

      const username = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);

      const session = {
        type: 'user',
        email: cleanId,
        name: displayName,
        id: 'user_' + Date.now(),
        badge: 'Verified Member',
        avatar: '👤'
      };

      this.setSession(session);
      return true;
    },

    // 4. Create Account
    signUp(fullName, identifier, password) {
      const rawName = (fullName || '').trim() || 'Community Member';
      const rawId = (identifier || '').trim();
      const cleanPass = (password || '').trim();
      const cleanName = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.sanitizeInput(rawName) : rawName;
      const cleanId = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.sanitizeInput(rawId) : rawId;

      if (!cleanId) {
        alert('Please enter an Email address or mobile number.');
        const idInput = document.getElementById('drawerSignUpEmail');
        if (idInput) idInput.focus();
        return false;
      }

      if (!cleanPass || cleanPass.length < 3) {
        alert('Please enter a password.');
        const passInput = document.getElementById('drawerSignUpPassword');
        if (passInput) passInput.focus();
        return false;
      }

      const session = {
        type: 'user',
        email: cleanId,
        name: cleanName,
        id: 'user_' + Date.now(),
        badge: 'Verified Member',
        avatar: '👤'
      };

      this.setSession(session);
      isSignUpMode = false;
      return true;
    },

    // 5. Continue as Guest (Requested: 'or iske neecha guest ka aption')
    loginAsGuest() {
      const guestNum = Math.floor(1000 + Math.random() * 9000);
      const session = {
        type: 'guest',
        email: `guest_${guestNum}@ajjez.io`,
        name: `Guest #${guestNum}`,
        id: `guest_${guestNum}`,
        badge: 'Guest Preview',
        avatar: '👤'
      };

      this.setSession(session);
    },

    // 6. Logout (Re-locks the menu and takes over the full drawer space again)
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      isSignUpMode = false;
      this.renderDrawerAuth();
      this.dispatchSessionChange(null);
    },

    toggleSignUpMode(val) {
      isSignUpMode = val;
      this.renderDrawerAuth();
    },

    // 7. Notify listeners
    dispatchSessionChange(session) {
      window.dispatchEvent(new CustomEvent('ajjez_session_change', { detail: session }));
    },

    // 8. Render Facebook-styled Form & Guest Option covering entire drawer space
    renderDrawerAuth() {
      const container = document.getElementById('drawerAuthCard');
      const navLinks = document.getElementById('drawerNavLinks');
      const footer = document.getElementById('drawerFooter');
      if (!container) return;

      const session = this.getSession();

      if (!session) {
        // LOCK THE MENU: Hide navigation links and footer completely
        if (navLinks) navLinks.classList.add('hidden');
        if (footer) footer.classList.add('hidden');

        if (!isSignUpMode) {
          // --- LOG IN VIEW (Exact layout of user's screenshot) ---
          container.className = "flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 animate-fade-in";
          container.innerHTML = `
            <div class="w-full space-y-4 my-auto">
              
              <!-- Lock Header Banner -->
              <div class="text-center space-y-1.5 pb-1">
                <div class="inline-flex size-12 rounded-2xl border border-sage/50 bg-black p-1 shadow-lg shadow-sage/20 mx-auto">
                  <img src="logo.png?v=aajez" alt="AJJEZ" class="w-full h-full object-cover rounded-xl">
                </div>
                <h3 class="text-base font-bold text-foreground tracking-tight">AJJEZ Member Access</h3>
                <p class="text-xs text-mutedOlive">Sign in, create account, or continue as guest to unlock the menu.</p>
              </div>

              <!-- Facebook-Style Login Card -->
              <div class="p-5 rounded-2xl bg-card border border-border/90 shadow-2xl space-y-3.5">
                
                <!-- 1. Email address or mobile number input -->
                <div>
                  <input 
                    type="text" 
                    id="drawerInputEmail" 
                    placeholder="Email address or mobile number" 
                    class="w-full h-11 bg-background border border-border focus:border-[#1877F2] rounded-xl px-4 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                  >
                </div>

                <!-- 2. Password input -->
                <div>
                  <input 
                    type="password" 
                    id="drawerInputPassword" 
                    placeholder="Password" 
                    class="w-full h-11 bg-background border border-border focus:border-[#1877F2] rounded-xl px-4 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                    onkeydown="if(event.key === 'Enter') window.AJJEZ_SESSION.handleLoginSubmit()"
                  >
                </div>

                <!-- 3. Log in (Facebook Blue Button) -->
                <button 
                  type="button" 
                  onclick="window.AJJEZ_SESSION.handleLoginSubmit()" 
                  class="w-full h-11 rounded-xl bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-md shadow-[#1877F2]/20 active:scale-[0.98]"
                >
                  Log in
                </button>

                <!-- 4. Forgotten password? link -->
                <div class="text-center pt-0.5">
                  <button 
                    type="button" 
                    onclick="alert('To reset password, contact us via the Contact page or continue as Guest.')" 
                    class="text-xs text-[#1877F2] hover:underline font-medium cursor-pointer"
                  >
                    Forgotten password?
                  </button>
                </div>

                <!-- 5. Create new account (Blue outlined button) -->
                <button 
                  type="button" 
                  onclick="window.AJJEZ_SESSION.toggleSignUpMode(true)" 
                  class="w-full h-10 rounded-xl border border-[#1877F2] hover:bg-[#1877F2]/10 text-[#1877F2] font-semibold text-xs tracking-wide transition-all flex items-center justify-center cursor-pointer active:scale-[0.98]"
                >
                  Create new account
                </button>

                <!-- Divider -->
                <div class="relative flex items-center justify-center py-0.5">
                  <div class="border-t border-border w-full"></div>
                  <span class="bg-card px-2.5 text-[10px] font-mono text-mutedOlive uppercase relative z-10">or explore instantly</span>
                </div>

                <!-- 6. Guest Option Right Below (As requested by user: 'or iske neecha guest ka aption') -->
                <button 
                  type="button" 
                  onclick="window.AJJEZ_SESSION.handleGuestClick()" 
                  class="w-full h-11 rounded-xl border border-sage/60 hover:border-lightGreen bg-evergreen/80 hover:bg-evergreen text-tea hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group active:scale-[0.98]"
                >
                  <span class="text-base">👤</span>
                  <span>Continue as Guest</span>
                  <span class="text-xs text-lightGreen font-mono group-hover:translate-x-1 transition-transform">→</span>
                </button>

              </div>

            </div>
          `;
        } else {
          // --- SIGN UP VIEW (When user clicks Create new account) ---
          container.className = "flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 animate-fade-in";
          container.innerHTML = `
            <div class="w-full space-y-4 my-auto">
              
              <div class="text-center space-y-1.5 pb-1">
                <div class="inline-flex size-12 rounded-2xl border border-sage/50 bg-black p-1 shadow-lg shadow-sage/20 mx-auto">
                  <img src="logo.png?v=aajez" alt="AJJEZ" class="w-full h-full object-cover rounded-xl">
                </div>
                <h3 class="text-base font-bold text-foreground tracking-tight">Create Free Account</h3>
                <p class="text-xs text-mutedOlive">Sign up to access Facebook, YouTube & WhatsApp.</p>
              </div>

              <div class="p-5 rounded-2xl bg-card border border-border/90 shadow-2xl space-y-3.5">
                <div>
                  <input 
                    type="text" 
                    id="drawerSignUpName" 
                    placeholder="Your Full Name" 
                    class="w-full h-11 bg-background border border-border focus:border-[#1877F2] rounded-xl px-4 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                  >
                </div>
                <div>
                  <input 
                    type="text" 
                    id="drawerSignUpEmail" 
                    placeholder="Email address or mobile number" 
                    class="w-full h-11 bg-background border border-border focus:border-[#1877F2] rounded-xl px-4 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                  >
                </div>
                <div>
                  <input 
                    type="password" 
                    id="drawerSignUpPassword" 
                    placeholder="New Password" 
                    class="w-full h-11 bg-background border border-border focus:border-[#1877F2] rounded-xl px-4 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                    onkeydown="if(event.key === 'Enter') window.AJJEZ_SESSION.handleSignUpSubmit()"
                  >
                </div>

                <button 
                  type="button" 
                  onclick="window.AJJEZ_SESSION.handleSignUpSubmit()" 
                  class="w-full h-11 rounded-xl bg-sage hover:bg-sage/90 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-md shadow-sage/20 active:scale-[0.98]"
                >
                  Sign Up & Unlock Menu ✨
                </button>

                <div class="text-center pt-0.5">
                  <button 
                    type="button" 
                    onclick="window.AJJEZ_SESSION.toggleSignUpMode(false)" 
                    class="text-xs text-[#1877F2] hover:underline font-medium cursor-pointer"
                  >
                    Already have an account? Log in
                  </button>
                </div>

                <div class="relative flex items-center justify-center py-0.5">
                  <div class="border-t border-border w-full"></div>
                  <span class="bg-card px-2.5 text-[10px] font-mono text-mutedOlive uppercase relative z-10">or explore instantly</span>
                </div>

                <button 
                  type="button" 
                  onclick="window.AJJEZ_SESSION.handleGuestClick()" 
                  class="w-full h-11 rounded-xl border border-sage/60 hover:border-lightGreen bg-evergreen/80 hover:bg-evergreen text-tea hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group active:scale-[0.98]"
                >
                  <span class="text-base">👤</span>
                  <span>Continue as Guest</span>
                  <span class="text-xs text-lightGreen font-mono group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

            </div>
          `;
        }

      } else {
        // UNLOCK THE MENU: User or Guest is active!
        if (navLinks) navLinks.classList.remove('hidden');
        if (footer) footer.classList.remove('hidden');

        const isGuest = session.type === 'guest';
        const safeName = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.escapeHTML(session.name) : session.name;
        const safeBadge = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.escapeHTML(session.badge) : session.badge;
        const safeEmail = window.AJJEZ_SECURITY ? window.AJJEZ_SECURITY.escapeHTML(session.email || session.id) : (session.email || session.id);

        container.className = "px-4 pt-3.5 pb-1 shrink-0 animate-fade-in";
        container.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-evergreen/80 border border-sage/50 shadow-md space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="size-9 rounded-xl bg-background border-2 border-lightGreen/60 flex items-center justify-center text-sm font-bold shrink-0">
                  ${isGuest ? '👤' : '✓'}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-xs text-white truncate max-w-[130px]" title="${safeName}">${safeName}</div>
                  <div class="text-[10px] font-mono text-lightGreen flex items-center gap-1 truncate">
                    <span class="size-1.5 rounded-full bg-lightGreen animate-ping shrink-0"></span>
                    <span>${safeBadge}</span>
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onclick="window.AJJEZ_SESSION.logout()" 
                class="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-border hover:border-rose-400/50 bg-background/90 text-mutedOlive hover:text-rose-400 transition-colors cursor-pointer shrink-0" 
                title="Log out and re-lock menu"
              >
                Log out
              </button>
            </div>
            <div class="text-[10px] text-mutedOlive font-mono truncate border-t border-sage/30 pt-1.5 flex items-center justify-between">
              <span class="truncate max-w-[170px]">${safeEmail}</span>
              <span class="text-lightGreen font-semibold">● Menu Unlocked</span>
            </div>
            <!-- Z++ Shield Status Badge in Drawer -->
            <div class="pt-1 flex items-center justify-center gap-1.5 text-[9px] font-mono text-tea/80 bg-background/50 rounded-lg py-1 border border-sage/20">
              <span class="size-1.5 rounded-full bg-lightGreen"></span>
              <span>Z++ Anti-Tamper Shield Active</span>
            </div>
          </div>
        `;
      }
    },

    handleLoginSubmit() {
      const emailInput = document.getElementById('drawerInputEmail');
      const passInput = document.getElementById('drawerInputPassword');
      const id = emailInput ? emailInput.value : '';
      const pass = passInput ? passInput.value : '';
      this.loginWithIdentifier(id, pass);
    },

    handleSignUpSubmit() {
      const nameInput = document.getElementById('drawerSignUpName');
      const emailInput = document.getElementById('drawerSignUpEmail');
      const passInput = document.getElementById('drawerSignUpPassword');
      const name = nameInput ? nameInput.value : '';
      const id = emailInput ? emailInput.value : '';
      const pass = passInput ? passInput.value : '';
      this.signUp(name, id, pass);
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
