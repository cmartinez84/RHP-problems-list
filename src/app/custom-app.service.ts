import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class CustomAppService {

  constructor(private http: Http) { }

  getData(request) {
    return this.http.get(request);
  }
}
