/* tslint:disable */
import { InformationItem } from './information-item';
export interface Information {
  id: string;
  content: string;
  title?: string;
  menuTitle?: string;
  author?: string;
  posted?: string;
  modified?: string;
  children?: Array<InformationItem>;
  parents?: Array<InformationItem>;
}
