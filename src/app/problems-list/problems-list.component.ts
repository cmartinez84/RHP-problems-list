import { Component, OnInit } from '@angular/core';
import { PatientDataService } from './../patient-data.service';
import { ClinicalGuidelinesService } from './../clinical-guidelines.service';
import { MedlineDataService } from './../medline-data.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { ProblemList } from './../problem-list.model';
import { Problem } from './../problem.model';
import { BaseApp } from './../baseApp';


@Component({
  selector: 'problems-list',
  providers: [PatientDataService, MedlineDataService, ClinicalGuidelinesService],
  templateUrl: './problems-list.component.html',
  styleUrls: ['./problems-list.component.css'],
})

export class ProblemsListComponent extends BaseApp implements OnInit {
  private patientId: string;
  private problems;
  private selectedProblemId;
  private expandedProblemIds = [];
  private filterActive: boolean;
  private filterAscending: boolean;
  private filterResolved: boolean;
  private problemSearchTerm:string;
  private checkedProblems = [];
  private selectedModal: "medline";
  private cgReference = {}
  private cgFormatted= [];
  private selectedGuideline: string;
  // private rows;
  private pipeTrigger = 1;

  private problemList: ProblemList = null;

  private activeFilter = false;
  private onsetSort = false;
  private nameSort = false;
  private medlineTitle: string;
  private notifications: string;
  //changing this condition will trigger the pipe to render the data
  constructor(private pds: PatientDataService,
              private cgs: ClinicalGuidelinesService,
              private mds: MedlineDataService
            )
  {
    super();
    let Component = this;
    this.updateFunctions['patientId'] = function() { Component.getSamplePatientData(); };
    this.patientId = '1';
    this.componentName = 'ProblemListComponent';
    this.title = 'Problem List';
    this.defaultWidth = 800;
    this.defaultHeight = 800;
    this.problemList = new ProblemList();
  }

  ngOnInit() {
    this.cgs.getGuidelines().then(
      (response) => {
        let guidelines = this.cgs.transformData(response);
        this.cgReference = guidelines;
        let output = [];
        for(let cqm in guidelines){
          output.push(guidelines[cqm]);
        }
        this.cgFormatted = output;
      }
    );
  }

  makeMedlineRequest(problemCode: string) {
    this.mds.getMedlineData(problemCode)
            .subscribe(
              (data) => {
                let parsedData = data.json();
                this.renderMedline(parsedData);
              },
              (error) => { console.error('ERROR: failed to load data.'); }
            );
  }

  renderMedline(parsedData){
    this.medlineTitle = parsedData['feed'].entry[0].title._value;
    let medlineDiv = document.getElementById("medlineDiv");
    let medlineSummary = parsedData['feed'].entry[0].summary._value;
    medlineDiv.innerHTML = medlineSummary;
  }

  todaysDate() {
    let today = new Date();
    return today;
  }

  // getPatientData() {
  //   let comp = this;
  //   this.pds.getProblems(this.patientId).subscribe(function(response: any) {
  //     comp.problems = response.json();
  //   });
  //   let data: any;
  //   this.pds.getProblemsForPatient(this.patientId).subscribe((response: any) => {
  //     data = this.pds.transformData(response.json());
  //     let list = new ProblemList(data);
  //
  //     // establish relationships once all problems are loaded
  //     this.pds.getProblemRelationshipsForPatient(this.patientId).subscribe((response: any) => {
  //       let relationships = response.json();
  //       relationships.forEach((el) => {
  //         list.addChildTo(el.childId, el.parentId);
  //       });
  //
  //       this.problemList = list;
  //       this.problemList.generateIndexedProblems();
  //     },
  //     (error) => console.error('ERROR: failed to load data.'));
  //   },
  //   (error) => console.error('ERROR: failed to load data.'));
  // }

  getSamplePatientData() {
      let data: any;
      this.pds.getSampleProblemData().subscribe((response: any) => {
        this.problems = response.json();
        let patientData = this.problems.filter((item) => item['Patient_ID'] == 19);
        data = this.pds.transformProblemData(patientData);
        let list = new ProblemList(data);

        // establish relationships once all problems are loaded
        this.pds.getSampleRelationshipsData().subscribe((response: any) => {
          let relationships = response.json();
          relationships.forEach((el) => {
            list.addChildTo(el['ResolvedProblem_ID'], el['ActiveProblem_ID']);
          });
          list.generateIndexedProblems();
          this.problemList = list;
          console.log(list);
          // this.displayProblemList = list;
          // this.renderRows();
        },
        (error) => console.error('ERROR: failed to load data.'));
      },
      (error) => console.error('ERROR: failed to load data.'));
    }
//table display methods
  clickProblem(problemIndex) {
    this.selectedProblemId = parseInt(problemIndex);
  }

  disclosureHandleClicked(problemId) {
    this.expandRow(problemId);
  }

  expandRow(problemId) {
    let problemIdIndex = this.expandedProblemIds.indexOf(problemId);
    if(problemIdIndex === -1){
      this.expandedProblemIds.push(problemId)
    }
    else{
      this.expandedProblemIds.splice(problemIdIndex, 1);
    }
  }
  ///modal methods
  openModal(modalName){
    this.selectedModal = modalName;
  }

  closeModal(){
    this.selectedModal = null;
  }

  loadGuideline(guideline){
    this.selectedGuideline = guideline;
  }
  //prepolutes Resolution modal with clicked item. reverts back if canceled.
  preCheckResolution(problem){
    let index = problem.id;
    this.selectedProblemId = problem.id;
    this.checkedProblems = [];
    this.checkedProblems[index] = true;
  }
  //resolution modal save/cancel methods under data methods  vvv

  //data methods

  //all changes to problemList and problems will need to trigger the pipe to rerender the data. (pure) pipes do not respond to changes inside an Object or array, and impure pipes suck. triggerPipe can be called from the DOM directly or back here. Either way.
  saveAllChanges(){
    this.problemList.saveAllChanges();
    this.notifications = "Changes Saved Successfully";
    setTimeout(()=>{ this.notifications = null;}, 2000);
    this.triggerPipe();
  }

  cancelAllChanges(){
    this.problemList.cancelAllChanges();
    this.notifications = "All Changes Cancelled";
    setTimeout(()=>{ this.notifications = null;}, 2000);
    this.triggerPipe();
  }
  //for new problem and resolution problem.
  submitNewProblem(problemName, onsetDate){
    let childrenIds = Object.keys(this.checkedProblems);
    this.problemList.plSubmitNewProblem(problemName, onsetDate, childrenIds);
    this.triggerPipe();
  }
  //remove from UI state index only when unsaved, NOT from master list
  removeProblem(problem){
    this.problemList.removeProblem(problem);
    this.triggerPipe();
  }

  cancelResolution(){
    this.checkedProblems = [];
    this.triggerPipe();
  }

  yyyymmdd(date): string{
    let rawDate = new Date(date);
    let mm = rawDate.getMonth() + 1;
    let dd = rawDate.getDate();
    return [rawDate.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
          ].join('-');
  }
  ////use to update table display
  triggerPipe(){
    //vacillating between two truthy values to trigger the pipe, as it DOES respond to this type of change
    this.pipeTrigger === 1? this.pipeTrigger = 2: this.pipeTrigger = 1;
  }


}
