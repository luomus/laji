import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-line-transect-my-document-list',
  templateUrl: './line-transect-my-document-list.component.html',
  styleUrls: ['./line-transect-my-document-list.component.css']
})
export class LineTransectMyDocumentListComponent implements OnInit {

  collectionID = Global.collections.lineTransect;

  ngOnInit() {
  }

}
