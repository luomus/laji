import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-count',
  templateUrl: './kerttu-count.component.html',
  styleUrls: ['./kerttu-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuCountComponent {
  @Input() label: string;
  @Input() labelInfo: string;
  @Input() count: number;
  @Input() additionalDescription: string;
  @Input() additionalDescriptionInfo: string;
  @Input() asPercentage = false;

  lang: string;

  constructor(
    private translate: TranslateService
  ) {
    this.lang = this.translate.currentLang;
  }
}
