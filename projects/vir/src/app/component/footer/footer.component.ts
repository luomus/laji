import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
  '5138', // paikkatieto
  // Muuta
  '2814' // punaisen kirjan verkkopalvelu
];

const augment = {
  263: [{id: '4271', title: 'Lokitus'}],
  261: [
    {id: '4404', title: 'Usein kysytyt kysymykset'},
    {id: '4515', title: 'Webinaarit'},
    {id: '6461', title: 'Virva-viranomaisrajoitukset'},
    {id: '6403', title: 'Viranomaisportaalin ohjeet'},
    {id: '6443', title: 'Rajapinnat'}
  ]
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
  ) {
    this.tree$ = this.baseDataService.getBaseData().pipe(
      map(data => data.information && data.information.children || []),
      map(data => (
        data.map(information => (
          {
            ...information,
            children: [
              ...information.children.filter(child => informationWhitelist.some(w => w === child.id)),
              ...((<any>augment)[information.id] ?? [])
            ]
          }
        ))
      ))
    );
  }

  ngOnInit() {
    this.footerService.footerVisible$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }
}
