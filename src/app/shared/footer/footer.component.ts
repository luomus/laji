import { Component } from '@angular/core';
import { FooterService } from '../service/footer.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  constructor(public footerService: FooterService) {
  }
}
