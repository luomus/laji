import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-nafi-my-document-list',
  templateUrl: './nafi-my-document-list.component.html',
  styleUrls: ['./nafi-my-document-list.component.css']
})
export class NafiMyDocumentListComponent implements OnInit {

  collectionID = Global.collections.nafi;

  ngOnInit() {
  }

}
