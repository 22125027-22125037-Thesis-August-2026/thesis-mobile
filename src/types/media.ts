export interface AttachmentFile {
  uri: string;
  name: string;
  type: string;
  // Present only for attachments already saved on the server (hydrated from a
  // MediaAttachmentResponse). Distinguishes "existing remote photo" from "newly picked local
  // photo" so editing an entry can tell which ones to re-upload vs. which to leave alone, and
  // which to call DELETE /api/v1/tracking/media/{id} for when removed.
  id?: string;
}
