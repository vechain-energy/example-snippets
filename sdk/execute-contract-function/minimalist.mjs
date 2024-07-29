import {
  ThorClient,
  VeChainProvider,
  ProviderInternalBaseWallet,
  signerUtils,
} from '@vechain/sdk-network';
import { clauseBuilder, TransactionHandler } from '@vechain/sdk-core';

// Sender
const senderAccount = {
  privateKey:
    'f9fc826b63a35413541d92d2bfb6661128cd5075fcdca583446d20c59994ba26',
  address: '0x7a28e7361fd10f4f058f9fefc77544349ecff5d6',
};

// Clause to execute
const clauses = [
  clauseBuilder.functionInteraction(
    '0x8384738c995d49c5b692560ae688fc8b51af1059',
    'increment()'
  ),
];

// 1. create thor client
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// 2. Estimate Gas Fee
const gasResult = await thor.gas.estimateGas(clauses, senderAccount.address);

// 3. build transaction
const txBody = await thor.transactions.buildTransactionBody(
  clauses,
  gasResult.totalGas,
  {
    isDelegated: true,
  }
);

/*
// SDK <beta.3
const signedTx = await thor.transactions.signTransaction(
  txBody,
  senderAccount.privateKey,
  {
    delegatorUrl: 'https://sponsor-testnet.vechain.energy/by/90',
  }
);
*/

// SDK >=beta.15

// 4. create wallet
const wallet = new ProviderInternalBaseWallet([senderAccount], {
  delegator: {
    delegatorUrl: 'https://sponsor-testnet.vechain.energy/by/90',
  },
});

// 5. create provider with thor client + wallet + delegation enabled
const providerWithDelegationEnabled = new VeChainProvider(thor, wallet, true);

// 6. get wallet through provider (wallet.getSigner() does not work)
const signer = await providerWithDelegationEnabled.getSigner(
  senderAccount.address
);

// 7. convert tx to request input(?)
const txInput = signerUtils.transactionBodyToTransactionRequestInput(
  txBody,
  senderAccount.address
);

// 8. sign tx
const rawDelegateSigned = await signer.signTransaction(txInput);

// 9. restore transaction from hex signed transaction
const signedTx = TransactionHandler.decode(
  Buffer.from(rawDelegateSigned.slice(2), 'hex'),
  true
);

// 10. send transaction
const sendTransactionResult = await thor.transactions.sendTransaction(signedTx);

console.log('Transaction sent', sendTransactionResult);
console.log(
  'Open',
  `https://explore-testnet.vechain.org/transactions/${sendTransactionResult.id}`,
  'to learn more'
);
console.log('');

console.log('Waiting for transaction to be included in the next block');
const txReceipt = await thor.transactions.waitForTransaction(
  sendTransactionResult.id
);
console.log('Transaction processed', txReceipt);
