import { useQuery } from '@tanstack/react-query'
import { fetchBanlist } from '../utils/api'

export function useBanlist() {
  return useQuery({
    queryKey: ['banlist'],
    queryFn:  fetchBanlist,
    staleTime: 24 * 60 * 60 * 1000, // 24hr
  })
}
