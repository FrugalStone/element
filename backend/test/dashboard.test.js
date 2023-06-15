const fs = require('fs');
const { JSDOM } = require('jsdom');
const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const ejs = require('ejs');

describe('Testing the EJS template', function() {
  let template;

  before(function() {
    const ejsFilePath = path.join(__dirname, '../views/students/dashboard.ejs');
    template = fs.readFileSync(ejsFilePath, 'utf-8');
    let compiledTemplate = ejs.compile(template);
  });

  it('should render without errors', function() {
    const compiledTemplate = ejs.compile(template);

    expect(function() {
      compiledTemplate({});
    }).to.not.throw();
  });

  it('should include the student navigation bar', function() {
    const dom = new JSDOM(template);
    const document = dom.window.document;

    const navBar = document.querySelector('.head-area');
    expect(navBar).to.exist;

    expect(navBar.getAttribute('data-active')).to.equal('home');
  });

  it('should render the cards correctly', function() {
    const dom = new JSDOM(template);
    const document = dom.window.document;

    const cards = document.querySelectorAll('.card');
    expect(cards.length).to.equal(1); 

    // const cardTitles = document.querySelectorAll('.card-title');
    // expect(cardTitles[0].textContent).to.equal('Visualize');
    // expect(cardTitles[1].textContent).to.equal('Graph');
  });

  it('should render registration tiles correctly', function() {
    const dom = new JSDOM(template, { runScripts: 'dangerously' });
    const document = dom.window.document;

    const registrationData = [
      { dept: 'CSE', sem: 'IV', startDate: '25-jan-2023', endDate: '30-may-2023' },
    ];

    const registrationTiles = document.querySelectorAll('.list-item');
    expect(registrationTiles.length).to.equal(registrationData.length);

    registrationTiles.forEach((tile, index) => {
      const dept = tile.querySelector('.badge.alert-info');
      const sem = tile.querySelector('.badge.alert-success');
      const startDate = tile.querySelector('.badge.alert-warning');
      const endDate = tile.querySelector('.badge.alert-danger');

      expect(dept.textContent).to.equal(registrationData[index].dept);
      expect(sem.textContent).to.equal(registrationData[index].sem);
      expect(startDate.textContent).to.equal(registrationData[index].startDate);
      expect(endDate.textContent).to.equal(registrationData[index].endDate);
    });
  });

  it('should render announcement tiles correctly', function() {
    const dom = new JSDOM(template, { runScripts: 'dangerously' });
    const document = dom.window.document;

    const announcementData = [
      { text: 'This is the first announcement' },
      { text: 'This is the second announcement' },
    ];

    const announcementTiles = document.querySelectorAll('.announce-tile');
    expect(announcementTiles.length).to.equal(announcementData.length);

    announcementTiles.forEach((tile, index) => {
      expect(tile.textContent.trim()).to.equal(announcementData[index].text);
    });
  });
});
