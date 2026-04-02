import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectFormService } from '../../shared/service/project-form.service';
import { ActivatedRoute } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];

@Component({
    selector: 'laji-result-service',
    template: `
    <div lajiFormOption="options.resultServiceType">
      @switch ((form$ | async)!.options?.resultServiceType) {
        @case ('MHL.resultServiceTypeWinterBirdCount') {
          <div>
            <laji-wbc-result [form]="(form$ | async)!"></laji-wbc-result>
          </div>
        }
        @case ('MHL.resultServiceTypeLineTransect') {
          <div>
            <laji-line-transect-result></laji-line-transect-result>
          </div>
        }
        @case ('MHL.resultServiceTypeNafi') {
          <div>
            <laji-nafi-result [form]="(form$ | async)!"></laji-nafi-result>
          </div>
        }
        @case ('MHL.resultServiceTypeSykeInsectProjects') {
          <div>
            <laji-syke-insect-result [form]="(form$ | async)!"></laji-syke-insect-result>
          </div>
        }
        @case ('MHL.resultServiceTypeInvasiveControl') {
          <div>
            <laji-invasive-species-control-result [form]="(form$ | async)!"></laji-invasive-species-control-result>
          </div>
        }
        @case ('MHL.resultServiceTypeCompleteLists') {
          <div>
            <laji-biomon-result [form]="(form$ | async)!"></laji-biomon-result>
          </div>
        }
        @case ('MHL.resultServiceTypeWaterBirdCount') {
          <div>
            <laji-water-bird-count-result [form]="(form$ | async)!"></laji-water-bird-count-result>
          </div>
        }
        @case ('MHL.resultServiceTypeBirdPointCount') {
          <div>
            <laji-bird-point-count-result [form]="(form$ | async)!"></laji-bird-point-count-result>
          </div>
        }
      }
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ResultsComponent implements OnInit {
  form$!: Observable<Form | undefined>;

  constructor(
    private projectFormService: ProjectFormService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
