import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-wbc-own-submissions',
  templateUrl: './wbc-own-submissions.component.html',
  styleUrls: ['./wbc-own-submissions.component.css']
})
export class WbcOwnSubmissionsComponent implements OnInit {

  collectionID = Global.collections.wbc;

  ngOnInit() {
  }

}
