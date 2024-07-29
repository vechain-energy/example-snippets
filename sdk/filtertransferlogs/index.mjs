import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.fromUrl('https://mainnet.vechain.org')

// access VET transfers
const logs = await thor.logs.filterTransferLogs({
  options: {
    offset: 0,
    limit: 3,
  },
  range: {
    unit: 'block',
    from: 0,
    to: 20000000,
  },
  criteriaSet: [
    {
      // VET receiver
      recipient: '0x000000000000000000000000000000000000dead',

      // transaction signer/origin
      txOrigin: '0x19135a7c5c51950b3aa4b8de5076dd7e5fb630d4',

      // VET sender
      sender: '0x19135a7c5c51950b3aa4b8de5076dd7e5fb630d4',
    },
  ],
  order: 'asc',
});
console.log(logs);
