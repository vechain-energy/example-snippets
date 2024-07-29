import {
  ThorClient,
  VeChainProvider,
  ProviderInternalBaseWallet,
  signerUtils,
} from '@vechain/sdk-network';
import {
  clauseBuilder,
  secp256k1,
  addressUtils,
  TransactionHandler,
} from '@vechain/sdk-core';

const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// generate random key for this script
const privateKey = secp256k1.generatePrivateKey();

// build instructions to execute
const clauses = [
  clauseBuilder.functionInteraction(
    '0x8384738c995d49c5b692560ae688fc8b51af1059',
    'increment()'
  ),
];

// execute transaction
const sendTransactionResult = await sendTransaction(clauses, privateKey, {
  delegatorUrl: 'https://sponsor-testnet.vechain.energy/by/90',
});

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

/**
 * hide complexity below
 */
async function sendTransaction(clauses, privateKey, delegator) {
  const senderAddress = addressUtils.fromPrivateKey(privateKey);

  // estimate how much gas the transaction will cost
  const gasResult = await thor.gas.estimateGas(clauses, senderAddress);

  // build a transaction
  const txBody = await thor.transactions.buildTransactionBody(
    clauses,
    gasResult.totalGas,
    {
      isDelegated: Boolean(delegator),
    }
  );

  // sign the transaction
  const wallet = new ProviderInternalBaseWallet(
    [{ privateKey, address: senderAddress }],
    {
      delegator,
    }
  );

  // Create the provider (used in this case to sign the transaction with getSigner() method)
  const providerWithDelegationEnabled = new VeChainProvider(thor, wallet, true);

  const signer = await providerWithDelegationEnabled.getSigner(senderAddress);
  const txInput = signerUtils.transactionBodyToTransactionRequestInput(
    txBody,
    senderAddress
  );
  console.log(txInput);
  const rawDelegateSigned = await signer.signTransaction(txInput);

  const delegatedSigned = TransactionHandler.decode(
    Buffer.from(rawDelegateSigned.slice(2), 'hex'),
    true
  );

  // send the transaction to the network
  const sendTransactionResult = await thor.transactions.sendTransaction(
    delegatedSigned
  );

  return sendTransactionResult;
}
