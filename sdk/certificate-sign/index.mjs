import {
  certificate,
  secp256k1,
  blake2b256,
  addressUtils,
} from '@vechain/sdk-core';

console.log('Generating a random wallet');
const privateKey = secp256k1.generatePrivateKey();

console.log('Generating a certificate');
const cert = {
  purpose: 'identification',
  payload: {
    type: 'text',
    content: 'Welcome to my application',
  },
  domain: 'localhost',
  timestamp: (Date.now() / 1000).toFixed(0),
};

console.log('');
console.log('Signing the certificate');
const signedCert = signCertificate(cert, privateKey);
console.log(signedCert);

console.log('');
console.log('Verifying signed certificate');
certificate.verify(signedCert);
console.log('...success');

console.log('');
console.log('Verifying an invalid certificate');
const invalidCert = {
  ...signedCert,
  payload: { ...signedCert.payload, content: 'Modified' },
};
try {
  certificate.verify(invalidCert);
  console.log('...success');
} catch (err) {
  console.log('...failed', err.message);
}

function signCertificate(cert, privateKey) {
  // calculate signer from private key
  const publicKey = secp256k1.derivePublicKey(privateKey);
  const signer = addressUtils.fromPublicKey(publicKey);

  // encode & sign
  const jsonStr = certificate.encode({ ...cert, signer });
  const rawSignature = secp256k1.sign(blake2b256(jsonStr), privateKey);
  const signature = `0x${rawSignature.toString('hex')}`;

  // signed certificate contains information about the signing address and the signature
  return { ...cert, signer, signature };
}
