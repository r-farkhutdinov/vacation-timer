import { useCallback, useEffect, useState } from 'react'
import { getGlobalRecord, getRecentGames, saveGame, submitGlobalRecord } from '../services/recordApi.js'

const EMPTY_RECORD = { score: 0, player_name: 'Пока никто', achieved_at: null }

export function useGlobalRecord() {
  const [record, setRecord] = useState(EMPTY_RECORD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentGames, setRecentGames] = useState([])

  useEffect(() => {
    Promise.all([getGlobalRecord(), getRecentGames()])
      .then(([nextRecord, games]) => {
        setRecord(nextRecord)
        setRecentGames(games)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const submitRecord = useCallback(async (score, playerName) => {
    const result = await submitGlobalRecord(score, playerName)
    setRecord({
      score: result.score,
      player_name: result.player_name,
      achieved_at: result.achieved_at,
    })
    return result
  }, [])

  const recordGame = useCallback(async (score) => {
    const game = await saveGame(score)
    setRecentGames((games) => [game, ...games].slice(0, 4))
    return game
  }, [])

  return { error, loading, recentGames, record, recordGame, submitRecord }
}
