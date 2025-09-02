import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostunitSelectionComponent } from './costunit-selection.component';

describe('CostunitSelectionComponent', () => {
  let component: CostunitSelectionComponent;
  let fixture: ComponentFixture<CostunitSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostunitSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CostunitSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
