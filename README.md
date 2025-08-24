# Presence - Proof-of-Presence Platform

## The Story

Shape really focuses on artists and creators. And I want to build something that would help Shape help artists and creators more. Something useful. Not just a fun little project. So I got this Proof-of-Presence idea. Proving that you are present in a community of a creator. A Badge of that. In form of an NFT. What if creators could provide metadata of NFT and image along with the wallets allowed to mint that NFT. Wouldn't it be like the creator invited you to join their community ? Wouldn't it feel personal and close ?
   
Creators would get gasback because community members would be interacting with creators' deployed contracts, and the community members would be getting NFTs that prove their presence in a community. These NFTs can be used as a certificate to prove skills and participation in events or a badge and membership proof of a community.
   
Creators should spend time doing what suits them the best and let the platform handle the complexities.

## Hackathon
Video demo: https://youtu.be/TeyJThHBiNU   
Team members: Shiv Shakti Rai   
Contracts Deployed on Shape Testnet:   
  presenceEventFactory: "0x00CB402321a902CbA782f591ACb557c1d121669f",   
  presenceCommunityFactory: "0x464Cbc87D461B53Adb626184C3BDCfa605c8eB26"   

## The platform

Presence is a decentralized platform that helps creators grow their communities and events by providing Proof-Of-Presence NFTs. This platform streamlines membership NFTs management and gives creators more time to create.
   
Creators issue NFTs to grow their communities. Members mint NFTs to prove their presence.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Smart Contracts](#smart-contracts)
- [Next steps](#next-steps)

## Project Overview

Presence leverages blockchain technology to allow users to:

- Create communities 
- Create events
- Mint variety of NFTs for these communities and events

The platform ensures transparency, security, and immutability for community and events.

## Usage
1) Landing Page: User is able to connect wallet
2) Profile Page: User is able to see his NFTs and get AI suggestions for more communities and events
3) Creator's Corner: Creator is able to create a new community or event, generate image using AI through text prompt, and see created communities and events and manage them.
4) Contract Management: Creator is able to add more levels with metadataURI for NFTs, add or remove users from mint list, see overview of NFTs and generate mint links for NFTs.
5) Mint page: Eligible Users are able to mint NFTs through link provided by the creator. This page contains details of both, the NFT to be minted and the contract.

## Features

- **Community Management**: Create and manage communities
- **Event Management**: Create and track events
- **Proof-of-Presence**: Validate and record presence on-chain
- **Dashboard**: Track participation and engagement

## Tech Stack

- **Frontend**:Next.js, Tailwind CSS
- **Blockchain**: Shape
- **Smart Contracts**: Solidity, Foundry
- **Contract connection**: Ethersjs
- **Storage**: IPFS for metadata and media files

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MetaMask wallet
- Foundry

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ShivRaiGithub/Presence.git
```

2. Navigate to project folder:
```bash
cd Presence
```

3. Install dependencies:
```bash
npm install --legacy-peer-deps
```
or
```bash
yarn install
```

4. .env: Copy .env.example to .env and enter the variables

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the DApp


** NOTE **
If deploying smart contracts locally, change the following in lib/contracts.ts (Right now they point to the deployed contracts on shape testnet):

```javascript
export const CONTRACT_ADDRESSES = {
  presenceEventFactory: "0x00CB402321a902CbA782f591ACb557c1d121669f",
  presenceCommunityFactory: "0x464Cbc87D461B53Adb626184C3BDCfa605c8eB26",
}
```

## Smart Contracts

- **PresenceCommunityFactory**: Deploys new community contracts
- **PresenceEventFactory**: Deploys new event contracts
- **Community Contract**: Manages members, metadata, NFTs and Community
- **Event Contract**: Manages members, metadata, NFTs and Event

## Next Steps
1. Integration with Google forms: Allows Creators to share a google form with users which collects wallet addresses of users allowing creators to directly extract and allow all wallet addresses to mint NFTs.
2. Improving AI Image model: Improving the AI image generation feature (Integrate APIs of better models or use a self-hosted model).
3. Improving Community and Event contract: Gas Optimizations, better features like options for "Anyone can join" or "Invite only" for community and events and Start and End Dates for events.
4. Dynamic NFTs: Allow users to update their NFTs' Metadata based on their achievements in community or event.
5. Improving UI/UX: Creators shouldn't worry about things they don't need to worry about.
6. Community and Event Discovery Page: Provide a page for users to discover new communities and events.

### Possibilities
1. File sharing: Distribute a file (even AI Models) and allow only the users having authorized NFTs to access it.
2. Pay-to-mint: Users pay to mint an NFT of a community or event. Can be used to buy NFTs as tickets to an event.

### The Main Step
To help creators grow their communities. To help users prove their presence.