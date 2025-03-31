import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FooterService } from '../service/footer.service';

interface MaybeMultiLang { fi: string; sv?: string; en?: string };

const infoLajiFiLangUrlMap: Record<string, MaybeMultiLang> = {
  readMore: { fi: 'https://info.laji.fi/', sv: 'https://info.laji.fi/sv/', en: 'https://info.laji.fi/en/' },
  contact: { fi: 'https://info.laji.fi/etusivu/lajitietokeskus-pahkinankuoressa/yhteystiedot/' },
  privacyPolicy: { fi: 'https://info.laji.fi/etusivu/lajitietokeskus-pahkinankuoressa/tietosuojaseloste/' },
  accessibility: { fi: 'https://info.laji.fi/etusivu/lajitietokeskus-pahkinankuoressa/saavutettavuusseloste/' },
  dataPolicy: {
    fi: 'https://info.laji.fi/etusivu/lajitietokeskus-pahkinankuoressa/aineistopolitiikka/',
    sv: 'https://info.laji.fi/sv/lajitietokeskuksen-ohje-ja-tietopankki-svenska/datapolicy-for-finlands-artdatacenter/'
  },
  restApi: {
    fi: 'https://info.laji.fi/etusivu/api/', en: 'https://info.laji.fi/en/frontpage/api/',
    sv: 'https://info.laji.fi/sv/lajitietokeskuksen-ohje-ja-tietopankki-svenska/api-technical/'
  },
  rApi: { fi: 'https://info.laji.fi/etusivu/r-paketti/', en: 'https://github.com/luomus/finbif', sv: 'https://github.com/luomus/finbif' },
  gis: { fi: 'https://info.laji.fi/etusivu/paikkatieto/', en: 'https://info.laji.fi/en/frontpage/spatial-data/', sv: 'https://info.laji.fi/en/frontpage/spatial-data/' },
  support: { fi: 'https://info.laji.fi/' },
  faq: { fi: 'https://info.laji.fi/ukk/' },
  dataUsers: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-datan-omistajille/', en: 'https://info.laji.fi/en/frontpage/datasets-and-their-use/' },
  dataHolders: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-datan-kayttajille/' },
  researchers: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-tutkijoille/' },
  natureObservers: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-luontoharrastajille/' },
  developers: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-kehittajille/' },
  media: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-medialle/' },
  taxa: { fi: 'https://info.laji.fi/etusivu/taksonomian-hallinta/' },
  observations: { fi: 'https://info.laji.fi/etusivu/havaintotieto/' },
  gisServices: { fi: 'https://info.laji.fi/etusivu/paikkatieto/' },
  citizenScience: { fi: 'https://info.laji.fi/kansalaistiede-ja-lajien-seuranta/' },
  identification: { fi: 'https://info.laji.fi/etusivu/lajintunnistus/' },
  apis: { fi: 'https://info.laji.fi/etusivu/oppaat/opas-kehittajille/' },
};

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements AfterViewInit {
  @Input() onFrontPage = false;

  footerVisible$: Observable<boolean>;

  constructor(footerService: FooterService, private translate: TranslateService, private cdr: ChangeDetectorRef) {
    this.footerVisible$ = footerService.footerVisible$;
  }

  ngAfterViewInit() {
    this.translate.onLangChange.subscribe(() => this.cdr.markForCheck());
  }

  getInfoLajiFiUrl(key: keyof typeof infoLajiFiLangUrlMap): string | undefined {
    return infoLajiFiLangUrlMap[key][this.translate.currentLang as keyof typeof infoLajiFiLangUrlMap[typeof key]];
  }
}
