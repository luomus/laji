import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export type StaticHtmlTemplateName = 'footer';

@Injectable({
  providedIn: 'root'
})

export class StaticHtmlTemplateService {
  constructor(
    private translate: TranslateService,
    private httpClient: HttpClient
  ) {}

  getTemplate(templateName: StaticHtmlTemplateName): Observable<string> {
    const lang = this.translate.currentLang;
    return this.httpClient.get(
      `/static/templates/${lang}/${templateName}.html`,
      { responseType: 'text' }
    );
  }
}
