import { Annotation } from './Annotation';

export interface Notification {

  id?: string;

  /**
   * QName for the person this notification is for
   */
  toPerson?: string;

  /**
   * Annotation connected to this
   */
  annotation?: Annotation;

  friendRequest?: string;

  friendRequestAccepted?: string;

  /**
   * Has the annotation been marked as seen
   */
  seen?: boolean;

  /**
   * dateTime string using ISO8601 format
   */
  created?: string;
}
