import * as FileSaver from 'file-saver';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'projects/laji/src/environments/environment';
import { PlatformService } from '../../root/platform.service';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'laji-pdf-button',
  templateUrl: './pdf-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfButtonComponent {

  @Input() element?: HTMLElement;
  @Input() fileName?: string;

  public loading = false;

  constructor(
    private lajiApiService: LajiApiService,
    private httpClient: HttpClient,
    private platformService: PlatformService,
    private cdr: ChangeDetectorRef
  ) {}

  print(event: MouseEvent) {
    event.stopPropagation();

    const {base = ''} = environment;
    const fileName = this.fileName ?? `${base.replace(/https?:\/\//, '')}.${moment().format('YYYY-MM-DDTHH:mm')}`;
    this.loading = true;
    this.cdr.markForCheck();

    if (this.platformService.isBrowser) {
      let html: string;
      if (this.element) {
        html = document.getElementsByTagName('head')[0].outerHTML + '<body style="padding: 0; margin: 0;">' + this.element.outerHTML + '</body>';
      } else {
        html = document.getElementsByTagName('html')[0].innerHTML;
      }
      this.prepareHtml(html).pipe(
        switchMap(processedHtml => this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, processedHtml))
      ).subscribe(response => {
        FileSaver.saveAs(response, fileName + '.pdf');
        this.loading = false;
        this.cdr.markForCheck();
      }, () => {
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }

  private prepareHtml(s: string): Observable<string> {
    // Make absolute SVG ids relative
    s = s.replace(/xlink:href=".*?#/g, 'xlink:href="#');
    // Strip scripts
    s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Replace local stylesheet link with the styles
    const stylesheetRegex = /<link.*?href="(styles.*?\.css)".*?>/;
    const stylesheetFileName = s.match(stylesheetRegex)?.[1];

    if (stylesheetFileName) {
      return this.httpClient.get(stylesheetFileName, { responseType: 'text' }).pipe(map(styles => {
        s = s.replace(stylesheetRegex, '<style>' + styles + '</style>');
        s = s.replace(/<noscript><link.*?href="(styles.*?\.css)".*?><\/noscript>/, '');
        return s;
      }));
    } else {
      return of(s);
    }
  }
}
