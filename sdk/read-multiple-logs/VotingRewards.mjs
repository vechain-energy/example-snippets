import { ThorClient } from '@vechain/sdk-network';
import voterRewardsAbi from './VoterRewards.json' assert { type: 'json' };

// Connect to TestNet
const thor = ThorClient.fromUrl('https://testnet.vechain.org');

// Get current round and calculate previous from it
const [currentCycle] = await thor.contracts.executeCall(
  '0x90c1a329e11CE6429eeF0ab9b8f7DAaB68694e7d',
  'function currentRoundId() returns (uint256)'
);
const previousCycle = currentCycle - 1n;

// create contracts helper for the Rewards contract
const vbdRewards = thor.contracts.load(
  '0x2D0EfF77e390cff063E0567A7735c904cBC4D1cf',
  voterRewardsAbi
);

// fetch logs
const [votesRegistered, rewardClaimed] = await thor.logs.filterEventLogs({
  criteriaSet: [
    ...vbdRewards.filters.VoteRegistered(previousCycle).criteriaSet,
    ...vbdRewards.filters.RewardClaimed(previousCycle).criteriaSet,
  ],
});

console.log(
  'Found',
  votesRegistered.length,
  'Vote Events',
  'and',
  rewardClaimed.length,
  'Reward Claims',
  'for round',
  previousCycle
);
