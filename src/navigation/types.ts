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
  ConsultationFeedback: undefined;
};

export type TrackingStackParamList = {
  DiaryOverview: undefined;
  DiaryDashboard: undefined;
  DiaryEntry: { entryId?: string } | undefined;

};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
