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
  AppointmentsHistory: undefined;
  TherapistFilter: { matchingSuccess?: boolean } | undefined;
  MatchingForm: undefined;
  TherapistList: undefined;
  TherapistDetails: { id: string };
  Booking: { therapistId: string };
  ConsultationDetail: {
    therapistId: string;
    slotId: string;
    slotStartDatetime: string;
    selectedDate: string;
    selectedTime: string;
  };
  WaitingRoom: {
    therapistId: string;
    slotId: string;
    slotStartDatetime: string;
    method: 'Video' | 'Chat';
    reason?: string;
    isBooked?: boolean;
  };
  VideoConsultation: {
    therapistId: string;
    slotId: string;
    slotStartDatetime: string;
    method: 'Video' | 'Chat';
    reason?: string;
    therapistName?: string;
    therapistSpecialty?: string;
    therapistAvatarUrl?: string | null;
  };
  // Resolved from Therapist-Feature
  ConsultationFeedback: {
    therapistId: string;
    slotId: string;
    slotStartDatetime: string;
    method: 'Video' | 'Chat';
    reason?: string;
    therapistName?: string;
    therapistSpecialty?: string;
    therapistAvatarUrl?: string | null;
    endedAt?: string;
  };
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
