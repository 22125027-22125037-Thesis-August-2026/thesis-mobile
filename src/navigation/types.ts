export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ParentExperience: undefined;
  AdminExperience: undefined;
  MainTabs: undefined;

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
    appointmentId?: string;
    therapistId: string;
    slotId: string;
    slotStartDatetime: string;
    method: 'Video' | 'Chat';
    reason?: string;
    isBooked?: boolean;
  };
  VideoConsultation: {
    appointmentId?: string;
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
    appointmentId?: string;
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
  SleepMain: undefined;
  DiaryOverview: undefined;
  DiaryEntry: { entryId?: string } | undefined;
  FoodMain: undefined;
};

export type TrackingStackParamList = {
  Home: undefined;

  // Nâng cấp tương tự cho Stack Tracking (nếu bạn dùng nested navigation)
  Chat: { sessionId?: string | null } | undefined;
  TherapyOverview: undefined;

  DiaryOverview: undefined;
  DiaryEntry: { entryId?: string } | undefined;
  SleepMain: undefined;
  FoodMain: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
