import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<object>
) {
  return res.json({
    message: `Hello from a server side randomly generated message: ${Math.random()}`,
  });
}
