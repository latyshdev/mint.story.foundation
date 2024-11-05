/* ========================================================================= */
const ethers = require('ethers');
const {gasMultiplicate, waitGwei} = require('./ethers_helper');
const { logError, pause, SECOND, logInfo, logSuccess } = require('./helper');
/* ========================================================================= */
exports.mint = {

  1: {
    name: `StoryNFT: IP Asset`,
    mint: `0xFaa402A8bc7C88D252cd4Bc64C154fcB8031d015`,
    NFT: `0x4c5f56a2FF75a8617337E33f75EB459Db422916F`,
    value: `0`,
    ended: true
  }, 

  2: {
    name: `CommemorativeColorNFT [Price: 0 IP]`,
    mint: `0x59a0B4E4074B2DB51B218A7cAb3B4F4715C8b360`,
    value: `0`,
    ended: false
  },

  3: {
    name: `Nerzo Ghost STORY [Price: 0 IP]`,
    mint: `0x4e4e28211A7C533a0a1bF13fB80600ab48Ddb12a`,
    value: `0`,
    ended: false
  },

  4: {
    name: `Nerzo STORY lliad [Price: 0.05 IP]`,
    mint: `0xf9789643c298c9D7F9d563Fd4b9DE6a25Ef46957`,
    value: `0`,
    ended: false
  },

  5: {
    name: `Morkie My Story 🦋 [Price: 0.05 IP]`,
    mint: `0xdFa85cAB70EB073773Bf802bB31a5f67bDAF7AE8`,
    value: `0`,
    ended: false
  },

  6: {
    name: `Morkie Story Iliad ✨ [Price: 0.1 IP]`,
    mint: `0x1e8df415F9Ae5E60f56B4648129D46a4bCc72a37`,
    value: `0`,
    ended: false
  },

  // STORY 
  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: StoryNFT,
    2: CommemorativeColorNFT,
    3: nerzoGhostStory,
    4: nerzoStorylliad,
    5: morkieMyStory,
    6: morkieStoryLilad
  }

};

/* ========================================================================= */
async function morkieStoryLilad(BOT, choice) {
  const ABI = require(`./OpenEditionERC721.json`); 
  const contractNFT = new ethers.Contract(choice.mint, ABI, BOT.wallets["STORY"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {
    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `STORY`);
    if (!gasIsNormal) return false;

    BOT.tx_params["STORY"].value = ethers.parseEther(`0.1`);

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contractNFT["claim"]
      .estimateGas(
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "100000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "1",
          "100000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    
    BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);

    let tx = await contractNFT["claim"]
      (
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "100000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "1",
          "100000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    return tx; 
  }
}

/* ========================================================================= */
async function morkieMyStory(BOT, choice) {

  const ABI = require(`./OpenEditionERC721.json`); 
  const contractNFT = new ethers.Contract(choice.mint, ABI, BOT.wallets["STORY"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {
    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `STORY`);
    if (!gasIsNormal) return false;

    BOT.tx_params["STORY"].value = ethers.parseEther(`0.05`);

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contractNFT["claim"]
      .estimateGas(
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "50000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "1",
          "50000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    
    BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);

    let tx = await contractNFT["claim"]
      (
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "50000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "1",
          "50000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    return tx; 
  }

}

/* ========================================================================= */
async function nerzoStorylliad(BOT, choice) {
  const ABI = require(`./OpenEditionERC721.json`); 
  const contractNFT = new ethers.Contract(choice.mint, ABI, BOT.wallets["STORY"]);


  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {
    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `STORY`);
    if (!gasIsNormal) return false;

    BOT.tx_params["STORY"].value = ethers.parseEther(`0.05`);

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contractNFT["claim"]
      .estimateGas(
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "50000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "50000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    
    BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);

    let tx = await contractNFT["claim"]
      (
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        "50000000000000000",
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ],
          "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          "50000000000000000",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    return tx; 
  }
}


/* ========================================================================= */
async function nerzoGhostStory(BOT, choice) {
  const ABI = require(`./OpenEditionERC721.json`); 
  const contractNFT = new ethers.Contract(choice.mint, ABI, BOT.wallets["STORY"]);


  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {
    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `STORY`);
    if (!gasIsNormal) return false;

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contractNFT["claim"]
      .estimateGas(
        BOT.wallets["STORY"].address,
        1,
        `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
        0,
        [
          ["0x0000000000000000000000000000000000000000000000000000000000000000"],
          "10",
          "0",
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ],
        `0x`,
        BOT.tx_params["STORY"]
      );
    
    BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);

    let tx = await contractNFT["claim"](
      BOT.wallets["STORY"].address,
      1,
      `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
      0,
      [
        ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        "10",
        "0",
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ],
      `0x`,
      BOT.tx_params["STORY"]
    );
    return tx; 
  }
}

/* ========================================================================= */
async function CommemorativeColorNFT(BOT, choice) {

  const ABI_nft = `["function safeMint(address to)", {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contractNFT = new ethers.Contract(choice.mint, ABI_nft, BOT.wallets["STORY"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  if (balanceOf > 0) {
    return true;
  } else {
     // Ждем газ
     let gasIsNormal = await waitGwei(BOT, `STORY`);
     if (!gasIsNormal) return false;
 
     // Определяем сколько нужно газа на транзакцию
     const gasAmount = await contractNFT["safeMint"].estimateGas(BOT.wallets["STORY"].address, BOT.tx_params["STORY"]);
     
     BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    //  console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);
 
     let tx = await contractNFT.safeMint(BOT.wallets["STORY"].address, BOT.tx_params["STORY"]);
     return tx;   
  }

}

/* ========================================================================= */
async function StoryNFT(BOT, choice) {
  const ABI_mint = require(`./abi.json`);
  const ABI_nft = require(`./abi_nft.json`);

  const contract = new ethers.Contract(choice.mint, ABI_mint, BOT.wallets["STORY"]);
  const contractNFT = new ethers.Contract(choice.NFT, ABI_nft, BOT.wallets["STORY"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["STORY"].address);
  // console.log("balanceOf", balanceOf);

  if (balanceOf > 0) {
    return true;
  } else {
    // return false;
    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `STORY`);
    if (!gasIsNormal) return false;

    // mintNFTGated(bytes signature, string twHash)
    const gasAmount = await contract["mintNFTGated"].estimateGas(
      `0x`, 
      `0x0000000000000000000000000000000000000000000000000000000000000000`,
      BOT.tx_params["STORY"]
    );
    
    BOT.tx_params["STORY"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["STORY"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["STORY"].gasLimit);
    // return true;

    // mintNFTGated(bytes signature, string twHash)
    let tx = await contract.mintNFTGated(
      `0x`, 
      `0x0000000000000000000000000000000000000000000000000000000000000000`,
      BOT.tx_params["STORY"]
    );
    return tx;
  }
}
