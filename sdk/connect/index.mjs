import { HttpClient, ThorClient } from '@vechain/sdk-network';
const nodeUrl = 'https://mainnet.vechain.org';

console.log('Connecting to', nodeUrl);
const thor = new ThorClient(new HttpClient(nodeUrl));

const bestBlock = await thor.blocks.getBestBlockCompressed();
const genesisBlock = await thor.blocks.getBlockCompressed(0);

console.table(
  [
    { Block: 'Genesis', ...genesisBlock },
    { Block: 'Best', ...bestBlock },
  ],
  ['Block', 'number', 'id']
);
