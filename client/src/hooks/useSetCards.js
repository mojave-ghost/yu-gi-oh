import { useQuery } from '@tanstack/react-query'
import { fetchCardsBySet } from '../utils/api'

export function useSetCards(setName) {
  return useQuery({
    queryKey: ['set', setName],
    queryFn:  () => fetchCardsBySet(setName),
    enabled:  !!setName,
    staleTime: 1000 * 60 * 60, // 1hr
  })
}
