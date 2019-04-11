import { Component, OnChanges, Input } from '@angular/core';
import {Occurrence} from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrence-map',
  templateUrl: './taxon-occurrence-map.component.html',
  styleUrls: ['./taxon-occurrence-map.component.scss']
})
export class TaxonOccurrenceMapComponent implements OnChanges {
  @Input() occurrences: Occurrence[];
  @Input() height = '100%';
  @Input() width = '100%';

  fillData = {};
  statusList = [];
  colorByStatus = {
    'MX.doesNotOccur': '#000000',
    'MX.typeOfOccurrenceOccurs': '#90ee90',
    'MX.typeOfOccurrenceStablePopulation': '#006400',
    'MX.typeOfOccurrenceOccasional': '#008000',
    'MX.typeOfOccurrenceCommon': '#00ff00',
    'MX.typeOfOccurrenceRare': '#00ffff',
    'MX.typeOfOccurrenceVeryRare': '#008b8b',
    'MX.typeOfOccurrenceVagrant': '#f0e68c',
    'MX.typeOfOccurrenceRareVagrant': '#bdb76b',
    'MX.typeOfOccurrenceMigrant': '#ff8c00',
    'MX.typeOfOccurrenceImport': '#e9967a',
    'MX.typeOfOccurrenceAnthropogenic': '#ffc0cb',
    'MX.typeOfOccurrenceNotEstablished': '#b22222',
    'MX.typeOfOccurrenceExtirpated': '#800000',
    'MX.typeOfOccurrenceOldRecords': '#a52a2a',
    'MX.typeOfOccurrenceUncertain': '#ffff00',
    'MX.typeOfOccurrenceSpontaneousOldResident': '#d9b3ff',
    'MX.typeOfOccurrenceSpontaneousNewResident': '#bf80ff',
    'MX.typeOfOccurrenceAlienOldResident': '#ecb3ff',
    'MX.typeOfOccurrenceSpontaneousNewEphemeral': '#a64dff',
    'MX.typeOfOccurrenceSpontaneousNewEphemeralOnlyOld': '#8c1aff',
    'MX.typeOfOccurrenceSpontaneousOldFormerlyResidentPossiblyExtinct': '#7300e6',
    'MX.typeOfOccurrenceSpontaneousOldFormerlyResidentExtinct': '#5900b3',
    'MX.typeOfOccurrenceAlienNewEphemeral': '#d24dff',
    'MX.typeOfOccurrenceAlienNewEphemeralOnlyold': '#c61aff',
    'MX.typeOfOccurrenceAlienNewResident': '#df80ff',
    'MX.typeOfOccurrenceAlienOldFormerlyResidentPossiblyExtinct': '#ac00e6',
    'MX.typeOfOccurrenceAlienOldExtinct': '#8600b3',
    'MX.typeOfOccurrenceSmallDegreeCultivatedOrigin': '#b3b3ff',
    'MX.typeOfOccurrenceNotableDegreeCultivatedOrigin': '#8080ff',
    'MX.typeOfOccurrenceCompletelyCultivatedOrigin': '#4d4dff',
    'MX.typeOfOccurrenceOnlyCultivated': '#1a1aff',
    'MX.typeOfOccurrenceMaxShortDistanceEscape': '#0000e6',
    'MX.typeOfOccurrenceMaxSoilImmigrant': '#0000b3',
    'MX.typeOfOccurrenceMaxReplanted': '#000080',
    'MX.typeOfOccurrenceMaxRelict': '#00004d',
    'MX.typeOfOccurrenceNotEvaluated': '#c0c0c0'
  };

  constructor() { }

  ngOnChanges() {
    this.fillData = {};
    this.statusList = [];

    (this.occurrences || []).forEach(occ => {
      if (this.statusList.indexOf(occ.status) === -1) {
        this.statusList.push(occ.status);
      }
      this.fillData[occ.area] = this.colorByStatus[occ.status];
    });
  }
}
