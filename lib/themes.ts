export interface ColorTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    tertiary: string
    orb: string
    orbEmissive: string
    particles: string
  }
}

export const themes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Rainbow',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      tertiary: '#95e1d3',
      orb: '#ff6b6b',
      orbEmissive: '#ff3333',
      particles: '#4ecdc4',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      primary: '#ff0080',
      secondary: '#00ffff',
      tertiary: '#ffff00',
      orb: '#ff0080',
      orbEmissive: '#ff00ff',
      particles: '#00ffff',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    colors: {
      primary: '#ff71ce',
      secondary: '#01cdfe',
      tertiary: '#05ffa1',
      orb: '#ff71ce',
      orbEmissive: '#b967ff',
      particles: '#05ffa1',
    },
  },
  {
    id: 'fire',
    name: 'Fire',
    colors: {
      primary: '#ff4500',
      secondary: '#ff6347',
      tertiary: '#ffa500',
      orb: '#ff0000',
      orbEmissive: '#ff4500',
      particles: '#ff6347',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#006994',
      secondary: '#00a8e8',
      tertiary: '#00c9ff',
      orb: '#003459',
      orbEmissive: '#007ea7',
      particles: '#00c9ff',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#2d6a4f',
      secondary: '#40916c',
      tertiary: '#52b788',
      orb: '#1b4332',
      orbEmissive: '#2d6a4f',
      particles: '#74c69d',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      tertiary: '#888888',
      orb: '#ffffff',
      orbEmissive: '#ffffff',
      particles: '#888888',
    },
  },
  {
    id: 'purple',
    name: 'Purple Dream',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      tertiary: '#d8b4fe',
      orb: '#9333ea',
      orbEmissive: '#a855f7',
      particles: '#d8b4fe',
    },
  },
]

export function getThemeById(id: string): ColorTheme {
  return themes.find((t) => t.id === id) || themes[0]
}
