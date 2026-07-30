/**
 * EspnSyncModal Component
 * Modal dialog enabling users to input their ESPN League ID and cookies
 * to trigger live API synchronization and instant data override.
 */

class EspnSyncModalComponent {
  static render(mountEl) {
    if (!mountEl) return;

    const currentYear = new Date().getFullYear();

    mountEl.innerHTML = `
      <div class="modal-overlay" id="espn-modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 style="display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-solid fa-rotate text-red"></i> ESPN Fantasy API Instant Sync
            </h3>
            <button id="close-espn-modal" style="color:var(--text-secondary); font-size:1.2rem;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body">
            <p class="text-muted" style="font-size:0.875rem; margin-bottom:1rem;">
              Enter your ESPN Fantasy Football League ID or paste your full ESPN League URL below to import live rosters, matchups, and standings.
            </p>

            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.25rem;">ESPN League ID or URL *</label>
                <input type="text" id="espn-input-league-id" placeholder="e.g. 123456789 or https://fantasy.espn.com/..." style="width:100%;">
                <div class="text-muted" style="font-size:0.72rem; margin-top:0.25rem;">
                  Paste either your numeric League ID (e.g., <code>987654321</code>) or your full ESPN league web browser URL.
                </div>
              </div>

              <div>
                <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.25rem;">Season Year</label>
                <input type="number" id="espn-input-season" value="${currentYear}" style="width:100%;">
              </div>

              <div style="background:var(--bg-surface); padding:0.85rem; border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                  <span class="text-gold" style="font-size:0.8rem; font-weight:700;">
                    <i class="fa-solid fa-lock"></i> Private League Credentials (Required for Private Leagues)
                  </span>
                </div>

                <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.65rem; background:rgba(0,0,0,0.2); padding:0.5rem 0.75rem; border-radius:var(--radius-sm);">
                  <strong>How to get your cookies in 30 seconds:</strong>
                  <ol style="margin:0.25rem 0 0 1.1rem; padding:0;">
                    <li>Log into <a href="https://fantasy.espn.com" target="_blank" style="color:var(--accent-blue);">fantasy.espn.com</a></li>
                    <li>Press <strong>F12</strong> (Developer Tools) & select the <strong>Application</strong> tab (or <strong>Storage</strong> in Firefox)</li>
                    <li>Expand <strong>Cookies</strong> > <code>https://fantasy.espn.com</code></li>
                    <li>Copy the Value for <code>SWID</code> and <code>espn_s2</code> into the boxes below:</li>
                  </ol>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.15rem;">SWID Cookie</label>
                    <input type="text" id="espn-input-swid" placeholder="e.g. {A1B2C3D4-5678-90AB-CDEF-1234567890AB}" style="width:100%; font-size:0.8rem;">
                  </div>
                  <div>
                    <label style="display:block; font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.15rem;">espn_s2 Cookie</label>
                    <input type="text" id="espn-input-s2" placeholder="e.g. AEA1234567890abcdef..." style="width:100%; font-size:0.8rem;">
                  </div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(0,230,118,0.08); padding:0.6rem 0.85rem; border-radius:var(--radius-md); border:1px solid rgba(0,230,118,0.2);">
                <input type="checkbox" id="espn-save-default" checked style="width:16px; height:16px; cursor:pointer;">
                <label for="espn-save-default" style="font-size:0.8rem; font-weight:700; color:var(--accent-sleeper); cursor:pointer;">
                  Save as Global Default for All Visitors (Single-League Mode)
                </label>
              </div>

              <div id="espn-sync-status-msg" style="display:none; padding:0.75rem; border-radius:var(--radius-md); font-size:0.85rem; font-weight:600;"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" id="btn-cancel-espn">Cancel</button>
            <button class="btn-primary" id="btn-trigger-espn-sync">
              <i class="fa-solid fa-cloud-arrow-down"></i> Sync Now
            </button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = mountEl.querySelector('#close-espn-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const cancelBtn = mountEl.querySelector('#btn-cancel-espn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());

    const syncBtn = mountEl.querySelector('#btn-trigger-espn-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.executeSync());
    }

    // Auto-parse full URLs pasted into League ID field
    const leagueInput = mountEl.querySelector('#espn-input-league-id');
    if (leagueInput) {
      leagueInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.includes('espn.com') || val.includes('leagueId=')) {
          const matchId = val.match(/leagueId=(\d+)/i) || val.match(/(\d{5,})/);
          const matchSeason = val.match(/seasonId=(\d{4})/i);

          if (matchId) {
            e.target.value = matchId[1] || matchId[0];
          }
          if (matchSeason) {
            const seasonInput = mountEl.querySelector('#espn-input-season');
            if (seasonInput) seasonInput.value = matchSeason[1];
          }
        }
      });
    }
  }

  static open() {
    const overlay = document.getElementById('espn-modal-overlay');
    if (overlay) overlay.classList.add('open');

    // Pre-fill saved credentials if available
    const creds = store.getState().espnCredentials;
    if (creds) {
      const idEl = document.getElementById('espn-input-league-id');
      const seasonEl = document.getElementById('espn-input-season');
      const swidEl = document.getElementById('espn-input-swid');
      const s2El = document.getElementById('espn-input-s2');

      if (idEl && creds.leagueId) idEl.value = creds.leagueId;
      if (seasonEl && creds.season) seasonEl.value = creds.season;
      if (swidEl && creds.swid) swidEl.value = creds.swid;
      if (s2El && creds.espnS2) s2El.value = creds.espnS2;
    }
  }

  static close() {
    const overlay = document.getElementById('espn-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  static async executeSync() {
    const rawLeagueId = document.getElementById('espn-input-league-id').value.trim();
    const season = document.getElementById('espn-input-season').value;
    const swid = document.getElementById('espn-input-swid').value.trim();
    const espnS2 = document.getElementById('espn-input-s2').value.trim();
    const saveAsDefault = document.getElementById('espn-save-default')?.checked ?? true;
    const statusMsg = document.getElementById('espn-sync-status-msg');

    // Extract numeric ID if URL was submitted directly
    const matchId = rawLeagueId.match(/leagueId=(\d+)/i) || rawLeagueId.match(/(\d+)/);
    const leagueId = matchId ? matchId[1] || matchId[0] : rawLeagueId;

    if (!leagueId) {
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(229,45,39,0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Please enter a valid numeric ESPN League ID or ESPN web URL.';
      return;
    }

    statusMsg.style.display = 'block';
    statusMsg.style.background = 'rgba(56,189,248,0.15)';
    statusMsg.style.color = '#38bdf8';
    statusMsg.innerText = `Connecting to ESPN API for League #${leagueId}...`;

    try {
      const response = await fetch('/api/sync/espn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, season: parseInt(season), swid, espnS2, saveAsDefault })
      });

      const resData = await response.json();

      if (resData.success) {
        statusMsg.style.background = 'rgba(0,230,118,0.15)';
        statusMsg.style.color = '#00e676';
        statusMsg.innerText = `Successfully synced "${resData.data.name}" globally for all users!`;

        // Apply data to store
        store.applyEspnSync(resData.data, { leagueId, season, swid, espnS2 });

        setTimeout(() => {
          this.close();
        }, 1200);
      } else {
        throw new Error(resData.error || 'Failed to sync ESPN league.');
      }
    } catch (err) {
      statusMsg.style.background = 'rgba(229,45,39,0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = err.message;
    }
  }
}

if (typeof window !== 'undefined') {
  window.EspnSyncModalComponent = EspnSyncModalComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EspnSyncModalComponent;
}
