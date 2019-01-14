import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { LabelField, Setup } from 'generic-label-maker';
import { Presets } from 'generic-label-maker';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  labelFields: LabelField[] = [
    {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste - QRCode', isQRCode: true},
    {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste'},
    {field: 'leg', content: 'Matti Meikäläinen', label: 'Kerääjä'},
    {field: 'taxon', content: 'Parus major', label: 'Laji'},
    {field: 'count', content: '10', label: 'Määrä'},
    {field: 'sex', content: 'uros', label: 'Sukupuoli'},
    {field: 'locality', content: 'Kuusen alla', label: 'Sijainti'},
    {field: 'country', content: 'Suomi', label: 'Maa'},
    {field: 'coordinates', content: '338:665', label: 'Koordinaatit'},
    {field: 'notes', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas risus magna, vulputate eu ' +
        'sodales sed, ornare sagittis sapien. Sed eu vestibulum metus, ac blandit elit. Nunc at elit posuere, vestibulum metus in, ' +
        'aliquet velit. Aenean ornare nunc scelerisque felis pulvinar, in dignissim quam dignissim. Donec eleifend at nulla ac iaculis. ' +
        'Ut ac volutpat nisl, et interdum urna. Quisque bibendum luctus consectetur.', label: 'Muistiipanot'
    }
  ];

  setup: Setup;
  data: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService
  ) { }

  ngOnInit() {
    this.setup = {
      ...Presets.A4,
      labelItems: this.labelFields.map((a, i) => ({
        type: 'field',
        y: i === 0 ? 0 : (i - 1) * 5,
        x: i === 0 ? 0 : 15,
        fields: i === 4 ? [a, this.labelFields[5]] : [a],
        style: {
          'width.mm': i === 0 ? 13 : 20,
          'height.mm': i === 0 ? 13 : 4
        }
      })).splice(0, 5)
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
      {id: 'http://id.luomus.fi/NMP.1123', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.1124', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1125', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.1126', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1127', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1128', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.1129', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1131', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1132', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1133', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1134', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1135', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.1136', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1137', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.1138', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.11211', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11221', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.11231', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.11241', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11251', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.11261', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11271', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11281', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.11291', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11311', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11321', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11331', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11341', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11351', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.11361', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.11371', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.11381', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},      {id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.1221', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1222', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.1223', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.1224', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1225', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.1226', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1227', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1228', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.1229', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1231', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1232', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1233', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1234', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1235', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.1236', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.1237', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.1238', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.12211', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12221', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.12231', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.12241', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12251', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.12261', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12271', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12281', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.12291', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12311', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12321', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12331', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12341', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12351', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.12361', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12371', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.12381', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.12121', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12122', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.12123', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.12124', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12125', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.12126', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12127', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12128', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.12129', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12131', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12132', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12133', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12134', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12135', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.12136', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.12137', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.12138', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},{id: 'http://id.luomus.fi/NMP.120', leg: 'Viltsu', taxon: 'Parus Major', count: 1, sex: '♀', locality: 'Myllypuro', country: 'Suomi', coordinates: '668543:338542', notes: 'Istui pajun nokassa'},
      {id: 'http://id.luomus.fi/NMP.121211', leg: 'Viltsu', taxon: 'laulujoutsen', count: 2, sex: '♂', locality: 'Leppäharju', country: 'Suomi', coordinates: '668542:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121221', leg: 'Viltsu', taxon: 'kyhmyhaahka', count: 3, sex: '', locality: 'Itis', country: 'Suomi', coordinates: '668543:338542', notes: 'Pariskunata pienen pokaisen kanssa'},
      {id: 'http://id.luomus.fi/NMP.121231', leg: 'Viltsu', taxon: 'mustakurkku-uikku', count: 1, sex: '♀', locality: 'Hämeenkyrö', country: 'Suomi', coordinates: '668544:338542', notes: 'Jotain muuta'},
      {id: 'http://id.luomus.fi/NMP.121241', leg: 'Viltsu', taxon: 'Histrionicus histrionicus', count: 4, sex: '', locality: 'Kuru', country: 'Suomi', coordinates: '668545:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121251', leg: 'Viltsu', taxon: 'amerikankurmitsa', count: 5, sex: '', locality: 'Hki', country: 'Suomi', coordinates: '668546:338542', notes: 'Piilossa kiven kolossa'},
      {id: 'http://id.luomus.fi/NMP.121261', leg: 'Viltsu', taxon: 'munkkikorppikotka', count: 1, sex: '', locality: 'Keskuspuiston ylärinne 5. kiven alla', country: 'Suomi', coordinates: '668573:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121271', leg: 'Viltsu', taxon: 'sinisuo- × arosuohaukka', count: 6, sex: '', locality: 'Espa', country: 'Suomi', coordinates: '668583:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121281', leg: 'Viltsu', taxon: 'lehtopöllö (harmaa värimuoto)', count: 7, sex: '♂', locality: 'Kallio', country: 'Suomi', coordinates: '668533:338542', notes: 'Oli vähän sateista'},
      {id: 'http://id.luomus.fi/NMP.121291', leg: 'Viltsu', taxon: 'harakka', count: 1, sex: '♂', locality: 'Puistola', country: 'Suomi', coordinates: '668513:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121311', leg: 'Viltsu', taxon: 'lyhytvarvaskiuru', count: 8, sex: '♀', locality: 'Siltamäki', country: 'Suomi', coordinates: '668523:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121321', leg: 'Viltsu', taxon: 'harmaakurkkurastas', count: 9, sex: '', locality: 'Haaga', country: 'Suomi', coordinates: '668563:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121331', leg: 'Viltsu', taxon: 'ruostesiipirastas', count: 10, sex: '♀', locality: 'Leppäharju', country: 'Suomi', coordinates: '668843:338542', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121341', leg: 'Viltsu', taxon: 'vuoriuunilintu', count: 11, sex: '♂', locality: 'Koivusalo', country: 'Suomi', coordinates: '668943:338252', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121351', leg: 'Viltsu', taxon: 'Acrocephalus schoenobaenus', count: 10, sex: '', locality: 'Tesoma', country: 'Suomi', coordinates: '668043:338242', notes: 'Lensi korkealla idässä'},
      {id: 'http://id.luomus.fi/NMP.121361', leg: 'Viltsu', taxon: 'Nucifraga caryocatactes caryocatactes', count: 2, sex: '♀', locality: 'Hervanta', country: 'Suomi', coordinates: '668510:338242', notes: ''},
      {id: 'http://id.luomus.fi/NMP.121371', leg: 'Viltsu', taxon: 'aromerikotka', count: 3, sex: '♂', locality: 'Pasila', country: 'Suomi', coordinates: '668511:338542', notes: 'Kevät asussa'},
      {id: 'http://id.luomus.fi/NMP.121381', leg: 'Viltsu', taxon: 'mustanmerenlokki', count: 1100, sex: '♂', locality: 'Käkisalmi', country: 'Suomi', coordinates: '668543:338542', notes: ''},
    ];
  }

}
