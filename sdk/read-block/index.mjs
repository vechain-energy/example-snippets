import { ThorClient } from '@vechain/sdk-network';
const thor = ThorClient.fromUrl('https://mainnet.vechain.org');
const blockIdOrNumber = process.argv[2] ?? 12345678;
console.log('Reading block', blockIdOrNumber);

// get the block and transaction ids within it
const compressed = await thor.blocks.getBlockCompressed(blockIdOrNumber);
console.log(compressed);

// get the block and transaction data including receipts
const expanded = await thor.blocks.getBlockExpanded(blockIdOrNumber);
console.log(expanded);
