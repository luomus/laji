import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { HeaderService } from '../../../shared/service/header.service';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'laji-kerttu-instructions',
  templateUrl: './kerttu-instructions.component.html',
  styleUrls: ['./kerttu-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuInstructionsComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
    private title: Title
  ) { }

  ngOnInit() {
    setTimeout(() => {
      const paragraph = (document.getElementsByTagName("laji-kerttu-instructions")).item(0).getElementsByTagName("p")?.item(0)?.innerText;
      const image = (document.getElementsByTagName("laji-kerttu-instructions")).item(0).getElementsByTagName("img")?.item(0)?.src;
      this.headerService.createTwitterCard(this.title.getTitle());
      this.headerService.updateMetaDescription(paragraph);
      if (image) {
        this.headerService.updateFeatureImage(image);
      }
    }, 0);
  }

}
