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
  unitsUtils,
  TransactionHandler,
} from '@vechain/sdk-core';

const _testnetUrl = 'https://testnet.vechain.org';
const thorClient = ThorClient.fromUrl(_testnetUrl, {
  isPollingEnabled: false,
});

// Sender account with private key
const senderAccount = {
  mnemonic:
    'fat draw position use tenant force south job notice soul time fruit',
  privateKey:
    '2153c1e49c14d92e8b558750e4ec3dc9b5a6ac4c13d24a71e0fa4f90f4a384b5',
  address: '0x571E3E1fBE342891778151f037967E107fb89bd0',
};

const signer = new ProviderInternalBaseWallet([
  {
    privateKey: Buffer.from(senderAccount.privateKey, 'hex'),
    address: senderAccount.address,
  },
]);
// Create the provider (used in this case to sign the transaction with getSigner() method)
const providerWithDelegationEnabled = new VeChainProvider(
  // Thor client used by the provider
  thorClient,

  // Internal wallet used by the provider (needed to call the getSigner() method)
  signer,

  // Enable fee delegation
  false
);

// 2 - Create the transaction clauses
const transaction = {
  clauses: [
    clauseBuilder.functionInteraction(
      '0x8384738c995d49c5b692560ae688fc8b51af1059',
      'increment()'
    ),
  ],
  simulateTransactionOptions: {
    caller: senderAccount.address,
  },
};

// 3 - Estimate gas
const gasResult = await thorClient.gas.estimateGas(
  transaction.clauses,
  senderAccount.address
);

// 4 - Build transaction body
const txBody = await thorClient.transactions.buildTransactionBody(
  transaction.clauses,
  gasResult.totalGas,
  {
    nonce: Date.now(),
  }
);

// 4 - Sign the transaction
const signer2 = await providerWithDelegationEnabled.getSigner(
  senderAccount.address
);
const txInput = signerUtils.transactionBodyToTransactionRequestInput(
  txBody,
  senderAccount.address
);

const signedTransaction = await signer2.signTransaction(txInput);
const delegatedSigned = TransactionHandler.decode(
  Buffer.from(signedTransaction.slice(2), 'hex'),
  true
);

// 5 - Send the transaction
const sendTransactionResult = await thorClient.transactions.sendTransaction(
  delegatedSigned
);

// 6 - Wait for transaction receipt
const txReceipt = await thorClient.transactions.waitForTransaction(
  sendTransactionResult.id
);
