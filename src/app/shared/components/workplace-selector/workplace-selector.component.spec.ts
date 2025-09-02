import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceSelectorComponent } from './workplace-selector.component';

describe('WorkplaceSelectorComponent', () => {
  let component: WorkplaceSelectorComponent;
  let fixture: ComponentFixture<WorkplaceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplaceSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkplaceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
