import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonNameComponent } from './taxon-name.component';

describe('TaxonNameComponent', () => {
  let component: TaxonNameComponent;
  let fixture: ComponentFixture<TaxonNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
