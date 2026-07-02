const fs = require('fs');
const path = require('path');
const realPlayers = require('./real_players');

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

const metricDefs = [
  { code: 'goals', label: 'Goles', group: 'offensive' },
  { code: 'assists', label: 'Asistencias', group: 'offensive' },
  { code: 'xg', label: 'xG', group: 'offensive' },
  { code: 'xa', label: 'xA', group: 'offensive' },
  { code: 'shots', label: 'Tiros', group: 'offensive' },
  { code: 'shots_on_target', label: 'Tiros a puerta', group: 'offensive' },
  { code: 'conversion_rate', label: 'Conversión (%)', group: 'offensive' },
  { code: 'touches_box', label: 'Toques en área', group: 'offensive' },
  { code: 'big_chances', label: 'Grandes ocasiones', group: 'offensive' },

  { code: 'key_passes', label: 'Key Passes', group: 'possession' },
  { code: 'through_balls', label: 'Through Balls', group: 'possession' },
  { code: 'prog_passes', label: 'Pases progresivos', group: 'possession' },
  { code: 'passes_final_third', label: 'Pases último tercio', group: 'possession' },
  { code: 'passes_box', label: 'Pases al área', group: 'possession' },
  { code: 'crosses', label: 'Crosses', group: 'possession' },
  { code: 'pass_accuracy', label: 'Precisión pase (%)', group: 'possession' },

  { code: 'prog_carries', label: 'Progressive Carries', group: 'possession' },
  { code: 'succ_dribbles', label: 'Regates exitosos', group: 'possession' },
  { code: 'carries_final_third', label: 'Carries último tercio', group: 'possession' },
  { code: 'carries_box', label: 'Carries al área', group: 'possession' },

  { code: 'tackles', label: 'Tackles', group: 'defensive' },
  { code: 'interceptions', label: 'Intercepciones', group: 'defensive' },
  { code: 'recoveries', label: 'Recuperaciones', group: 'defensive' },
  { code: 'blocks', label: 'Bloqueos', group: 'defensive' },
  { code: 'clearances', label: 'Despejes', group: 'defensive' },
  { code: 'aerial_won', label: 'Duelos aéreos (%)', group: 'defensive' },

  { code: 'top_speed', label: 'Top Speed (km/h)', group: 'defensive' },
  { code: 'sprint_dist', label: 'Sprint Dist (m)', group: 'defensive' },

  { code: 'sca', label: 'Shot Creating Actions', group: 'offensive' },
  { code: 'gca', label: 'Goal Creating Actions', group: 'offensive' },
  { code: 'xgchain', label: 'xGChain', group: 'possession' },
  { code: 'xgbuildup', label: 'xGBuildup', group: 'possession' }
];

const metricIdMap = {};
metricDefs.forEach(m => metricIdMap[m.code] = uuid());

const positions = ['GK', 'RB', 'LB', 'CB', 'DM', 'CM', 'BBM', 'AM', 'RW', 'LW', 'SS', 'CF'];
const playersData = [];

const randomNum = (min, max) => Math.random() * (max - min) + min;

// Extract unique clubs dynamically from realPlayers
const clubsSet = new Set();
positions.forEach(pos => {
  if (realPlayers[pos]) {
    realPlayers[pos].forEach(p => clubsSet.add(p[3]));
  }
});
const clubs = Array.from(clubsSet);

positions.forEach(pos => {
  if (realPlayers[pos]) {
    realPlayers[pos].forEach(pData => {
      playersData.push({
        id: uuid(),
        first_name: pData[0],
        last_name: pData[1],
        nationality: pData[2],
        club_name: pData[3],
        league: 'Primera División',
        position: pos,
        birth_date: new Date(Date.now() - randomNum(20, 32) * 31556952000).toISOString().split('T')[0],
        preferred_foot: Math.random() > 0.25 ? 'right' : 'left',
        metrics: {}
      });
    });
  }
});

function randomNormal(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  return Math.max(0, num * stdDev + mean);
}

const posArchetypes = {
  'GK':  { goals: [0, 0], xg: [0, 0], prog_passes: [2, 1], saves: [3, 0.8], passes_final_third: [1, 0.5] },
  'CB':  { goals: [0.05, 0.05], xg: [0.05, 0.05], prog_passes: [4, 1.5], aerial_won: [65, 10], tackles: [1.5, 0.5], clearances: [4, 1.5], xgbuildup: [0.5, 0.2] },
  'RB':  { goals: [0.1, 0.1], assists: [0.15, 0.1], crosses: [3, 1.5], prog_carries: [2, 1], tackles: [2, 0.8], interceptions: [1.2, 0.5], prog_passes: [4.5, 1.5] },
  'LB':  { goals: [0.1, 0.1], assists: [0.15, 0.1], crosses: [3, 1.5], prog_carries: [2, 1], tackles: [2, 0.8], interceptions: [1.2, 0.5], prog_passes: [4.5, 1.5] },
  'DM':  { goals: [0.05, 0.05], assists: [0.1, 0.1], tackles: [2.5, 0.8], interceptions: [1.8, 0.6], prog_passes: [6, 2], pass_accuracy: [88, 5], xgbuildup: [0.8, 0.3] },
  'CM':  { goals: [0.15, 0.1], assists: [0.2, 0.1], prog_passes: [7, 2.5], key_passes: [1.5, 0.8], sca: [3, 1.2], xgchain: [0.7, 0.2] },
  'BBM': { goals: [0.2, 0.1], assists: [0.15, 0.1], tackles: [2, 0.8], prog_carries: [2.5, 1], touches_box: [2.5, 1.2] },
  'AM':  { goals: [0.3, 0.15], assists: [0.35, 0.15], key_passes: [2.5, 1], sca: [4.5, 1.5], gca: [0.6, 0.3], prog_passes: [6, 2], touches_box: [4, 1.5] },
  'RW':  { goals: [0.35, 0.2], assists: [0.25, 0.15], succ_dribbles: [2.5, 1.2], prog_carries: [4, 1.5], crosses: [4, 2], touches_box: [5, 2], shots: [2.5, 1] },
  'LW':  { goals: [0.35, 0.2], assists: [0.25, 0.15], succ_dribbles: [2.5, 1.2], prog_carries: [4, 1.5], crosses: [4, 2], touches_box: [5, 2], shots: [2.5, 1] },
  'SS':  { goals: [0.4, 0.2], assists: [0.25, 0.15], shots: [3, 1], touches_box: [5.5, 1.5], sca: [3.5, 1.2], prog_carries: [3, 1.2] },
  'CF':  { goals: [0.6, 0.25], xg: [0.55, 0.2], shots: [3.5, 1.2], touches_box: [6.5, 2], aerial_won: [45, 15], conversion_rate: [18, 5] },
};

const baseDist = { mean: 2, std: 1 };

playersData.forEach(p => {
  const arch = posArchetypes[p.position] || {};
  metricDefs.forEach(m => {
    const config = arch[m.code] || [baseDist.mean, baseDist.std];
    p.metrics[m.code] = randomNormal(config[0], config[1]);
  });
});

const metricsInserts = [];

positions.forEach(pos => {
  const playersInPos = playersData.filter(p => p.position === pos);
  
  metricDefs.forEach(m => {
    playersInPos.sort((a, b) => a.metrics[m.code] - b.metrics[m.code]);
    
    playersInPos.forEach((p, index) => {
      const percentile = Math.round((index / (playersInPos.length - 1)) * 99);
      metricsInserts.push({
        player_id: p.id,
        metric_id: metricIdMap[m.code],
        value: Number(p.metrics[m.code].toFixed(2)),
        percentile: percentile
      });
    });
  });
});

let sql = `
-- =========================================================================
-- MASSIVE AI SCOUT OS SEED DATA (ETL SCRIPT)
-- Generates exactly 180 players con FBref-style advanced metrics
-- =========================================================================

-- 1. CLEAN EXISTING DATA
DELETE FROM player_metrics;
DELETE FROM players;
DELETE FROM metrics;

-- 2. INSERT ADVANCED METRICS DICTIONARY
INSERT INTO metrics (id, code, label, "group") VALUES
`;
const metricsVals = metricDefs.map(m => `('${metricIdMap[m.code]}', '${m.code}', '${m.label}', '${m.group}')`).join(',\n');
sql += metricsVals + ';\n\n';

const clubMap = {};
clubs.forEach(c => clubMap[c] = uuid());

sql += `-- 3. INSERT CLUBS\nDELETE FROM clubs;\nINSERT INTO clubs (id, name, country) VALUES\n`;
const clubVals = clubs.map(c => `('${clubMap[c]}', '${c}', 'Europa')`).join(',\n');
sql += clubVals + ';\n\n';

sql += `-- 4. INSERT 180 PLAYERS\nINSERT INTO players (id, first_name, last_name, club_id, league, nationality, position, birth_date, preferred_foot) VALUES\n`;
const playerVals = playersData.map(p => {
  return `('${p.id}', '${p.first_name.replace(/'/g, "''")}', '${p.last_name.replace(/'/g, "''")}', '${clubMap[p.club_name]}', '${p.league}', '${p.nationality}', '${p.position}', '${p.birth_date}', '${p.preferred_foot}')`;
}).join(',\n');
sql += playerVals + ';\n\n';

sql += `-- 5. INSERT PLAYER METRICS\n`;
const chunkSize = 1000;
for (let i = 0; i < metricsInserts.length; i += chunkSize) {
  const chunk = metricsInserts.slice(i, i + chunkSize);
  sql += `INSERT INTO player_metrics (player_id, metric_id, value, percentile) VALUES\n`;
  const chunkVals = chunk.map(m => `('${m.player_id}', '${m.metric_id}', ${m.value}, ${m.percentile})`).join(',\n');
  sql += chunkVals + ';\n\n';
}

fs.writeFileSync(path.join(__dirname, 'seed-massive.sql'), sql);
console.log('Successfully generated scripts/seed-massive.sql with 180 players and ' + metricsInserts.length + ' metrics!');
