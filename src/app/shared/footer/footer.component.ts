import { Component } from '@angular/core';
import { FooterService } from '../service/footer.service';

@Component({
  selector: 'laji-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  constructor(public footerService: FooterService) {
  }
}
