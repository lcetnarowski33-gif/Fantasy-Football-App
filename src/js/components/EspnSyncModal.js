/**
 * EspnSyncModal Component
 * Modal dialog enabling users to input their ESPN League ID and cookies
 * to trigger live API synchronization and instant data override.
 */

class EspnSyncModalComponent {
  static render(mountEl) {
    if (!mountEl) return;

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
              Enter your ESPN Fantasy Football League ID below to instantly import live rosters, matchups, standings, and points.
            </p>

            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.25rem;">ESPN League ID *</label>
                <input type="text" id="espn-input-league-id" placeholder="e.g. 123456789" style="width:100%;">
              </div>

              <div>
                <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.25rem;">Season Year</label>
                <input type="number" id="espn-input-season" value="2025" style="width:100%;">
              </div>

              <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-md); border:1px dashed var(--border-color);">
                <span class="text-gold" style="font-size:0.8rem; font-weight:700; display:block; margin-bottom:0.25rem;">Private League Credentials (Optional)</span>
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
                  <input type="text" id="espn-input-swid" placeholder="SWID Cookie (e.g. {A1B2C3...})" style="width:100%; font-size:0.8rem;">
                  <input type="text" id="espn-input-s2" placeholder="espn_s2 Cookie string..." style="width:100%; font-size:0.8rem;">
                </div>
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
  }

  static open() {
    const overlay = document.getElementById('espn-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  static close() {
    const overlay = document.getElementById('espn-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  static async executeSync() {
    const leagueId = document.getElementById('espn-input-league-id').value.trim();
    const season = document.getElementById('espn-input-season').value;
    const swid = document.getElementById('espn-input-swid').value.trim();
    const espnS2 = document.getElementById('espn-input-s2').value.trim();
    const statusMsg = document.getElementById('espn-sync-status-msg');

    if (!leagueId) {
      statusMsg.style.display = 'block';
      statusMsg.style.background = 'rgba(229,45,39,0.15)';
      statusMsg.style.color = '#ef4444';
      statusMsg.innerText = 'Please enter a valid ESPN League ID.';
      return;
    }

    statusMsg.style.display = 'block';
    statusMsg.style.background = 'rgba(56,189,248,0.15)';
    statusMsg.style.color = '#38bdf8';
    statusMsg.innerText = 'Connecting to ESPN API...';

    try {
      const response = await fetch('/api/sync/espn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, season: parseInt(season), swid, espnS2 })
      });

      const resData = await response.json();

      if (resData.success) {
        statusMsg.style.background = 'rgba(0,230,118,0.15)';
        statusMsg.style.color = '#00e676';
        statusMsg.innerText = `Successfully synced "${resData.data.name}"!`;

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EspnSyncModalComponent;
}
