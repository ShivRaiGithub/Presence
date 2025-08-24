// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./BaseSoulbound.sol";

/**
 * @title Event
 * @dev Soulbound NFT for events
 */
contract Event is BaseSoulbound {
    string constant contractType = "Event";
    string eventName;
    string eventDescription;
    string eventMetadataURI;

    constructor(
        string memory name,
        string memory symbol,
        address creator,
        string memory _eventName,
        string memory _eventDescription,
        string memory _eventMetadataURI
    ) BaseSoulbound(name, symbol, creator) {
        eventName = _eventName;
        eventDescription = _eventDescription;
        eventMetadataURI = _eventMetadataURI;
    }

    function getContractDetails()
        external
        view
        override
        returns (string memory, string memory, string memory, string memory)
    {
        return (contractType, eventName, eventDescription, eventMetadataURI);
    }
}
