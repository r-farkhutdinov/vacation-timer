const projectUrl = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const headers = {
  apikey: publishableKey,
  'Content-Type': 'application/json',
}

async function request(path, options = {}) {
  if (!projectUrl || !publishableKey) {
    throw new Error('Supabase is not configured')
  }

  const response = await fetch(`${projectUrl}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`)
  }

  return response.json()
}

export async function getGlobalRecord() {
  const records = await request('/rest/v1/global_record?id=eq.1&select=score,player_name,achieved_at')
  return records[0] ?? { score: 0, player_name: 'Пока никто', achieved_at: null }
}

export async function submitGlobalRecord(score, playerName) {
  const records = await request('/rest/v1/rpc/submit_record', {
    method: 'POST',
    body: JSON.stringify({ p_score: score, p_player_name: playerName }),
  })
  return records[0]
}

export async function getRecentGames() {
  return request('/rest/v1/game_results?select=id,score,played_at&order=played_at.desc&limit=4')
}

export async function saveGame(score) {
  const games = await request('/rest/v1/rpc/save_game', {
    method: 'POST',
    body: JSON.stringify({ p_score: score }),
  })
  return games[0]
}
