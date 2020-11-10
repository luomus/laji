import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProjectFormService } from '../project-form.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-project-form-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesComponent implements OnInit {

  collectionID$: Observable<string>;

  @LocalStorage() public showTemplateIntro;

  constructor(
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService
  ) {
  }

  ngOnInit() {
    if (this.showTemplateIntro === null) {
      this.showTemplateIntro = true;
    }
    this.collectionID$ = this.projectFormService.getFormFromRoute$(this.route).pipe(
      map(form => form.collectionID)
    );
  }

  toggleInfo() {
    this.showTemplateIntro = !this.showTemplateIntro;
  }

}

