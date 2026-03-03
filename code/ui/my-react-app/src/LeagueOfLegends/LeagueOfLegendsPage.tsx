import { useState, useMemo } from 'react';

/* ──────────────────  STATIC DATA  ────────────────── */

const ROLES = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const TIER_COLORS = {
  S: '#ff4655',
  A: '#ff8c00',
  B: '#f5c542',
  C: '#4ea8de',
  D: '#8a8a8a',
};

const TIER_LABELS = {
  S: 'S — OP / Must Ban',
  A: 'A — Strong Pick',
  B: 'B — Solid / Reliable',
  C: 'C — Situational',
  D: 'D — Weak / Off-meta',
};

const META_CHAMPIONS = [
  { name: "K'Sante",    role: 'Top',     tier: 'S', winRate: 52.4, pickRate: 14.2, banRate: 38.5 },
  { name: 'Ambessa',    role: 'Top',     tier: 'S', winRate: 53.1, pickRate: 11.8, banRate: 42.1 },
  { name: 'Yone',       role: 'Mid',     tier: 'S', winRate: 51.8, pickRate: 18.3, banRate: 35.7 },
  { name: 'Aurora',     role: 'Mid',     tier: 'S', winRate: 52.9, pickRate: 13.5, banRate: 40.2 },
  { name: 'Viego',      role: 'Jungle',  tier: 'S', winRate: 52.1, pickRate: 15.7, banRate: 28.3 },
  { name: 'Rek\'Sai',   role: 'Jungle',  tier: 'A', winRate: 51.6, pickRate: 8.4,  banRate: 12.1 },
  { name: 'Lee Sin',    role: 'Jungle',  tier: 'A', winRate: 50.3, pickRate: 16.9, banRate: 14.5 },
  { name: 'Jinx',       role: 'ADC',     tier: 'S', winRate: 52.7, pickRate: 17.1, banRate: 22.6 },
  { name: 'Kai\'Sa',    role: 'ADC',     tier: 'A', winRate: 51.2, pickRate: 19.4, banRate: 10.3 },
  { name: 'Jhin',       role: 'ADC',     tier: 'A', winRate: 51.5, pickRate: 14.8, banRate: 5.2 },
  { name: 'Thresh',     role: 'Support', tier: 'S', winRate: 52.0, pickRate: 12.6, banRate: 18.9 },
  { name: 'Nautilus',   role: 'Support', tier: 'A', winRate: 51.8, pickRate: 10.2, banRate: 15.4 },
  { name: 'Lulu',       role: 'Support', tier: 'A', winRate: 51.3, pickRate: 11.1, banRate: 7.8 },
  { name: 'Aatrox',     role: 'Top',     tier: 'A', winRate: 50.9, pickRate: 10.5, banRate: 11.7 },
  { name: 'Garen',      role: 'Top',     tier: 'B', winRate: 50.5, pickRate: 8.1,  banRate: 3.4 },
  { name: 'Darius',     role: 'Top',     tier: 'B', winRate: 50.2, pickRate: 7.6,  banRate: 9.8 },
  { name: 'Ahri',       role: 'Mid',     tier: 'A', winRate: 51.0, pickRate: 12.4, banRate: 6.3 },
  { name: 'Syndra',     role: 'Mid',     tier: 'B', winRate: 49.8, pickRate: 7.9,  banRate: 4.5 },
  { name: 'Zed',        role: 'Mid',     tier: 'B', winRate: 49.5, pickRate: 11.2, banRate: 22.1 },
  { name: 'Elise',      role: 'Jungle',  tier: 'B', winRate: 50.1, pickRate: 5.3,  banRate: 2.9 },
  { name: 'Amumu',      role: 'Jungle',  tier: 'C', winRate: 49.2, pickRate: 4.1,  banRate: 1.2 },
  { name: 'Ezreal',     role: 'ADC',     tier: 'B', winRate: 49.6, pickRate: 15.2, banRate: 3.1 },
  { name: 'Aphelios',   role: 'ADC',     tier: 'C', winRate: 48.5, pickRate: 6.7,  banRate: 2.4 },
  { name: 'Yuumi',      role: 'Support', tier: 'D', winRate: 46.8, pickRate: 4.3,  banRate: 12.6 },
  { name: 'Sona',       role: 'Support', tier: 'C', winRate: 49.0, pickRate: 3.8,  banRate: 1.1 },
  { name: 'Gwen',       role: 'Top',     tier: 'C', winRate: 48.9, pickRate: 5.6,  banRate: 4.2 },
  { name: 'Azir',       role: 'Mid',     tier: 'C', winRate: 47.8, pickRate: 4.2,  banRate: 2.0 },
  { name: 'Nidalee',    role: 'Jungle',  tier: 'D', winRate: 47.1, pickRate: 3.5,  banRate: 0.8 },
  { name: 'Sivir',      role: 'ADC',     tier: 'D', winRate: 47.5, pickRate: 3.1,  banRate: 0.5 },
  { name: 'Rell',       role: 'Support', tier: 'B', winRate: 50.4, pickRate: 6.9,  banRate: 3.7 },
];

const INITIAL_SCOREBOARD = [
  { id: 1,  team: 'Blue', player: 'OrnnMain99',   champion: "K'Sante",  kills: 3,  deaths: 1, assists: 7,  cs: 214, gold: 11200, role: 'Top' },
  { id: 2,  team: 'Blue', player: 'JglDiff',      champion: 'Viego',    kills: 8,  deaths: 2, assists: 10, cs: 178, gold: 13500, role: 'Jungle' },
  { id: 3,  team: 'Blue', player: 'MidGap',       champion: 'Yone',     kills: 12, deaths: 3, assists: 5,  cs: 248, gold: 15200, role: 'Mid' },
  { id: 4,  team: 'Blue', player: 'CritLord',     champion: 'Jinx',     kills: 9,  deaths: 4, assists: 8,  cs: 232, gold: 14100, role: 'ADC' },
  { id: 5,  team: 'Blue', player: 'HookCity',     champion: 'Thresh',   kills: 1,  deaths: 2, assists: 18, cs: 42,  gold: 8200,  role: 'Support' },
  { id: 6,  team: 'Red',  player: 'TopDiffWins',  champion: 'Aatrox',   kills: 5,  deaths: 4, assists: 3,  cs: 198, gold: 10800, role: 'Top' },
  { id: 7,  team: 'Red',  player: 'MonkeyKing42', champion: 'Lee Sin',  kills: 4,  deaths: 6, assists: 9,  cs: 156, gold: 10200, role: 'Jungle' },
  { id: 8,  team: 'Red',  player: 'Faker2',       champion: 'Ahri',     kills: 6,  deaths: 5, assists: 4,  cs: 221, gold: 11900, role: 'Mid' },
  { id: 9,  team: 'Red',  player: 'PewPew',       champion: 'Kai\'Sa', kills: 7,  deaths: 5, assists: 3,  cs: 219, gold: 12400, role: 'ADC' },
  { id: 10, team: 'Red',  player: 'WardBot',      champion: 'Nautilus', kills: 0,  deaths: 7, assists: 12, cs: 38,  gold: 7100,  role: 'Support' },
];

/* ──────────────────  COMPONENTS  ────────────────── */

function TierBadge({ tier }) {
  return (
    <span
      className="lol-tier-badge"
      style={{ background: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}

function Scoreboard({ players }) {
  const [sortKey, setSortKey] = useState('team');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return copy;
  }, [players, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(key === 'team' || key === 'player'); }
  };

  const cols = [
    { key: 'team', label: 'Team' },
    { key: 'role', label: 'Role' },
    { key: 'player', label: 'Player' },
    { key: 'champion', label: 'Champion' },
    { key: 'kills', label: 'K' },
    { key: 'deaths', label: 'D' },
    { key: 'assists', label: 'A' },
    { key: 'cs', label: 'CS' },
    { key: 'gold', label: 'Gold' },
  ];

  return (
    <div className="lol-table-wrap">
      <table className="lol-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                onClick={() => handleSort(c.key)}
                className={sortKey === c.key ? 'lol-sorted' : ''}
              >
                {c.label}
                {sortKey === c.key && (
                  <span className="lol-sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className={`lol-row-${p.team.toLowerCase()}`}>
              <td>
                <span className={`lol-team-dot lol-team-${p.team.toLowerCase()}`} />
                {p.team}
              </td>
              <td>{p.role}</td>
              <td className="lol-player-name">{p.player}</td>
              <td>{p.champion}</td>
              <td className="lol-stat">{p.kills}</td>
              <td className="lol-stat lol-deaths">{p.deaths}</td>
              <td className="lol-stat">{p.assists}</td>
              <td className="lol-stat">{p.cs}</td>
              <td className="lol-stat">{p.gold.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TierList({ champions, roleFilter }) {
  const filtered = useMemo(
    () => (roleFilter === 'All' ? champions : champions.filter((c) => c.role === roleFilter)),
    [champions, roleFilter],
  );

  const grouped = useMemo(() => {
    const groups = {};
    for (const c of filtered) {
      (groups[c.tier] ||= []).push(c);
    }
    // Sort within each tier by winRate desc
    for (const tier of Object.keys(groups)) {
      groups[tier].sort((a, b) => b.winRate - a.winRate);
    }
    return groups;
  }, [filtered]);

  const tierOrder = ['S', 'A', 'B', 'C', 'D'];

  return (
    <div className="lol-tier-list">
      {tierOrder.map(
        (tier) =>
          grouped[tier] && (
            <div className="lol-tier-section" key={tier}>
              <div className="lol-tier-header" style={{ borderColor: TIER_COLORS[tier] }}>
                <TierBadge tier={tier} />
                <span className="lol-tier-label">{TIER_LABELS[tier]}</span>
              </div>
              <div className="lol-tier-champs">
                {grouped[tier].map((c) => (
                  <div className="lol-champ-card" key={c.name}>
                    <div className="lol-champ-name">{c.name}</div>
                    <div className="lol-champ-role">{c.role}</div>
                    <div className="lol-champ-stats">
                      <span className="lol-wr" title="Win Rate">
                        {c.winRate}% WR
                      </span>
                      <span className="lol-pr" title="Pick Rate">
                        {c.pickRate}% PR
                      </span>
                      <span className="lol-br" title="Ban Rate">
                        {c.banRate}% BR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}

/* ──────────────────  MAIN PAGE  ────────────────── */

export default function LeagueOfLegends() {
  const [tab, setTab] = useState('scoreboard');
  const [roleFilter, setRoleFilter] = useState('All');

  return (
    <div className="lol-page">
      <h1 className="lol-title">⚔️ League of Legends</h1>
      <p className="lol-subtitle">Scoreboard &amp; Meta Tier List — Patch 26.4</p>

      {/* Tabs */}
      <div className="lol-tabs">
        <button
          className={`lol-tab ${tab === 'scoreboard' ? 'active' : ''}`}
          onClick={() => setTab('scoreboard')}
        >
          Scoreboard
        </button>
        <button
          className={`lol-tab ${tab === 'tierlist' ? 'active' : ''}`}
          onClick={() => setTab('tierlist')}
        >
          Meta Tier List
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'scoreboard' && (
        <section className="lol-section">
          <h2 className="lol-section-title">Live Match — Blue vs Red</h2>
          <div className="lol-team-scores">
            <div className="lol-team-score lol-team-blue-bg">
              <span className="lol-team-label">Blue</span>
              <span className="lol-team-total">
                {INITIAL_SCOREBOARD.filter((p) => p.team === 'Blue').reduce((s, p) => s + p.kills, 0)} kills
              </span>
            </div>
            <span className="lol-vs">VS</span>
            <div className="lol-team-score lol-team-red-bg">
              <span className="lol-team-label">Red</span>
              <span className="lol-team-total">
                {INITIAL_SCOREBOARD.filter((p) => p.team === 'Red').reduce((s, p) => s + p.kills, 0)} kills
              </span>
            </div>
          </div>
          <Scoreboard players={INITIAL_SCOREBOARD} />
        </section>
      )}

      {tab === 'tierlist' && (
        <section className="lol-section">
          <h2 className="lol-section-title">Meta Tier List</h2>
          <div className="lol-role-filter">
            {ROLES.map((r) => (
              <button
                key={r}
                className={`lol-role-btn ${roleFilter === r ? 'active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <TierList champions={META_CHAMPIONS} roleFilter={roleFilter} />
        </section>
      )}

      <style>{`
        /* ── Page ── */
        .lol-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1rem 3rem;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #e0e6ed;
        }
        .lol-title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 0.15rem;
          letter-spacing: 0.02em;
        }
        .lol-subtitle {
          text-align: center;
          color: #8b95a5;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        /* ── Tabs ── */
        .lol-tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .lol-tab {
          padding: 0.55rem 1.4rem;
          border: 1px solid #2a3040;
          border-radius: 8px;
          background: #151a24;
          color: #8b95a5;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lol-tab:hover { background: #1e2533; color: #c7cdd6; }
        .lol-tab.active {
          background: linear-gradient(135deg, #c89b3c 0%, #785a28 100%);
          color: #0a0e14;
          border-color: #c89b3c;
        }

        /* ── Section ── */
        .lol-section { animation: lol-fadein 0.3s ease; }
        @keyframes lol-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .lol-section-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #c89b3c;
        }

        /* ── Team Scores ── */
        .lol-team-scores {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .lol-team-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          min-width: 120px;
        }
        .lol-team-blue-bg { background: rgba(0, 130, 255, 0.15); border: 1px solid rgba(0, 130, 255, 0.3); }
        .lol-team-red-bg  { background: rgba(255, 50, 50, 0.15);  border: 1px solid rgba(255, 50, 50, 0.3); }
        .lol-team-label { font-weight: 700; font-size: 1.1rem; }
        .lol-team-total { font-size: 0.9rem; color: #8b95a5; margin-top: 0.2rem; }
        .lol-vs { font-weight: 800; font-size: 1.2rem; color: #555; }

        /* ── Table ── */
        .lol-table-wrap {
          overflow-x: auto;
          border-radius: 10px;
          border: 1px solid #1e2533;
        }
        .lol-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .lol-table th {
          position: sticky;
          top: 0;
          background: #111620;
          padding: 0.6rem 0.75rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #8b95a5;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          border-bottom: 2px solid #1e2533;
        }
        .lol-table th:hover { color: #c89b3c; }
        .lol-sorted { color: #c89b3c !important; }
        .lol-sort-arrow { font-size: 0.7rem; }
        .lol-table td {
          padding: 0.55rem 0.75rem;
          border-bottom: 1px solid #161c28;
          white-space: nowrap;
        }
        .lol-row-blue { background: rgba(0, 130, 255, 0.04); }
        .lol-row-red  { background: rgba(255, 50, 50, 0.04); }
        .lol-row-blue:hover { background: rgba(0, 130, 255, 0.10); }
        .lol-row-red:hover  { background: rgba(255, 50, 50, 0.10); }
        .lol-team-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }
        .lol-team-blue { background: #0082ff; }
        .lol-team-red  { background: #ff3232; }
        .lol-player-name { font-weight: 600; color: #e8ecf2; }
        .lol-stat { text-align: center; font-variant-numeric: tabular-nums; }
        .lol-deaths { color: #e05555; }

        /* ── Role Filter ── */
        .lol-role-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .lol-role-btn {
          padding: 0.35rem 0.9rem;
          border: 1px solid #2a3040;
          border-radius: 6px;
          background: #151a24;
          color: #8b95a5;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lol-role-btn:hover { border-color: #c89b3c; color: #c89b3c; }
        .lol-role-btn.active {
          background: #c89b3c;
          color: #0a0e14;
          border-color: #c89b3c;
        }

        /* ── Tier List ── */
        .lol-tier-list { display: flex; flex-direction: column; gap: 1rem; }
        .lol-tier-section {
          background: #111620;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #1e2533;
        }
        .lol-tier-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 1rem;
          border-left: 4px solid;
          background: rgba(0,0,0,0.25);
        }
        .lol-tier-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px; height: 30px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.95rem;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        .lol-tier-label { font-weight: 600; font-size: 0.9rem; color: #c7cdd6; }
        .lol-tier-champs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
        }
        .lol-champ-card {
          background: #1a2030;
          border: 1px solid #242d3d;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          min-width: 130px;
          transition: transform 0.15s, border-color 0.15s;
        }
        .lol-champ-card:hover { transform: translateY(-2px); border-color: #c89b3c; }
        .lol-champ-name { font-weight: 700; font-size: 0.92rem; margin-bottom: 0.15rem; }
        .lol-champ-role { font-size: 0.75rem; color: #6b7585; margin-bottom: 0.35rem; }
        .lol-champ-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.72rem;
          color: #8b95a5;
        }
        .lol-wr { color: #4ade80; }
        .lol-br { color: #f87171; }

        @media (max-width: 640px) {
          .lol-page { padding: 1.25rem 0.5rem 2rem; }
          .lol-title { font-size: 1.5rem; }
          .lol-table { font-size: 0.78rem; }
          .lol-table th, .lol-table td { padding: 0.4rem 0.5rem; }
          .lol-champ-card { min-width: 110px; }
        }
      `}</style>
    </div>
  );
}
