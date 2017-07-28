import { TestBed, inject } from '@angular/core/testing';

import { ClinicalGuidelinesService } from './clinical-guidelines.service';

describe('ClinicalGuidelinesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalGuidelinesService]
    });
  });

  it('should be created', inject([ClinicalGuidelinesService], (service: ClinicalGuidelinesService) => {
    expect(service).toBeTruthy();
  }));
});
