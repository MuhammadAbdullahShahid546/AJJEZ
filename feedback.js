/**
 * AJJEZ 3-in-1 Social Super App
 * 2-Minute Interactive Star Rating & Feedback System
 */

(function () {
  const FEEDBACK_STORAGE_KEY = 'ajjez_feedback_completed';
  const SESSION_START_KEY = 'ajjez_session_start_time';
  const TWO_MINUTES_MS = 2 * 60 * 1000; // 120,000 ms

  let selectedRating = 5;

  window.AJJEZ_FEEDBACK = {
    // 1. Initialize timer
    init() {
      // If user has already given feedback or dismissed it, do not show
      if (localStorage.getItem(FEEDBACK_STORAGE_KEY)) {
        return;
      }

      // Track session start time across page navigations in sessionStorage
      let startTime = sessionStorage.getItem(SESSION_START_KEY);
      if (!startTime) {
        startTime = Date.now().toString();
        sessionStorage.setItem(SESSION_START_KEY, startTime);
      }

      const elapsed = Date.now() - parseInt(startTime, 10);
      const remainingTime = Math.max(0, TWO_MINUTES_MS - elapsed);

      // Trigger modal after remaining time
      setTimeout(() => {
        if (!localStorage.getItem(FEEDBACK_STORAGE_KEY)) {
          this.showModal();
        }
      }, remainingTime);
    },

    // 2. Open Modal
    showModal() {
      // Remove any existing modal first
      const existing = document.getElementById('ajjezFeedbackModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'ajjezFeedbackModal';
      modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300 opacity-0';

      modal.innerHTML = `
        <div class="relative w-full max-w-md rounded-3xl border border-sage/50 bg-card/95 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl transition-all duration-300 transform scale-95 overflow-hidden text-center">
          
          <!-- Subtle Glow Atmosphere -->
          <div class="absolute -top-20 left-1/2 -translate-x-1/2 size-44 bg-lightGreen/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Top-Right Close Cross Button (As requested by user: 'upper side cross ka option de dena') -->
          <button 
            type="button" 
            onclick="AJJEZ_FEEDBACK.close()" 
            class="absolute top-4 right-4 p-2 rounded-xl text-mutedOlive hover:text-white hover:bg-muted transition-colors cursor-pointer" 
            title="Close"
          >
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Header -->
          <div class="space-y-2 pb-4">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sage/40 bg-evergreen text-xs font-mono text-tea mx-auto shadow-sm">
              <span>⭐</span>
              <span>2-Minute Experience</span>
            </div>
            <h3 class="text-xl font-extrabold text-foreground tracking-tight">How is your AJJEZ experience?</h3>
            <p class="text-xs text-mutedOlive max-w-xs mx-auto">
              You've been exploring AJJEZ! How would you rate the 3-in-1 Super App?
            </p>
          </div>

          <!-- 5 Clickable Stars -->
          <div class="py-3 space-y-2">
            <div class="flex items-center justify-center gap-2" id="feedbackStarsContainer">
              ${[1, 2, 3, 4, 5].map(star => `
                <button 
                  type="button" 
                  data-star="${star}" 
                  onclick="AJJEZ_FEEDBACK.setRating(${star})" 
                  onmouseenter="AJJEZ_FEEDBACK.hoverRating(${star})" 
                  onmouseleave="AJJEZ_FEEDBACK.renderStars()"
                  class="text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none cursor-pointer text-amber-400"
                >
                  ★
                </button>
              `).join('')}
            </div>
            <div id="feedbackRatingLabel" class="text-xs font-mono font-semibold text-lightGreen">
              Excellent! Loved it! 🌟
            </div>
          </div>

          <!-- Optional Feedback Textarea -->
          <div class="pt-2 text-left space-y-1.5">
            <label class="block text-xs font-mono font-medium text-tea">What's your feedback? (Optional)</label>
            <textarea 
              id="feedbackModalComments" 
              rows="3" 
              placeholder="Tell us what you liked or how we can improve..." 
              class="w-full bg-background border border-border focus:border-lightGreen rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder-zinc-500 focus:outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 space-y-2">
            <button 
              type="button" 
              id="feedbackSubmitBtn"
              onclick="AJJEZ_FEEDBACK.submit()" 
              class="w-full py-3 rounded-full bg-sage hover:bg-sage/90 text-white font-bold text-sm shadow-lg shadow-sage/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Feedback</span>
              <span>✨</span>
            </button>
            <p class="text-[10px] text-mutedOlive">Takes less than 10 seconds</p>
          </div>

        </div>
      `;

      document.body.appendChild(modal);

      // Animate in
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.transform').classList.remove('scale-95');
      }, 10);

      this.setRating(5);
    },

    // 3. Star Hover & Selection
    hoverRating(starCount) {
      this.updateStarsUI(starCount);
    },

    setRating(starCount) {
      selectedRating = starCount;
      this.updateStarsUI(starCount);
    },

    renderStars() {
      this.updateStarsUI(selectedRating);
    },

    updateStarsUI(rating) {
      const labels = {
        1: "Needs Improvement 😞",
        2: "Fair 😐",
        3: "Good 🙂",
        4: "Very Good! 😊",
        5: "Excellent! Loved it! 🌟"
      };

      const container = document.getElementById('feedbackStarsContainer');
      const label = document.getElementById('feedbackRatingLabel');

      if (container) {
        container.querySelectorAll('button').forEach((btn, index) => {
          const starNum = index + 1;
          if (starNum <= rating) {
            btn.className = "text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none cursor-pointer text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]";
          } else {
            btn.className = "text-3xl sm:text-4xl transition-transform hover:scale-125 focus:outline-none cursor-pointer text-zinc-600";
          }
        });
      }

      if (label) {
        label.textContent = labels[rating] || "Good";
      }
    },

    // 4. Close via Cross Button
    close() {
      const modal = document.getElementById('ajjezFeedbackModal');
      if (!modal) return;

      modal.classList.add('opacity-0');
      modal.querySelector('.transform').classList.add('scale-95');
      setTimeout(() => {
        modal.remove();
      }, 300);

      // Mark as dismissed so user isn't disturbed repeatedly
      localStorage.setItem(FEEDBACK_STORAGE_KEY, 'dismissed_' + Date.now());
    },

    // 5. Submit to Formspree
    async submit() {
      const btn = document.getElementById('feedbackSubmitBtn');
      const commentInput = document.getElementById('feedbackModalComments');
      const comments = commentInput ? commentInput.value.trim() : '';

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Submitting...</span>`;
      }

      // Check current session identity if logged in
      const session = (window.AJJEZ_SESSION && window.AJJEZ_SESSION.getSession()) || { name: 'Anonymous Visitor', email: 'N/A' };

      const payload = {
        _subject: `AJJEZ 2-Min Feedback: ${selectedRating} Stars from ${session.name}`,
        rating: `${selectedRating} / 5 Stars`,
        feedback: comments || 'No written comment provided',
        userName: session.name,
        userEmail: session.email,
        timestamp: new Date().toISOString()
      };

      try {
        await fetch("https://formspree.io/f/myeeopbg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Feedback dispatch:", err);
      }

      localStorage.setItem(FEEDBACK_STORAGE_KEY, 'submitted_' + Date.now());

      if (btn) {
        btn.className = "w-full py-3 rounded-full bg-evergreen border border-sage/60 text-lightGreen font-bold text-sm flex items-center justify-center gap-2";
        btn.innerHTML = `<span>Thank you for your feedback! ❤️</span>`;
      }

      setTimeout(() => {
        this.close();
      }, 1600);
    }
  };

  // Auto-boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AJJEZ_FEEDBACK.init());
  } else {
    window.AJJEZ_FEEDBACK.init();
  }
})();
