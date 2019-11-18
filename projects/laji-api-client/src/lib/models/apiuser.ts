/* tslint:disable */
export interface APIUser {

  /**
   * Source systems ID (only admin can edit)
   */
  systemID?: string;

  /**
   * Email address to where feedback is send (only admin can edit)
   */
  feedbackEmail?: string;
  email: string;
}
