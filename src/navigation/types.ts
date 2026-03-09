export type RootStackParamList = {
    TherapistList: undefined;         // No params needed to open the list
    TherapistDetails: { id: string }; // MUST have an 'id' string to open details
  };

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}