export class Problem {
  public childrenIds: number[] = [];
  public clinicalGuidelines: string [];
  public notes: string;
  public displayChildrenIds = [];
  public saved: boolean = true;
  public modified: boolean = false;

  constructor(
    public id: number,
    public name: string,
    public onsetDate: any,
    private active,
    private resolved: boolean = false,
    public medline: string[] = [],
  ) {}


  setActive(): boolean{
      this.active = !this.active;
      // this.modified = !this.modified;
      return this.active;
  }

  setResolved(): boolean{
    this.resolved = !this.resolved;
    this.modified = !this.modified;
    return this.resolved;
  }
  forceResolved(): boolean{
    this.modified = true;
    this.resolved = true;
    console.log(this.resolved);
    return this.resolved;
  }

}
