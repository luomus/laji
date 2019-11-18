/* tslint:disable */
import { Annotation } from './annotation';
export interface Notification {
  id: string;
  annotation?: Annotation;
  created?: string;
  friendRequest?: string;
  friendRequestAccepted?: string;
  seen?: boolean;
  toPerson?: string;
}
