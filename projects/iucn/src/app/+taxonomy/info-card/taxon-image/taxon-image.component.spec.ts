import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonImageComponent } from './taxon-image.component';

describe('TaxonImageComponent', () => {
  let component: TaxonImageComponent;
  let fixture: ComponentFixture<TaxonImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
