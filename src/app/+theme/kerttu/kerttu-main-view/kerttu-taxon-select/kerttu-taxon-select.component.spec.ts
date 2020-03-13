import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuTaxonSelectComponent } from './kerttu-taxon-select.component';

describe('KerttuTaxonSelectComponent', () => {
  let component: KerttuTaxonSelectComponent;
  let fixture: ComponentFixture<KerttuTaxonSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuTaxonSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuTaxonSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
