export type RootStackParamList = {
  TherapistList: undefined; // No params needed to open the list
  TherapistDetails: { id: string }; // MUST have an 'id' string to open details
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
