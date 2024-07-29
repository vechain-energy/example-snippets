import { ThorClient } from '@vechain/sdk-network';
import { ZERO_ADDRESS } from '@vechain/sdk-core';
import energyAbi from './energy.json' assert { type: 'json' };

const thor = ThorClient.fromUrl('https://mainnet.vechain.org');
const vtho = thor.contracts.load(
  '0x0000000000000000000000000000456e65726779',
  energyAbi
);

const results = await thor.logs.filterEventLogs({
  criteriaSet: [
    ...vtho.filters.Transfer(ZERO_ADDRESS).criteriaSet, // FROM Zero
    ...vtho.filters.Transfer(null, ZERO_ADDRESS).criteriaSet, // TO Zero
  ],
  range: {
    unit: 'block',
    from: 1_000_000,
    to: 20_000_000,
  },
});

results.forEach((result) => {
  result.forEach((log) => {
    // access to decoded data
    console.log(
      'Transfer',
      log.decodedData._from,
      log.decodedData._to,
      log.decodedData._value
    );
  });
});
