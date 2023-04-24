'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jo Joe',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-03-03T17:01:17.194Z',
    '2021-03-04T23:36:17.929Z',
    '2021-03-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////
/// Functions
// Date operations
const calcDaysPassed = (date1, date2) =>
  Math.floor(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

const formatMovementDate = (date, locale) => {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// Formatting the currencies and numbers

const formattedAmount = (amount, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);

// Render transactions in the App
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movements = account.movements;
  const movementsDates = account.movementsDates;

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    const movType = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMov = formattedAmount(mov, account.locale, account.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movType}">
      ${i + 1} ${movType}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calc and display balance
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formattedAmount(
    account.balance,
    account.locale,
    account.currency,
  );
};

// Calc and display summary (in, out, interest)
const calcDisplaySummary = function (account) {
  const movements = account.movements;

  const incomes = movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formattedAmount(
    incomes,
    account.locale,
    account.currency,
  );

  const outs = movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = formattedAmount(
    Math.abs(outs),
    account.locale,
    account.currency,
  );

  const interest = movements
    .filter((mov) => mov > 0)
    .map((mov) => mov * (account.interestRate / 100))
    .filter((mov) => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumInterest.textContent = formattedAmount(
    interest,
    account.locale,
    account.currency,
  );
};

// Create usernames for accounts based on owners names
const createUsernames = function (accounts) {
  accounts.forEach((account) => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map((name) => name.charAt(0))
      .join('');
  });
};

createUsernames(accounts);

// Update UI functionality
const updateUI = function (account) {
  // display  movements
  displayMovements(account);

  // display balance
  calcDisplayBalance(account);

  // display summary
  calcDisplaySummary(account);
};

const startLogOutTimer = function () {
  const tick = function () {
    // minutes
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);

    // print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // when timer hits 0 -> stop timer, log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // decrease timer on 1s
    time--;
  };

  // set timer for 5 min
  let time = 300;

  // call tick function immediately
  tick();

  // call the timer every section
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////
/// Events Handlers
// Login functionality
let currentAccount;
let timer;

//
// FAKE LOGIN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
//

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value,
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
      }`;

    containerApp.style.opacity = 100;

    // Current date
    const now = new Date();
    const dateOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      dateOptions,
    ).format(now);

    // clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    // clear all timers for other users
    if (timer) clearInterval(timer);
    // start log out timer
    timer = startLogOutTimer();

    // show UI for logged in user
    updateUI(currentAccount);
  }
});

// Transfer functionality
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    (account) => account.username === inputTransferTo.value,
  );

  // clear input fields in Transfer money section
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    // perform transaction
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Request loan functionality
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      // reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }

  // clear input field in Loan request section
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Close (delete) account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  // check credentials
  if (
    currentAccount?.username === inputCloseUsername.value &&
    currentAccount?.pin === Number(inputClosePin.value)
  ) {
    // remove account from the account list
    const index = accounts.findIndex(
      (account) => account.username === currentAccount.username,
    );
    accounts.splice(index, 1);
    // log out (hide UI)
    containerApp.style.opacity = 0;
  }

  // clear input fields in Close account section
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

// Sorting functionality
let sorted = false;

btnSort.addEventListener('click', function () {
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
