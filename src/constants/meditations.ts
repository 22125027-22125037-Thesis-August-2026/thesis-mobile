// Catalogue for the home-screen "Thiền & thư giãn" carousel. Every video is a guided
// meditation/breathing practice narrated in Vietnamese by a Vietnamese creator, verified live
// via the YouTube oEmbed endpoint (https://www.youtube.com/oembed?url=...) before being added
// here. `minutes` is the video's actual runtime (lengthSeconds pulled from the watch page,
// rounded to the nearest minute) — keep it in sync if a URL below is ever swapped out.
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
    minutes: 10,
    icon: 'air-purifier',
    gradient: ['#4FC3F7', '#29B6F6', '#0288D1'],
    tint: 'rgba(2,136,209,0.20)',
    // "10 Phút Tập Thở 478 Mỗi Ngày Cực Tốt Cho Phổi, Tăng Cường Sinh Lực" — Kim Ba Yoga
    youtubeUrl: 'https://www.youtube.com/watch?v=VkJwbuJjn2c',
  },
  {
    id: 'bodyScan',
    titleKey: 'home.meditation.items.bodyScan.title',
    categoryKey: 'home.meditation.items.bodyScan.category',
    minutes: 32,
    icon: 'meditation',
    gradient: ['#A5D6A7', '#66BB6A', '#2E7D32'],
    tint: 'rgba(46,125,50,0.20)',
    // "Thầy Minh Niệm | Thiền buông thư 04: Kết nối với sự màu nhiệm của chính mình" —
    // official Minh Niệm channel
    youtubeUrl: 'https://www.youtube.com/watch?v=duI72bHMUq4',
  },
  {
    id: 'morning',
    titleKey: 'home.meditation.items.morning.title',
    categoryKey: 'home.meditation.items.morning.category',
    minutes: 11,
    icon: 'weather-sunset-up',
    gradient: ['#FFCC80', '#FFB74D', '#F57C00'],
    tint: 'rgba(245,124,0,0.20)',
    // "Thiền định cho buổi sáng tràn đầy năng lượng tích cực" — Breath.vn
    youtubeUrl: 'https://www.youtube.com/watch?v=pHKnAQuw67A',
  },
  {
    id: 'sleep',
    titleKey: 'home.meditation.items.sleep.title',
    categoryKey: 'home.meditation.items.sleep.category',
    minutes: 60,
    icon: 'moon-waning-crescent',
    gradient: ['#B39DDB', '#9575CD', '#5E35B1'],
    tint: 'rgba(94,53,177,0.20)',
    // "Thiền Ngủ Ngon, Cho Người Khó Ngủ Về Đêm, Ngủ Ngay Sau 5 Phút | Thiền Ngủ Kim Ba"
    youtubeUrl: 'https://www.youtube.com/watch?v=xummeRAZVto',
  },
  {
    id: 'calmAnxiety',
    titleKey: 'home.meditation.items.calmAnxiety.title',
    categoryKey: 'home.meditation.items.calmAnxiety.category',
    minutes: 10,
    icon: 'heart-pulse',
    gradient: ['#FFAB91', '#FF8A65', '#E64A19'],
    tint: 'rgba(230,74,25,0.20)',
    // "Hít Thở Giảm Stress, Luyện Thử 5 Phút Tĩnh Tâm An Nhiên Ngủ Cực Ngon" — Kim Ba Yoga
    youtubeUrl: 'https://www.youtube.com/watch?v=lj7LjnS6prc',
  },
];
