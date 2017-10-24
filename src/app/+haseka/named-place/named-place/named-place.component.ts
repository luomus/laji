import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { FormService } from '../../../shared/service/form.service';
import { NpChooseComponent } from '../np-choose/np-choose.component';
import { Observable } from 'rxjs/Observable';
import { FooterService } from '../../../shared/service/footer.service';

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css']
})
export class NamedPlaceComponent implements OnInit, OnDestroy {
  formId;
  collectionId;

  formData;

  namedPlaces: NamedPlace[];
  activeNP = -1;
  namedPlace: NamedPlace;

  editMode = false;

  errorMsg = '';

  private subParam: Subscription;
  private namedPlaces$: Observable<NamedPlace[]>;
  private subTrans: Subscription;

  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;

  constructor(
    private route: ActivatedRoute,
    private namedPlaceService: NamedPlacesService,
    private formService: FormService,
    private footerService: FooterService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.collectionId = params['collectionId'];
    });

    this.updateNP();
    this.getFormInfo();
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.formData = null;
        this.getFormInfo();
      }
    );

    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
    this.footerService.footerVisible = true;
  }

  private updateNP() {
    if (this.collectionId) {
      this.namedPlaces$ = this.namedPlaceService
        .getAllNamePlacesByCollectionId(this.collectionId);

      this.namedPlaces$.subscribe(
        data => {
          this.setActiveNP(-1);
          data.sort(this.sortFunction);
          this.namedPlaces = data;
        },
        err => {
          this.translate.get('np.loadError')
            .subscribe(msg => (this.setErrorMessage(msg)));
        }
      );
    }
  }

  private getFormInfo() {
    this.formService.getForm(this.formId, this.translate.currentLang)
      .subscribe(data => {
          this.formData = data;
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {formId: this.formId})
            .subscribe(msg => this.setErrorMessage(msg));
        }
      );
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

  toNormalMode(np: NamedPlace) {
    if (np) {
      if (this.activeNP >= 0) {
        this.namedPlaces[this.activeNP] = np;
        this.namedPlace = np;
      } else {
        this.namedPlaces.push(np);
      }
    }
    this.editMode = false;
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }

  private sortFunction(a, b) {
    let aa, bb;

    if (Number(a.alternativeID) && Number(b.alternativeID)) {
      aa = Number(a.alternativeID);
      bb = Number(b.alternativeID);
    } else {
      aa = a.name.toLowerCase();
      bb = b.name.toLowerCase();
    }

    return aa < bb ? -1 : aa > bb ? 1 : 0;
  }

  /*private naturalSort(a, b) {
    function chunkify(t) {
      const tz = [];
      let x = 0, y = -1, n = false, i, j;

      while (i = (j = t.charAt(x++)).charCodeAt(0)) {
        const m = (i === 46 || (i >= 48 && i <= 57));
          if (m !== n) {
            tz[++y] = '';
            n = m;
          }
          tz[y] += j;
       }
      return tz;
    }

    const aa = chunkify(a.name);
    const bb = chunkify(b.name);
    const aa = a.name.toLowerCase().split(' ');
    const bb = b.name.toLowerCase().split(' ');

    for (let x = 0; aa[x] && bb[x]; x++) {
      if (aa[x] !== bb[x]) {
        const c = Number(aa[x]), d = Number(bb[x]);
        if (c !== null && d !== null) {
          return c - d;
        } else {
          return (aa[x] > bb[x]) ? 1 : -1;
        }
      }
    }
    return aa.length - bb.length;
  }*/
}
