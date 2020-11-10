import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IUserMappingFile, MappingFileService } from '../../service/mapping-file.service';

@Component({
  selector: 'laji-user-mapping-button',
  templateUrl: './user-mapping-button.component.html',
  styleUrls: ['./user-mapping-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMappingButtonComponent {

  @Input() hasUserMapping = false;
  @Input() showSave = false;

  @Output() loadError = new EventEmitter();
  @Output() userMapping = new EventEmitter<IUserMappingFile>();
  @Output() clearUserMapping = new EventEmitter();

  constructor(
    private mappingFileService: MappingFileService,
    private cdr: ChangeDetectorRef
  ) {}

  loadFile(event: Event) {
    this.mappingFileService.load(event).subscribe(
      (data) => {
        (event.target as HTMLInputElement).value = '';
        this.userMapping.emit(data);
        this.cdr.detectChanges();
      },
      () => {
        this.loadError.emit();
        this.cdr.detectChanges();
      }
    );
  }
}
