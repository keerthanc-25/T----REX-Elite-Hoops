import { create } from 'zustand';

interface AppState {
  isDesignStudio: boolean;
  setIsDesignStudio: (value: boolean) => void;
  isIntroComplete: boolean;
  setIsIntroComplete: (value: boolean) => void;
  isAnatomyMode: boolean;
  setIsAnatomyMode: (value: boolean) => void;
  anatomyProgress: number;
  setAnatomyProgress: (value: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  isDesignStudio: false,
  setIsDesignStudio: (value: boolean) => set({ isDesignStudio: value }),
  isIntroComplete: false,
  setIsIntroComplete: (value: boolean) => set({ isIntroComplete: value }),
  isAnatomyMode: false,
  setIsAnatomyMode: (value: boolean) => set({ isAnatomyMode: value }),
  anatomyProgress: 0,
  setAnatomyProgress: (value: number) => set({ anatomyProgress: value }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
