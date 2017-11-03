import { TaxonomyImage } from '../model/Taxonomy';

export interface Image extends TaxonomyImage {

  documentId?: string;

  unitId?: string;

  vernacularName?: string;

  scientificName?: string;

}
