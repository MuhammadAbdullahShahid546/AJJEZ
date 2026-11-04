/**
 * AJJEZ 3-in-1 Super App - Authentication & Guest Access Engine
 * Handles User Account Creation, Guest Mode, and Profile Switching across Facebook, YouTube & WhatsApp
 */

(function () {
  const STORAGE_KEY = 'ajjez_user_identity';

  // Founder Profile Definition
  const FOUNDER_PROFILE = {
    id: 'founder_abdullah',
    name: 'Muhammad Abdullah Shahid',
    username: '@abdullah',
    isGuest: false,
    isFounder: true,
    avatar: 'profile.jpg',
    avatarType: 'image',
    badge: 'Founder & CEO',
    bio: 'Founder of AJJEZ - The 3-in-1 Social Super App'
  };

  // Default Guest Profile
  const GUEST_PROFILE = {
    id: 'guest_explorer',
    name: 'Guest Explorer',
    username: '@guest',
    isGuest: true,
    isFounder: false,
    avatar: '👤',
    avatarType: 'emoji',
    badge: 'Guest Preview',
    bio: 'Exploring AJJEZ 3-in-1 Super App'
  };

  window.AJJEZ_AUTH = {
    FOUNDER: FOUNDER_PROFILE,
    GUEST: GUEST_PROFILE,

    // 1. Get Current Logged In User
    getUser() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Error reading AJJEZ user identity:", e);
      }
      return null;
    },

    // 2. Set Current User
    setUser(userObj) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
        this.updatePageUI();
        this.dispatchUserChange(userObj);
      } catch (e) {
        console.error("Error saving AJJEZ user identity:", e);
      }
    },

    // 3. Create Free Custom Account
    createAccount(fullName, username, avatarEmoji = '🚀') {
      const cleanName = (fullName || '').trim() || 'Community Member';
      let cleanUsername = (username || '').trim();
      if (!cleanUsername.startsWith('@')) {
        cleanUsername = '@' + (cleanUsername || cleanName.toLowerCase().replace(/\s+/g, ''));
      }

      const newUser = {
        id: 'user_' + Date.now(),
        name: cleanName,
        username: cleanUsername,
        isGuest: false,
        isFounder: false,
        avatar: avatarEmoji,
        avatarType: 'emoji',
        badge: 'Verified Member',
        bio: 'AJJEZ Community Pioneer',
        createdAt: new Date().toISOString()
      };

      this.setUser(newUser);
      this.closeModal();
      this.showToast(`Welcome, ${cleanName}! Account created successfully 🎉`);
    },

    // 4. Continue as Guest (Requested by user)
    continueAsGuest() {
      const guestUser = {
        ...GUEST_PROFILE,
        id: 'guest_' + Math.floor(Math.random() * 8999 + 1000),
        username: '@guest_' + Math.floor(Math.random() * 899 + 100),
      };
      this.setUser(guestUser);
      this.closeModal();
      this.showToast("Browsing as Guest. You can explore all 3 platforms freely! 👁️");
    },

    // 5. Switch to Founder
    loginAsFounder() {
      this.setUser(FOUNDER_PROFILE);
      this.closeModal();
      this.showToast("Welcome back, Abdullah! Founder mode active 👑");
    },

    // 6. Sign Out / Reset
    logout() {
      localStorage.removeItem(STORAGE_KEY);
      this.openModal();
      this.showToast("Signed out. Please create an account or continue as Guest.");
    },

    // 7. Modal Control
    openModal() {
      let modal = document.getElementById('ajjezAuthModal');
      if (!modal) {
        this.injectAuthModal();
        modal = document.getElementById('ajjezAuthModal');
      }
      if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
          const backdrop = modal.querySelector('.auth-backdrop');
          const card = modal.querySelector('.auth-card');
          if (backdrop) backdrop.classList.remove('opacity-0');
          if (card) card.classList.remove('opacity-0', 'scale-95');
        }, 10);
      }
    },

    closeModal() {
      const modal = document.getElementById('ajjezAuthModal');
      if (!modal) return;
      const backdrop = modal.querySelector('.auth-backdrop');
      const card = modal.querySelector('.auth-card');
      if (backdrop) backdrop.classList.add('opacity-0');
      if (card) card.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    },

    // 8. Custom Toast Notification
    showToast(message) {
      let container = document.getElementById('ajjezToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'ajjezToastContainer';
        container.className = 'fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-evergreen border border-sage/60 text-white text-xs sm:text-sm font-medium shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0';
      toast.innerHTML = `
        <span class="size-2 rounded-full bg-lightGreen animate-ping shrink-0"></span>
        <span>${message}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    // 9. Dispatch custom event when user changes
    dispatchUserChange(user) {
      window.dispatchEvent(new CustomEvent('ajjez_user_changed', { detail: user }));
    },

    // 10. Sync UI elements across the page
    updatePageUI() {
      let user = this.getUser();
      if (!user) {
        // If not set yet, automatically default to guest preview or show modal
        return;
      }

      // Sync name elements
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = user.name;
      });

      // Sync username elements
      document.querySelectorAll('[data-user-handle]').forEach(el => {
        el.textContent = user.username;
      });

      // Sync badge elements
      document.querySelectorAll('[data-user-badge]').forEach(el => {
        el.textContent = user.badge;
      });

      // Sync avatar elements
      document.querySelectorAll('[data-user-avatar]').forEach(el => {
        if (user.avatarType === 'image') {
          el.innerHTML = `<img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover rounded-full">`;
        } else {
          el.innerHTML = `<span class="flex items-center justify-center w-full h-full text-base sm:text-lg">${user.avatar || '👤'}</span>`;
        }
      });

      // Update Nav User Button if exists
      const navBtn = document.getElementById('navUserAuthBtn');
      if (navBtn) {
        if (user.isGuest) {
          navBtn.innerHTML = `
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-zinc-700 bg-card hover:border-sage transition-all cursor-pointer">
              <span class="text-xs">👤</span>
              <span class="text-[11px] font-mono text-zinc-300 hidden sm:inline">Guest</span>
              <span class="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded-full hidden md:inline">Preview</span>
            </div>
          `;
        } else if (user.isFounder) {
          navBtn.innerHTML = `
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-lightGreen/50 bg-evergreen hover:border-lightGreen transition-all cursor-pointer shadow-[0_0_15px_rgba(172,236,161,0.2)]">
              <div class="size-5 rounded-full overflow-hidden bg-black shrink-0">
                <img src="${user.avatar}" class="w-full h-full object-cover">
              </div>
              <span class="text-[11px] font-mono font-semibold text-lightGreen hidden sm:inline">Abdullah</span>
              <span class="text-[9px] font-mono uppercase bg-lightGreen text-evergreen font-bold px-1.5 py-0.2 rounded-full">Founder</span>
            </div>
          `;
        } else {
          navBtn.innerHTML = `
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-sage/50 bg-card hover:border-lightGreen transition-all cursor-pointer">
              <span class="text-xs">${user.avatar}</span>
              <span class="text-[11px] font-semibold text-white max-w-[90px] truncate hidden sm:inline">${user.name}</span>
            </div>
          `;
        }
      }
    },

    // 11. Inject Auth Modal HTML into DOM
    injectAuthModal() {
      if (document.getElementById('ajjezAuthModal')) return;

      const modalHtml = `
      <div id="ajjezAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 hidden">
        <!-- Backdrop -->
        <div class="auth-backdrop fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 opacity-0" onclick="AJJEZ_AUTH.closeModal()"></div>

        <!-- Auth Card -->
        <div class="auth-card relative z-10 w-full max-w-md rounded-3xl border border-sage/40 bg-card/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300 transform opacity-0 scale-95 overflow-hidden">
          
          <!-- Subtle Glow Atmosphere -->
          <div class="absolute -top-24 left-1/2 -translate-x-1/2 size-48 bg-lightGreen/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close Button -->
          <button onclick="AJJEZ_AUTH.closeModal()" class="absolute top-4 right-4 p-2 rounded-xl text-mutedOlive hover:text-white hover:bg-muted transition-colors cursor-pointer" title="Close">
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="text-center space-y-3 pb-6 border-b border-border">
            <div class="inline-flex size-12 rounded-2xl border border-sage/50 bg-black p-1 shadow-lg shadow-sage/20 mx-auto">
              <img src="logo.png?v=aajez" alt="AJJEZ Logo" class="w-full h-full object-cover rounded-xl">
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Join AJJEZ Super App</h2>
              <p class="text-xs text-mutedOlive mt-1 leading-relaxed">
                Connect on <strong class="text-[#1877F2]">Facebook</strong>, watch on <strong class="text-[#FF0000]">YouTube</strong>, and chat on <strong class="text-[#25D366]">WhatsApp</strong>.
              </p>
            </div>
          </div>

          <!-- Account Creation Form -->
          <div class="pt-5 space-y-4">
            <div>
              <label class="block text-xs font-mono font-medium text-tea mb-1.5">Your Full Name</label>
              <input type="text" id="authInputName" placeholder="e.g. Ali Khan" class="w-full bg-background border border-border focus:border-lightGreen rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-lightGreen transition-all">
            </div>

            <div>
              <label class="block text-xs font-mono font-medium text-tea mb-1.5">Choose Username</label>
              <div class="relative">
                <input type="text" id="authInputUsername" placeholder="e.g. alikhan" class="w-full bg-background border border-border focus:border-lightGreen rounded-xl pl-8 pr-4 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-lightGreen transition-all font-mono">
                <span class="absolute left-3 top-2.5 text-mutedOlive font-mono text-sm">@</span>
              </div>
            </div>

            <!-- Avatar Emoji Selector -->
            <div>
              <label class="block text-xs font-mono font-medium text-mutedOlive mb-1.5">Select Profile Avatar</label>
              <div class="grid grid-cols-6 gap-2">
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '🚀')" class="avatar-option size-10 rounded-xl border-2 border-lightGreen bg-evergreen text-lg flex items-center justify-center transition-all cursor-pointer">🚀</button>
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '⚡')" class="avatar-option size-10 rounded-xl border border-border bg-background hover:border-sage text-lg flex items-center justify-center transition-all cursor-pointer">⚡</button>
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '🦁')" class="avatar-option size-10 rounded-xl border border-border bg-background hover:border-sage text-lg flex items-center justify-center transition-all cursor-pointer">🦁</button>
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '🎮')" class="avatar-option size-10 rounded-xl border border-border bg-background hover:border-sage text-lg flex items-center justify-center transition-all cursor-pointer">🎮</button>
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '👑')" class="avatar-option size-10 rounded-xl border border-border bg-background hover:border-sage text-lg flex items-center justify-center transition-all cursor-pointer">👑</button>
                <button type="button" onclick="AJJEZ_AUTH.selectAvatar(this, '💎')" class="avatar-option size-10 rounded-xl border border-border bg-background hover:border-sage text-lg flex items-center justify-center transition-all cursor-pointer">💎</button>
              </div>
            </div>

            <!-- Submit Button (Create Account) -->
            <button onclick="AJJEZ_AUTH.handleCreateSubmit()" class="w-full py-3 rounded-full bg-sage hover:bg-sage/90 text-white font-bold text-sm shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
              <span>Create Free Account & Enter</span>
              <span>✨</span>
            </button>

            <!-- Divider -->
            <div class="relative flex items-center justify-center my-3">
              <div class="border-t border-border w-full"></div>
              <span class="bg-card px-3 text-[10px] font-mono text-mutedOlive uppercase tracking-wider relative z-10">or explore instantly</span>
            </div>

            <!-- GUEST ACCESS ACTION (As requested by User) -->
            <button onclick="AJJEZ_AUTH.continueAsGuest()" class="w-full py-2.5 rounded-full border border-zinc-700 bg-background hover:bg-muted/70 hover:border-mutedOlive text-zinc-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group">
              <span class="text-sm">👁️</span>
              <span>Continue as Guest (No Account Required)</span>
              <span class="text-mutedOlive group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
            <p class="text-[10px] text-center text-mutedOlive">
              Guest access gives you instant preview of Facebook, YouTube & WhatsApp.
            </p>

            <!-- Founder Sign In Option -->
            <div class="pt-2 text-center border-t border-border/60">
              <button onclick="AJJEZ_AUTH.loginAsFounder()" class="text-[11px] font-mono text-lightGreen/80 hover:text-lightGreen hover:underline transition-colors cursor-pointer">
                👑 Are you Muhammad Abdullah Shahid? Log in as Founder
              </button>
            </div>

          </div>

        </div>
      </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = modalHtml;
      document.body.appendChild(wrapper.firstElementChild);
    },

    selectAvatar(btn, emoji) {
      document.querySelectorAll('.avatar-option').forEach(b => {
        b.classList.remove('border-2', 'border-lightGreen', 'bg-evergreen');
        b.classList.add('border', 'border-border', 'bg-background');
      });
      btn.classList.remove('border', 'border-border', 'bg-background');
      btn.classList.add('border-2', 'border-lightGreen', 'bg-evergreen');
      this._selectedAvatar = emoji;
    },

    handleCreateSubmit() {
      const nameInput = document.getElementById('authInputName');
      const usernameInput = document.getElementById('authInputUsername');
      const name = nameInput ? nameInput.value.trim() : '';
      const username = usernameInput ? usernameInput.value.trim() : '';

      if (!name) {
        alert("Please enter your name to create your account.");
        if (nameInput) nameInput.focus();
        return;
      }

      this.createAccount(name, username, this._selectedAvatar || '🚀');
    },

    // 12. Initialization
    init() {
      this._selectedAvatar = '🚀';
      this.injectAuthModal();

      const currentUser = this.getUser();
      if (!currentUser) {
        // First-time visitor: open the Auth / Guest Modal after slight delay
        setTimeout(() => {
          this.openModal();
        }, 800);
      } else {
        this.updatePageUI();
      }
    }
  };

  // Auto-boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AJJEZ_AUTH.init());
  } else {
    window.AJJEZ_AUTH.init();
  }
})();
