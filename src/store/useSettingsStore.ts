import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';

export interface SettingsState {
  themeMode: ThemeMode;
  accentColor: string;
  customColorHex: string;
  wallpaper: string;
  taskbarVisible: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setCustomColorHex: (hex: string) => void;
  setWallpaper: (url: string) => void;
  toggleTaskbar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      accentColor: 'from-indigo-500/80 to-purple-500/80',
      customColorHex: '#6366f1',
      wallpaper: 'aurora',
      taskbarVisible: true,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (color) => set({ accentColor: color }),
      setCustomColorHex: (hex) => set({ customColorHex: hex }),
      setWallpaper: (url) => set({ wallpaper: url }),
      toggleTaskbar: () => set((state) => ({ taskbarVisible: !state.taskbarVisible })),
    }),
    {
      name: 'os-settings-storage', // name of item in localStorage
    }
  )
);
