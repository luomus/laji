/* tslint:disable */
export interface Feedback {

  /**
   * subject for the feedback
   */
  subject: string;

  /**
   * feedback message
   */
  message: string;

  /**
   * Metadata about the feedback
   */
  meta?: string;
}
