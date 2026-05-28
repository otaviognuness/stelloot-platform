export type ThemeMode = 'default' | 'black' | 'light';

export type Palette = {
  accent: string;
  accentText: string;
  background: string;
  border: string;
  danger: string;
  muted: string;
  surface: string;
  surfaceAlt: string;
  text: string;
};

export const palettes: Record<ThemeMode, Palette> = {
  default: {
    accent: '#20e8ba',
    accentText: '#04121d',
    background: '#070d1d',
    border: '#202c4d',
    danger: '#ff7287',
    muted: '#a8b4d2',
    surface: '#101a36',
    surfaceAlt: '#162348',
    text: '#f7f9ff',
  },
  black: {
    accent: '#ffffff',
    accentText: '#070707',
    background: '#050505',
    border: '#262626',
    danger: '#ff7272',
    muted: '#ababab',
    surface: '#0e0e0e',
    surfaceAlt: '#181818',
    text: '#ffffff',
  },
  light: {
    accent: '#08121e',
    accentText: '#ffffff',
    background: '#f4f6fb',
    border: '#dce2ee',
    danger: '#cb334d',
    muted: '#5e687d',
    surface: '#ffffff',
    surfaceAlt: '#e9eef8',
    text: '#10151f',
  },
};
