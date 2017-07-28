import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApiCaller } from './api-caller';
// include mock data for testing
import { PROBLEMS, GUIDELINES } from './mock_guidelines_data';


// establish format for guideline data
export class Guideline {
  constructor(
    public code: string,
    public title: string,
    public body: string,
    public references: any[]
  ) { }
}

@Injectable()
export class ClinicalGuidelinesService extends ApiCaller {

  constructor(private _http: Http) {
    super(_http);
  }

  getGuidelines(): Promise<any> {
    return new Promise((resolve, reject) => {
        // simulate server latency with 2-second delay
        setTimeout(() => resolve(GUIDELINES), 10);
    });
  }

  transformData(rawData: any) {
    let guidelines = {};
    PROBLEMS.forEach((problemId) => {
      guidelines[problemId] = [];
      let problemGuidelines = rawData[problemId];
      problemGuidelines.forEach((guideline) => {
        guidelines[problemId].push(new Guideline(guideline.code, guideline.title, guideline.body, guideline.references));
      });
    });
    return guidelines;
  }
}
