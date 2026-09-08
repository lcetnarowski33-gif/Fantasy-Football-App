# Mobile Compact Design Rule (ESPN / Sleeper Style)

Always design and format mobile views (<768px and <480px) to be dense, compact, and glanceable, directly mirroring professional sports applications like ESPN Fantasy and Sleeper:

1. **Height Budget & Segmented Navigation**:
   - Never stack multiple full-league tables and full multi-game feeds in a single monolithic column on mobile.
   - Use segmented tab switchers (e.g. `[ 🏆 Standings | ⚔️ Matchups | ⚡ Power Rankings | 📜 Activity ]`) so each section fits on a single phone screen without endless scrolling.
   - On Team Hubs, make the Roster the primary active sub-tab, keeping efficiency and analytics in adjacent sub-tabs rather than stacking 14 metric boxes above the roster.

2. **Compact Typography & Hierarchy**:
   - Mobile base font size: `html { font-size: 13px - 14px; }`.
   - Primary data/team names: `12px - 13px` (`0.8rem - 0.85rem`).
   - Stat values: `14px - 15px` (`0.95rem - 1.05rem`, bold) rather than giant 24px-28px desktop fonts.
   - Labels and subtext: `10px - 11px` (`0.68rem - 0.72rem`).

3. **Compact Tables & Frozen First Column**:
   - Row heights must be tight (`32px - 36px`).
   - A 10-team league standings table must fit in ~350px of vertical space.
   - Always freeze the first column (Team / Player Name) with `position: sticky; left: 0;` so horizontal swiping never loses track of the entity.

4. **Slim Headers & Low Margins**:
   - Mobile card paddings: `0.4rem - 0.6rem`.
   - Section margins: `0.4rem - 0.6rem`.
   - Compact top navbar (~44px) so content is immediately visible above the fold.
