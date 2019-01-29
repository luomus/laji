import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesImagesComponent } from './species-images.component';

describe('SpeciesImagesComponent', () => {
  let component: SpeciesImagesComponent;
  let fixture: ComponentFixture<SpeciesImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
