import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '../../shared/model/Form';
import ResultServiceType = Form.ResultServiceType;
import { ProjectFormService } from '../../shared/service/project-form.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'laji-result-service',
    template: `
    <div lajiFormOption="options.resultServiceType">
      @switch ((form$ | async)!.options?.resultServiceType) {
        @case (ResultServiceType.winterBirdCount) {
          <div>
            <laji-wbc-result [form]="(form$ | async)!"></laji-wbc-result>
          </div>
        }
        @case (ResultServiceType.lineTransect) {
          <div>
            <laji-line-transect-result></laji-line-transect-result>
          </div>
        }
        @case (ResultServiceType.nafi) {
          <div>
            <laji-nafi-result [form]="(form$ | async)!"></laji-nafi-result>
          </div>
        }
        @case (ResultServiceType.sykeInsect) {
          <div>
            <laji-syke-insect-result [form]="(form$ | async)!"></laji-syke-insect-result>
          </div>
        }
        @case (ResultServiceType.invasiveSpeciesControl) {
          <div>
            <laji-invasive-species-control-result [form]="(form$ | async)!"></laji-invasive-species-control-result>
          </div>
        }
        @case (ResultServiceType.completeLists) {
          <div>
            <laji-biomon-result [form]="(form$ | async)!"></laji-biomon-result>
          </div>
        }
        @case (ResultServiceType.waterBirdCount) {
          <div>
            <laji-water-bird-count-result [form]="(form$ | async)!"></laji-water-bird-count-result>
          </div>
        }
        @case (ResultServiceType.birdPointCount) {
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
  form$!: Observable<Form.SchemaForm | undefined>;

  ResultServiceType = ResultServiceType; // eslint-disable-line @typescript-eslint/naming-convention

  constructor(
    private projectFormService: ProjectFormService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
