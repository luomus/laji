import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  IRecording,
  IRecordingAnnotation,
  IRecordingStatusInfo,
  ITaxonWithAnnotation,
  TaxonAnnotationEnum
} from '../../models';
import { forkJoin, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Autocomplete } from '../../../../shared/model/Autocomplete';
import { KerttuTaxonService } from '../../service/kerttu-taxon-service';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() recording: IRecording;
  @Input() annotation: IRecordingAnnotation;
  @Input() statusInfo: IRecordingStatusInfo;
  @Input() taxonList: string[];
  @Input() taxonExpertise: string[];

  @Input() buttonsAreDisabled = false;

  @ViewChild('modal') public modalComponent: ModalDirective;

  generalAnnotation: IRecordingAnnotation = {};
  selectedTaxons: {
    main: ITaxonWithAnnotation[];
    other: ITaxonWithAnnotation[];
  };

  loadingTaxons = false;
  modalTaxon: ITaxonWithAnnotation;

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() addToTaxonExpertise = new EventEmitter<string>();
  @Output() annotationChange = new EventEmitter<IRecordingAnnotation>();

  private selectedTaxonsSub: Subscription;

  constructor(
    private taxonService: KerttuTaxonService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording) {
      this.generalAnnotation = {...this.annotation, taxonAnnotations: undefined};
      this.updateSelectedTaxons();
    }
  }

  addTaxonToSelected(taxon: Autocomplete, type: 'main'|'other') {
    if (!this.taxonList || !this.taxonExpertise || this.loadingTaxons) {
      return;
    }
    if (this.selectedTaxons[type].filter(t => t.annotation.taxonId === taxon.key).length > 0) {
      return;
    }

    const newTaxon = {
      ...taxon.payload,
      annotation: {
        taxonId: taxon.key,
        annotation: TaxonAnnotationEnum.occurs,
        bird: taxon.payload.informalTaxonGroups.filter(g => g.id === 'MVL.1').length > 0
      }
    };

    if (this.taxonList.includes(taxon.key) && !this.taxonExpertise.includes(taxon.key)) {
      this.showModal(newTaxon);
    }
    this.selectedTaxons[type] = [...this.selectedTaxons[type], newTaxon];

    this.updateAnnotation();
  }

  updateAnnotation() {
    const taxonAnnotations = {};
    for (const key of Object.keys(this.selectedTaxons)) {
      taxonAnnotations[key] = this.selectedTaxons[key].map(taxon => taxon.annotation);
    }

    this.annotationChange.emit({
      ...this.generalAnnotation,
      taxonAnnotations: taxonAnnotations
    });
  }

  showModal(taxon: ITaxonWithAnnotation) {
    this.modalTaxon = taxon;
    this.modalComponent.show();
  }

  closeModal(addTaxonToExpertise = false) {
    if (addTaxonToExpertise) {
      this.addToTaxonExpertise.emit(this.modalTaxon.annotation.taxonId);
    }
    this.modalComponent.hide();
  }

  private updateSelectedTaxons() {
    if (this.selectedTaxonsSub) {
      this.selectedTaxonsSub = undefined;
    }

    this.selectedTaxons = {
      'main': [],
      'other': []
    };

    const taxonAnnotations = this.annotation?.taxonAnnotations;

    if (taxonAnnotations?.main?.length > 0 || taxonAnnotations?.other?.length > 0) {
      const observables = [];
      for (const type of ['main', 'other']) {
        if (taxonAnnotations[type]?.length > 0) {
          const obs: Observable<ITaxonWithAnnotation>[] = taxonAnnotations[type].map(
            a => this.taxonService.getTaxon(a.taxonId).pipe(map(taxon => {
              return {...taxon, annotation: a};
            }))
          );
          observables.push(forkJoin(obs));
        } else {
          observables.push(of([]));
        }
      }

      this.loadingTaxons = true;
      this.selectedTaxonsSub = forkJoin(observables).subscribe((results: ITaxonWithAnnotation[][])  => {
        this.selectedTaxons = {
          'main': results[0],
          'other': results[1]
        };
        this.loadingTaxons = false;
        this.cdr.markForCheck();
      });
    }
  }
}

