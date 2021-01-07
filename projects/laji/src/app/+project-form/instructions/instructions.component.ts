import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ProjectFormService } from '../project-form.service';
import { ActivatedRoute } from '@angular/router';
import { MultiLanguage } from '../../../../../laji-api-client/src/lib/models';

@Component({
  template: `<laji-info-page [child]="instructions$ | async | multiLang: true:undefined:'%value%'"></laji-info-page>`,
  selector: 'laji-instructions'
})
export class InstructionsComponent implements OnInit {

  instructions$: Observable<MultiLanguage>;

  constructor(private projectFormService: ProjectFormService,
              private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.instructions$ = this.projectFormService.getFormFromRoute$(this.route)
      .pipe(map(form => {console.log(form); return form.options.instructions; }));
  }

}
