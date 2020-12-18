import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpeciesImagesComponent } from './species-images.component';

describe('SpeciesImagesComponent', () => {
  let component: SpeciesImagesComponent;
  let fixture: ComponentFixture<SpeciesImagesComponent>;

  beforeEach(waitForAsync(() => {
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
