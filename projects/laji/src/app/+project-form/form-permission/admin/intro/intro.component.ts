import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectFormService } from '../../../../shared/service/project-form.service';
import { Observable } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];

@Component({
    selector: 'laji-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.css'],
    standalone: false
})
export class IntroComponent implements OnInit {

  form$!: Observable<Form | undefined>;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
