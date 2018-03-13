import { NamedPlace } from '../../../shared/model/NamedPlace';

export interface ExtendedNamedPlace extends NamedPlace {
  _status: 'free'|'mine'|'reserved'|'sent';
}
