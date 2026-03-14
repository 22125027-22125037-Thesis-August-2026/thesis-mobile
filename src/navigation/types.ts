export type RootStackParamList = {
  Home: undefined;
  TherapistList: undefined; // No params needed to open the list
  TherapistDetails: { id: string }; // MUST have an 'id' string to open details
  TherapistFilter: { matchingSuccess?: boolean } | undefined;
  MatchingForm: undefined;
  Booking: { therapistId: string };
  ConsultationDetail: { selectedDate: string; selectedTime: string };
  VideoConsultation: undefined;

  WaitingRoom: {
    date: string;
    time: string;
    method: string;
    reason: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}