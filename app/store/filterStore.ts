import { create } from 'zustand'

export interface FilterState {
  wardFilter: string; categoryFilter: string; furnishingFilter: string
  priceRangeFilter: string; sizeRangeFilter: string; proximityFilter: string
  floodRiskFilter: string; reqElevator: boolean; reqBalcony: boolean
  reqPrivateBath: boolean; reqParking: boolean; searchInput: string; searchQuery: string
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'reset'>, value: string | boolean) => void
  reset: () => void
}

const initial = { wardFilter: '', categoryFilter: '', furnishingFilter: '', priceRangeFilter: '', sizeRangeFilter: '', proximityFilter: '', floodRiskFilter: '', reqElevator: false, reqBalcony: false, reqPrivateBath: false, reqParking: false, searchInput: '', searchQuery: '' }
export const useFilterStore = create<FilterState>((set) => ({ ...initial, setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>), reset: () => set(initial) }))
