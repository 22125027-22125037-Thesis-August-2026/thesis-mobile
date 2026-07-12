export type TagCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  tags: string[];
};

export const DIARY_TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'activities',
    label: 'Hoạt động',
    icon: 'lightning-bolt-outline',
    color: '#00897B',
    tags: [
      'Học tập',
      'Làm việc',
      'Tập thể dục',
      'Nấu ăn',
      'Xem phim',
      'Đọc sách',
      'Nghe nhạc',
      'Chơi game',
      'Du lịch',
      'Thiền định',
      'Mua sắm',
      'Nghỉ ngơi',
    ],
  },
  {
    id: 'social',
    label: 'Ở cùng',
    icon: 'account-group-outline',
    color: '#E5707E',
    tags: ['Gia đình', 'Bạn bè', 'Người yêu', 'Đồng nghiệp', 'Mình ên'],
  },
  {
    id: 'topics',
    label: 'Chủ đề',
    icon: 'tag-multiple-outline',
    color: '#9B7EDE',
    tags: [
      'Tài chính',
      'Sức khỏe',
      'Tình yêu',
      'Công việc',
      'Trường học',
      'Nhà ở',
      'Tương lai',
      'Bản thân',
    ],
  },
  {
    id: 'body',
    label: 'Cơ thể',
    icon: 'heart-pulse',
    color: '#66BB6A',
    tags: [
      'Đầy năng lượng',
      'Mệt mỏi',
      'Đau đầu',
      'Ốm bệnh',
      'Ngủ ngon',
      'Mất ngủ',
      'Khỏe mạnh',
    ],
  },
  {
    id: 'weather',
    label: 'Thời tiết',
    icon: 'weather-sunny',
    color: '#FFB300',
    tags: ['Nắng đẹp', 'Trời mưa', 'Oi bức', 'Mát mẻ', 'Lạnh'],
  },
];

export const ALL_DIARY_TAGS = DIARY_TAG_CATEGORIES.flatMap(c => c.tags);
