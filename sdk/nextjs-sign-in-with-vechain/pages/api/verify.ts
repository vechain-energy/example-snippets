import type { NextApiRequest, NextApiResponse } from 'next';
import { certificate } from '@vechain/sdk-core';
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<object>
) {
  const authHeader = req.headers.authorization;
  const decodedAuthHeader = atob(authHeader ?? '');
  const decodedCertificate = JSON.parse(decodedAuthHeader);
  if (!decodedCertificate) {
    return res.json({
      status: 'missing',
      authHeader,
      decodedAuthHeader,
      decodedCertificate,
    });
  }

  try {
    // verify it
    certificate.verify(decodedCertificate);

    // further verify attributes like signer, domain or payload of the decodedCertificate
    // verify timestamp/max. validity

    return res.json({
      status: 'verified',
      authHeader,
      decodedCertificate,
      user: decodedCertificate.signer,
    });
  } catch (err: any) {
    return res.json({
      status: 'failed',
      authHeader,
      decodedAuthHeader,
      decodedCertificate,
      errorMessage: err.message,
    });
  }
}
