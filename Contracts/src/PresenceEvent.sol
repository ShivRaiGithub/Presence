// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Event} from "./Event.sol";

/**
 * @title PresenceEvent
 * @dev Factory contract that deploys Event contracts
 */
contract PresenceEvent is ReentrancyGuard {
    // State variables
    mapping(address => uint256[]) public creatorEventContracts;
    address[] public allEventContracts;
    
    // Events
    event EventDeployed(
        address indexed creator,
        address indexed contractAddress,
        string name,
        string symbol,
        uint256 timestamp
    );
    
    
    /**
     * @dev Deploy a new Event contract
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param _eventName The name of the event
     * @param _eventDescription The description of the event
     * @param _eventMetadataURI The metadata URI for the event
     */
    function deployEvent(
        string memory name,
        string memory symbol,
        string memory _eventName,
        string memory _eventDescription,
        string memory _eventMetadataURI
    ) external nonReentrant returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        
        // Deploy new Event contract
        Event newContract = new Event(
            name,
            symbol,
            msg.sender,
            _eventName,
            _eventDescription,
            _eventMetadataURI
        );
        
        address contractAddress = address(newContract);
        
        // Store contract tracking info
        allEventContracts.push(contractAddress);
        creatorEventContracts[msg.sender].push(allEventContracts.length - 1);
        
        emit EventDeployed(msg.sender, contractAddress, name, symbol, block.timestamp);
        
        return contractAddress;
    }
    
    /**
     * @dev Get all event contracts deployed by a creator
     */
    function getCreatorEventContracts(address creator) external view returns (address[] memory) {
        address[] memory contracts = new address[](creatorEventContracts[creator].length);
        for (uint256 i = 0; i < creatorEventContracts[creator].length; i++) {
            contracts[i] = allEventContracts[creatorEventContracts[creator][i]];
        }
        return contracts;
    }
    
    /**
     * @dev Get total number of event contracts
     */
    function getTotalEventContracts() external view returns (uint256) {
        return allEventContracts.length;
    }
    
    /**
     * @dev Get all event contracts
     */
    function getAllEventContracts() external view returns (address[] memory) {
        return allEventContracts;
    }
}