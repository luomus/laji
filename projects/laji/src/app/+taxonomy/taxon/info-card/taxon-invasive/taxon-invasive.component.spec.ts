import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonInvasiveComponent } from './taxon-invasive.component';

describe('TaxonInvasiveComponent', () => {
  let component: TaxonInvasiveComponent;
  let fixture: ComponentFixture<TaxonInvasiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonInvasiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonInvasiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
