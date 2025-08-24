// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Community} from "./Community.sol";

/**
 * @title PresenceCommunity
 * @dev Factory contract that deploys Community contracts
 */
contract PresenceCommunity is ReentrancyGuard {
    
    // State variables
    mapping(address => uint256[]) public creatorCommunityContracts;
    address[] public allCommunityContracts;

    // Events
    event CommunityDeployed(
        address indexed creator,
        address indexed contractAddress,
        string name,
        string symbol,
        uint256 timestamp
    );
    
    /**
     * @dev Deploy a new Community contract
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param _communityName The name of the community
     * @param _communityDescription The description of the community
     * @param _communityMetadataURI The metadata URI for the community
     */
    function deployCommunity(
        string memory name,
        string memory symbol,
        string memory _communityName,
        string memory _communityDescription,
        string memory _communityMetadataURI
    ) external nonReentrant returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        
        // Deploy new Community contract
        Community newContract = new Community(
            name,
            symbol,
            msg.sender,
            _communityName,
            _communityDescription,
            _communityMetadataURI
        );
        
        address contractAddress = address(newContract);

        // Store contract tracking info
        allCommunityContracts.push(contractAddress);
        creatorCommunityContracts[msg.sender].push(allCommunityContracts.length - 1);
        
        emit CommunityDeployed(msg.sender, contractAddress, name, symbol, block.timestamp);
        
        return contractAddress;
    }
    
    /**
     * @dev Get all community contracts deployed by a creator
     */
    function getCreatorCommunityContracts(address creator) external view returns (address[] memory) {
        address[] memory contracts = new address[](creatorCommunityContracts[creator].length);
        for (uint256 i = 0; i < creatorCommunityContracts[creator].length; i++) {
            contracts[i] = allCommunityContracts[creatorCommunityContracts[creator][i]];
        }
        return contracts;
    }
    
    /**
     * @dev Get total number of community contracts
     */
    function getTotalCommunityContracts() external view returns (uint256) {
        return allCommunityContracts.length;
    }
    
    /**
     * @dev Get all community contracts
     */
    function getAllCommunityContracts() external view returns (address[] memory) {
        return allCommunityContracts;
    }
}