import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { FooterService } from '../../../../shared/service/footer.service';
import { ProjectFormService } from '../../../../shared/service/project-form.service';

@Component({
  selector: 'laji-np-print',
  templateUrl: './np-print.component.html',
  styleUrls: ['./np-print.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpPrintComponent implements OnInit, OnDestroy {

  namedPlace$: Observable<NamedPlace>;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private footerService: FooterService,
    private projectFormService: ProjectFormService
  ) { }

 ngOnInit() {
    this.footerService.footerVisible = false;
    this.namedPlace$ = this.projectFormService.getNamedPlacesRouteData$(this.route).pipe(map(data => data.namedPlace));
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }
}
