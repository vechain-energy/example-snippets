import { ThorClient } from '@vechain/sdk-network';
import energyAbi from './energy.json' assert { type: 'json' };

const thor = ThorClient.fromUrl('https://mainnet.vechain.org');
const vtho = thor.contracts.load(
  '0x0000000000000000000000000000456e65726779',
  energyAbi
);

const transfers = vtho.filters

  // pass filters in the order of the input definition for the event
  // skip values by passing null or undefined
  .Transfer(null, '0x0000000000000000000000000000456e65726779');

const results = await transfers

  // paginate or filter to certain ranges
  .get(
    // optional, pass undefined, if you don't want to filter for a range
    {
      unit: 'block',
      from: 0,
      to: 10000000,
    },

    // optional, pass undefined, if you don't want to paginate
    { limit: 1 },

    // optional sort order
    'desc'
  );

results.forEach((result) => {
  result.forEach((log) => {
    console.log(log);
    console.log(
      'Transfer',
      log.decodedData._from,
      log.decodedData._to,
      log.decodedData._value
    );
  });
});
