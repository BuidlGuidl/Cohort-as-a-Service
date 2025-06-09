import { GraphQLClient } from "graphql-request";

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_API_URL
  ? `${process.env.NEXT_PUBLIC_PONDER_API_URL}/graphql`
  : "http://localhost:42069/graphql";

export const graphqlClient = new GraphQLClient(PONDER_GRAPHQL_URL);

// Example query to get cohort with all related data
export const GET_COHORT_DETAILS = `
  query GetCohortDetails($address: String!) {
    cohort(id: $address) {
      id
      address
      chainId
      chainName
      primaryAdmin
      name
      description
      createdAt
      
      builders {
        id
        builderAddress
        cap
        last
        isActive
      }
      
      admins {
        id
        adminAddress
        isActive
      }
      
      withdrawEvents(orderBy: timestamp, orderDirection: desc) {
        id
        builderAddress
        amount
        reason
        timestamp
      }
    }
  }
`;
