import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonSpecimensComponent } from './taxon-specimens.component';

describe('TaxonSpecimensComponent', () => {
  let component: TaxonSpecimensComponent;
  let fixture: ComponentFixture<TaxonSpecimensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonSpecimensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
