import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Form } from '../../../../shared/model/Form';
import { ProjectFormService } from '../../../project-form.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  form$: Observable<Form.SchemaForm>;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
