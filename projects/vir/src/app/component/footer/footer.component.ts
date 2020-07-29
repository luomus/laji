import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from 'src/app/shared/service/footer.service';
import { BaseDataService } from 'src/app/graph-ql/service/base-data.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'vir-footer',
  templateUrl: './footer.component.html',
  styleUrls: [
    '../../../../../../src/app/shared/footer/footer.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  public tree$: Observable<any>;
  public columns = [
    'col-sm-offset-1 col-sm-6 col-md-3',
    'col-sm-5 col-md-2',
    'col-sm-offset-1 col-md-offset-0 col-sm-6 col-md-3 ',
    'col-sm-5 col-md-3'
  ];

  constructor(
    public footerService: FooterService,
    private baseDataService: BaseDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.footerService.footerVisible$.subscribe(visible => {
      this.cdr.markForCheck();
    });
    this.tree$ = this.baseDataService.getBaseData().pipe(
      map(data => data.information && data.information.children || []),
      tap(console.log)
    );
  }
}
