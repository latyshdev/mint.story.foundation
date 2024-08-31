/* ========================================================================= */
// Библиотеки
const fs = require('fs');
const inquirer = require('inquirer');
const ethers = require('ethers')
/* ========================================================================= */
// Модули
const mint = require('./mint').mint;
const {logError, logInfo, hexLog, logWarn, evaluateProxy, logSuccess, pause,
  randomBetweenInt, consoleTime,
  MINUTE, SECOND,
  shuffle} = require('./helper');
const {getWallet, getBalance} = require('./ethers_helper');
const {createProvider} = require('./providers');
// console.log(mint);

/* ========================================================================= */
// Код
const mintArray = Object.keys(mint).map(element => element).reverse();

/* ========================================================================= */
// Меню
const questions = [
  {
    name: "choice",
    type: "list",
    message: " ",
    choices: mintArray.map(function(key){
      return {
        name: (!mint[key].ended) ? mint[key].name : `${mint[key].name} [ENDED]`, 
        value: key}
    })
  }
];

/* ========================================================================= */
  async function Main () {
    // Выбор минта
    const answers = await inquirer.prompt(questions);
    let choice = await answers.choice;
    // let choice = 1;
    // console.log("Выбрали для минта:", mint[choice].name, choice);
    logInfo(`Выбрали для минта: ${hexLog(mint[choice].name, 'balance')}`)

    if (mint[choice].ended || choice === "mintFunctions") {
      logError(`Выбрали неактивный минт.`);
      return false;
    }

    // Проверяем файл unready.txt
    const unreadyExist = fs.existsSync('./_CONFIGS/unready.txt');
    if (!unreadyExist) {
      logError(`Файл unready.txt не существует. Создаю`);
      fs.writeFileSync(`./_CONFIGS/unready.txt`, ``, `utf-8`);

      // Проверяем приватные адреса
      const privatesExist = fs.existsSync('privates.txt');
      if (!privatesExist) {
        logError(`Файл privates.txt не существует. Создаю`);
        fs.writeFileSync(`privates.txt`, ``, `utf-8`);
        return false;
      }

      // Считываем приватные адреса
      const privateKeys = fs.readFileSync(`privates.txt`, `utf-8`)
        .split("\n")
        .map(row => row.trim())
        .filter(pk => pk !== "");
      // console.log(privateKeys.length, privateKeys);
      if (privateKeys.length === 0) {
        logError(`Файл privates.txt пуст.`);
        return false;
      }

      // Проверяем прокси
      const proxyExist = fs.existsSync('proxy.txt');
      if (!proxyExist) {
        logError(`Файл proxy.txt не существует. Создаю`);
        fs.writeFileSync(`proxy.txt`, ``, `utf-8`);
        return false;
      }

      // Считываем прокси
      const proxyList = fs.readFileSync(`proxy.txt`, `utf-8`)
        .split("\n")
        .map(row => row.trim())
        .filter(proxy => proxy !== "");
      if (proxyList.length === 0) {
        logError(`Файл proxy.txt пуст.`);
        return false;
      }
      
      // Проверяем соответствие
      if (proxyList.length !== privateKeys.length) {
        logError(`Количество прокси не соответствует количеству приватных ключей`);
        logWarn(`Прокси: ${proxyList.length}. Приватных ключей: ${privateKeys.length}`)
        return false;
      }

      // Объединяем privateKeys и proxyList
      let unready = ``;
      for await (let [i, privateKey] of privateKeys.entries()) {
        unready += `id${i+1};${privateKey};${proxyList[i]}\n`;
      }
      fs.writeFileSync(`./_CONFIGS/unready.txt`, unready, `utf-8`);

      return false;
    }

    const configExist = fs.existsSync('./_CONFIGS/STORY.json');
    if (!configExist) {
      logError(`Конфиг STORY.json не существует. Копирую конфиг по умолчанию.`);
      logWarn(`Заполните STORY.json`);
      fs.copyFileSync('./_CONFIGS/STORY.json_', './_CONFIGS/STORY.json');
      return false;
    };

    const CONFIG = require('./_CONFIGS/STORY.json');
    // console.log(CONFIG);
    if (CONFIG.SHUFFLE_PK) {
      logWarn(`Включена рандомизация кошельков`);
    };

    // Стартуем
    // const privateKeysOld = JSON.parse(JSON.stringify(privateKeys));
    let unready = fs
      .readFileSync(`./_CONFIGS/unready.txt`, `utf-8`)
      .split("\n")
      .filter(row => row !== "");

    unready =  (CONFIG.SHUFFLE_PK === true) ? shuffle(unready) : unready;

    logWarn(`RPC: ${CONFIG.RPC}`);
    if (CONFIG.MAX_GWEI_ETHEREUM) logWarn(`Включено отслеживание gwei в Ethereum: ${CONFIG.MAX_GWEI_ETHEREUM}`);
    if (!CONFIG.MAX_ERRORS) {
      logError(`Не установлен параметр MAX_ERRORS в конфиге`);
      return;
    }

    if (!CONFIG.hasOwnProperty(`TXN_TYPE`)) {
      logError(`Не установлен параметр TXN_TYPE в конфиге`);
      return; 
    }

    logWarn(`Количество ошибок: ${CONFIG.MAX_ERRORS}`);
    logWarn(`Максимальный gwei: ${CONFIG.MAX_GWEI_PROJECT}`);
    logWarn(`Пауза между кошельками: от ${CONFIG.PAUSE_BETWEEN_ACCOUNTS[0]} до ${CONFIG.PAUSE_BETWEEN_ACCOUNTS[1]} секунд`);
    logWarn(`Тип прокси: ${CONFIG.PROXY_TYPE}`);
    logWarn(`Тип транзакции: ${CONFIG.TXN_TYPE}`);
    logWarn(`Рандомный тип транзакции: ${CONFIG.RANDOM_TXN_TYPE}`);
    logWarn(`Ожидание транзакции: ${CONFIG.WAIT_TX}`);
    logWarn(`RPC: ${CONFIG.RPC}`);
    console.log();

    if (unready.length === 0) {
      logError(`Файл unready.txt существует, но пуст.`);
      fs.unlinkSync(`./_CONFIGS/unready.txt`);
      return false;
    }

    let length = unready.length;
    fs.appendFileSync(`./_LOGS/logs.txt`, `${"*".repeat(100)}\n${consoleTime()}\n${mint[choice].name} | Кошельков: ${length}\n${"*".repeat(100)}\n`);

    for await (let [i, row] of unready.entries()) {

      try {
      // console.log(row);
      console.log();

      let [id, privateKey, proxy] = row.split(";").map(el => el.trim());
      // console.log(id, proxy);
      // continue;

      if (!proxy || !privateKey) continue;

      const BOT = {};
      await createBot(BOT, privateKey, proxy);
      // console.log(BOT);

      let balance = await getBalance(BOT, "STORY");

      if (balance === false) {
        delete BOT;
        continue;
      } 

      balance = ethers.formatEther(balance);
      logInfo(BOT.wallets["STORY"].address)


      let standardMsg = `Кошелек [${BOT.wallets["STORY"].address} | ${id}] [${parseInt(i) + 1} из ${length}]`;
      standardMsg += ` | ${mint[choice].name} `;

      logInfo(standardMsg);

      logInfo(`Баланс кошелька: ${balance}`);

      if (balance < CONFIG.MIN_BALANCE) {
        logWarn(`Слишком маленький баланс`);
        fs.appendFileSync(`./_LOGS/res.txt`, `${BOT.wallets["STORY"].address}\tFALSE\t${balance}\n`, `utf-8`);
        delete BOT;
        continue;
      };

        //Ждем газ и выставляем параметры транзакции (gasPrice)
        // BOT.tx_params["STORY"].maxFeePerGas = 0;
        // BOT.tx_params["STORY"].maxPriorityFeePerGas = 0;

        // Txn Type: 0 (Legacy) Rabby Wallet ???
        BOT.tx_params["STORY"].type = CONFIG.TXN_TYPE;
        
        if (CONFIG.RANDOM_TXN_TYPE) {
          BOT.tx_params["STORY"].type = shuffle([0,2])[0];
        }

        // console.log(BOT.tx_params["STORY"]);

        let msg = ``;

        // Делаем минт
        let tx = await  mint.mintFunctions[choice](BOT, mint[choice]);

        if (tx === true) {
          logSuccess(standardMsg + `| Минт уже был совершен.`);
          msg = consoleTime() + " | " + standardMsg + `| Минт уже был совершен.\n`;
        }
        else {

          if (tx === false) {
            logError(standardMsg + `| Не смогли заминтить`);
            msg += consoleTime() + " | " + standardMsg + `| Не смогли заминтить\n`
          } else {
            logWarn(standardMsg + `| | Type: ${BOT.tx_params["STORY"].type} | ${tx.hash}`);
            msg = consoleTime() + " | " + standardMsg + `| Транзакция в очереди | Type: ${BOT.tx_params["STORY"].type} | ${CONFIG.EXPLORER}/${tx.hash}\n`;
            if (CONFIG.WAIT_TX) {
              await tx.wait();
              logSuccess(standardMsg + `| ${tx.hash}`);
              msg += consoleTime() + " | " + standardMsg + `| Транзакция готова | ${CONFIG.EXPLORER}/${tx.hash}\n`;  
            }
          }

        }

        // Записываем логи и обновляем файлы
        fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        fs.appendFileSync(`./_CONFIGS/ready.txt`, row + "\n", `utf-8`);

        // Удаляем кошелек из файла неготовых
        unready = unready.filter(el => el !== row); 
        fs.writeFileSync(`./_CONFIGS/unready.txt`, unready.join("\n"), `utf-8`);
       
        // Если минт был совершен ранее, то пропускаем паузу
        if (tx === true) {
          fs.appendFileSync(`./_LOGS/res.txt`, `${BOT.wallets["STORY"].address}\tTRUE\t${balance}\n`, `utf-8`);
          delete BOT;
          continue;
        };

        if (tx === false) {
          fs.appendFileSync(`./_LOGS/res.txt`, `${BOT.wallets["STORY"].address}\tFALSE\t${balance}\n`, `utf-8`);
          delete BOT;
          continue;
        }

        // Если последний кошелек, то ждать не нужно
        // console.log(i, i+1, i+1 === unready.length, unready.length);
        if (i+1 === length) {
          delete BOT;
          continue;
        }

        // Пауза между кошельками
        let pauseSeconds = randomBetweenInt(
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[0],
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[1]
        );
        let pauseSecondsMs = pauseSeconds * SECOND;
        logInfo(standardMsg + ` | Пауза ${pauseSecondsMs / SECOND} секунд`);

        // Пауза между кошельками
        await pause(pauseSecondsMs);
        
      } catch (err) {
        logError(err.message);
        // logError(standardMsg + ` | ${err.message}`);
        // msg = consoleTime() + " | " + standardMsg + ` | ERROR: ${err.message}` + "\n";
        // fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        // fs.appendFileSync(`./_CONFIGS/fail.txt`, row + "\n", `utf-8`);
        console.error(err);
      }

    };



    // createBot
    async function createBot(BOT, privateKey, proxy) {
      BOT.configs = {"STORY": CONFIG};
      BOT.tx_params = {"STORY": {}};
      // Создаем провайдера
      BOT.providers = {};

      BOT.proxy = evaluateProxy(proxy, CONFIG.PROXY_TYPE);
      // console.log(BOT.proxy);
      // return;

      BOT.providers["STORY"] = await createProvider({
        RPC: CONFIG.RPC,
        proxy: BOT.proxy
      });

      // Создаем провайдера ETHEREUM
      if (CONFIG.MAX_GWEI_ETHEREUM) {
        BOT.providers["ETHEREUM"] = await createProvider({
          RPC: CONFIG.RPC_ETHEREUM,
          proxy: BOT.proxy
        });
      };

      // Создаем кошелек
      BOT.wallets = {};
      BOT.wallets["STORY"] = await getWallet(privateKey, BOT.providers["STORY"]);
      BOT.errors = {};
      BOT.errors["STORY"] = 0;

      return BOT;
    }

    return true;
}

(async () => {

  while (true) {
    let res = await Main();
    logSuccess(`ЗАВЕРШИЛИ ЦИКЛ`);
    console.log();
    console.log();
    console.log();
    await pause( 10 * SECOND);
    if (res === true) await pause( 15 * MINUTE);
  }

})();
