/**
 * PWA Controller Module
 * Handles Service Worker registration, install prompts for Android/Chrome (beforeinstallprompt),
 * and guided "Add to Home Screen" instructions for iOS / iPhone Safari users.
 */

class PWAController {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  get isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  get isIOS() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  get isSafari() {
    const ua = window.navigator.userAgent.toLowerCase();
    return this.isIOS && ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios');
  }

  init() {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('⚡ [PWA] Service Worker registered with scope:', registration.scope);

            // Check for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('⚡ [PWA] New version available! Activating...');
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });

      // Reload page when new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] Controller changed, updating to latest deployment...');
          window.location.reload();
        }
      });
    }

    // 2. Capture Android / Chromium install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent standard mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('📲 [PWA] captured beforeinstallprompt event');
      this.updateInstallButtons();
    });

    // 3. Track successful installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstalled = true;
      console.log('🎉 [PWA] App was successfully installed!');
      this.updateInstallButtons();
    });

    // 4. Inject iOS instructions modal container
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.injectModalContainer());
    } else {
      this.injectModalContainer();
    }
  }

  updateInstallButtons() {
    const drawerBtn = document.getElementById('drawer-btn-pwa-install');
    if (drawerBtn) {
      if (this.isStandalone) {
        drawerBtn.innerHTML = '<i class="fa-solid fa-circle-check text-green"></i> <span>Installed</span>';
        drawerBtn.classList.add('disabled');
      } else {
        drawerBtn.innerHTML = '<i class="fa-solid fa-mobile-screen-button text-gold"></i> <span>Install App</span>';
        drawerBtn.classList.remove('disabled');
      }
    }

    const headerBtn = document.getElementById('header-btn-pwa-install');
    if (headerBtn) {
      if (this.isStandalone) {
        headerBtn.style.display = 'none';
      } else {
        headerBtn.innerHTML = '<i class="fa-solid fa-download text-gold"></i>';
      }
    }
  }

  /**
   * Primary entry point when user clicks "Install App"
   */
  async promptInstall() {
    // 1. If already installed in standalone mode
    if (this.isStandalone) {
      alert('Fantasy League Analytics is already installed and running in standalone mode!');
      return;
    }

    // 2. If Android / Chromium beforeinstallprompt is ready
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        console.log('[PWA] User choice:', choice.outcome);
        this.deferredPrompt = null;
        this.updateInstallButtons();
      } catch (err) {
        console.error('[PWA] Install prompt error:', err);
      }
      return;
    }

    // 3. If on iPhone / iOS Safari
    if (this.isIOS) {
      this.openIosInstallModal();
      return;
    }

    // 4. Fallback for desktop Chrome or browsers where prompt was dismissed
    this.openGenericInstallModal();
  }

  injectModalContainer() {
    if (document.getElementById('pwa-modal-mount')) return;
    const mount = document.createElement('div');
    mount.id = 'pwa-modal-mount';
    document.body.appendChild(mount);
  }

  openIosInstallModal() {
    const mount = document.getElementById('pwa-modal-mount');
    if (!mount) return;

    mount.innerHTML = `
      <div class="decision-audit-modal-backdrop" onclick="PWA.closeModal()" style="z-index: 10000;">
        <div class="decision-audit-modal-content animate-fade-in" onclick="event.stopPropagation()" style="max-width: 420px; text-align: center; padding: 1.5rem 1.25rem;">
          <div style="width:56px; height:56px; margin:0 auto 0.75rem auto; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,230,118,0.3);">
            <img src="/icons/icon-192x192.png" alt="Fantasy App" style="width:100%; height:100%; object-fit:cover;">
          </div>

          <h3 style="margin:0 0 0.35rem 0; font-size:1.25rem; font-weight:800; color:var(--text-primary);">
            Install Fantasy App on iPhone
          </h3>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:1.25rem; line-height:1.4;">
            Install as a standalone app on your iPhone Home Screen with zero browser address bars:
          </p>

          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1rem; text-align:left; display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.25rem;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,230,118,0.15); color:var(--accent-sleeper); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; flex-shrink:0;">
                1
              </div>
              <div style="font-size:0.85rem; color:var(--text-primary);">
                Tap the <strong class="text-green"><i class="fa-solid fa-arrow-up-from-bracket"></i> Share</strong> button in Safari's bottom toolbar.
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:28px; height:28px; border-radius:50%; background:rgba(245,158,11,0.15); color:var(--accent-gold); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; flex-shrink:0;">
                2
              </div>
              <div style="font-size:0.85rem; color:var(--text-primary);">
                Scroll down and tap <strong class="text-gold"><i class="fa-regular fa-square-plus"></i> Add to Home Screen</strong>.
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,176,255,0.15); color:var(--accent-blue); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; flex-shrink:0;">
                3
              </div>
              <div style="font-size:0.85rem; color:var(--text-primary);">
                Tap <strong class="text-blue">Add</strong> in the top right corner.
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-block" onclick="PWA.closeModal()" style="width:100%; padding:0.65rem;">
            Got It!
          </button>
        </div>
      </div>
    `;
  }

  openGenericInstallModal() {
    const mount = document.getElementById('pwa-modal-mount');
    if (!mount) return;

    mount.innerHTML = `
      <div class="decision-audit-modal-backdrop" onclick="PWA.closeModal()" style="z-index: 10000;">
        <div class="decision-audit-modal-content animate-fade-in" onclick="event.stopPropagation()" style="max-width: 420px; text-align: center; padding: 1.5rem 1.25rem;">
          <div style="width:56px; height:56px; margin:0 auto 0.75rem auto; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,230,118,0.3);">
            <img src="/icons/icon-192x192.png" alt="Fantasy App" style="width:100%; height:100%; object-fit:cover;">
          </div>

          <h3 style="margin:0 0 0.35rem 0; font-size:1.25rem; font-weight:800; color:var(--text-primary);">
            Install Fantasy League Analytics
          </h3>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:1.25rem; line-height:1.4;">
            Open your browser's options menu (three dots <i class="fa-solid fa-ellipsis-vertical"></i> or the address bar install icon) and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
          </p>

          <button class="btn btn-primary btn-block" onclick="PWA.closeModal()" style="width:100%; padding:0.65rem;">
            Close
          </button>
        </div>
      </div>
    `;
  }

  closeModal() {
    const mount = document.getElementById('pwa-modal-mount');
    if (mount) mount.innerHTML = '';
  }
}

// Instantiate global PWA controller
if (typeof window !== 'undefined') {
  window.PWA = new PWAController();
}
