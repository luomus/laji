import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from 'projects/laji/src/app/shared/service/footer.service';

@Component({
  selector: 'vir-footer',
  templateUrl: './footer.component.html',
  styleUrls: [
    '../../../../../laji/src/app/shared/footer/footer.component.scss',
    './footer.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  @Input() onFrontPage = false;

  footerVisible$: Observable<boolean>;

  constructor(footerService: FooterService) {
    this.footerVisible$ = footerService.footerVisible$;
  }
}
