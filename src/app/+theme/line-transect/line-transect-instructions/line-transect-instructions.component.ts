import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'laji-line-transect-instructions',
  templateUrl: './line-transect-instructions.component.html',
  styleUrls: ['./line-transect-instructions.component.css']
})
export class LineTransectInstructionsComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
      this.route.fragment.subscribe((frag) => {
        if (frag) {
          window.location.hash = frag;
        }
    });
  }

  toFragment(fragment) {
    window.location.hash = fragment;
  }
}
