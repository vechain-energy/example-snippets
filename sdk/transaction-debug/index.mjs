import { ThorClient } from '@vechain/sdk-network';
import { coder } from '@vechain/sdk-core';
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

// check out https://vechainstats.com/transactions/#txns-reverted to get another one for testing
const txId =
  process.argv[2] ??
  '0x27b515344514d5feeeaf582a93edf3139604f58f5a66785350e400e21584c7bb';

// define your with custom errors
const contractInterface = coder.createInterface([]);

console.log('Checking Transaction Id', txId, 'on', thor.httpClient.baseURL);
const receipt = await thor.transactions.getTransactionReceipt(txId);

if (!receipt.reverted) {
  console.log('Transaction was successful');
  process.exit(0);
}

const transaction = await thor.transactions.getTransaction(txId, {
  pending: true,
});
if (!transaction) {
  console.log('Transaction not found');
  process.exit(1);
}

if (!transaction.meta) {
  console.log('Transaction is pending');
  process.exit(1);
}

const simulation = await thor.transactions.simulateTransaction(
  transaction.clauses,
  {
    revision: transaction.meta.blockID,
    gas: transaction.gas,
    caller: transaction.origin,
    gasPayer: transaction.delegator ?? transaction.origin,
    expiration: transaction.expiration,
    blockRef: transaction.blockRef,
  }
);

simulation.forEach((clause, clauseIndex) => {
  if (!clause.reverted) {
    return console.log(`Clause #${clauseIndex} was successful`);
  }

  const revertReason = contractInterface.parseError(clause.data);

  console.log(`Clause #${clauseIndex} reverted with`);
  console.log(' VM Error:', clause.vmError);
  console.log(' Revert Reason:', revertReason.args);
});
