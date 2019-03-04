'use strict';

import { Group } from './Group';

export interface RedListTaxonGroup extends Group {

  hasIucnSubGroup?: Array<string|RedListTaxonGroup>;

  includesTaxon?: string[];
}
