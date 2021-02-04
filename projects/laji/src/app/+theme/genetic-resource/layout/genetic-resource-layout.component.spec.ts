import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneticResourceLayoutComponent } from './genetic-resource-layout.component';

describe('LayoutComponent', () => {
  let component: GeneticResourceLayoutComponent;
  let fixture: ComponentFixture<GeneticResourceLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticResourceLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticResourceLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
