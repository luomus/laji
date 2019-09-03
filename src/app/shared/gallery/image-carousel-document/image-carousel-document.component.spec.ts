import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCarouselDocumentComponent } from './image-carousel-document.component';

describe('ImageCarouselDocumentComponent', () => {
  let component: ImageCarouselDocumentComponent;
  let fixture: ComponentFixture<ImageCarouselDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageCarouselDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCarouselDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
