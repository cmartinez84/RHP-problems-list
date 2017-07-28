import {PipeTransform, Pipe} from '@angular/core';
import { Problem } from './problem.model';

@Pipe({
  name: 'problemListFilter',
  pure: true,
})
//my filtering method can be used on the model, but will need a few modifications to make it work by making this a method on ProblemList class, a method that's called whenever there are changes made to Problems. I did try going down that route, but calling that method on clicking checkboxes causes some synchonricity issues (e.g. retrieving value from checkbox input seems to be out of sync when the same action creates a "check" and when the click function is implmented), so perhaps some other input element or button would be better suited. 
export class ProblemListFilterPipe implements PipeTransform{
  transform(originalList, filterActive:boolean, filterAscending: boolean, filterResolved:boolean, problemListLoaded){
    //begin by creating a copy of the indexed Problems of Problem List. we want a copy of the probem list, but keep the references to instantiated problem objects. i think the cleanest approach to filtering, in ths case, is through elimination:
      let allProblemsCopy = Object.assign({}, originalList);

      if(filterActive === true){
          for(let problemId in allProblemsCopy){
            if(!allProblemsCopy[problemId].active){
              delete allProblemsCopy[problemId];
            }
          }
      }

      if(filterResolved === true){
          for(let problemId in allProblemsCopy){
            if(!allProblemsCopy[problemId].resolved){
              delete allProblemsCopy[problemId];
            }
          }
      }
      //by this point, we have a problem list reduced to only desired active and resolved states. since we don't want to actually eliminate the child relationships listed on the problme object, i build out a reusable displayChildrenIds property based on remaining the problem object id's.
      for(let problemKey in allProblemsCopy ){
        let problem = allProblemsCopy[problemKey];
        problem.displayChildrenIds = [];
        problem.childrenIds.forEach((childId)=>{
          if(allProblemsCopy[childId]){
            problem.displayChildrenIds.push(childId);
          }
        })
      }

      //get rid of child problems that have no children of their own, since they will already be displayed with parent
      for (let problemId in allProblemsCopy) {
        allProblemsCopy[problemId].displayChildrenIds.forEach((childId) => {
          // remove any child that is not also a parent from original list
          if(allProblemsCopy[childId] && allProblemsCopy[childId].displayChildrenIds.length === 0) {
            delete allProblemsCopy[childId];
          }
        });
      }

      //ouput will be  [{},{}..] where every {} displays one table row of information, including duplicate instances of a problem, which are taken care of through Angular directives and CSS.
      let problemRows: {}[] = [];
      let allProblemsSorted = [];
      //change from associative array to regular array, to be ordered with sort method.  you cannot sort objects, as Object order is unstabe.
      for(let problemId in allProblemsCopy){
        allProblemsSorted.push(allProblemsCopy[problemId]);
      }

      if(!filterAscending){
        allProblemsSorted.sort((a, b) => {
          a = new Date(a.onsetDate);
          b = new Date(b.onsetDate);
        return a>b ? -1 : a<b ? 1 : 0;
        });
      }
      else {
        allProblemsSorted.sort((b, a) => {
          a = new Date(a.onsetDate);
          b = new Date(b.onsetDate);
        return a>b ? -1 : a<b ? 1 : 0;
        });
      }


      allProblemsSorted.forEach(function(problem){
          let problemRow = {
            problemId: problem.id,
            isParentRow : true,
            hasChildren : false,
            problem : problem
        };

        problem.displayChildrenIds.length > 0 ?  problemRow['hasChildren'] = true: null;
        problemRows.push(problemRow);

        problem.displayChildrenIds.forEach((childId) => {
          let childProblem = originalList[childId];
          let problemRow2 = {
            problemId: childId,
            isParentRow: false,
            expandWith : problem.id,
            problem : childProblem
          };
          problemRows.push(problemRow2);
          });
      });
        return problemRows;
    }
 }
