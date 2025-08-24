// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Script.sol";
import {PresenceEvent} from "../src/PresenceEvent.sol";
import {PresenceCommunity} from "../src/PresenceCommunity.sol";

contract DeployPresence is Script {
    function run() public returns(PresenceEvent eventFactory, PresenceCommunity communityFactory) {

        vm.startBroadcast(msg.sender);

        // Deploy the PresenceEvent contract
        eventFactory = new PresenceEvent();
        console.log("PresenceEvent deployed at:", address(eventFactory));

        // Deploy the PresenceCommunity contract
        communityFactory = new PresenceCommunity();
        console.log("PresenceCommunity deployed at:", address(communityFactory));

        vm.stopBroadcast();
        return (eventFactory, communityFactory);
    }
}
