import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonImagesComponent } from './taxon-images.component';

describe('TaxonImagesComponent', () => {
  let component: TaxonImagesComponent;
  let fixture: ComponentFixture<TaxonImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
