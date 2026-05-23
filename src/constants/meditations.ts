// Placeholder catalogue for the home-screen "Thiền & thư giãn" carousel.
// URLs are general guided-meditation videos chosen as defaults — swap them for
// curated/licensed content before release.
export type MeditationExercise = {
  id: string;
  titleKey: string;
  categoryKey: string;
  minutes: number;
  icon: string;
  gradient: [string, string, string];
  tint: string;
  youtubeUrl: string;
};

export const MEDITATION_EXERCISES: MeditationExercise[] = [
  {
    id: 'breath478',
    titleKey: 'home.meditation.items.breath478.title',
    categoryKey: 'home.meditation.items.breath478.category',
    minutes: 5,
    icon: 'air-purifier',
    gradient: ['#4FC3F7', '#29B6F6', '#0288D1'],
    tint: 'rgba(2,136,209,0.20)',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
  },
  {
    id: 'bodyScan',
    titleKey: 'home.meditation.items.bodyScan.title',
    categoryKey: 'home.meditation.items.bodyScan.category',
    minutes: 10,
    icon: 'meditation',
    gradient: ['#A5D6A7', '#66BB6A', '#2E7D32'],
    tint: 'rgba(46,125,50,0.20)',
    youtubeUrl: 'https://www.youtube.com/watch?v=15q-N-_kkrU',
  },
  {
    id: 'morning',
    titleKey: 'home.meditation.items.morning.title',
    categoryKey: 'home.meditation.items.morning.category',
    minutes: 8,
    icon: 'weather-sunset-up',
    gradient: ['#FFCC80', '#FFB74D', '#F57C00'],
    tint: 'rgba(245,124,0,0.20)',
    youtubeUrl: 'https://www.youtube.com/watch?v=j734gLbQFbU',
  },
  {
    id: 'sleep',
    titleKey: 'home.meditation.items.sleep.title',
    categoryKey: 'home.meditation.items.sleep.category',
    minutes: 15,
    icon: 'moon-waning-crescent',
    gradient: ['#B39DDB', '#9575CD', '#5E35B1'],
    tint: 'rgba(94,53,177,0.20)',
    youtubeUrl: 'https://www.youtube.com/watch?v=aEqlQvczMJQ',
  },
  {
    id: 'calmAnxiety',
    titleKey: 'home.meditation.items.calmAnxiety.title',
    categoryKey: 'home.meditation.items.calmAnxiety.category',
    minutes: 7,
    icon: 'heart-pulse',
    gradient: ['#FFAB91', '#FF8A65', '#E64A19'],
    tint: 'rgba(230,74,25,0.20)',
    youtubeUrl: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
  },
];
