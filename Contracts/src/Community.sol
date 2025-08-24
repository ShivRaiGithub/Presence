// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./BaseSoulbound.sol";

/**
 * @title Community
 * @dev Soulbound NFT for communities
 */
contract Community is BaseSoulbound {
    string constant contractType = "Community";
    string communityName;
    string communityDescription;
    string communityMetadataURI;

    constructor(
        string memory name,
        string memory symbol,
        address creator,
        string memory _communityName,
        string memory _communityDescription,
        string memory _communityMetadataURI
    ) BaseSoulbound(name, symbol, creator) {
        communityName = _communityName;
        communityDescription = _communityDescription;
        communityMetadataURI = _communityMetadataURI;
    }

    function getContractDetails()
        external
        view
        override
        returns (string memory, string memory, string memory, string memory)
    {
        return (contractType, communityName, communityDescription, communityMetadataURI);
    }
}
