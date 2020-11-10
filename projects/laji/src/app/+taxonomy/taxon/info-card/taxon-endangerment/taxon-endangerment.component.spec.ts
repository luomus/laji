import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonEndangermentComponent } from './taxon-endangerment.component';

describe('TaxonEndangermentComponent', () => {
  let component: TaxonEndangermentComponent;
  let fixture: ComponentFixture<TaxonEndangermentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonEndangermentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonEndangermentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
