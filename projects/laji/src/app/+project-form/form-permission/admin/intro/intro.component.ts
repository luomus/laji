import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Form } from '../../../../shared/model/Form';
import { ProjectFormService } from '../../../../shared/service/project-form.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'laji-intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.css'],
    standalone: false
})
export class IntroComponent implements OnInit {

  form$!: Observable<Form.SchemaForm | undefined>;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
