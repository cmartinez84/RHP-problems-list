import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

export class EMRData {
    constructor(){}
}

@Injectable()
export class DataService {

    constructor(private http: Http) { }

    getEMRData(item = "") {
        return  this.http.get('emrdata.json')
            .map((response: Response) => item===""?response.json():response.json().emrData[item]);
    }

    private handleError(error: Response) {
        console.error(error);
        let msg = `Error status code ${error.status} at ${error.url}`;
        return Observable.throw(msg);
    }

}
