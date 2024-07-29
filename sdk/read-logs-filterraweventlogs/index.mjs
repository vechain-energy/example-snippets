import { ThorClient } from '@vechain/sdk-network';
import { abi } from '@vechain/sdk-core';
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

// access all logs for a contract
const logs = await thor.logs.filterRawEventLogs({
  options: {
    offset: 0,
    limit: 3,
  },
  criteriaSet: [
    {
      address: '0x0000000000000000000000000000456e65726779',
    },
  ],
  order: 'asc',
});

// create encoder helper to handle event encoding to filter for specific data
const event = new abi.Event(
  'event Transfer(address indexed from, address indexed to, uint256 amount)'
);
const encodedTopics = event.encodeFilterTopics([
  // first indexed value is "from", set to null to not use it
  null,

  // second indexed value is "to"
  '0x0000000000000000000000000000456e65726779',
]);

// access logs for a contract with filters
const filteredLogs = await thor.logs.filterRawEventLogs({
  criteriaSet: [
    // filter by address and topics, empty topics are ignored
    {
      // not defining an address, will return the event on all contracts
      address: '0x0000000000000000000000000000456e65726779',

      // define the single topic filters
      topic0: encodedTopics[0],
      topic1: encodedTopics[1],
      topic2: encodedTopics[2],
      topic3: encodedTopics[3],
      topic4: encodedTopics[4],
    },
  ],

  // sort ascending
  order: 'asc',

  // filter in first 10m blocks
  range: {
    unit: 'block',
    from: 0,
    to: 10000000,
  },

  // limit to first match
  options: {
    offset: 0,
    limit: 1,
  },
});

const [decodedLog] = filteredLogs.map((log) => event.decodeEventLog(log));
console.log(
  'From',
  decodedLog.from,
  'To',
  decodedLog.to,
  'Amount',
  decodedLog.amount
);
