import {PipeTransform, Pipe} from '@angular/core';
import { Problem } from './problem.model';

@Pipe({
  name: 'resolutionSearchFilter',
  pure: true,
})

export class ResolutionSearchFilterPipe implements PipeTransform{
  transform(allProblems: {}, problemSearchTerm: string){
    problemSearchTerm = problemSearchTerm? problemSearchTerm.toLocaleLowerCase(): null;
    let output = [];
      for(let problemKey in allProblems)  {
        output.push(allProblems[problemKey]);
      }
    return problemSearchTerm ? output.filter((problem)=>{
      return problem.name.toLocaleLowerCase().indexOf(problemSearchTerm) !== -1;
    }): output;
  }
 }
