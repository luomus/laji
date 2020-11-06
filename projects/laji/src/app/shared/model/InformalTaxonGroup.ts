'use strict';

import { Group } from './Group';

export interface InformalTaxonGroup extends Group {

  hasSubGroup?: Array<string|InformalTaxonGroup>;
}
