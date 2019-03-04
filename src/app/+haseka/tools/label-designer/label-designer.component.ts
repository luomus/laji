import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Presets, ILabelField, ISetup } from 'generic-label-maker';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { PdfLabelService } from '../../../shared/service/pdf-label.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  labelFields$: Observable<ILabelField[]>;
  setup: ISetup;
  data: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
    private pdfLabelService: PdfLabelService
  ) { }

  ngOnInit() {
    this.labelFields$ = this.pdfLabelService.allPossibleFields();
    this.setup = {
      page: {
        ...Presets.A4,
        'paddingTop.mm': 10,
        'paddingLeft.mm': 10,
        'paddingBottom.mm': 10,
        'paddingRight.mm': 10
      },
      label: {
        'height.mm': 20,
        'width.mm': 50,
        'marginTop.mm': 1.5,
        'marginLeft.mm': 1.5,
        'marginBottom.mm': 1.5,
        'marginRight.mm': 1.5,
        'font-family': 'Arial',
        'font-size.pt': 9
      },
      labelItems: this.pdfLabelService.possibleFields.map((a, i) => ({
        type: 'field',
        y: i === 0 ? 0 : (i - 1) * 5,
        x: i === 0 ? 0 : 15,
        fields: [a],
        style: {
          'width.mm': i === 0 ? 13 : 33,
          'height.mm': i === 0 ? 13 : 5
        }
      })).splice(0, 2)
    };
    this.data = this.getMockData();
  }


  htmlToPdf(html: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, html)
        .subscribe((response) => {
          FileSaver.saveAs(response,  'labels.pdf');
        });
    }
  }

  // tslint:disable
  private getMockData() {
    return [
      {id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.121', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.122', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.123', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.124', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.125', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.126', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.127', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.128', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.129', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.131', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.132', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.133', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.134', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.135', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.136', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.137', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.138', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.139', leg: 'Viltsu', taxon: 'kottarainen', count: 130, sex: '', locality: 'Parkkuu', country: 'Suomi', coordinates: '668443:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.1211', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1221', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.1231', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.1241', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1251', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.1261', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1271', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1281', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.1291', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1311', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1321', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1331', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1341', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1351', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.1361', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1371', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.1381', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.1121', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1122', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.1123', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'}
    ];
  }

}
