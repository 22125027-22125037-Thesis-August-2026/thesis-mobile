export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
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
  FoodOverview: undefined;
  FoodEntry: undefined;
};

export type TrackingStackParamList = {
  Home: undefined;
  Chat: undefined;
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
