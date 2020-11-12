import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../../shared/service/header.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'laji-ykj',
  templateUrl: './ykj.component.html'
})
export class YkjComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private headerService: HeaderService,
    private title: Title
    ) {}

    ngOnInit() {
      this.headerService.createTwitterCard(this.title.getTitle());
      setTimeout(() => {
        const paragraph = (document.getElementsByTagName("laji-ykj")).item(0).getElementsByTagName("p")?.item(0)?.innerText;
        const image = (document.getElementsByTagName("laji-ykj")).item(0).getElementsByTagName("img")?.item(0)?.src;
        this.headerService.updateMetaDescription(paragraph);
        if (image) {
          this.headerService.updateFeatureImage(image);
        }
      },0)
    }
}
