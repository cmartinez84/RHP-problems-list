import { Problem } from './problem.model';
import { ProblemListTableRow } from './problems-list/problem-list-table-row';

export class ProblemList {
  public masterIndexedProblems;
  //the masterIndexedProblems is what we create on loading the page and maintains a represenatation of data from the db
  public indexedProblems;
  // the indexedProblems representes our UI state of the data between saving all changes.
  private trackedChanges = {};
  //trackedChanges is a mock databse transaction, which will only be submitted on ths.saveAllChanges(), and can be read in console

  constructor(problems: Problem[] = []) {
    this.masterIndexedProblems = {};
    problems.forEach((problem) => {
      this.masterIndexedProblems[problem.id] = problem;
    });
  }
  // pl = "problems list". i use it only for readability to distinguish it from other identically named methods.
  allProblems(): Problem[] {
    let output: Problem[];
    output = [];
    for (let id in this.indexedProblems) {
      output.push(this.indexedProblems[id].problem);
    }
    return output;
  }
  addChildTo(childId, parentId) {
    this.masterIndexedProblems[parentId].childrenIds.push(childId);
  }
  //update masterIndexedProblems with on saving all changes
  refreshMasterList(){
    this.masterIndexedProblems = {};
    this.masterIndexedProblems = Object.assign({}, this.indexedProblems);
  }
  //for use with onInit and for cacelling all changes. resets UI state
  generateIndexedProblems(){
    this.indexedProblems = {};
    this.indexedProblems = Object.assign({}, this.masterIndexedProblems);
  }

  addProblem(problem){
      this.indexedProblems[problem.id] = problem;
      let statement = problem.name.toString() + " added";
      this.trackedChanges[problem.id] = statement;
  }

  removeProblem(problem){
    let statement = problem.name.toString() + " removed";
    this.trackedChanges[problem.id] = statement;
    delete this.indexedProblems[problem.id];
  }

  plSubmitNewProblem(problemName, onsetDate, childrenIds){
    if (problemName) {
      let newIndex = Object.keys(this.indexedProblems).length;
      let onsetDate  = new Date();
      let newProblem = new Problem(newIndex, problemName, onsetDate, true, false, ["250"]);
      newProblem.childrenIds = childrenIds;
      newProblem.saved = false;
      childrenIds.forEach((childId)=>{
      let childProblem = this.indexedProblems[childId];
        childProblem.forceResolved();
        console.log(childProblem);
      });
      this.addProblem(newProblem);
    }
  }

  saveAllChanges(){
    let trackedKeys = Object.keys(this.trackedChanges);
    trackedKeys.forEach((trackedKey)=>{
      if(this.indexedProblems[trackedKey]){
        let problem = this.indexedProblems[trackedKey];
        problem.saved = true;
        problem.modified = false;
        this.refreshMasterList();
      }
    })
    this.trackedChanges = {};
  }

  cancelAllChanges(){
    this.generateIndexedProblems();
  }
  //used with proceeding methods
  cloneProblem(problem): Problem{
    let clone = new Problem(problem.id, problem.name, problem.onsetDate, problem.active, problem.resolved,
      problem.medline);
      clone.childrenIds = problem.childrenIds.slice(0);
      // clone.clinicalGuidelines = problem.clinicalGuidelines.slice(0);
      clone.notes = problem.notes;
      clone.displayChildrenIds = problem.displayChildrenIds.slice(0);
      clone.saved = problem.saved;
      clone.modified = problem.saved;
      this.indexedProblems[clone.id] = clone;
      // console.log(clone);
      return clone;
  }
  //the follwing two methods create a new instance of Problem object while preserving the original Problem List
  plSetActive(problemId){
    //sets state as well as returns new value
    let problem = this.indexedProblems[problemId];
    if(problem.modified === false){

      problem = this.cloneProblem(problem);
    }
    let result = problem.setActive();

    let statement = problem.name + " active statement changed to " + result.toString();
    this.trackedChanges[problemId] = statement;
  }

  plSetResolved(problemId){
    //sets state as well as returns new value
    let problem = this.indexedProblems[problemId];
    if(problem.modified === false){
      problem = this.cloneProblem(problem);
    }
    let result = problem.setResolved();
    let statement = problem.name + " resolved statement changed to " + result.toString();
    this.trackedChanges[problemId] = statement;
  }
}
