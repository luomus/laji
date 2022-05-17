import { Injectable } from '@angular/core';
import { forkJoin as ObservableForkJoin, from, Observable, of as ObservableOf } from 'rxjs';
import { concatMap, map, toArray } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { MultiLangService } from '../../lang/service/multi-lang.service';
import { PublicationService } from '../../../shared/service/publication.service';
import { Publication } from '../../../shared/model/Publication';
import { UserService } from '../../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../../shared/service/id.service';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { AreaService } from '../../../shared/service/area.service';

@Injectable({
  providedIn: 'root'
})
export class DatatableUtil {
  constructor(
    private labelService: TriplestoreLabelService,
    private areaService: AreaService,
    private publicationService: PublicationService,
    private userService: UserService,
    private translate: TranslateService,
    private warehouseValueMappingService: WarehouseValueMappingService
  ) { }

  getVisibleValue(value, row, templateName: string): Observable<string> {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      if (['taxonHabitats', 'latestRedListEvaluationHabitats', 'redListStatus2010', 'redListStatus2015', 'taxonName', 'biogeographicalProvinceOccurrence']
        .indexOf(templateName) === -1) {
        return ObservableOf('');
      }
    }

    if (Array.isArray(value) && ['informalTaxonGroup'].indexOf(templateName) === -1 &&
      !templateName.startsWith('latestRedListEvaluation.threatenedAtArea_') && !templateName.startsWith('latestRedListEvaluation.occurrences_')) {
      return from(value).pipe(
        concatMap(val => this.getVisibleValue(val, row, templateName)),
        toArray(),
        map(values => values.join(', '))
      );
    }

    if (templateName.startsWith('latestRedListEvaluation.threatenedAtArea_')) {
      const area = templateName.split('_')[1];
      return ObservableOf(value.includes(area) ? 'RT' : '');
    } else if (templateName.startsWith('latestRedListEvaluation.occurrences_')) {
      const targetArea = templateName.split('_')[1];
      const match = value.filter(val => val.area === targetArea);
      return match.length > 0 ? this.getLabels(match[0].status) : ObservableOf(value);
    }

    let observable;
    switch (templateName) {
      case 'warehouseLabel':
        observable = this.getWarehouseLabels(value);
        break;
      case 'label':
      case 'labelArray':
        observable = this.getLabels(value);
        break;
      case 'multiLang':
        observable = ObservableOf(MultiLangService.getValue(value, this.translate.currentLang, '%value% (%lang%)'));
        break;
      case 'multiLangAll':
        observable = ObservableOf(MultiLangService.valueToString(value));
        break;
      case 'boolean':
        if (value === true) {
          observable = this.translate.get('yes');
        } else {
          observable = this.translate.get('no');
        }
        break;
      case 'publication':
      case 'publicationArray':
        observable = this.getPublications(value);
        break;
      case 'taxonHabitats':
        observable = this.getHabitats(row);
        break;
      case 'latestRedListEvaluationHabitats':
        if (!row.latestRedListEvaluation) {
          return ObservableOf('');
        }
        observable = this.getHabitats(row.latestRedListEvaluation);
        break;
      case 'redListStatus2010':
      case 'redListStatus2015':
        const year = templateName === 'redListStatus2010' ? 2010 : 2015;
        (row.redListStatusesInFinland || []).forEach(status => {
          if (status.year === year) {
            observable = this.getLabels(status.status);
          }
        });
        break;
      case 'iucnStatus':
        observable = ObservableOf(IdService.getId(value?.status).replace('MX.iucn', '') + ' (' + value?.year + ')');
        break;
      case 'user':
        observable = this.userService.getPersonInfo(value);
        break;
      case 'species':
        observable = this.getTaxon(value, 'speciesScientificName');
        break;
      case 'taxon':
        observable = this.getTaxon(value);
        break;
      case 'taxonName':
        observable = ObservableOf(
          (row.scientificName || '') + (row.scientificName && row.vernacularName ? ' – ' : '') + (row.vernacularName || '')
        );
        break;
      case 'informalTaxonGroup':
        observable = this.getLabels(value[value.length - 1]);
        break;
      case 'biogeographicalProvinceOccurrence':
        observable = this.getBiogeographicalProvinceOccurence(row.occurrences);
        break;
      default:
        break;
    }

    return observable || ObservableOf(value);
  }

  private getBiogeographicalProvinceOccurence(occurrences): Observable<string> {
    if (!occurrences) {
      return ObservableOf('');
    }

    return this.getArray(occurrences, (occurrence) => ObservableForkJoin([
      this.areaService.getProvinceCode(IdService.getId(occurrence.area), this.translate.currentLang),
      this.labelService.get(IdService.getId(occurrence.status), this.translate.currentLang)
    ]).pipe(
      map(data => data[0]+ ': ' + data[1])
    ), '; ')
  }

  private getWarehouseLabels(values): Observable<string> {
    return this.getArray(values, (value) => this.warehouseValueMappingService.getSchemaKey(value).pipe(
        concatMap(key => this.labelService.get(IdService.getId(key), this.translate.currentLang))
      ), '; ');
  }

  private getLabels(values): Observable<string> {
    return this.getArray(values, (value) => this.labelService.get(IdService.getId(value), this.translate.currentLang), '; ');
  }

  private getPublications(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (const item of values) {
      labelObservables.push(
        this.publicationService.getPublication(item, this.translate.currentLang).pipe(
          map((res: Publication) => res && res['dc:bibliographicCitation'] ? res['dc:bibliographicCitation'] : item))
      );
    }
    return ObservableForkJoin(labelObservables).pipe(
      map(labels => labels.join('; '))
    );
  }

  private getHabitats(obj): Observable<string> {
    if (!obj.primaryHabitat) {
      return ObservableOf('');
    }
    const habitats = (obj.primaryHabitat ? [obj.primaryHabitat] : []).concat(obj.secondaryHabitats || []);
    return ObservableForkJoin(habitats.map(h => this.getLabels(h.habitat))).pipe(
      map(data => data.join('; '))
    );
  }

  private getArray(values: string|string[], getObservable: (string) => Observable<string>, separator: string): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const observables = values.map(value => getObservable(value));
    return ObservableForkJoin(observables).pipe(
      map((labels: string[]) => labels.join(separator))
    );
  }

  private getTaxon(value: any, sciName: 'scientificName' | 'speciesScientificName' = 'scientificName'): Observable<string> {
    if (value.linkings && value.linkings.taxon && value.linkings.taxon.id) {
      return ObservableOf(MultiLangService.getValue(value.linkings.taxon.vernacularName, this.translate.currentLang, '%value% (%lang%)') +
        (value.linkings.taxon[sciName] && value.linkings.taxon.vernacularName  ? ' — ' + value.linkings.taxon[sciName] :
        (value.linkings.taxon[sciName] || '')));
    } else if (value.taxonVerbatim) {
      return ObservableOf(value.taxonVerbatim);
    } else if (value.reportedInformalTaxonGroup) {
      return this.getLabels(value.reportedInformalTaxonGroup);
    }
    return ObservableOf('');
  }
}
