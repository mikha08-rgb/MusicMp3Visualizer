export interface DemoTrack {
  id: string
  title: string
  artist?: string
  url: string
}

export const demoTracks: DemoTrack[] = [
  {
    id: 'demo-1',
    title: 'Test Demo Bass',
    artist: 'Alge',
    url: '/demo/test demo bass - Alge copy.mp3',
  },
]

// Get the default/first demo track
export const getDefaultDemoTrack = (): DemoTrack => {
  return demoTracks[0]
}

// Get demo track by ID
export const getDemoTrackById = (id: string): DemoTrack | undefined => {
  return demoTracks.find(track => track.id === id)
}
