var configs = require('../configs'),
    log = require('log4js').getLogger('NutakuPage'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until,
    RSVP = require('rsvp');

function NutakuPage(driver){
  this.driver = driver;
}

NutakuPage.prototype.loadLoginPage = function(){
  return this.driver.get('http://www.nutaku.net/login')
}

NutakuPage.prototype.getLoginForm = function(){
  var driver = this.driver,
      deferred = RSVP.defer();
  
  log.debug("Looking for login form..");
  driver.findElement(this.queries.form)
  .then(function(loginForm){
    log.debug('login form found!');
    
    if(loginForm.isDisplayed()){
      log.debug('Login form is visible')
      deferred.resolve(loginForm);
    } else {
      log.debug('Loging form is not visible')
      deferred.reject();
    }
  })
  .catch(function(){
    log.debug('Login form was not found: ', arguments)
  })
  
  return deferred.promise;
}

NutakuPage.prototype.login = function login(loginForm){
  var deferred = RSVP.defer(),
      queries = this.queries;
  
  log.debug('entering login creds');
  
  if(loginForm){
    
    loginForm.findElement(queries.username)
    .then(function(usernameField){
      if(usernameField){
        log.debug("Input username field found, populating..");
        return usernameField.sendKeys(configs.natuku.username);  
      } else {
        log.error("username field is invalid", passwordField);
        deferred.reject('username field was invalid');
      }
      
    })
    .then(function(){
      log.debug("Finding password field")
      return loginForm.findElement(queries.password);
    })
    .then(function(passwordField){
      if(passwordField){
        log.debug("password field found, populating..")
        return passwordField.sendKeys(configs.natuku.password);  
      } else {
        log.error("Password field is invalid", passwordField);
        deferred.reject('Password field was invalid');
      }
    })
    .then(function(){
      return loginForm.submit();
    })
    .then(function(){
      log.debug('login page submission completed. Page should be loaded now.')
      deferred.resolve();
    })
    
  } else {
    log.error("Unable to login, invalid form object: ", loginForm);
  }
  
  return deferred.promise;
}

NutakuPage.prototype.queries = {
  form: By.className('log-sign'),
  username: By.id('s-email'),
  password: By.id('s-password')
}

module.exports = NutakuPage;