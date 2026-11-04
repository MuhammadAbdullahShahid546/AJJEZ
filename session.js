/**
 * AJJEZ 3-in-1 Social Super App
 * Facebook-style Login & Guest Mode Menu Engine
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

    // 3. Login with Email or Mobile Number & Password
    loginWithIdentifier(identifier, password) {
      const cleanId = (identifier || '').trim();
      const cleanPass = (password || '').trim();

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

    // 4. Create New Account
    createAccount(identifier, password) {
      let cleanId = (identifier || '').trim();
      let cleanPass = (password || '').trim();

      if (!cleanId) {
        cleanId = prompt("Enter your Email address or mobile number to create an account:");
        if (!cleanId || !cleanId.trim()) return;
        cleanId = cleanId.trim();
      }

      if (!cleanPass) {
        cleanPass = prompt("Choose a password for your new account:");
        if (!cleanPass || !cleanPass.trim()) return;
        cleanPass = cleanPass.trim();
      }

      const username = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);

      const session = {
        type: 'user',
        email: cleanId,
        name: displayName,
        id: 'user_' + Date.now(),
        badge: 'New Member',
        avatar: '👤'
      };

      this.setSession(session);
      alert(`Account created successfully for ${displayName}! Welcome to AJJEZ.`);
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

    // 6. Logout
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      this.renderDrawerAuth();
      this.dispatchSessionChange(null);
    },

    // 7. Notify listeners
    dispatchSessionChange(session) {
      window.dispatchEvent(new CustomEvent('ajjez_session_change', { detail: session }));
    },

    // 8. Render Facebook-styled Form & Guest Option inside Menu Drawer
    renderDrawerAuth() {
      const container = document.getElementById('drawerAuthCard');
      if (!container) return;

      const session = this.getSession();

      if (!session) {
        // Facebook-style Auth Form matching user's screenshot
        container.innerHTML = `
          <div class="p-4 rounded-2xl bg-card border border-border/90 shadow-xl space-y-3">
            
            <!-- Email address or mobile number input -->
            <div>
              <input 
                type="text" 
                id="drawerInputEmail" 
                placeholder="Email address or mobile number" 
                class="w-full h-10 bg-background border border-border focus:border-[#1877F2] rounded-xl px-3.5 text-xs text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
              >
            </div>

            <!-- Password input -->
            <div>
              <input 
                type="password" 
                id="drawerInputPassword" 
                placeholder="Password" 
                class="w-full h-10 bg-background border border-border focus:border-[#1877F2] rounded-xl px-3.5 text-xs text-foreground placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                onkeydown="if(event.key === 'Enter') window.AJJEZ_SESSION.handleFormSubmit()"
              >
            </div>

            <!-- Log in (Facebook blue button) -->
            <button 
              type="button" 
              onclick="window.AJJEZ_SESSION.handleFormSubmit()" 
              class="w-full h-10 rounded-xl bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-[0.98]"
            >
              Log in
            </button>

            <!-- Forgotten password? link -->
            <div class="text-center pt-0.5 pb-0.5">
              <button 
                type="button" 
                onclick="alert('To reset your password, contact admin via the Contact page or continue as Guest.')" 
                class="text-xs text-[#1877F2] hover:underline font-medium cursor-pointer"
              >
                Forgotten password?
              </button>
            </div>

            <!-- Create new account (Blue outlined button) -->
            <button 
              type="button" 
              onclick="window.AJJEZ_SESSION.handleCreateAccountPrompt()" 
              class="w-full h-9 rounded-full sm:rounded-xl border border-[#1877F2] hover:bg-[#1877F2]/10 text-[#1877F2] font-semibold text-xs tracking-wide transition-all flex items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              Create new account
            </button>

            <!-- Guest Option Right Below (as requested: 'is tarha se or iske neecha guest ka aption') -->
            <div class="pt-2 border-t border-border/80">
              <button 
                type="button" 
                onclick="window.AJJEZ_SESSION.handleGuestClick()" 
                class="w-full h-9 rounded-full sm:rounded-xl border border-border hover:border-lightGreen bg-evergreen/70 hover:bg-evergreen text-tea hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group active:scale-[0.98]"
              >
                <span class="text-sm">👤</span>
                <span>Continue as Guest</span>
                <span class="text-[10px] text-lightGreen font-mono group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>

          </div>
        `;
      } else {
        // Active User / Guest Profile Card
        const isGuest = session.type === 'guest';
        container.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-evergreen/80 border border-sage/50 shadow-md space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="size-9 rounded-xl bg-background border-2 border-lightGreen/60 flex items-center justify-center text-sm font-bold shrink-0">
                  ${isGuest ? '👤' : '✓'}
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
                title="Log out and return to login form"
              >
                Log out
              </button>
            </div>
            <div class="text-[10px] text-mutedOlive font-mono truncate border-t border-sage/30 pt-1.5 flex items-center justify-between">
              <span class="truncate max-w-[170px]">${session.email || session.id}</span>
              <span class="text-lightGreen">Active</span>
            </div>
          </div>
        `;
      }
    },

    handleFormSubmit() {
      const emailInput = document.getElementById('drawerInputEmail');
      const passInput = document.getElementById('drawerInputPassword');
      const id = emailInput ? emailInput.value : '';
      const pass = passInput ? passInput.value : '';
      this.loginWithIdentifier(id, pass);
    },

    handleCreateAccountPrompt() {
      const emailInput = document.getElementById('drawerInputEmail');
      const passInput = document.getElementById('drawerInputPassword');
      const id = emailInput ? emailInput.value : '';
      const pass = passInput ? passInput.value : '';
      this.createAccount(id, pass);
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
