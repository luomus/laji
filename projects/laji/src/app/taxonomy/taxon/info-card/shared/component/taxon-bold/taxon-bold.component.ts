import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client/generated/api.d';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';
import { DownloadParams, FORMAT } from 'projects/laji/src/app/shared-modules/download-modal/download.component';
import { ExportService } from 'projects/laji/src/app/shared/service/export.service';

type Taxon = components['schemas']['LajiBackendTaxon'];

interface BoldEntry {
  scientificName: string;
  publicRecords: number;
  bins: string[];
}

@Component({
    selector: 'laji-taxon-bold',
    templateUrl: './taxon-bold.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TaxonBoldComponent implements OnChanges {

  @Input() taxon!: Taxon;

  @Input() displayReferenceSequences = true;

  @ViewChild('chooseFileTypeModal', { static: true }) public modal!: ModalComponent;

  boldEntries: BoldEntry[] = [];

  referenceSequenceColumns: { prop: keyof Taxon['referenceSequences'][number]; label: string; cellTemplate?: any }[] = [
    { prop: 'sequenceText', label: 'taxonomy.referenceSequences.sequenceText' },
    { prop: 'locus', label: 'taxonomy.referenceSequences.locus', cellTemplate: 'label' },
    { prop: 'specimenId', label: 'taxonomy.referenceSequences.specimenId' },
    { prop: 'externalSequenceId', label: 'taxonomy.referenceSequences.externalSequenceId' }
  ];

  constructor(
    public translate: TranslateService,
    private exportService: ExportService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.taxon) {
      this.boldEntries = [];
      this.getBoldEntries();
    }
  }

  getBoldEntries() {
    if (this.taxon.hasBold === false) {
      return;
    }

    this.getBoldEntry(this.taxon);

    if (this.taxon.synonyms) {
      this.taxon.synonyms.forEach(synonym => {
        this.getBoldEntry(synonym);
      });
    }
  }

  getBoldEntry(taxon: Taxon['synonyms'][number]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let scientificName = this.taxon.scientificName!;
    let publicRecords = 0;
    const bins: string[] = [];

    if (taxon.scientificName) {
      scientificName = taxon.scientificName;
    }

    if (taxon.bold?.publicRecords) {
      publicRecords = taxon.bold.publicRecords;
    }

    if (taxon.bold?.binCount && taxon.bold?.binCount > 0) {
      taxon.bold?.bins?.forEach(bin => {
        bins.push(bin);
      });
    }

    if (publicRecords > 0 || bins.length > 0) {
      this.boldEntries.push({
        scientificName,
        publicRecords,
        bins
      });
    }
  }

  openChooseFileTypeModal() {
    this.modal.show();
  }

  downloadReferenceSequences({ fileType }: DownloadParams) {
    const aoa = [
      this.referenceSequenceColumns.map(col => this.translate.instant(col.label)),
      ...this.taxon.referenceSequences.map(refSeq =>
        this.referenceSequenceColumns.map(col => refSeq[col.prop])
      )
    ];

    this.exportService.export(
      aoa,
      fileType as Exclude<FORMAT, 'gpkg'>,
      `${this.translate.instant('taxonomy.referenceSequences.download.fileName')}-${this.taxon.id})`,
      { forceQuotes: true }
    ).subscribe();
  }
}
