const puppeteer=require("puppeteer");
const {email,password}=require("./secrets");

let { answer } = require("./codes");
let curTab;

let browserOpenPromise=puppeteer.launch({
    headless : false,
    defaultViewport : null,
    args : ["--start-maximized"],
    //executablePath: "C:\Program Files\Google\Chrome\Application\chrome",
});

//then-->fulfill
browserOpenPromise.then(function(browser)
{
    console.log("browser is opened");
    //console.log(browserOpenPromise);
    let allTabsPromise=browser.pages();
    return allTabsPromise;
})
.then(function (allTabsArr){
    console.log("all Tabs are opened");
    curTab = allTabsArr[0];
    let vistingPagesPromise = curTab.goto("https://www.hackerrank.com/auth/login");
    return vistingPagesPromise;
})
.then(function (data){
    console.log("hackerrank login page opened");
    let emailWillBeTypedPromise = curTab.type("input[name='username']",email,{delay: 100});
    return emailWillBeTypedPromise;
})
.then(function(){
    console.log("email is typed");
    let passwordWillBeTypedPromise = curTab.type("input[placeholder = 'Your password']",password,{delay: 100});
    return passwordWillBeTypedPromise;
})
.then(function(){
    console.log("password is typed");
    let hackerrankLoginPromise = curTab.click(
        ".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled"
        );
    return hackerrankLoginPromise;
})
.then(function(){
    console.log("logged in to hackerrank successfully");
    let algoPageOpenedPromise = waitAndClick("div[data-automation='algorithms']");
    return algoPageOpenedPromise;
})
.then(function(){
    console.log("algo tab is opened");
    let allQuestionsPromise = curTab.waitForSelector('a[data-analytics="ChallengeListChallengeName"]');
    return allQuestionsPromise;
})
.then(function(){
    function getAllQuestionsLink(){
        let allElemArr = document.querySelectorAll('a[data-analytics="ChallengeListChallengeName"]');
        let linksArr = [];
    
        for(let i=0;i<allElemArr.length;i++){
            linksArr.push(allElemArr[i].getAttribute('href'));
        }
        return linksArr;
    }
    let linksArrPromise = curTab.evaluate(getAllQuestionsLink);
    return linksArrPromise;
})
.then(function(linksArr){
    console.log("links to all questions received");
    let questionWillBeSolvedPromise = questionSolver(linksArr[0], 0);
    for (let i = 1; i < linksArr.length; i++){
      questionWillBeSolvedPromise = questionWillBeSolvedPromise.then(function () {
        return questionSolver(linksArr[i], i);
      })
      // a = 10;
      // a = a + 1;
    }
    return questionWillBeSolvedPromise;
})
.then(function(){
    console.log("question is solved");
})
.catch(function(err){
    console.log(err);
})

function waitAndClick(algoBtn){
    let waitClickPromise = new Promise(function(resolve,reject){
        let waitForSelectorPromise = curTab.waitForSelector(algoBtn);
        waitForSelectorPromise.then(function(){
            console.log("algo button is found");
            let algoButtonClickedPromise = curTab.click(algoBtn);
            return algoButtonClickedPromise;
        })
        .then(function(){
            console.log("algo button is clicked");
            resolve();
        })
        .catch(function(err){
            reject(err);
        })
        
    })
    return waitClickPromise;
    
}

function questionSolver(url, idx) {
    return new Promise(function (resolve, reject) {
      let fullLink = `https://www.hackerrank.com${url}`;
      let goToQuesPagePromise = curTab.goto(fullLink);
      goToQuesPagePromise
        .then(function () {
          console.log("question opened");
          //tick the custom input box mark
          let waitForCheckBoxAndClickPromise = waitAndClick(".checkbox-input");
          return waitForCheckBoxAndClickPromise;
        })
        .then(function () {
          //select the box where code will be typed
          let waitForTextBoxPromise = curTab.waitForSelector(".custominput");
          return waitForTextBoxPromise;
        })
        .then(function () {
          let codeWillBeTypedPromise = curTab.type(".custominput", answer[idx], {
            delay: 100,
          });
          return codeWillBeTypedPromise;
        })
        .then(function () {
          //control key is pressed promise
          let controlPressedPromise = curTab.keyboard.down("Control");
          return controlPressedPromise;
        })
        .then(function () {
          let aKeyPressedPromise = curTab.keyboard.press("a");
          return aKeyPressedPromise;
        })
        .then(function () {
          let xKeyPressedPromise = curTab.keyboard.press("x");
          return xKeyPressedPromise;
        })
        .then(function () {
          let ctrlIsReleasedPromise = curTab.keyboard.up("Control");
          return ctrlIsReleasedPromise;
        })
        .then(function () {
          //select the editor promise
          let cursorOnEditorPromise = curTab.click(
            ".monaco-editor.no-user-select.vs"
          );
          return cursorOnEditorPromise;
        })
        .then(function () {
          //control key is pressed promise
          let controlPressedPromise = curTab.keyboard.down("Control");
          return controlPressedPromise;
        })
        .then(function () {
          let aKeyPressedPromise = curTab.keyboard.press("A");
          return aKeyPressedPromise;
        })
        .then(function () {
          let vKeyPressedPromise = curTab.keyboard.press("V");
          return vKeyPressedPromise;
        })
        .then(function () {
          let controlDownPromise = curTab.keyboard.up("Control");
          return controlDownPromise;
        })
        .then(function () {
          let submitButtonClickedPromise = curTab.click(".hr-monaco-submit");
          return submitButtonClickedPromise;
        })
        .then(function () {
          console.log("code submitted successfully");
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }