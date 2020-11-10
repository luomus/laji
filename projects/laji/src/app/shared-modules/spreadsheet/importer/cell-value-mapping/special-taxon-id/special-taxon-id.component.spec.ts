import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialTaxonIdComponent } from './special-taxon-id.component';

describe('SpecialTaxonIdComponent', () => {
  let component: SpecialTaxonIdComponent;
  let fixture: ComponentFixture<SpecialTaxonIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialTaxonIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialTaxonIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
