'use client'; // This is a client component
import { type ReactElement, useEffect, useState } from 'react';
import { WalletButton, useWallet } from '@vechain/dapp-kit-react';

const Button = (): ReactElement => {
  const { connectionCertificate } = useWallet();

  const [apiResponse, setApiResonse] = useState<object | undefined>();

  useEffect(() => {
    console.log(JSON.stringify(connectionCertificate, null, 2));
    const encodedCertificate = btoa(JSON.stringify(connectionCertificate));
    fetch('/api/verify', {
      method: 'GET',
      headers: {
        authorization: encodedCertificate,
      },
    })
      .then((result) => result.json())
      .then(setApiResonse)
      .catch((err) => setApiResonse(err.message));
  }, [connectionCertificate]);

  return (
    <div className="container">
      <WalletButton />
      <pre>{JSON.stringify(apiResponse, null, 2)}</pre>

      <br />
      <hr />
      <i className="text-xs">
        Note: VeWorld does not support Frames.
        <br />
        <a href={window.location.href} target="_blank" className="underline">
          Open this Preview-URL in a new tab to test it.
        </a>
      </i>
    </div>
  );
};

const HomePage = (): ReactElement => {
  return <Button />;
};

// eslint-disable-next-line import/no-default-export
export default HomePage;
