# How Doxxed am I?

A privacy audit for your wallet. What information does your public on-chain activity expose?

## Client UI

- Login with World ID (or Farcaster?) to prevent bots from using the service (think: Super Captcha)
  - Get JWT
- Enter your wallet address
- "What your browser tells us" (show first while blockchain data is loading)
  - Browser fingerprinting
  - Geolocation
  - Bonus: Attempt to log in with various social accounts
- "What your wallet tells us"
  - Balance
  - ENS names
  - Tokens
  - Age of wallet, recent activity
  - Graph of frequently interacted addresses
  - Used exchanges, mixers, etc.

## Backend

Vercel functions?

- Validate World ID JWT: https://docs.world.org/world-id/further-reading/oidc#redirect-responses
- Fetch blockchain data with library
- Return JSON for visualizations

## Library

### 1. Data Fetcher

- API wrapper around 1inch, Alchemy, Etherscan, etc.
- Constructs unified transaction histories by chain
- Handles pagination and basic response normalization
- Returns consistent transaction format across chains

### 2. Analyzers

Each analyzer takes transaction histories as input and outputs specific insights in JSON:

- **PortfolioViewer**: Displays assets, tokens, ENS, NFTs, etc.
- **LabelResolver**: Maps addresses to human-readable names (known exchanges, known mixers)
- **RelationshipAnalyzer**: Identifies frequently interacted addresses and known contracts
- **TimezoneAnalyzer**: Estimates user timezone based on transaction timestamps

### Usage

```javascript
// Fetch data
const txHistory = await blockchainFetcher.getTransactions(address, chains);

// Run analyzers
const portfolio = analyzePortfolio(txHistory);
const timezone = analyzeTimezone(txHistory);
const labels = analyzeLabels(txHistory);
const relationships = analyzeRelationships(txHistory);
```
