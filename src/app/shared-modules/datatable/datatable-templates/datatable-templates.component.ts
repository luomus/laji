import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { SYNONYM_KEYS } from '../../../+taxonomy/species/service/taxon-export.service';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-datatable-templates',
  templateUrl: './datatable-templates.component.html',
  styleUrls: ['./datatable-templates.component.css']
})
export class DatatableTemplatesComponent {
  @ViewChild('defaultHeaderTpl', { static: true }) dafaultHeader: TemplateRef<any>;
  @ViewChild('labelHeaderTpl', { static: true }) labelHeader: TemplateRef<any>;
  @ViewChild('taxon', { static: true }) taxon: TemplateRef<any>;
  @ViewChild('originalTaxon', { static: true }) originalTaxon: TemplateRef<any>;
  @ViewChild('species', { static: true }) species: TemplateRef<any>;
  @ViewChild('synonyms', { static: true }) synonyms: TemplateRef<any>;
  @ViewChild('eventDate', { static: true }) eventDate: TemplateRef<any>;
  @ViewChild('multiLang', { static: true }) multiLang: TemplateRef<any>;
  @ViewChild('multiLangAll', { static: true }) multiLangAll: TemplateRef<any>;
  @ViewChild('vernacularName') vernacularName: TemplateRef<any>;
  @ViewChild('scientificName', { static: true }) scientificName: TemplateRef<any>;
  @ViewChild('taxonScientificName', { static: true }) taxonScientificName: TemplateRef<any>;
  @ViewChild('taxonScientificNameLink', { static: true }) taxonScientificNameLink: TemplateRef<any>;
  @ViewChild('cursive', { static: true }) cursive: TemplateRef<any>;
  @ViewChild('boolean', { static: true }) boolean: TemplateRef<any>;
  @ViewChild('label', { static: true }) label: TemplateRef<any>;
  @ViewChild('labelArray', { static: true }) labelArray: TemplateRef<any>;
  @ViewChild('warehouseLabel', { static: true }) warehouseLabel: TemplateRef<any>;
  @ViewChild('toSemicolon', { static: true }) toSemicolon: TemplateRef<any>;
  @ViewChild('numeric', { static: true }) numeric: TemplateRef<any>;
  @ViewChild('date', { static: true }) date: TemplateRef<any>;
  @ViewChild('user', { static: true }) user: TemplateRef<any>;
  @ViewChild('publication', { static: true }) publication: TemplateRef<any>;
  @ViewChild('publicationArray', { static: true }) publicationArray: TemplateRef<any>;
  @ViewChild('iucnStatus', { static: true }) iucnStatus: TemplateRef<any>;
  @ViewChild('annotation', { static: true }) annotation: TemplateRef<any>;
  @ViewChild('image', { static: true }) image: TemplateRef<any>;
  @ViewChild('link', { static: true }) link: TemplateRef<any>;
  @ViewChild('number', { static: true }) number: TemplateRef<any>;
  @ViewChild('biogeographicalProvince', { static: true }) biogeographicalProvince: TemplateRef<any>;
  @ViewChild('taxonHabitats', { static: true }) taxonHabitats: TemplateRef<any>;

  annotationTypes = Annotation.TypeEnum;
  synonymKeys = SYNONYM_KEYS;
  annotationTagsObservation = Global.annotationTags;

  constructor() { }

  roundNumber(value: number) {
    return Math.round(value * 10 ) / 10;
  }

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }

  void() {}
}
