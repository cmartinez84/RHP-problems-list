//import necessary modules to make api call to medline//
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

@Injectable()
export class MedlineDataService {
  private baseUrl: string = 'https://apps2.nlm.nih.gov/medlineplus/services/mpconnect_service.cfm?';
  private codeSystem: string = '2.16.840.1.113883.6.103';

  constructor(private http: Http) {}

  getMedlineData(problemCode: string) {
    let url: string = this.baseUrl +
                      'mainSearchCriteria.v.cs=' +
                      this.codeSystem +
                      '&mainSearchCriteria.v.c=' +
                      problemCode +
                      '&knowledgeResponseType=application/json';

    return this.http.get(url);
  }

  private handleError(error: Response) {
      console.error(error);
      let msg = `Error status code ${error.status} at ${error.url}`;
      return Observable.throw(msg);
  }
}
