import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApiCaller } from './api-caller';

@Injectable()
export class PhysicianDataService extends ApiCaller{
  constructor(_http: Http) {
    super(_http);
  }

  getAllPatients(physicianId) {
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=PatientList&ProviderID='+physicianId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=PatientList&ProviderID='+physicianId);
    return this.makeCall("getClinicalItemLH.php", "ClinicalItem=PatientList&ProviderID="+physicianId);
  }
  getTodaysPatients(physicianId) {
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=AppointmentList&AppointmentDate=Today&ProviderID='+physicianId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=AppointmentList&AppointmentDate=Today&ProviderID='+physicianId);
    return this.makeCall("getClinicalItemLH.php", "ClinicalItem=AppointmentList&AppointmentDate=Today&ProviderID="+physicianId);
  }
  getTomorrowsPatients(physicianId) {
    // return this.http.get('http://sample-env-1.ubqrpdwqmj.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=AppointmentList&AppointmentDate=Tomorrow&ProviderID='+physicianId);
    // return this.http.get('http://sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/getClinicalItemLH.php?ClinicalItem=AppointmentList&AppointmentDate=Tomorrow&ProviderID='+physicianId);
    return this.makeCall("getClinicalItemLH.php", "ClinicalItem=AppointmentList&AppointmentDate=Tomorrow&ProviderID="+physicianId);
  }
}
