export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ParentExperience: undefined;
  AdminExperience: undefined;
  MainTabs: undefined;

  // Nâng cấp: Màn hình Chat giờ đây có thể nhận sessionId (phiên cũ) hoặc không có (phiên mới)
  Chat: { sessionId?: string | null } | undefined;
  MessageList: undefined;
  SocialChat: {
    channelId: string;
    recipientName: string;
    recipientProfileId: string;
    channelType: 'DIRECT_FRIEND' | 'THERAPIST_CONSULT';
  };
  FriendProfile: {
    friendProfileId: string;
    friendName: string;
  };

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
  SleepMain: { viewProfileId?: string } | undefined;
  DiaryOverview: { viewProfileId?: string } | undefined;
  DiaryEntry: { entryId?: string } | undefined;
  FoodMain: { viewProfileId?: string } | undefined;
};

export type TrackingStackParamList = {
  Home: undefined;

  // Nâng cấp tương tự cho Stack Tracking (nếu bạn dùng nested navigation)
  Chat: { sessionId?: string | null } | undefined;
  MessageList: undefined;
  SocialChat: {
    channelId: string;
    recipientName: string;
    recipientProfileId: string;
    channelType: 'DIRECT_FRIEND' | 'THERAPIST_CONSULT';
  };
  FriendProfile: {
    friendProfileId: string;
    friendName: string;
  };
  TherapyOverview: undefined;

  DiaryOverview: { viewProfileId?: string } | undefined;
  DiaryEntry: { entryId?: string } | undefined;
  SleepMain: { viewProfileId?: string } | undefined;
  FoodMain: { viewProfileId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
