## Finish Line 🏁

- [x] Finish application
- [x] UI for browser fingerprinting (table of interesting data)
- [x] UI for location data as a map
- [x] Mobile width
- [x] Copy edits

## Post Hackathon

- [ ] Update README
- [ ] Update API keys, rate limits, etc.
- [ ] Disable all Vercel logging
- [ ] More modular implementation
- [ ] List future ideas

---

## Client UI

- [x] Enter your wallet address
- [x] "What your browser tells us"
  - Show first while blockchain data is loading -[x] Browser fingerprinting
- [ ] "What your wallet tells us"
  - Balance
  - ENS names
  - Basenames
  - Tokens
  - Age of wallet, recent activity
  - Graph of frequently interacted addresses
  - Used exchanges, mixers, etc.

## Client Data

https://github.com/thumbmarkjs/thumbmarkjs

- [x] OS + device
- [x] Geolocation via IP
- [x] Time zone
- [x] Text in clipboard

https://github.com/MetaMask/detect-provider

- [ ] Any better options?

## Backend

- [x] Discover other ENS names, associated addresses
  - [ ] Check Base, Farcaster, etc?
- [x] API wrapper around 1inch, Alchemy, Etherscan, etc.
- [x] PortfolioViewer: Displays assets, tokens, ENS, NFTs, etc.
- [ ] LabelResolver: Maps addresses to human-readable names (known exchanges, known mixers)
  - [ ] Get from Alchemy? Etherscan?
- [x] RelationshipAnalyzer: Identifies frequently interacted addresses and known contracts
  - [ ] Return transaction amounts
- [x] TimezoneAnalyzer: Estimates user timezone based on transaction timestamps

## Bonus

- Login with World ID to prevent bots from using the service (think: Super Captcha)
  - [ ] MiniApp?
  - [ ] Verify?
  - [ ] Protect API with JWT https://docs.world.org/world-id/further-reading/oidc#redirect-responses
- Animated character: Looking glass with eye. Peeks out from edge of screen. When user focuses on input.
- Fingerprinting: Detect social accounts
