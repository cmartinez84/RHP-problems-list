import { Http } from '@angular/http';

export class ApiCaller {
  private domain = 'sample-env-4.mhzbupucny.us-west-2.elasticbeanstalk.com/';
  // private domain = 'localhost:8000/';

  constructor(private http: Http) { }

  makeCall(file, query) {
    let fileComponent = encodeURIComponent(file);
    let queryComponent = encodeURIComponent(query);
    return this.http.get('http://'+this.domain+'apiCalls.php?file='+fileComponent+'&query='+queryComponent);
  }

  getUrl(file, query) {
    let fileComponent = encodeURIComponent(file);
    let queryComponent = encodeURIComponent(query);
    return this.http.get('http://'+this.domain+'apiCalls.php?returnURL=true&file='+fileComponent+'&query='+queryComponent);
  }
}
