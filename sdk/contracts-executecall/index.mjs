import { ThorClient } from '@vechain/sdk-network';
import { ErrorDecoder } from 'ethers-decode-error';
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

// read name of contract
const name = await thor.contracts.executeCall(
  '0x0000000000000000000000000000456e65726779',
  'name() returns (string)'
);
console.log('Name', name);

// read balance of an address
const balanceNow = await thor.contracts.executeCall(
  '0x0000000000000000000000000000456e65726779',
  'balanceOf(address _owner) returns (uint256)',
  ['0x0000000000000000000000000000000000000000']
);
console.log('Balance Now', balanceNow);

// read balance of an address in the past
const balancePast = await thor.contracts.executeCall(
  '0x0000000000000000000000000000456e65726779',
  'balanceOf(address _owner) returns (uint256)',
  ['0x0000000000000000000000000000000000000000'],
  { revision: 12345678 }
);
console.log('Balance Past', balancePast);

// simulate a transfer
const transfer = await thor.contracts.executeCall(
  '0x0000000000000000000000000000456e65726779',
  'transfer(address _to, uint256 _amount) returns(bool success)',
  ['0x0000000000000000000000000000456e65726779', '1'],
  {
    caller: '0x0000000000000000000000000000000000000000',
  }
);
console.log('Transfer Test', transfer);

// failing simulation of transfer
try {
  const failingTransfer = await thor.contracts.executeCall(
    '0x0000000000000000000000000000456e65726779',
    'transfer(address _to, uint256 _amount) returns(bool success)',
    ['0x0000000000000000000000000000456e65726779', '1'],
    {
      caller: '0x0000000000000000000000000000000000000003',
    }
  );
  console.log('Failed Transfer Test', failingTransfer);
} catch (err) {
  const errorDecoder = ErrorDecoder.create();
  const decodedError = await errorDecoder.decode(err);
  console.log(`Revert reason: ${decodedError.reason}`);
}
