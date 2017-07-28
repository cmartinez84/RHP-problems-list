import { RHAppPage } from './app.po';

describe('rhapp App', function() {
  let page: RHAppPage;

  beforeEach(() => {
    page = new RHAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
