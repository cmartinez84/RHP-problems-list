export class BaseApp {
  public componentName: string;
  public title: string;
  public defaultWidth: number;
  public defaultHeight: number;
  protected updateFunctions: any;
  protected updateMain: any;
  protected onResize: any;

  constructor() {
    this.title = "-";
    this.title = "CustomAppComponent";
    this.defaultWidth = 300;
    this.defaultHeight = 200;
    this.updateFunctions = {};
    this.updateMain = function(){};
    this.onResize = function(){};
  }

  update(item, data) {
    let Component = this;
    Component[item] = data;
    if(Component.updateFunctions[item]) { Component.updateFunctions[item](); };
    Component.updateMain()
  }
}
