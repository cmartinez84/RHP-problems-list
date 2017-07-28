import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApiCaller } from './api-caller';

@Injectable()
export class DoseResponseDataService extends ApiCaller {

  constructor(private _http: Http) {
    super(_http);
  }

  getData(patientId: string, startDate = 0, endDate = Infinity, clinicalEvents = undefined) {
    patientId = '1';
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItem.php?ClinicalItem=DoseResponseCurve&PatientID='+patientId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItem.php?ClinicalItem=DoseResponseCurve&PatientID='+patientId);
    return this.makeCall("getClinicalItem.php", "ClinicalItem=DoseResponseCurve&PatientID="+patientId);
  }

  transformData(rawData: any, patient: any) {
    let data: any[];
    data = [];
    for(let i=0; i<rawData.length; i++) {
      let name = rawData[i].clinicalevent;
      let dataset = data.find(function(event: any){ return event.name === name; });
      if(dataset === undefined) {
        dataset = {name: name, values: []};
        data.push(dataset);
      }
      let dataPoint = [rawData[i].eventdate, parseFloat(rawData[i].clinicalvalue)];
      dataset.values.push(dataPoint);
      dataset.unit = rawData[i].Units;
      dataset.refMin = parseFloat(rawData[i].referencerangemin);
      dataset.refMax = parseFloat(rawData[i].referencerangemax);
    }
    return {title: "Lab Values for Patient " + patient, data: data};
  }
}
