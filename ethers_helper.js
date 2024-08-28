const ethers = require('ethers');

/* ========================================================================= */
// Цветные сообщения
const HEX = require('./_CONFIGS/chalkColors.json');

const {
  hexLog, logWarn, logInfo, ceil10, logError, logSuccess, pause, shuffle, 
  randomBetweenInt, SECOND, consoleTime
} = require('./helper');


/* ========================================================================= */
function ceilFeeData(feeData, decimals) {
  // console.log("ceilFeeData", feeData);
  let newFeeData = {};
  for (let data in feeData) {
    if (feeData[data]) {
      let mutableValue = ethers.formatUnits(feeData[data], 'gwei');
      // console.log(mutableValue);
      mutableValue = ceil10(mutableValue, decimals);
      mutableValue = `${mutableValue}`;
      // console.log(data, mutableValue);
      newFeeData[data] = ethers.parseUnits(mutableValue, 'gwei');
    }
  }
  // console.log("feeData ceilFeeData", feeData);
  return newFeeData;
};

async function getNetworkGas(BOT, PROJECT_NAME) {
  let gwei = {};
  gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
    .catch(err => false);

  while (gwei[PROJECT_NAME] === false)   {
    console.log("Не смогли получить данные о комиссиях");
    await pause(SECOND * 15);
    gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
      .catch(err => false);
  }

  gwei[PROJECT_NAME] = ceilFeeData(gwei[PROJECT_NAME], 
    BOT.configs[PROJECT_NAME].PROJECT_GAS_DECIMALS);

  let gasPrice =  ethers.formatUnits(gwei[PROJECT_NAME].gasPrice, 'gwei');
  gasPrice = parseFloat(gasPrice);

  // logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
  // `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`); 

  BOT.tx_params[PROJECT_NAME].gasPrice = gwei[PROJECT_NAME].gasPrice;
  return gwei[PROJECT_NAME];
}

/* ========================================================================= */
async function waitGwei(BOT, PROJECT_NAME) {
  // console.log(BOT);
  // console.log();
  // console.log("waitGwei | ");
  process.stdout.write("waitGwei | " + "       " + "\r");
  let ready = false;
  let gwei = {};
  while (!ready) {
    // logInfo(`Аккаунтов в очереди: ${BOT.queue[PROJECT_NAME]}`);
    process.stdout.write('\r');  // needs return '/r'
    await pause(SECOND * 3);

    if (BOT.errors[PROJECT_NAME] > BOT.configs[PROJECT_NAME].MAX_ERRORS) return false;

    try {

      // Если нам нужно следить за Ethereum Gwei

      gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
        .catch(err => false);
      
      if (!gwei[PROJECT_NAME]) {
        logError("Не смогли получить данные о комиссиях");
      }
      // console.log(gwei)

      gwei[PROJECT_NAME] = ceilFeeData(gwei[PROJECT_NAME], 
        BOT.configs[PROJECT_NAME].PROJECT_GAS_DECIMALS);
        
      let gasPrice =  ethers.formatUnits(gwei[PROJECT_NAME].gasPrice, 'gwei');
      gasPrice = parseFloat(gasPrice);
      

      let gasPriceProjectOK = gasPrice < BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT ;

      // console.log(gwei);

      if (gasPriceProjectOK) {
        logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
        `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`);
        ready = true;
        continue;
      } else {
        logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
        `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`);
      }
      // console.log();

    } catch (err) {
      // console.error(err);
      logError(`Ошибка при получении газа: ${err.message}`);
      logWarn(`Ошибок: ${BOT.errors[PROJECT_NAME] + 1} / ${BOT.configs[PROJECT_NAME].MAX_ERRORS}`);
      BOT.errors[PROJECT_NAME]++;
      await pause(SECOND * 30);
    };

    await pause(SECOND * 15);
  }



  if (BOT.tx_params[PROJECT_NAME].type === 0) {
    BOT.tx_params[PROJECT_NAME].gasPrice = gwei[PROJECT_NAME].gasPrice;
  }

  if (BOT.tx_params[PROJECT_NAME].type === 2) {
    BOT.tx_params[PROJECT_NAME].gasPrice = null;
    BOT.tx_params[PROJECT_NAME].maxFeePerGas = gwei[PROJECT_NAME].gasPrice;
    BOT.tx_params[PROJECT_NAME].maxPriorityFeePerGas = gwei[PROJECT_NAME].maxPriorityFeePerGas;
  } 

  // console.log(BOT.configs[PROJECT_NAME]);
  // console.log(BOT.tx_params[PROJECT_NAME]);

  return gwei[PROJECT_NAME];

};

/* ========================================================================= */
// Функция для увеличения количества газа
function gasMultiplicate(amount, multiplicate) {
  let amountFloat = ethers.formatUnits(amount, `wei`);
  amountFloat = amountFloat * multiplicate;
  return ethers.parseUnits(`${parseInt(Math.ceil(amountFloat))}`, `wei`);
}

/* ========================================================================= */
// Функция для пауз между транзакциями
async function pauseBetweenTx({min, max}) {
  if (!min || !max) {
    logWarn(`В функцию pauseBetweenTx не переданы значения для min или max`);
    return false;
  }
  let pauseInMs = randomBetweenInt(min, max);
  pauseInMs = pauseInMs * 1000;
  logInfo(`Пауза между активностями ${parseInt(pauseInMs / 1000)} секунд`);

  return await pause(pauseInMs);
}

/* ========================================================================= */
// Получаем кошелек
async function getWallet(privateKey, provider) {
  // console.log(privateKey, provider)
  let wallet = new ethers.Wallet(privateKey, provider);
  // console.log(wallet.address);
  return wallet;
};

async function getBalance(BOT, PROJECT_NAME) {
  // console.log("getBalance:")
  try {
    return await BOT.providers[PROJECT_NAME]
      .getBalance(BOT.wallets[PROJECT_NAME].address);
  } catch (error) {
  logError(`${PROJECT_NAME} | ${BOT.session} | Не смогли получить баланс | `
      + error.message);
    return false;
  }
}

/* ========================================================================= */
exports.waitGwei = waitGwei;
exports.getNetworkGas = getNetworkGas;
exports.gasMultiplicate = gasMultiplicate;
exports.pauseBetweenTx = pauseBetweenTx;
exports.getWallet = getWallet;
exports.getBalance = getBalance;