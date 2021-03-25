import { TaxonomyImage } from '../../model/Taxonomy';

export interface IImageSelectEvent {
  taxonId: string;
  documentId: string;
  unitId: string;
  fullURL: string;
}

export interface Image extends TaxonomyImage {

  taxonId?: string;

  documentId?: string;

  unitId?: string;

  vernacularName?: string;

  scientificName?: string;

  caption?: string;
}
