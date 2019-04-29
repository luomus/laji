import { Injectable } from '@angular/core';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { MultiLangService } from '../../../shared-modules/lang/service/multi-lang.service';
import { PublicationService } from '../../../shared/service/publication.service';
import { Publication } from '../../../shared/model/Publication';
import { UserService } from '../../../shared/service/user.service';
import { Person } from '../../../shared/model/Person';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DatatableUtil {
  constructor(
    private labelService: TriplestoreLabelService,
    private publicationService: PublicationService,
    private userService: UserService,
    private translate: TranslateService
  ) { }

  getVisibleValue(value, row, template): Observable<string> {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      if (['latestRedListEvaluationHabitats', 'redListStatus2010', 'redListStatus2015', 'taxonName'].indexOf(template) === -1) {
        return ObservableOf('');
      }
    }

    let observable;
    switch (template) {
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
      case 'latestRedListEvaluationHabitats':
        if (!row.latestRedListEvaluation || !row.latestRedListEvaluation.primaryHabitat) {
          return ObservableOf('');
        }
        const habitats = [row.latestRedListEvaluation.primaryHabitat].concat(row.latestRedListEvaluation.secondaryHabitats || []);
        observable = ObservableForkJoin(habitats.map(h => this.getLabels(h.habitat))).pipe(
          map(data => data.join('; '))
        );
        break;
      case 'redListStatus2010':
      case 'redListStatus2015':
        const year = template === 'redListStatus2010' ? 2010 : 2015;
        (row.redListStatusesInFinland || []).forEach(status => {
          if (status.year === year) {
            observable = this.getLabels(status.status);
          }
        });
        break;
      case 'iucnStatus':
        observable = ObservableOf(value.status.replace('MX.iucn', '') + ' (' + value.year + ')');
        break;
      case 'user':
        observable = this.getUserName(value);
        break;
      case 'taxonName':
        observable = ObservableOf(
          (row.scientificName || '') + (row.scientificName && row.vernacularName ? ' – ' : '') + (row.vernacularName || '')
        );
        break;
      default:
        observable = ObservableOf(value);
        break;
    }

    return observable || ObservableOf(value);
  }

  private getLabels(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (let i = 0; i < values.length; i++) {
      labelObservables.push(
        this.labelService.get(values[i], this.translate.currentLang)
      );
    }
    return ObservableForkJoin(labelObservables).pipe(
      map(labels => labels.join('; '))
    );
  }

  private getPublications(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (let i = 0; i < values.length; i++) {
      labelObservables.push(
        this.publicationService.getPublication(values[i], this.translate.currentLang).pipe(
          map((res: Publication) => {
            return res && res['dc:bibliographicCitation'] ? res['dc:bibliographicCitation'] : values[i];
          }))
      );
    }
    return ObservableForkJoin(labelObservables).pipe(
      map(labels => labels.join('; '))
    );
  }


  private getUserName(value): Observable<string> {
    return this.userService.getUser(value)
      .pipe(map((user: Person) => (user.fullName || '')));
  }
}
