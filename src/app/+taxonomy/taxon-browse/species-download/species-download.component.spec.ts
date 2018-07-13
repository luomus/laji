import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesDownloadComponent } from './species-download.component';

describe('SpeciesDownloadComponent', () => {
  let component: SpeciesDownloadComponent;
  let fixture: ComponentFixture<SpeciesDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
