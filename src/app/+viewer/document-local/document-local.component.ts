import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'laji-document-local',
  templateUrl: './document-local.component.html',
  styleUrls: ['./document-local.component.css']
})
export class DocumentLocalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() document: any;
  @Input() useWorldMap = true;

  active = 0;
  personID: string;
  mapData = [];
  hasMapData = false;

  private metaFetch: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.action$
      .startWith('')
      .switchMap(() => this.userService.getUser())
      .subscribe(person => {
        this.personID = person.id;
        this.cd.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.document) {
      this.hasMapData = false;
      this.mapData = [];
      this.document.gatherings.map((gathering, i) => {
        if (gathering.geometry) {
          this.hasMapData = true;
          this.mapData[i] = gathering.geometry;
        }
      });
    }
  }

  ngOnDestroy() {
    this.metaFetch.unsubscribe();
  }
}
