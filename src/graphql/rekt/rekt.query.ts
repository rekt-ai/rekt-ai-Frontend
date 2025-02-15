import { gql } from "graphql-request";

export const queryMarketCreateds = gql`
  query QueryMarketCreateds($first: Int, $skip: Int) {
    marketCreateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
      where: { 
        blockTimestamp_gt: ${Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60)}
      }
    ) {
      id
      startTime
      deadline
      blockNumber
    }
  }
`;

export const queryMarketSettleds = gql`
  query QueryMarketSettleds($first: Int, $marketId: String) {
    marketSettleds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
      where: { 
        marketId: $marketId,
        winner_not: "0x0000000000000000000000000000000000000000"
      }
    ) {
      id
      marketId
      finalPrice
      predictionPrice
      totalAmount
      winner
      transactionHash
      blockTimestamp
      blockNumber
    }
  }
`;

export const queryMarketParticipations = gql`
  query QueryMarketParticipations($first: Int, $marketId: String) {
    marketParticipations(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
      where: { marketId: $marketId }
    ) {
      blockNumber
      blockTimestamp
      id
      marketId
      player
      predictionPrice
      transactionHash
    }
  }
`;

export const queryWithdrawBalances = gql`
  query QueryWithdrawBalances($first: Int, $user: String) {
    withdrawBalances(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
      where: { user: $user }
    ) {
      amount
      blockNumber
      blockTimestamp
      id
      user
      transactionHash
    }
  }
`;

export const queryOwnershipTransferreds = gql`
  query QueryOwnershipTransferreds($first: Int) {
    ownershipTransferreds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      blockNumber
      blockTimestamp
      id
      newOwner
      previousOwner
      transactionHash
    }
  }
`;