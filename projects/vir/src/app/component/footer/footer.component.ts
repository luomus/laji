import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from 'projects/laji/src/app/shared/service/footer.service';
import { BaseDataService } from 'projects/laji/src/app/graph-ql/service/base-data.service';
import { map } from 'rxjs/operators';

const informationWhitelist = [
  // FinBIF
  '2954', '2915', // mission (EN, FI)
  '2982', '3033', // documents
  '848', '713', // privacy policy / tietosuojaseloste
  '1153', '1133', // contact
  // Data management
  '875', '709', // sensitive data
  '2584', '2569', // checklist
  '772', // laadunvalvonta
  // Services and instructions
  '803', // tietovarasto
  '806c1', '806', // API / technical
  // Muuta
  '2814' // punaisen kirjan verkkopalvelu
];

const augment = {
  '263': [{id: '4271', title: 'Lokitus'}]
};

@Component({
  selector: 'vir-footer',
  templateUrl: './footer.component.html',
  styleUrls: [
    '../../../../../laji/src/app/shared/footer/footer.component.scss',
    './footer.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  @Input() onFrontPage = false;

  public tree$: Observable<any>;

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
      map(data => {
        return data.map(information => {
          return {
            ...information,
            children: [
              ...information.children.filter(child => informationWhitelist.some(w => w === child.id)),
              ...(augment[information.id] ?? [])
            ]
          };
        });
      })
    );
  }
}
