import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, forkJoin as ObservableForkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { MultiLangService } from '../../../shared-modules/lang/service/multi-lang.service';
import { PublicationService } from '../../../shared/service/publication.service';
import { Publication } from '../../../shared/model/Publication';
import { UserService } from '../../../shared/service/user.service';
import { Person } from '../../../shared/model/Person';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class DatatableUtil {
  constructor(
    private labelService: TriplestoreLabelService,
    private publicationService: PublicationService,
    private userService: UserService,
    private translate: TranslateService
  ) { }

  getVisibleValue(value, template): Observable<string> {
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
      case 'iucnStatus':
        observable = ObservableOf(value.status.replace('MX.iucn', '') + ' (' + value.year + ')');
        break;
      case 'user':
        observable = this.getUserName(value);
        break;
      default:
        observable = ObservableOf(value);
        break;
    }

    return observable;
  }

  private getLabels(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (let i = 0; i < values.length; i++) {
      labelObservables.push(
        this.labelService.get(values[i], this.translate.currentLang)
      )
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
        this.publicationService.getPublication(values[i], this.translate.currentLang)
          .map((res: Publication) => {
            return res && res['dc:bibliographicCitation'] ? res['dc:bibliographicCitation'] : values[i];
          })
      )
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
