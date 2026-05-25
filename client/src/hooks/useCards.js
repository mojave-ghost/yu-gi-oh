import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchCards } from '../utils/api'

export function useCards({ query, type, attribute, levelMin, levelMax, sort, page }) {
  return useQuery({
    queryKey: ['cards', { query, type, attribute, levelMin, levelMax, sort, page }],
    queryFn:  () => fetchCards({ query, type, attribute, levelMin, levelMax, sort, page }),
    placeholderData: keepPreviousData,
  })
}
