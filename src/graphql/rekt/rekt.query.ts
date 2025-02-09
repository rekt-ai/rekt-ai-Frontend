import { gql } from "graphql-request";

export const queryMarketCreateds = gql`
  query QueryMarketCreateds($first: Int, $skip: Int, $deadline: Int, $marketId: String) {
    marketCreateds(
      first: $first
      orderBy: startTime
      orderDirection: desc
      skip: $skip
      where: { 
        deadline_lt: $deadline_lt,
        deadline_gt: $deadline_gt,
        marketId: $marketId,
        startTime: $startTime,
        deadline: $deadline,
        blockTimestamp: $blockTimestamp
      }
    ) {
      id
      marketId
      name
      startTime
      deadline
      blockTimestamp
      blockNumber
    }
  }
`;

export const queryMarketSettleds = gql`
  query QueryMarketSettleds($blockTimestamp: Int, $first: Int, $marketId: String) {
    marketSettleds(
      orderBy: blockTimestamp
      orderDirection: asc
      where: { 
        marketId: $marketId,
        blockTimestamp_gt: $blockTimestamp,
        winner_not: 0,
        totalAmount: "",
        winner: ""
      }
      first: $first
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
      orderBy: id
      orderDirection: asc
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
  query QueryWithdrawBalances($first: Int) {
    withdrawBalances(
      first: $first
      orderBy: id
      orderDirection: asc
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
      orderBy: id
      orderDirection: asc
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


