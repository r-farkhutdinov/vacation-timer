import { useCallback, useEffect, useState } from 'react'
import { getGlobalRecord, submitGlobalRecord } from '../services/recordApi.js'

const EMPTY_RECORD = { score: 0, player_name: 'Пока никто', achieved_at: null }

export function useGlobalRecord() {
  const [record, setRecord] = useState(EMPTY_RECORD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGlobalRecord()
      .then(setRecord)
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

  return { error, loading, record, submitRecord }
}
