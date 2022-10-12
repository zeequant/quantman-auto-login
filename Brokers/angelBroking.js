const { delay, screen, QUANTMAN_URL, fetchTOTP } = require('./helper');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const enterTOTPAndClickLogin = async (driver, totpSecretKey, isReAttempt) => {
  const TOTP = await fetchTOTP('angelbroking', totpSecretKey);
  const TOTPTextBoxElement = By.id('totp');

  if(isReAttempt) {
    await driver.findElement(TOTPTextBoxElement).clear()
  }

  await driver.findElement(TOTPTextBoxElement).sendKeys(TOTP);
  await driver.findElement(By.id('sign-in')).click();
};

const doLoginAngleBroking = async (username, password, totpSecretKey) => {
  var driver = new Builder()
    .forBrowser('chrome')
    // .setChromeOptions(new chrome.Options().headless().windowSize(screen))
    .build();
  
  console.log('Browser initialized');

  driver.manage().setTimeouts({ implicit: 3000, pageLoad: 300000, script: 30000 })

  await driver.get(`${QUANTMAN_URL}/auth/angel_broking`);
  console.log('Login Page opened');

  await delay(1000);

  console.log(`STEP 1: [ENTER CLIENT_ID AND PASSWORD] Initiated`);
  await driver.findElement(By.id('client-code')).sendKeys(username);
  await driver.findElement(By.name('password')).sendKeys(password);
  console.log(`STEP 1: [ENTER CLIENT_ID AND PASSWORD] Completed`);

  console.log(`STEP 2: [ENTER TOTP AND CLICK LOGIN] Initiated`);
  await enterTOTPAndClickLogin(driver, totpSecretKey, false);
  await delay(1000);

  const isInValidTOTP = await driver.findElement(By.css('#login-error[style*="display: block"]')).then(() => true).catch(e => false);

  if (isInValidTOTP) {
    await delay(1000);
    console.log(`STEP 2: [ENTER TOTP AND CLICK LOGIN] ReAttemtp`);
    await enterTOTPAndClickLogin(driver, totpSecretKey, true);
  }
  console.log(`STEP 2: [ENTER TOTP AND CLICK LOGIN] Completed`);

  await delay(1000);

  console.log(`STEP 4: [CHECK RETURN TO QUANTMAN PAGE]`);
  await driver.wait(until.titleIs('Quantman'), 5000);

  await driver.quit();
};

const doLogin = async (args) => {
  const { username, password, totpSecretKey } = args;

  await doLoginAngleBroking(username, password, totpSecretKey)
    .then(() => {
      console.log('successfully completed')
    })
    .catch((e) => {
      console.log('exiting with error ', e);
    });
};

module.exports = {
  doLogin
};