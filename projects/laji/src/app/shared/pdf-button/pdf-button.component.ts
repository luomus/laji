import * as FileSaver from 'file-saver';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'projects/laji/src/environments/environment';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-pdf-button',
  templateUrl: './pdf-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfButtonComponent {

  @Input() fileName: string;

  public loading = false;

  constructor(
    private lajiApiService: LajiApiService,
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
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, this.prepareHtml(document.getElementsByTagName('html')[0].innerHTML))
        .subscribe((response) => {
          FileSaver.saveAs(response, fileName + '.pdf');
          this.loading = false;
          this.cdr.markForCheck();
        }, () => {
          this.loading = false;
          this.cdr.markForCheck();
        });
    }
  }

  private prepareHtml(s: string) {
    // Make absolute SVG ids relative
    s = s.replace(/xlink:href=".*?#/g, 'xlink:href="#');
    // Strip scripts
    s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return s;
  }
}
