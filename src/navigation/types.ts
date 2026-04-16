export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ParentExperience: undefined;
  AdminExperience: undefined;

  // Nâng cấp: Màn hình Chat giờ đây có thể nhận sessionId (phiên cũ) hoặc không có (phiên mới)
  Chat: { sessionId?: string | null } | undefined;

  // Đăng ký thêm màn hình Tổng quan Lịch sử Chat
  TherapyOverview: undefined;

  TherapistBookingLanding: { matchingSuccess?: boolean } | undefined;
  TherapistFilter: { matchingSuccess?: boolean } | undefined;
  MatchingForm: undefined;
  TherapistList: undefined;
  TherapistDetails: { id: string };
  Booking: { therapistId: string };
  ConsultationDetail: {
    selectedDate: string;
    selectedTime: string;
  };
  WaitingRoom: {
    date: string;
    time: string;
    method: 'Video' | 'Chat';
    reason?: string;
  };
  VideoConsultation: undefined;
  // Resolved from Therapist-Feature
  ConsultationFeedback: undefined;
  // Resolved from main
  SleepOverview: undefined;
  SleepEntry: undefined;
  DiaryOverview: undefined;
  DiaryDashboard: undefined;
  DiaryEntry: { entryId?: string } | undefined;
  FoodOverview: undefined;
  FoodEntry: undefined;
};

export type TrackingStackParamList = {
  Home: undefined;

  // Nâng cấp tương tự cho Stack Tracking (nếu bạn dùng nested navigation)
  Chat: { sessionId?: string | null } | undefined;
  TherapyOverview: undefined;

  DiaryOverview: undefined;
  DiaryDashboard: undefined;
  DiaryEntry: { entryId?: string } | undefined;
  SleepOverview: undefined;
  SleepEntry: undefined;
  FoodOverview: undefined;
  FoodEntry: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
