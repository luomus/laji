import { Component, Input } from '@angular/core';
import { FooterService } from '../service/footer.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  @Input() onFrontPage = false;

  constructor(public footerService: FooterService) {}
}
