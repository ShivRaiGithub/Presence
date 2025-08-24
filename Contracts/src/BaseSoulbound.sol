// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseSoulboundNFT
 * @dev Abstract base for soulbound NFTs with allowlisting and levels.
 */
abstract contract BaseSoulbound is ERC721, Ownable, ReentrancyGuard {

    struct MintStatus {
        bool allowedToMint;
        bool hasMinted;
        uint256 tokenId;
    }

    struct UserLevel {
        address user;
        uint256 level;
    }

    uint256 internal _tokenIdCounter = 1;
    uint256 public levelCount = 0;


    mapping(address => mapping(uint256 => MintStatus)) public userToLevelToMintStatus;
    mapping(uint256 => string) public levelMetadataURIs;
    mapping(address => uint256[]) public userTokenId;
    mapping(uint256 => UserLevel) tokenIdToUserLevel;


    event Minted(address indexed user, uint256 level, uint256 tokenId);
    event Burned(address indexed user, uint256 tokenId);

    constructor(string memory name, string memory symbol, address creator)
        ERC721(name, symbol)
        Ownable(creator)
    {}

    modifier onlyAllowlisted(uint256 level) {
        require(userToLevelToMintStatus[msg.sender][level].allowedToMint, "Not on allowlist");
        _;
    }

    modifier hasNotMinted(uint256 level) {
        require(!userToLevelToMintStatus[msg.sender][level].hasMinted, "Already minted");
        _;
    }

    function addLevel(string memory metadataURI) external onlyOwner {
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        levelCount++;
        levelMetadataURIs[levelCount] = metadataURI;
    }

    function addToAllowlist(address[] memory users, uint256 level) external onlyOwner {
        require(users.length > 0 && level > 0 && level <= levelCount, "Invalid input");
        for (uint256 i = 0; i < users.length; i++) {
            userToLevelToMintStatus[users[i]][level].allowedToMint = true;
        }
    }

    function removeFromAllowlist(address[] memory users, uint256 level) external onlyOwner {
        require(users.length > 0 && level > 0, "Invalid input");
        for (uint256 i = 0; i < users.length; i++) {
            userToLevelToMintStatus[users[i]][level].allowedToMint = false;
        }
    }

    function mint(uint256 level) external nonReentrant onlyAllowlisted(level) hasNotMinted(level) {
        require(level > 0, "Invalid level");

        uint256 tokenId = _tokenIdCounter++;
        userToLevelToMintStatus[msg.sender][level] = MintStatus(true, true, tokenId);
        userTokenId[msg.sender].push(tokenId);
        tokenIdToUserLevel[tokenId] = UserLevel(msg.sender, level);

        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, level, tokenId);
    }

    function burn(uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || msg.sender == owner(), "Not authorized");

        uint256 level = tokenIdToUserLevel[tokenId].level;

        userToLevelToMintStatus[tokenOwner][level] = MintStatus(false, false, 0);

        // Remove tokenId from userTokenId list
        uint256[] storage tokens = userTokenId[tokenOwner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }

        _burn(tokenId);
        emit Burned(tokenOwner, tokenId);
    }

    // This replaces _beforeTokenTransfer from older OZ versions
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override virtual returns (address) {
        address from = _ownerOf(tokenId);

        // Block transfers (but allow minting and burning)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }

        return super._update(to, tokenId, auth);
    }


    function approve(address, uint256) public pure override {
        revert("Soulbound: Approval not allowed");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: Approval not allowed");
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address tokenOwner = _ownerOf(tokenId);
        require(tokenOwner != address(0), "Token does not exist");
        return levelMetadataURIs[tokenIdToUserLevel[tokenId].level];
    }

    // Common view functions
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    function getUserLevelsMinted(address user) external view returns (uint256[] memory) {
        return userTokenId[user];
    }

    function hasUserMinted(address user, uint256 level) external view returns (bool) {
        return userToLevelToMintStatus[user][level].hasMinted;
    }

    function getUserTokenId(address user, uint256 level) external view returns (uint256) {
        return userToLevelToMintStatus[user][level].tokenId;
    }

    function getTokenLevel(uint256 tokenId) external view returns (uint256) {
        return tokenIdToUserLevel[tokenId].level;
    }

    function isEligible(address user, uint256 level) external view returns (bool) {
        return userToLevelToMintStatus[user][level].allowedToMint;
    }

    // Abstract view function to be implemented by derived contracts
    function getContractDetails() external view virtual returns (string memory, string memory, string memory, string memory);

}
