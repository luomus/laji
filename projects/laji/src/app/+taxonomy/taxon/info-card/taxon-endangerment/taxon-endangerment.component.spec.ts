import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonEndangermentComponent } from './taxon-endangerment.component';

describe('TaxonEndangermentComponent', () => {
  let component: TaxonEndangermentComponent;
  let fixture: ComponentFixture<TaxonEndangermentComponent>;

  beforeEach(waitForAsync(() => {
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
