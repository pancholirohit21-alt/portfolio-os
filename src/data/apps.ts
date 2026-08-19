import { AppId } from '@/store/useWindowStore';

export interface AppConfig {
  id: AppId;
  iconUrl: string;
  title: string;
  scale?: number;
}

export const getAllApps = (isLight: boolean): AppConfig[] => [
  { id: 'terminal' as AppId, iconUrl: '/icons/Terminal.png?v=2', title: 'Terminal' },
  { id: 'resume' as AppId, iconUrl: `/icons/Resume-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Resume' },
  { id: 'facetime' as AppId, iconUrl: '/icons/Facetime.png?v=2', title: 'FaceTime' },
  { id: 'settings' as AppId, iconUrl: '/icons/Settings.png?v=2', title: 'Settings' },
  { id: 'translator' as AppId, iconUrl: '/icons/Translate.png?v=2', title: 'Translator' },
  { id: 'converter' as AppId, iconUrl: '/icons/format.png?v=2', title: 'Format Factory' },
  { id: 'compressor' as AppId, iconUrl: '/icons/compressor.png?v=2', title: 'Compressor' },
  { id: 'exchange' as AppId, iconUrl: '/icons/currency_convert.png?v=2', title: 'Global Exchange' },
  { id: 'help' as AppId, iconUrl: '/icons/Help.png?v=2', title: 'Help Center' },
  { id: 'aiassistant' as AppId, iconUrl: '/icons/AI_Chat.png?v=2', title: 'AI Assistant' },
  { id: 'dailyhub' as AppId, iconUrl: '/icons/daily-hub.png?v=2', title: 'Daily Hub' },
  { id: 'magiceraser' as AppId, iconUrl: '/icons/Image_editor.png?v=2', title: 'Image Studio' },
  { id: 'qrstudio' as AppId, iconUrl: '/icons/QR-generator.png?v=2', title: 'QR Studio' },
  { id: 'devtools' as AppId, iconUrl: '/icons/dev-tool.png?v=2', title: 'DevTools' },
  { id: 'cryptostudio' as AppId, iconUrl: `/icons/Passwords-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Password Hub' },
  // Games (accessible in Launchpad and GamesHub)
  { id: 'game2048' as AppId, iconUrl: '/icons/2048.png?v=2', title: '2048' },
  { id: 'tictactoe' as AppId, iconUrl: '/icons/tictactoe.png?v=2', title: 'Tic Tac Toe' },
  { id: 'snake' as AppId, iconUrl: '/icons/snake.png?v=2', title: 'Snake', scale: 1.15 },
  { id: 'typinggame' as AppId, iconUrl: '/icons/typing.png', title: 'DevType' },
  { id: 'musicplayer' as AppId, iconUrl: '/icons/music.png?v=3', title: 'Music Player' },
];

// Apps specifically for the taskbar (excludes individual games)
export const getTaskbarApps = (isLight: boolean): AppConfig[] => [
  { id: 'launchpad' as AppId, iconUrl: `/icons/apps-${isLight ? 'light' : 'dark'}.png`, title: 'Launchpad' },
  { id: 'terminal' as AppId, iconUrl: '/icons/Terminal.png?v=2', title: 'Terminal' },
  { id: 'resume' as AppId, iconUrl: `/icons/Resume-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Resume' },
  { id: 'facetime' as AppId, iconUrl: '/icons/Facetime.png?v=2', title: 'FaceTime' },
  { id: 'settings' as AppId, iconUrl: '/icons/Settings.png?v=2', title: 'Settings' },
  { id: 'translator' as AppId, iconUrl: '/icons/Translate.png?v=2', title: 'Translator' },
  { id: 'converter' as AppId, iconUrl: '/icons/format.png?v=2', title: 'Format Factory' },
  { id: 'compressor' as AppId, iconUrl: '/icons/compressor.png?v=2', title: 'Compressor' },
  { id: 'exchange' as AppId, iconUrl: '/icons/currency_convert.png?v=2', title: 'Global Exchange' },
  { id: 'gameshub' as AppId, iconUrl: '/icons/games-hub.png', title: 'Games Hub' },
  { id: 'aiassistant' as AppId, iconUrl: '/icons/AI_Chat.png?v=2', title: 'AI Assistant' },
  { id: 'dailyhub' as AppId, iconUrl: '/icons/daily-hub.png?v=2', title: 'Daily Hub' },
  { id: 'magiceraser' as AppId, iconUrl: '/icons/Image_editor.png?v=2', title: 'Image Studio' },
  { id: 'qrstudio' as AppId, iconUrl: '/icons/QR-generator.png?v=2', title: 'QR Studio' },
  { id: 'devtools' as AppId, iconUrl: '/icons/dev-tool.png?v=2', title: 'DevTools' },
  { id: 'cryptostudio' as AppId, iconUrl: `/icons/Passwords-${isLight ? 'light' : 'dark'}.png?v=2`, title: 'Password Hub' },
  { id: 'musicplayer' as AppId, iconUrl: '/icons/music.png?v=3', title: 'Music Player' },
];
