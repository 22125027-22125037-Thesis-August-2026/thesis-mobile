declare module 'react-native-zoom-us' {
  export interface ZoomInitializeOptions {
    jwtToken: string;
    domain?: string;
    clientKey?: string;
    clientSecret?: string;
  }

  export interface ZoomJoinMeetingOptions {
    userName: string;
    meetingNumber: string;
    password: string;
  }

  interface ZoomUsModule {
    initialize(options: ZoomInitializeOptions): Promise<string>;
    joinMeeting(options: ZoomJoinMeetingOptions): Promise<void>;
  }

  const ZoomUs: ZoomUsModule;

  export default ZoomUs;
}
