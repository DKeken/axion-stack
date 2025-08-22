import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
}

interface UIActions {
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>((set, get) => ({
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
}));
