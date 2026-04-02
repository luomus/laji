import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../../../shared/service/form.service';
import { map, switchMap } from 'rxjs';
import { Subscription } from 'rxjs';
import { ExportService } from '../../../../shared/service/export.service';
import moment from 'moment';
import { BookType } from 'xlsx';
import { ProjectFormService } from '../../../../shared/service/project-form.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];
type Participant = components['schemas']['Participant'];

@Component({
    selector: 'laji-form-participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.css'],
    standalone: false
})
export class ParticipantsComponent implements OnInit, OnDestroy {

  form: Form | undefined;
  loaded = false;
  fetching = false;

  participants$!: Subscription;
  form$!: Subscription;

  columns = [
    {
      label: 'form.participants.export.id',
      name: 'id'
    },
    {
      label: 'form.participants.export.fullName',
      name: 'fullName'
    },
    {
      label: 'form.participants.export.emailAddress',
      name: 'emailAddress'
    },
    {
      label: 'form.participants.export.lintuvaaraLoginName',
      name: 'lintuvaaraLoginName'
    },
    {
      label: 'form.participants.export.lastDoc',
      name: 'lastDoc'
    },
    {
      label: 'form.participants.export.docCount',
      name: 'docCount'
    },
  ];

  constructor(private route: ActivatedRoute,
              private formService: FormService,
              private exportService: ExportService,
              private projectFormService: ProjectFormService
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route).subscribe(form => {
      this.form = form;
      this.loaded = true;
    });
  }

  ngOnDestroy() {
    if (this.participants$) {
      this.participants$.unsubscribe();
    }
    if (this.form$) {
      this.form$.unsubscribe();
    }
  }

  getParticipants(type: string) {
    this.fetching = true;
    if (!this.form) {
      return;
    }
    this.participants$ = this.formService.getParticipants(this.form).pipe(
      map(this.formatData),
      switchMap(data => this.exportService.exportFromData(data, this.columns, type as BookType, `laji-${this.form!.id}-participants`))
    ).subscribe(() => {
      this.fetching = false;
    });
  }

  private formatData(data: Participant[]) {
    return data.map(participant => ({
      ...participant,
      lintuvaaraLoginName: (participant.lintuvaaraLoginName || []).map(i => i.replace('lintuvaara:', '')),
      lastDoc: participant.lastDoc && moment(participant.lastDoc).format('YYYY-MM-DD')
    }));
  }
}
