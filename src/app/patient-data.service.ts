import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ApiCaller } from './api-caller';
import { Problem } from './problem.model';  // Service is responsible for processing raw data response into Problem instances

@Injectable()
export class PatientDataService extends ApiCaller {
  // URLs for hosts of mock data corresponding to:
  private mockProblemsUrl = 'https://api.myjson.com/bins/hgjib';        // * problems.json
  private mockRelationshipsUrl = 'https://api.myjson.com/bins/1fzolf';  // * relationships.json
  private dataSampleUrl = 'https://api.myjson.com/bins/195gh3';
  private relationshipSampleUrl = 'https://api.myjson.com/bins/l3rcn';

  constructor(private _http: Http) {
    super(_http);
  }

  getSummary(patientId) {
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=ClinicalSummary&PatientID='+patientId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=ClinicalSummary&PatientID='+patientId);
    return this.makeCall("getClinicalItemLH.php", "ClinicalItem=ClinicalSummary&PatientID="+patientId);
  }

  getPhotoSrc(patientId) {
    // return 'http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItemPhoto.php?ClinicalItem=PatientPhoto&PatientID='+patientId;
    // return 'http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItemPhoto.php?ClinicalItem=PatientPhoto&PatientID='+patientId;
    return this.getUrl("getClinicalItemPhoto.php", "ClinicalItem=PatientPhoto&PatientID="+patientId);
  }

  getWellnessScore(patientId) {
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItem.php?ClinicalItem=WellnessScore&PatientID='+patientId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItem.php?ClinicalItem=WellnessScore&PatientID='+patientId);
    return this.makeCall("getClinicalItem.php", "ClinicalItem=WellnessScore&PatientID="+patientId);
  }

  getProblems(patientId) {
    patientId = "1";
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItems.php?ClinicalItem=ProblemsList&PatientID='+patientId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItems.php?ClinicalItem=ProblemsList&PatientID='+patientId);
    return this.makeCall("getClinicalItems.php", "ClinicalItem=ProblemsList&PatientID="+patientId);
  }

  getClinicalEventData(patientId) {
    patientId = '1';
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItems.php?ClinicalItem=ClinicalEventTimeline&PatientID='+patientId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItems.php?ClinicalItem=ClinicalEventTimeline&PatientID='+patientId);
    return this.makeCall("getClinicalItems.php", "ClinicalItem=ClinicalEventTimeline&PatientID="+patientId);
  }

  getChecklistData(item = ""){
    return  this._http.get('./checklist.json');
  }

  // these 2 functions are used to test out ProblemsListComponent with custom mock data
  getProblemsForPatient(patientId) {
    return this._http.get(this.mockProblemsUrl);
  }
  getProblemRelationshipsForPatient(patientId) {
    return this._http.get(this.mockRelationshipsUrl);
  }
  getSampleProblemData() {
    return this._http.get(this.dataSampleUrl);
  }
  getSampleRelationshipsData() {
    return this._http.get(this.relationshipSampleUrl);
  }

  transformData(rawData: any) {
    let data: any[];
    data = [];
    rawData.forEach((prob) => {
      let dataset = new Problem(prob['id'], prob['problem'], this.parseDate(prob['onset']), prob['active'], prob['resolved']);
      dataset.medline = prob['medline'];
      dataset.clinicalGuidelines = prob['cqm'];
      dataset.notes = prob['notes'];
      data.push(dataset);
    });

    return data;
  }

  transformProblemData(rawData: any) {
    let data: any[];
    data = [];
    rawData.forEach((prob) => {
      let dataset = new Problem(
        prob['ProblemLists_ID'],
        prob['Problem'],
        this.parseDate(prob['DateOfOnset']),
        prob['IsActive'],
        prob['IsResolved']);
      data.push(dataset);
    });

    return data;
  }

  public parseDate(input: string): Date {
    let day: number;
    let month: number;
    let year: number;
    let re = /([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})/;
    let match = re.exec(input);
    year = parseInt(match[1]);
    month = parseInt(match[2]);
    day = parseInt(match[3]);

    return new Date(year, month-1, day);
  }
}
