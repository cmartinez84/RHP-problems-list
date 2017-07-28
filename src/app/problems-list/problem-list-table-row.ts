export class ProblemListTableRow {
  constructor(public problemId, public isParentRow: boolean, public hasChildren: boolean, public expandWith = null) {}

}
