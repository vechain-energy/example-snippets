import { subscriptions, ThorClient } from '@vechain/sdk-network';
import WebSocket from 'ws';

// build a subscription url for the WebSocket connection
const wsUrl = subscriptions.getNewTransactionsSubscriptionUrl(
  'https://mainnet.vechain.org'
);

// connect the WebSocket
console.log('Connecting to', wsUrl);
const ws = new WebSocket(wsUrl);
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');

// handle incoming messages
ws.onmessage = async (message) => {
  // data is received as text and needs to be converted into an object first
  console.log('Received data', message.data);
  const addedTx = JSON.parse(message.data);

  console.log('New transaction', addedTx);

  // @TODO: requires fix of https://github.com/vechain/vechain-sdk-js/issues/823
  // fetch transaction details using the ThorClient
  // const thorTx = await thor.transactions.getTransaction(addedTx.id, {
  //   pending: true,
  // });
  // console.log(thorTx);

  // fetch transaction details directly from the node
  // const nodeTx = await fetch(
  //   `https://mainnet.vechain.org/transactions/${addedTx.id}?pending=true`
  // ).then((res) => res.json());
  // console.log(nodeTx);
};

// some helper to debug the websocket activity
ws.onopen = () => {
  console.log('Connected, listening for new Transactions');
};
ws.onclose = () => {
  console.log('Disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};
