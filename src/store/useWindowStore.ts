import { create } from 'zustand';

export type AppId = 'terminal' | 'resume' | 'projects' | 'facetime' | 'settings' | 'vscode' | 'translator' | 'chatbot' | 'tour' | 'converter' | 'compressor' | 'exchange';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface OSStore {
  windows: Record<AppId, WindowState>;
  highestZIndex: number;
  openApp: (id: AppId, title: string) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  maximizeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
}

const initialWindows: Record<AppId, WindowState> = {
  terminal: { id: 'terminal', title: 'Terminal', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  resume: { id: 'resume', title: 'Resume.pdf', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  facetime: { id: 'facetime', title: 'FaceTime', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  vscode: { id: 'vscode', title: 'VS Code', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  translator: { id: 'translator', title: 'AI Translator', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  chatbot: { id: 'chatbot', title: 'Virtual Rohit', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  tour: { id: 'tour', title: 'Take a Tour', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  converter: { id: 'converter', title: 'Format Factory', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  compressor: { id: 'compressor', title: 'Compressor', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  exchange: { id: 'exchange', title: 'Exchange', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  game2048: { id: 'game2048', title: '2048', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  tictactoe: { id: 'tictactoe', title: 'Tic Tac Toe', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  snake: { id: 'snake', title: 'Snake', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  dailyhub: { id: 'dailyhub', title: 'Daily Hub', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  magiceraser: { id: 'magiceraser', title: 'Image Studio', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  qrstudio: { id: 'qrstudio', title: 'QR Studio', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  devtools: { id: 'devtools', title: 'DevTools', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
  cryptostudio: { id: 'cryptostudio', title: 'Password Hub', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 0 },
};

export const useWindowStore = create<OSStore>((set) => ({
  windows: initialWindows,
  highestZIndex: 100,

  openApp: (id, title) => set((state) => {
    const newZ = state.highestZIndex + 1;
    return {
      highestZIndex: newZ,
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], title, isOpen: true, isMinimized: false, zIndex: newZ },
      },
    };
  }),

  closeApp: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false },
    }
  })),

  minimizeApp: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isMinimized: true },
    }
  })),

  maximizeApp: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isMaximized: !state.windows[id].isMaximized },
    }
  })),

  focusApp: (id) => set((state) => {
    const win = state.windows[id];
    if (win.zIndex === state.highestZIndex && !win.isMinimized) return state; // Already focused and visible

    const newZ = win.zIndex === state.highestZIndex ? state.highestZIndex : state.highestZIndex + 1;
    return {
      highestZIndex: newZ,
      windows: {
        ...state.windows,
        [id]: { ...win, zIndex: newZ, isMinimized: false },
      },
    };
  }),
}));
