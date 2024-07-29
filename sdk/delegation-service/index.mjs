import {
  HttpClient,
  ThorClient,
  VeChainProvider,
  ProviderInternalBaseWallet,
  signerUtils,
} from '@vechain/sdk-network';
import {
  clauseBuilder,
  secp256k1,
  TransactionHandler,
  addressUtils,
} from '@vechain/sdk-core';
import express from 'express';

// setup simple express server
const app = express();
app.use(express.json());
app.listen(3000);

app.post('/', (req, res) => {
  console.log('Incoming request', req.body);
  const transactionToSign = TransactionHandler.decode(
    Buffer.from(req.body.raw.slice(2), 'hex')
  );
  const delegatedHash = transactionToSign.getSignatureHash(req.body.origin);
  const signature = `0x${Buffer.from(
    secp256k1.sign(delegatedHash, delegatorPrivateKey)
  ).toString('hex')}`;
  console.log('Signature', signature);

  res.json({ signature });
});

// build a transaction, signed with url fee delegation
const thor = new ThorClient(new HttpClient('https://testnet.vechain.org'));
const privateKey = secp256k1.generatePrivateKey();
const senderAddress = addressUtils.fromPrivateKey(privateKey);
const delegatorPrivateKey = secp256k1.generatePrivateKey();
const tx = await generateSampleTransaction();

const providerWithDelegationEnabled = new VeChainProvider(
  thor,
  new ProviderInternalBaseWallet(
    [
      {
        privateKey: privateKey,
        address: senderAddress,
      },
    ],
    {
      delegator: { delegatorUrl: 'http://localhost:3000/' },
    }
  ),

  // Enable fee delegation
  true
);
const signedTx = await (
  await providerWithDelegationEnabled.getSigner(senderAddress)
).signTransaction(
  signerUtils.transactionBodyToTransactionRequestInput(tx, senderAddress)
);
process.exit(0);

async function generateSampleTransaction() {
  // generate random key for this script
  const privateKey = secp256k1.generatePrivateKey();

  // build instructions to execute
  const clauses = [
    clauseBuilder.functionInteraction(
      '0x8384738c995d49c5b692560ae688fc8b51af1059',
      'increment()'
    ),
  ];

  // estimate how much gas the transaction will cost
  const gasResult = await thor.gas.estimateGas(clauses);

  // build a transaction
  const tx = await thor.transactions.buildTransactionBody(
    clauses,
    gasResult.totalGas,
    {
      isDelegated: true,
    }
  );

  return tx;
}
