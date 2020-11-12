import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../../../app/shared/service/header.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'laji-emk',
  templateUrl: './emk.component.html',
  styles: [`
    .alternative {
      background-color: #fffacf;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmkComponent {

  constructor(
    public translate: TranslateService,
    private headerService: HeaderService,
    private title: Title
    ) {
      setTimeout(() => {
        this.headerService.createTwitterCard(this.title.getTitle());
        const paragraph = (document.getElementsByTagName("laji-emk")).item(0).getElementsByTagName("p")?.item(0)?.innerText;
        const image = (document.getElementsByTagName("laji-emk")).item(0).getElementsByTagName("img")?.item(0)?.src;
        this.headerService.updateMetaDescription(paragraph);
        this.headerService.updateFeatureImage(image);
      }, 0);
    }

}
