import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from '../service/footer.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  @Input() onFrontPage = false;

  footerVisible$: Observable<boolean>;

  constructor(footerService: FooterService) {
    this.footerVisible$ = footerService.footerVisible$;
  }
}
