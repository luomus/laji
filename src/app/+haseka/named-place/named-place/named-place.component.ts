import { Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { NpChooseComponent} from '../np-choose/np-choose.component';
import { Observable } from 'rxjs/Observable';
import { FooterService } from '../../../shared/service/footer.service';

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css']
})
export class NamedPlaceComponent implements OnInit, OnDestroy, OnChanges {
  formId;
  collectionId;

  namedPlaces: NamedPlace[];
  activeNP = -1;
  namedPlace: NamedPlace;

  editMode = false;

  errorMsg = '';

  private subParam: Subscription;
  private namedPlaces$: Observable<NamedPlace[]>;

  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;

  constructor(
    private route: ActivatedRoute,
    private namedPlaceService: NamedPlacesService,
    private footerService: FooterService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.collectionId = params['collectionId'];
    });

    this.updateNP();
    this.footerService.footerVisible = false;
  }

  ngOnChanges() {
    this.updateNP();
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    this.footerService.footerVisible = true;
  }

  updateNP() {
    if (this.collectionId) {
      this.namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId)
        .map(result => result.results);

      this.namedPlaces$.subscribe(
        data => {
          this.namedPlaces = data;
          if (this.activeNP >= 0) {
            this.namedPlace = this.namedPlaces[this.activeNP];
          } else {
            this.namedPlace = null;
          }
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {formId: this.formId})
            .subscribe(data => this.setErrorMessage(data));
        }
      );
    }
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    if (this.activeNP >= 0) {
      this.namedPlace = this.namedPlaces[this.activeNP];
    } else {
      this.namedPlace = null;
    }
  }

  toEditMode(create: boolean) {
    if (create) {
      this.chooseView.setActiveNP(-1);
    }

    this.editMode = true;
  }

  toNormalMode() {
    this.updateNP();
    this.editMode = false;
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }
}
