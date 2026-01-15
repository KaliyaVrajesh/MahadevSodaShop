import { useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'

export function useSupabaseRealtime(table, callback, event = '*') {
  const handleChange = useCallback((payload) => {
    callback(payload)
  }, [callback])

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        handleChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, handleChange])
}

export function useProductsRealtime(onUpdate) {
  useSupabaseRealtime('products', onUpdate)
}

export function useSalesRealtime(onUpdate) {
  useSupabaseRealtime('sales', onUpdate)
}
