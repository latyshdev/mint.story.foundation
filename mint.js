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
    ended: false
  }, // Linus 
  
  // STORY 
  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: StoryNFT
  }

};

async function StoryNFT(BOT, choice) {

}
