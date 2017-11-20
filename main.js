let cpu = Game.cpu.getUsed();
console.log("CPU@Start: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
const CPUdebug = false;

require("globals");
var moduleSpawnCreeps = require('module.spawnCreeps');
var towerModule = require('tower');

global.reqCPU = Game.cpu.getUsed();
global.start = Game.time;
console.log('CPU@Initialization: ' + (global.reqCPU - cpu) + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);

//const profiler = require('screeps-profiler'); // cf. https://www.npmjs.com/package/screeps-profiler
//profiler.enable() ;
module.exports.loop = function() {

     for (var c in Game.creeps) {
    //   //c.memory.homeroom = this.room;
       var curCreep = Game.creeps[c];

      //  if(curCreep.memory.role == 'repairer')
      //  {
      //    curCreep.memory.role = 'builder';
      //    curCreep.memory.spawn = '59830099b097071b4adc49bb';
      //    curCreep.memory.homeroom = 'E47S29';
       //
      //  }
      //  if(curCreep.memory.role == 'upgrader')
      //  {
      //   //  curCreep.memory.role = 'builder';
      //    curCreep.memory.spawn = '59830099b097071b4adc49bd';
      //    curCreep.memory.homeroom = 'E47S29';
       //
      //  }
    //   //console.log(curCreep);
      //  for(var roomName in Game.rooms){//Loop through all rooms your creeps/structures are in
      //         curCreep.memory.homeroom = roomName;
      //       }
      //     }
             //var room = Game.rooms[roomName];
             //room.memory.roomArray = {};
             //room.memory.roomArray.lairs = {};
      //        var spawn1 = room.spawns.Spawn1;
      //        room.memory.roomArray.spawns = {};
      //        console.log(room.controller);
      //        console.log(room.controller.owner.username);
      //
      // console.log(room);
      // curCreep.memory.homeroom = 'E46S28';
      // curCreep.memory.spawn = '59ab16632e2fa57887739586';
    }

    //profiler.wrap(function() {
    let cpu = Game.cpu.getUsed();
    if (Game.time == global.start) { cpu -= global.reqCPU; }
    if (cpu >= 35) {
        console.log("<font color=#ff0000 type='highlight'>CPU@LoopStart: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket +"</font>");
        //return;
    }

    //Fill global.myRooms
    for (let m in global.myroomlist) {
        global.myRooms[global.myroomlist[m].name] = global.myroomlist[m];
    }

    var CPUdebugString = "CPU Debug<br><br>";
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed())}
        // check for memory entries of died creeps by iterating over Memory.creeps
        if (Game.time % 37 == 0) {
            for (var name in Memory.creeps) {
                // and checking if the it is still alive
                if (Game.creeps[name] == undefined) {
                    // if not, delete the memory entry
                    delete Memory.creeps[name];
                }
            }
        }

        var senex = _.filter(Game.creeps,{ ticksToLive: 1});
        if (global.LOG_EXPIRE == true) {
            for (var ind in senex) {
                console.log("<font color=#ffffff type='highlight'>Creep expired: " + senex[ind].name + " the \"" + senex[ind].memory.role + "\" in room " + senex[ind].room.name + ".</font>");
            }
        }

        /*Observer Code
        //TODO: Scan rooms in 10 rooms distance for room info and save it in an object
        */

        // Flag colors
        if (Game.time % global.DELAYFLAGCOLORS == 0) {
            //only flags for unit group should have only one color
            for (let f in Game.flags) {
                switch (Game.flags[f].memory.function) {
                    case "narrowSource":
                        Game.flags[f].setColor(COLOR_BROWN, COLOR_YELLOW);
                        break;

                    case "remoteController":
                        Game.flags[f].setColor(COLOR_CYAN, COLOR_PURPLE);
                        break;

                    case "attackController":
                        Game.flags[f].setColor(COLOR_CYAN, COLOR_RED);
                        break;

                    case "remoteSource":
                        Game.flags[f].setColor(COLOR_GREEN, COLOR_YELLOW);
                        break;

                    case "haulEnergy":
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_YELLOW);
                        break;

                    case "protector":
                        Game.flags[f].setColor(COLOR_RED, COLOR_BROWN);
                        break;

                    case "demolish":
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_RED);
                        break;

                    case "transporter":
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_BROWN);
                        break;

                    case "SKHarvest":
                        Game.flags[f].setColor(COLOR_CYAN, COLOR_YELLOW);
                        break;
                }
            }
        }

        // Single Market Buy Orders
        if (Game.time % global.DELAYMARKETBUY == 0 && Game.cpu.bucket > global.CPU_THRESHOLD && Memory.buyOrder != undefined) {
            let info = Memory.buyOrder.split(":"); //Format: [AMOUNT]:[ORDERID]
            var left = info[0];
            var order =Game.market.getOrderById(info[1]);
            if (order != null) {
                if (left > 500) {
                    left = 500;
                }
                if (left > order.amount) {
                    left = order.amount;
                }

                var bestRoom;
                if (Memory.buyRoom != undefined) {
                    bestRoom = Game.rooms[Memory.buyRoom];
                }
                else {
                    var bestCost = 999999;
                    for (var r in global.myRooms) {
                        var cost = Game.market.calcTransactionCost(left, order.roomName, global.myRooms[r].name);
                        if (global.myRooms[r].terminal != undefined && global.myRooms[r].terminal.cooldown == 0 && global.myRooms[r].terminal.owner.username == global.playerUsername) {
                            if (bestCost > cost) {
                                bestRoom = global.myRooms[r];
                                bestCost = cost;
                            }
                        }
                    }
                    if (bestRoom == undefined || bestRoom.name == undefined) {
                        console.log("No room with enough energy found!");
                    }
                    else {
                        Memory.buyRoom = bestRoom.name;
                    }
                }

                var returnCode = Game.market.deal(order.id, left, bestRoom.name);
                if (returnCode == OK) {
                    info[0] -= left;
                    if (global.LOG_MARKET == true) {
                        console.log("<font color=#fe2ec8 type='highlight'>" + left + " " + order.resourceType + " bought in room " + bestRoom.name + " for " + (left * order.price) + " credits.</font>");
                    }
                    if (info[0] > 0) {
                        Memory.buyOrder = info.join(":");
                    }
                    else {
                        delete Memory.buyOrder;
                        delete Memory.buyRoom;
                        console.log("<font color=#fe2ec8 type='highlight'>Buy order accomplished.</font>");
                    }
                }
            }
            else {
                delete Memory.buyOrder;
                delete Memory.buyRoom;
                if (global.LOG_MARKET == true) {
                    console.log("<font color=#fe2ec8 type='highlight'>Buy order cancelled since it disappeared from market.</font>");
                }
            }
        }
    // Market Auto Selling Code
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Market Code: " + Game.cpu.getUsed())}
        if (Game.time % global.DELAYMARKETAUTOSELL == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
            //Remove expired market orders
            let expiredOrders = _.filter(Game.market.orders, {remainingAmount: 0});
            if (expiredOrders.length > 0) {
                for (let o in expiredOrders) {
                    Game.market.cancelOrder(expiredOrders[o].id);
                }
            }

            //Look for surplus materials
            var surplusMinerals;

            for (var r in global.myRooms) {
                if (Game.rooms[r] != undefined && Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.cooldown == 0 && Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[RESOURCE_ENERGY] > 100000 && Game.rooms[r].name != Memory.buyRoom && Game.rooms[r].memory.terminalTransfer == undefined) {
                    for (var resource in Game.rooms[r].memory.resourceLimits) {
                        if (Game.rooms[r].memory.resourceLimits[resource] != undefined && Game.rooms[r].storage.store[resource] > (Game.rooms[r].memory.resourceLimits[resource].minMarket)) {
                            if (Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket + 100) {
                                surplusMinerals = Game.rooms[r].storage.store[resource] - Game.rooms[r].memory.resourceLimits[resource].minMarket;
                                if (surplusMinerals >= global.AUTOSELL_PACKETSIZE) {
                                    surplusMinerals = global.AUTOSELL_PACKETSIZE;
                                    var orders = [];
                                    orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
                                    orders = _.sortBy(orders, "price");
                                    for (var o = 0; o < orders.length; o++) {
                                        var orderResource = orders[o].resourceType;
                                        var orderRoomName = orders[o].roomName;
                                        var orderAmount;
                                        if (surplusMinerals > orders[o].amount) {
                                            orderAmount = orders[o].amount;
                                        }
                                        else {
                                            orderAmount = surplusMinerals;
                                        }
                                        var orderCosts = global.terminalTransfer(orderResource, orderAmount, orderRoomName, "cost");
                                        if (orderAmount >= 500 && orderCosts <= Game.rooms[r].storage.store[RESOURCE_ENERGY] - 10000) {
                                            Game.rooms[r].memory.terminalTransfer = orders[o].id + ":" + orderAmount + ":" + orderResource + ":MarketOrder";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Resource Balancing: " + Game.cpu.getUsed())}
    if (Game.time % global.DELAYRESOURCEBALANCING == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
        // Inter-room resource balancing
        for (let r in global.myRooms) {
            //terminal ready, storage is ours, enough energy, no ongoing transfer
            if (Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.cooldown == 0 && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername
                && Game.rooms[r].storage.store[RESOURCE_ENERGY] > 5000 && Game.rooms[r].memory.terminalTransfer == undefined) {
                var combinedResources = [];
                // terminal has a/l 25% space
                if (_.sum(Game.rooms[r].terminal.store) < Game.rooms[r].terminal.storeCapacity * 0.75) {
                    for (let e in Game.rooms[r].storage.store) {
                        if (combinedResources.indexOf(e) == -1) {
                            combinedResources.push(e);
                        }
                    }
                }
                for (let e in Game.rooms[r].terminal.store) {
                    if (combinedResources.indexOf(e) == -1) {
                        combinedResources.push(e);
                    }
                }
                var checkedResources = [];

                if (_.sum(Game.rooms[r].terminal.store) < Game.rooms[r].terminal.storeCapacity * 0.75) {
                    combinedResources = _.sortBy(combinedResources, function (res) {return checkTerminalLimits(Game.rooms[r], res);});
                    combinedResources = combinedResources.reverse();
                }
                else {
                    combinedResources = _.sortBy(combinedResources, function (res) {return checkStorageLimits(Game.rooms[r], res);});
                    combinedResources = combinedResources.reverse();
                }

                for (let n in combinedResources) {
                    //Iterate through resources in terminal and/or storage
                    if (checkedResources.indexOf(combinedResources[n]) == -1) {
                        var storageDelta = checkStorageLimits(Game.rooms[r], combinedResources[n]);
                        var packetSize = global.RBS_PACKETSIZE;
                        if (combinedResources[n] == RESOURCE_ENERGY) {
                            packetSize = global.RBS_PACKETSIZE * 2;
                        }

                        if (Game.rooms[r].memory.terminalTransfer == undefined && (_.sum(Game.rooms[r].terminal.store) >= Game.rooms[r].terminal.storeCapacity * 0.70 ||
                            (storageDelta >= (Game.rooms[r].memory.resourceLimits[combinedResources[n]].maxStorage * 0.1) && packetSize <= Game.rooms[r].storage.store[combinedResources[n]] && storageDelta <= Game.rooms[r].storage.store[combinedResources[n]]))) {
                            // Resource can be shared with other rooms if their maxStorage is not reached yet
                            checkedResources.push(n);
                            let recipientRooms = [];
                            let fullRooms = [];
                            for (var ru in global.myRooms) {
                                if (Game.rooms[ru].name != Game.rooms[r].name && Game.rooms[ru].storage != undefined && Game.rooms[ru].terminal != undefined && Game.rooms[ru].storage.owner.username == global.playerUsername) {
                                    if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75 && checkStorageLimits(Game.rooms[ru], combinedResources[n]) < 0) {
                                        recipientRooms.push(Game.rooms[ru]);
                                    }
                                    else if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75) {
                                        fullRooms.push(Game.rooms[ru]);
                                    }
                                }
                            }
                            recipientRooms = _.sortBy(recipientRooms,function (room) { return checkStorageLimits(room, combinedResources[n]);});
                            fullRooms = _.sortBy(fullRooms,function (room) { return checkStorageLimits(room, combinedResources[n]);});

                            if (recipientRooms.length > 0) {
                                let recipientDelta = checkStorageLimits(recipientRooms[0], combinedResources[n]);
                                if (recipientDelta < 0) {
                                    // Recipient room need the resource
                                    let transferAmount;
                                    if (storageDelta + recipientDelta >= 0) {
                                        transferAmount = Math.abs(recipientDelta);
                                    }
                                    else {
                                        transferAmount = storageDelta;
                                    }

                                    if (transferAmount < 100) {
                                        transferAmount = 100;
                                    }

                                    if (transferAmount > packetSize) {
                                        transferAmount = packetSize;
                                    }

                                    terminalTransferX(combinedResources[n], transferAmount, Game.rooms[r].name, recipientRooms[0].name, true);
                                    break;
                                }
                            }
                            else if (fullRooms.length > 0) {
                                // Room is over storage limit --> look for rooms with less of the resource
                                for (let p in fullRooms) {
                                    if (fullRooms[p].storage != undefined && (fullRooms[p].storage.store[combinedResources[n]] == undefined || checkStorageLimits(Game.rooms[r], combinedResources[n]) > checkStorageLimits(fullRooms[p], combinedResources[n]) + packetSize)) {
                                        //room with less minerals found
                                        terminalTransferX(combinedResources[n], packetSize / 2, Game.rooms[r].name, fullRooms[p].name, true);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start cycling through rooms: " + Game.cpu.getUsed())}
        // Cycle through rooms
        for (var r in Game.rooms) {
            //Save hostile creeps in room
            let roomCreeps = Game.rooms[r].find(FIND_MY_CREEPS);
            var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
            let enemies = _.filter(hostiles, function (e) {return (isHostile(e))});

            Game.rooms[r].saveHostiles();

            Game.rooms[r].refreshMemory();

            Game.rooms[r].setDefaultResourceLimits();

            Game.rooms[r].manageRamparts();
            //Build RCL8 installations
            if (Game.time % global.DELAYRCL8INSTALLATION == 0 && Game.rooms[r].controller != undefined && Game.rooms[r].controller.level == 8 && Game.rooms[r].controller.owner.username == global.playerUsername) {
                let structures = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_STORAGE});
                for (let s in structures) {
                    let foundStructures = structures[s].pos.lookFor(LOOK_STRUCTURES);
                    foundStructures = foundStructures.concat(structures[s].pos.lookFor(LOOK_CONSTRUCTION_SITES));
                    let ramparts = _.filter(foundStructures, function (s) { return s.structureType == STRUCTURE_RAMPART});
                    if (ramparts.length == 0) {
                        structures[s].pos.createConstructionSite(STRUCTURE_RAMPART);
                    }
                }
            }
          //Panic flag code
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting flag code: " + Game.cpu.getUsed())}
            if (Game.time % global.DELAYPANICFLAG == 0) {
                // Check existing flags
                let panicFlags = Game.rooms[r].find(FIND_FLAGS,{filter: (f) => f.memory.function == "protector" && f.memory.panic == true});
                if (panicFlags.length > 0 && Game.rooms[r].memory.hostiles.length == 0) {
                    for (let f in panicFlags) {
                        Game.flags[panicFlags[f].name].remove();
                    }
                }

                //Set new flags
                var remoteFlags = _.filter(Game.flags, function (f) {
                    return (f.memory.function == "remoteSource" || f.memory.function == "haulEnergy");
                });
                for (var f in remoteFlags) {
                    var flag = remoteFlags[f];
                    if (flag.room != undefined) {
                        // We have visibility in room
                        if (flag.room.memory.hostiles.length > 0 && flag.room.memory.panicFlag == undefined && flag.memory.skr == undefined) {
                            //Hostiles present in room with remote harvesters
                            let panicName = "PanicFlag_" + flag.pos.roomName;
                            var panicFlag = flag.pos.createFlag(panicName); // create white panic flag to attract protectors
                            flag.room.memory.panicFlag = panicFlag;
                            panicFlag = _.filter(Game.flags, {name: panicFlag})[0];
                            panicFlag.memory.function = "protector";
                            panicFlag.memory.volume = flag.room.memory.hostiles.length;

                            var flagSpawnRoomName = "NA";
                            if(flag.memory.spawn != undefined) {
                                panicFlag.memory.spawn = flag.memory.spawn;
                                flagSpawnRoomName = Game.getObjectById(panicFlag.memory.spawn).room.name;
                            }


                            panicFlag.memory.panic = true;

                            if (global.LOG_PANICFLAG == true) {
                                console.log("<font color=#ff0000 type='highlight'>Panic flag has been set in room " + flag.room.name + " for room " + flagSpawnRoomName + "</font>");
                            }
                        }
                        else if (flag.room.memory.hostiles.length == 0 && flag.room.memory.panicFlag != undefined) {
                            // No hostiles present in room with remote harvesters
                            var tempFlag = _.filter(Game.flags, {name: flag.room.memory.panicFlag})[0];
                            if (tempFlag != null) {
                                tempFlag.remove();
                                delete flag.room.memory.panicFlag;
                            }
                        }

                        if (Memory.flowPath[flag.pos.roomName] != undefined && (Memory.flowPath[flag.pos.roomName].roomHash == undefined || Game.time % global.DELAYFLOWROOMCHECK == 0)) {
                            //Save flow path markers
                            let markerString = "";
                            let flowMarker = flag.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_CONTAINER});
                            for (m in flowMarker) {
                                if (flowMarker[m].pos.x < 10) {
                                    markerString = markerString + "0";
                                }
                                markerString = markerString + flowMarker[m].pos.x;

                                if (flowMarker[m].pos.y < 10) {
                                    markerString = markerString + "0";
                                }
                                markerString = markerString + flowMarker[m].pos.y;
                            }
                            if (Memory.flowPath[flag.pos.roomName].roomHash == undefined) {
                                //First hash of the room
                                Memory.flowPath[flag.pos.roomName].roomHash = markerString.hashCode();
                            }
                            else {
                                //Compare with existing hash
                                let newHash = markerString.hashCode();
                                if (newHash != Memory.flowPath[flag.pos.roomName].roomHash) {
                                    console.log("<font color=#ffff00 type='highlight'>" + flag.room.name + ": FlowPaths will be recalculated!</font>");
                                    Memory.flowPath[flag.pos.roomName].roomHash = newHash;
                                    delete Memory.flowPath[flag.pos.roomName];
                                }
                            }
                        }
                    }
                }
            }

            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting spawn code: " + Game.cpu.getUsed())}
            // Spawn code
            if (Game.rooms[r].memory.roomArray != undefined && (Game.rooms[r].memory.roomArray.spawns == undefined || Game.rooms[r].memory.roomArray.spawns.length == 0)) {
                //room has no spawn yet
                //console.log('bloed');
                if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == global.playerUsername) {
                    //room is owned and should be updated
                    var claimFlags = Game.rooms[r].find(FIND_FLAGS, { filter: (s) => s.pos.roomName == Game.rooms[r].name && s.memory.function == "remoteController"});
                    var upgraderRecruits = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: Game.rooms[r].name}});
                    if (upgraderRecruits.length < 1) {
                        var roomName;
                        if (claimFlags.length > 0) {
                            //Claimer present, read homeroom
                            var newUpgraders = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: claimFlags[0].memory.supply}});
                            if (newUpgraders.length > 0) {
                                var targetCreep = newUpgraders;
                                roomName=claimFlags[0].memory.supply;
                            }
                        }
                        else {
                            for (var x in global.myRooms) {
                                if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                    var newUpgraders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "upgrader" && s.carry.energy == 0});
                                    if (newUpgraders.length > 0) {
                                        let targetCreep = newUpgraders;
                                        roomName=Game.rooms[x].name;
                                    }
                                }
                            }
                        }
                        for (var g in newUpgraders) {
                            let targetCreep = newUpgraders[g];
                            if (targetCreep != undefined && targetCreep.carry.energy == 0 && targetCreep.ticksToLive > 500) {
                                targetCreep.memory.homeroom = Game.rooms[r].name;
                                targetCreep.memory.spawn = Game.rooms[r].controller.id;
                                console.log("<font color=#ffff00 type='highlight'>" + targetCreep.name + " has been captured in room " + targetCreep.pos.roomName + " as an upgrader by room " + Game.rooms[r].name + ".</font>");
                                break;
                            }
                        }
                    }

                    var BuilderRecruits = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: Game.rooms[r].name}});
                    if (BuilderRecruits.length < 2) {
                        let roomName;
                        let targetCreepBuilder;
                        if (claimFlags.length > 0) {
                            //Claimer present, read homeroom
                            let newBuilders = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: claimFlags[0].memory.supply}});
                            if (newBuilders.length > 0) {
                                targetCreepBuilder = newBuilders[0];
                                roomName=claimFlags[0].memory.supply;
                            }
                        }
                        else {
                            for (var x in global.myRooms) {
                                if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                    var newBuilders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "repairer" && s.carry.energy == 0});
                                    if (newBuilders.length > 0) {
                                        targetCreepBuilder = newBuilders[0];
                                        roomName=Game.rooms[x].name;
                                    }
                                }
                            }
                        }
                        if (targetCreepBuilder != undefined && targetCreepBuilder.carry.energy == 0 && targetCreepBuilder.ticksToLive > 500) {
                            targetCreepBuilder.memory.homeroom = Game.rooms[r].name;
                            targetCreepBuilder.memory.spawn =  Game.rooms[r].controller.id;
                            console.log("<font color=#ffff000 type='highlight'>" + targetCreepBuilder.name + " has been captured in room " + targetCreepBuilder.pos.roomName + " as a repairer by room " + Game.rooms[r].name + ".</font>");
                        }
                    }

                }
            }
            else if (Game.time % global.DELAYSPAWNING == 0 && Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == global.playerUsername) {
                //console.log('spawn run');
                moduleSpawnCreeps.run(Game.rooms[r]);
            }
//console.log('spawn not run');
//console.log(Game.time % global.DELAYSPAWNING);
//console.log( Game.rooms[r].controller.owner.username == global.playerUsername);
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting tower code: " + Game.cpu.getUsed())}


            // Tower code
            if (Game.rooms[r].memory.roomArray != undefined) {
                towerModule.defendMyRoom(r);
            }

            // Search for dropped energy
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start dropped energy search: " + Game.cpu.getUsed())}
            if (Game.time % global.DELAYDROPPEDENERGY == 0) {
                var energies = Game.rooms[r].find(FIND_DROPPED_RESOURCES);
                if (energies.length > 0 && roomCreeps.length > 0) {
                    let lastPos;
                    for (var energy in energies) {
                        if (energies[energy] != undefined && energies[energy].pos.isEqualTo(lastPos) == false && energies[energy].pos.findInRange(FIND_HOSTILE_CREEPS, {filter: (h) => isHostile(h) == true}).length == 0) {
                            if (energies[energy].resourceType == RESOURCE_ENERGY || (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername)) {
                                lastPos = energies[energy].pos;
                                var energyID = energies[energy].id;
                                var energyAmount = energies[energy].amount;
                                let busyCollectors = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (c) => c.memory.jobQueueTask == "pickUpEnergy" && c.memory.jobQueueObject == energyID});
                                if (busyCollectors.length == 0 && energyAmount > 15 && (Game.rooms[r].memory.hostiles.length == 0 || (Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.lairs.length > 0))) {
                                    var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                                        filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) >= 0 && s.memory.role != "energyHauler" && s.memory.role != "protector" && s.memory.role != "einarr" && s.memory.role != "distributor" && s.memory.role != "stationaryHarvester" && s.memory.role != "remoteStationaryHarvester" && s.memory.dropEnergy != true
                                    });

                                    if (collector == null) {
                                        collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                                            filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0 && s.memory.role != "energyHauler" && s.memory.role != "protector" && s.memory.role != "einarr" && s.memory.role != "distributor" && s.memory.role != "stationaryHarvester" && s.memory.role != "remoteStationaryHarvester" && s.memory.role != "SKHarvester" && s.memory.dropEnergy != true
                                        });
                                    }

                                    if (collector != null) {
                                        // Creep found to pick up dropped energy
                                        collector.memory.jobQueueObject = energyID;
                                        collector.memory.jobQueueTask = "pickUpEnergy";
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Link code
            if (Game.time % global.DELAYLINK == 0 && Game.rooms[r].memory.links != undefined) {

                var sourceLinks = [];

                var targetLinkPriorities = {};

                for (var linkId in Game.rooms[r].memory.links) {
                    var link = Game.getObjectById(linkId);
                    if ( link != undefined) {
                        if(Game.rooms[r].memory.links[linkId].priority == 0) {
                          sourceLinks.push(link);
                        }
                        else {
                          var tmpPrioArray = { priority: Game.rooms[r].memory.links[linkId].priority, id: linkId };

                          targetLinkPriorities[linkId] = tmpPrioArray;
                        }
                    }
                }
                // for (var i = 0; i < targetLinkPriorities.length; i++) {
                //   console.log("link - " + targetLinkPriorities[i].id + "priority -" + targetLinkPriorities[i].priority);
                // }

                targetLinkPriorities = _.sortBy(targetLinkPriorities, "priority");
                // console.log("sorted");
                // for (var i = 0; i < targetLinkPriorities.length; i++) {
                //   console.log("link - " + targetLinkPriorities[i].id + "priority -" + targetLinkPriorities[i].priority);
                // }
                for (var l in sourceLinks) {
                  if (sourceLinks[l].energy > 0 && sourceLinks[l].cooldown == 0) {
                    for (var i = 0; i < targetLinkPriorities.length; i++) {
                      var tmpTargetLink = Game.getObjectById(targetLinkPriorities[i].id);
                      if ( (tmpTargetLink.energyCapacity - tmpTargetLink.energy) > 50) {
                        if( sourceLinks[l].transferEnergy(Game.getObjectById(targetLinkPriorities[i].id)) == OK ) { break; }
                      }
                  }
                }
              }
            }

            //     if (Game.rooms[r].memory.linksEmpty == undefined) {
            //         // Prepare link roles
            //         var emptyArray = [];
            //         emptyArray.push("[LINK_ID]");
            //         Game.rooms[r].memory.linksEmpty = emptyArray;
            //     }
            //
            //     for (var link in Game.rooms[r].memory.roomArray.links) {
            //         if (Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]) != undefined) {
            //             if (Game.rooms[r].memory.linksEmpty == undefined || Game.rooms[r].memory.linksEmpty.indexOf(Game.rooms[r].memory.roomArray.links[link]) == -1) {
            //                 fillLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
            //                 targetLevel += Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]).energy;
            //             }
            //             else {
            //                 emptyLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
            //             }
            //         }
            //     }
            //     targetLevel = Math.ceil(targetLevel / fillLinks.length / 100); //Targetlevel is now 0 - 8
            //     fillLinks = _.sortBy(fillLinks, "energy");
            //     //Empty emptyLinks
            //     for (var link in emptyLinks) {
            //         if (emptyLinks[link].cooldown == 0 && emptyLinks[link].energy > 0) {
            //             for (var i = 0; i < fillLinks.length; i++) {
            //                 if (fillLinks[i].energy < 800) {
            //                     if (fillLinks[i].energy + emptyLinks[link].energy < 799) {
            //                         emptyLinks[link].transferEnergy(fillLinks[i], emptyLinks[link].energy);
            //                     }
            //                     else if (fillLinks[i].energy < 790) {
            //                         emptyLinks[link].transferEnergy(fillLinks[i], (800 - fillLinks[i].energy));
            //                     }
            //                 }
            //             }
            //             break;
            //         }
            //     }
            //     fillLinks = _.sortBy(fillLinks, "energy");
            //
            //     if (targetLevel > 0 && fillLinks.length > 1) {
            //         var minLevel = 99;
            //         var maxLevel = 0;
            //         var maxLink;
            //         var minLink;
            //
            //         for (var link in fillLinks) {
            //             if (Math.ceil(fillLinks[link].energy / 100) <= targetLevel && Math.ceil(fillLinks[link].energy / 100) <= minLevel) {
            //                 //Receiver link
            //                 minLevel = Math.ceil(fillLinks[link].energy / 100);
            //                 minLink = fillLinks[link];
            //             }
            //             else if (fillLinks[link].cooldown == 0 && Math.ceil(fillLinks[link].energy / 100) >= targetLevel && Math.ceil(fillLinks[link].energy / 100) >= maxLevel) {
            //                 //Sender link
            //                 maxLevel = Math.ceil(fillLinks[link].energy / 100);
            //                 maxLink = fillLinks[link];
            //             }
            //         }
            //
            //         if (maxLink != undefined && maxLink.id != minLink.id && fillLinks.length > 1 && maxLevel > targetLevel) {
            //             maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
            //         }
            //     }
            // }

            // Terminal code
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting terminal code: " + Game.cpu.getUsed())}
            if (Game.cpu.bucket > global.CPU_THRESHOLD && Game.rooms[r].memory.terminalTransfer != undefined && Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.owner.username == global.playerUsername) {
                var terminal = Game.rooms[r].terminal;
                if (terminal != undefined && terminal.cooldown == 0 && terminal.owner.username == global.playerUsername && Game.rooms[r].memory.terminalTransfer != undefined) {
                    //Terminal exists
                    var targetRoom;
                    var amount;
                    var resource;
                    var comment;
                    var energyCost;
                    var info = Game.rooms[r].memory.terminalTransfer;
                    info = info.split(":");
                    targetRoom = info[0];
                    amount = parseInt(info[1]);
                    resource = info[2];
                    comment = info[3];

                    if (amount >= 100) {
                        energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
                        Game.rooms[r].memory.terminalEnergyCost = energyCost;
                        if (comment != "MarketOrder") {
                            var energyTransferAmount = parseInt(energyCost) + parseInt(amount);
                            var stdEnergyCost = Game.market.calcTransactionCost(global.TERMINAL_PACKETSIZE, terminal.room.name, targetRoom);
                            if ((resource != RESOURCE_ENERGY && amount >= global.TERMINAL_PACKETSIZE && terminal.store[resource] >= global.TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) >= stdEnergyCost)
                                || (resource == RESOURCE_ENERGY && amount >= global.TERMINAL_PACKETSIZE && terminal.store[resource] >= global.TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) - global.TERMINAL_PACKETSIZE >= stdEnergyCost)) {
                                if (terminal.send(resource, global.TERMINAL_PACKETSIZE, targetRoom, comment) == OK) {
                                    info[1] -= global.TERMINAL_PACKETSIZE;
                                    Game.rooms[r].memory.terminalTransfer = info.join(":");
                                    if (global.LOG_TERMINAL == true) {
                                        console.log("<font color=#009bff type='highlight'>" + Game.rooms[r].name + ": " + global.TERMINAL_PACKETSIZE + "/" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + stdEnergyCost + " energy: " + comment + "</font>");
                                    }
                                }
                                else {
                                    console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, 500, targetRoom, comment) + "</font>");
                                }
                            }
                            else if ((resource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyTransferAmount)
                                || (resource != RESOURCE_ENERGY && terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost)) {
                                // Amount to be transferred reached and enough energy available -> GO!
                                if (terminal.send(resource, amount, targetRoom, comment) == OK) {
                                    delete Game.rooms[r].memory.terminalTransfer;
                                    delete Game.rooms[r].memory.terminalEnergyCost;
                                    if (global.LOG_TERMINAL == true) {
                                        console.log("<font color=#009bff type='highlight'>" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + energyCost + " energy: " + comment + "</font>");
                                    }
                                }
                                else {
                                    if (amount < 100) {
                                        delete Game.rooms[r].memory.terminalTransfer;
                                    }
                                    else {
                                        console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, amount, targetRoom, comment) + "</font>");
                                    }
                                }
                            }
                        }
                        else {
                            // Market Order
                            var orderID = targetRoom;
                            let order = Game.market.getOrderById(orderID);
                            if (order != null) {
                                if (amount > global.AUTOSELL_PACKETSIZE) {
                                    amount = global.AUTOSELL_PACKETSIZE;
                                }
                                energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, order.roomName);
                                Game.rooms[r].memory.terminalEnergyCost = energyCost;
                                if (Game.rooms[r].terminal.store[resource] >= amount) {
                                    if (resource == RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= amount + energyCost ||
                                        resource != RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= energyCost) {
                                        //Do the deal!
                                        if (parseInt(info[1]) <= global.AUTOSELL_PACKETSIZE && Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
                                            if (global.LOG_MARKET == true) {
                                                console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                            }
                                            delete Game.rooms[r].memory.terminalTransfer;
                                        }
                                        else if (Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
                                            if (global.LOG_MARKET == true) {
                                                console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                            }
                                            info[1] -= amount;
                                            Game.rooms[r].memory.terminalTransfer = info.join(":");
                                        }
                                    }
                                }
                            }
                            else {
                                delete Game.rooms[r].memory.terminalTransfer;
                            }
                        }
                    }
                    else {
                        delete Game.rooms[r].memory.terminalTransfer;
                    }
                }
            }
            // Production Code
            if (Game.cpu.bucket > global.CPU_THRESHOLD && Game.time % global.DELAYPRODUCTION == 0 && Game.rooms[r].memory.innerLabs != undefined && Game.rooms[r].memory.innerLabs[0].labID != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1].labID != "[LAB_ID]"
            && Game.rooms[r].memory.labOrder == undefined && Game.rooms[r].memory.labTarget == undefined) {
                for (let res in RESOURCES_ALL) {
                    if (RESOURCES_ALL[res] != RESOURCE_ENERGY && RESOURCES_ALL[res] != RESOURCE_POWER && global.mineralDescriptions[RESOURCES_ALL[res]].tier > 0) {
                        var storageLevel;
                        if (Game.rooms[r].storage.store[RESOURCES_ALL[res]] == undefined) {
                            storageLevel = 0;
                        }
                        else {
                            storageLevel = Game.rooms[r].storage.store[RESOURCES_ALL[res]];
                        }

                        if ((storageLevel) < Game.rooms[r].memory.resourceLimits[RESOURCES_ALL[res]].minProduction) {
                            //Try to produce resource
                            let resource = RESOURCES_ALL[res];

                            let delta = Math.ceil((Game.rooms[r].memory.resourceLimits[resource].minProduction - storageLevel)/10)*10;

                            if (delta >= Game.rooms[r].memory.resourceLimits[resource].minProduction * 0.2 || delta >= 3000) {
                                let genuineDelta = delta;
                                var productionTarget = whatIsLackingFor(Game.rooms[r], delta, resource);
                                let minProductionPacketSize = 100;

                                while (global.mineralDescriptions[productionTarget.resource].tier > 0 && Game.rooms[r].memory.labTarget == undefined && Game.cpu.getUsed() < 250) {
                                    if (productionTarget.amount == 0) {
                                        productionTarget.amount = genuineDelta;
                                    }
                                    if (Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget.resource].component1] >= minProductionPacketSize &&
                                        Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget.resource].component2] >= minProductionPacketSize) {
                                        //All components ready, start production
                                        let reactionAmount = Math.min(Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget.resource].component1], Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget.resource].component2]);
                                        if (reactionAmount > genuineDelta) {
                                            reactionAmount = genuineDelta;
                                        }
                                        Game.rooms[r].memory.labTarget = reactionAmount + ":" + productionTarget.resource;
                                        if (global.LOG_INFO == true) {
                                            console.log("<font color=#ffca33 type='highlight'>Room " + Game.rooms[r].name + " started auto production of " + reactionAmount + " " + productionTarget.resource + ".</font>");
                                        }
                                    }
                                    else if (Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget].component1] < minProductionPacketSize) {
                                        resource = global.mineralDescriptions[productionTarget].component1;
                                    }
                                    else if (Game.rooms[r].storage.store[global.mineralDescriptions[productionTarget].component2] < minProductionPacketSize) {
                                        resource = global.mineralDescriptions[productionTarget].component2;
                                    }
                                    productionTarget = whatIsLackingFor(Game.rooms[r], genuineDelta, resource);
                                }

                                if (global.mineralDescriptions[productionTarget.resource].tier == 0) {
                                    //Tier 0 resource missing
                                    Game.rooms[r].memory.lastMissingComponent = productionTarget.resource;
                                }
                            }
                        }
                    }
                }
            }

            // Lab code
            if (Game.time % global.DELAYPRODUCTION == 0 && Game.cpu.bucket > global.CPU_THRESHOLD && Game.rooms[r].memory.labTarget != undefined && Game.rooms[r].memory.labOrder == undefined) {
                // Lab Queueing Code
                var labString = Game.rooms[r].memory.labTarget.split(":");
                var origAmount = labString[0];
                var origResource = labString[1];
                if (global.mineralDescriptions[labString[1]].tier == 0) {
                    delete Game.rooms[r].memory.labTarget;
                }
                else {
                    while (global.mineralDescriptions[labString[1]] != undefined && global.mineralDescriptions[labString[1]].tier > 0) {
                        var labTarget = global.whatIsLackingFor(Game.rooms[r], labString[0], labString[1]);
                        var missingComponent1 = global.mineralDescriptions[labTarget.resource].component1;
                        var missingComponent2 = global.mineralDescriptions[labTarget.resource].component2;
                        if (Game.rooms[r].storage.store[missingComponent1] != undefined && Game.rooms[r].storage.store[missingComponent2] != undefined
                            && Game.rooms[r].storage.store[missingComponent1] >= labTarget.amount && Game.rooms[r].storage.store[missingComponent2] >= labTarget.amount) {
                            //All component available
                            if (labTarget.amount == 0) {
                                labTarget.amount = origAmount;
                            }
                            Game.rooms[r].memory.labOrder = labTarget.amount + ":" + missingComponent1 + ":" + missingComponent2 + ":prepare";
                            if (missingComponent1 == global.mineralDescriptions[origResource].component1 && missingComponent2 == global.mineralDescriptions[origResource].component2) {
                                // Last production order given
                                delete Game.rooms[r].memory.labTarget;
                            }
                            break;
                        }
                        else {
                            //Components missing
                            if (Game.rooms[r].storage.store[missingComponent1] == undefined || Game.rooms[r].storage.store[missingComponent1] < labTarget.amount) {
                                //Component 1 missing
                                if (Game.rooms[r].storage.store[missingComponent1] == undefined) {
                                    labString[0] = labTarget.amount;
                                }
                                else {
                                    labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent1];
                                }
                                labString[1] = missingComponent1;
                            }
                            else {
                                //Component 2 missing
                                if (Game.rooms[r].storage.store[missingComponent2] == undefined) {
                                    labString[0] = labTarget.amount;
                                }
                                else {
                                    labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent2];
                                }
                                labString[1] = missingComponent2;
                            }
                        }
                    }
                }

            }

            // Lab Production Code
            if (Game.time % global.DELAYLAB == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
                if (Game.rooms[r].memory.innerLabs == undefined) {
                    // Prepare link roles
                    var emptyArray = {};
                    var innerLabs = [];
                    emptyArray["labID"] = "[LAB_ID]";
                    emptyArray["resource"] = "[RESOURCE]";
                    innerLabs.push(emptyArray);
                    innerLabs.push(emptyArray);
                    Game.rooms[r].memory.innerLabs = innerLabs;
                }
                if (Game.rooms[r].memory.labOrder != undefined) { //FORMAT: 500:H:Z:[prepare/running/done]
                    var innerLabs = [];
                    if (Game.rooms[r].memory.innerLabs == undefined) {
                        // Prepare link roles
                        var emptyArray = {};
                        emptyArray["labID"] = "[LAB_ID]";
                        emptyArray["resource"] = "[RESOURCE]";
                        innerLabs.push(emptyArray);
                        Game.rooms[r].memory.innerLabs = innerLabs;
                    }
                    else if (Game.rooms[r].memory.innerLabs[0].labID != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1].labID != "[LAB_ID]") {
                        innerLabs = Game.rooms[r].memory.innerLabs;
                        var labOrder = Game.rooms[r].memory.labOrder.split(":");
                        if (innerLabs.length == 2) {
                            //There are two innerLabs defined
                            if (innerLabs[0].resource != labOrder[1] || innerLabs[1].resource != labOrder[2]) {
                                //Set inner lab resource to ingredients
                                innerLabs[0].resource = labOrder[1];
                                innerLabs[1].resource = labOrder[2];
                                Game.rooms[r].memory.innerLabs = innerLabs;
                            }
                            var rawAmount = labOrder[0];
                            if (rawAmount > Game.getObjectById(innerLabs[0].labID).mineralCapacity) {
                                rawAmount = Game.getObjectById(innerLabs[0].labID).mineralCapacity;
                            }
                            if (labOrder[3] == "prepare" && Game.getObjectById(innerLabs[0].labID).mineralType == innerLabs[0].resource && Game.getObjectById(innerLabs[0].labID).mineralAmount >= rawAmount
                                && Game.getObjectById(innerLabs[1].labID).mineralType == innerLabs[1].resource && Game.getObjectById(innerLabs[1].labID).mineralAmount >= rawAmount) {
                                labOrder[3] = "running";
                                Game.rooms[r].memory.labOrder = labOrder.join(":");
                            }
                            if (labOrder[3] == "running") {
                                // Reaction can be started
                                for (var lab in Game.rooms[r].memory.roomArray.labs) {
                                    if ((Game.rooms[r].memory.boostLabs == undefined || Game.rooms[r].memory.boostLabs.indexOf(Game.rooms[r].memory.roomArray.labs[lab]) == -1) && Game.rooms[r].memory.roomArray.labs[lab] != innerLabs[0].labID && Game.rooms[r].memory.roomArray.labs[lab] != innerLabs[1].labID) {
                                        if (Game.getObjectById(innerLabs[0].labID).mineralAmount > 4 && Game.getObjectById(innerLabs[1].labID).mineralAmount > 4) {
                                            //Still enough material to do a reaction
                                            var currentLab = Game.getObjectById(Game.rooms[r].memory.roomArray.labs[lab]);
                                            if (currentLab.cooldown == 0) {
                                                currentLab.runReaction(Game.getObjectById(innerLabs[0].labID), Game.getObjectById(innerLabs[1].labID));
                                            }
                                        }
                                        else {
                                            labOrder[3] = "done";
                                            Game.rooms[r].memory.labOrder = labOrder.join(":");
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.log("Inner links not defined in room " + Game.rooms[r].name);
                    }
                }
            }
        }

    //Cycle through creeps
    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Starting creeps: " + Game.cpu.getUsed())
    }
    for (let name in Game.creeps) {
        // get the creep object
        var creep = Game.creeps[name];
        //Check for miniharvester
        if (creep.memory.role == "miniharvester") {
            creep.memory.role = "harvester";
        }
        //Check for fleeing creeps
        if (creep.room.memory.hostiles.length == 0 && creep.memory.fleeing == true) {
            //Get away from the exit
            if ((creep.pos.x < 10 || creep.pos.x > 40) || (creep.pos.y < 10 || creep.pos.y > 40)) {
                var area = creep.room.lookAtArea(20, 20, 40, 40, true);
                area = _.filter(area, function (a) {
                    return (a.terrain != "wall")
                });
                if (area.length > 0) {
                    let destPos = creep.room.getPositionAt(area[0].x, area[0].y);
                    creep.moveTo(destPos, {reusePath: moveReusePath()});
                }
                else {
                    console.log("No safe area found in room " + Game.rooms[r].name + ".");
                }
            }
            else {
                //Creep has distance to any room exit
                creep.memory.sleep = 50;
                delete creep.memory.fleeing;
            }
        }
        else { // Check for sleeping creeps
            if (creep.memory.sleep != undefined && creep.memory.jobQueueTask == undefined) {
                creep.memory.sleep--;
                //creep.say("Zzz: " + creep.memory.sleep);
                if (creep.memory.sleep < 1) {
                    delete creep.memory.sleep;
                }
            }
            else {
                if (creep.spawning == false && creep.ticksToLive > 1000 && creep.memory.boostList != undefined) {
                    //Creep needs boosting
                    if (creep.memory.boostList.length > 0) {
                        let boostLabs = creep.room.memory.boostLabs;
                        if (boostLabs != undefined && boostLabs.length > 0) {
                            if (creep.memory.myBoostLab == undefined) {
                                //Find vacant boost lab
                                let tempList = [];
                                for (let b in boostLabs) {
                                    if (creep.room.find(FIND_MY_CREEPS, {filter: (c) => c.memory.myBoostLab == boostLabs[b]}).length == 0) {
                                        tempList.push(Game.getObjectById(boostLabs[b]));
                                    }
                                }
                                let myBoostLab = creep.pos.findClosestByPath(tempList);
                                if (myBoostLab != null) {
                                    creep.memory.myBoostLab = myBoostLab.id;
                                }
                                else {
                                    creep.memory.sleep = 5;
                                }
                            }
                            if (creep.memory.myBoostLab != undefined) {
                                // Vacant boost lab found
                                if (creep.memory.myButler == undefined || Game.getObjectById(creep.memory.myButler) == null) {
                                    //Find butler
                                    let butler = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (c) => c.memory.jobQueueTask == undefined && (c.memory.role == "energyTransporter" || c.memory.role == "harvester")});
                                    if (butler != null) {
                                        butler.memory.jobQueueTask = "prepareBoost";
                                        butler.memory.jobQueueObject = creep.id;
                                        creep.memory.myButler = butler.id;
                                        if (global.LOG_INFO == true) {
                                            console.log(creep.room.name + ": " + creep.name + " has taken " + butler.name + " as a butler.");
                                        }
                                    }
                                }
                                else {
                                    //Wait for boostLab to fill up
                                    let boostLab = Game.getObjectById(creep.memory.myBoostLab);
                                    if (creep.pos.getRangeTo(boostLab) > 1) {
                                        creep.moveTo(boostLab, {reusePath: moveReusePath()});
                                    }
                                    else {
                                        let bodyPart = global.mineralDescriptions[creep.memory.boostList[0]].bodyPart;
                                        let numberofParts = creep.getActiveBodyparts(bodyPart);
                                        let mineralNeed = 30 * numberofParts;
                                        let energyNeed = 20 * numberofParts;
                                        if (boostLab.mineralType == creep.memory.boostList[0] && boostLab.mineralAmount >= mineralNeed && boostLab.energy >= energyNeed) {
                                            // Lab ready for boost
                                            let returnCode = boostLab.boostCreep(creep);
                                            if (returnCode == OK) {
                                                if (creep.memory.boostList.length == 1) {
                                                    delete creep.memory.boostList;
                                                    if (creep.memory.myButler != undefined) {
                                                        let butler = Game.getObjectById(creep.memory.myButler);
                                                        delete butler.memory.jobQueueObject;
                                                        delete butler.memory.jobQueueTask;
                                                        delete butler.memory.myBoostLab;
                                                    }
                                                    delete creep.memory.myButler;
                                                    delete creep.memory.myBoostLab;
                                                }
                                                else {
                                                    delete creep.memory.boostList[creep.memory.boostList.length - 1];
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        delete creep.memory.boostList;
                    }
                }
                else if (creep.memory.jobQueueTask != undefined && creep.spawning == false) {
                    //Job queue pending
                    switch (creep.memory.jobQueueTask) {
                        case "pickUpEnergy": //Dropped energy to be picked up
                            if (_.sum(creep.carry) == creep.carryCapacity) {
                                //creep full
                                delete creep.memory.myDroppedEnergy;
                                delete creep.memory.jobQueueObject;
                                delete creep.memory.jobQueueTask;
                            }
                            else {
                                if (creep.memory.myDroppedEnergy == undefined) {
                                    let source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                                    if (source != null) {
                                        creep.memory.myDroppedEnergy = source.id;
                                    }
                                }
                                let source = Game.getObjectById(creep.memory.myDroppedEnergy);
                                if (source == null) {
                                    delete creep.memory.myDroppedEnergy;
                                    delete creep.memory.jobQueueObject;
                                    delete creep.memory.jobQueueTask;
                                }
                                else if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(source, {reusePath: moveReusePath()});
                                  }

                            }
                            break;
                        case "prepareBoost": //Creep boost to be prepared
                            let boostLabs = creep.room.memory.boostLabs;
                            if (creep.memory.myBoostLab == undefined) {
                                let tempList = [];
                                for (let b in boostLabs) {
                                    tempList.push(Game.getObjectById(boostLabs[b]));
                                }
                                let myBoostLab = creep.pos.findClosestByPath(tempList);
                                if (myBoostLab != null) {
                                    creep.memory.myBoostLab = myBoostLab.id;
                                }
                            }
                            if (creep.carry[RESOURCE_ENERGY] > 0) {
                                creep.storeAllBut();
                            }
                            else {
                                let clientCreep = Game.getObjectById(creep.memory.jobQueueObject);
                                if (clientCreep.memory.boostList != undefined) {
                                    let boostLab = Game.getObjectById(creep.memory.myBoostLab);
                                    let bodyPart = global.mineralDescriptions[clientCreep.memory.boostList[0]].bodyPart;
                                    let mineralNeed = 30 * clientCreep.getActiveBodyparts(bodyPart);
                                    if (boostLab.mineralAmount < mineralNeed || boostLab.mineralType != clientCreep.memory.boostList[0]) {
                                        //Lab needs minerals
                                        if (creep.storeAllBut(clientCreep.memory.boostList[0]) == true) {
                                            if (_.sum(creep.carry) == 0) {
                                                //Get minerals from storage
                                                let amount = mineralNeed - boostLab.mineralAmount;
                                                if (amount > creep.carryCapacity) {
                                                    amount = creep.carryCapacity;
                                                }
                                                if (creep.withdraw(creep.room.storage, clientCreep.memory.boostList[0], amount) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                                                    break;
                                                }
                                            }
                                            else {
                                                //Bring minerals to lab
                                                if (creep.transfer(boostLab, clientCreep.memory.boostList[0]) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(boostLab, {reusePath: moveReusePath()});
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    delete creep.memory.jobQueueTask;
                                    delete creep.memory.jobQueueObject;
                                }
                            }
                            break;
                        default:
                            creep.memory.jobQueueTask = undefined;
                            break;
                    }
                }
                else if (creep.spawning == false) {
                    if (CPUdebug == true) {
                        CPUdebugString = CPUdebugString.concat("<br>Start creep " + creep.name + "( " + creep.memory.role + "): " + Game.cpu.getUsed())
                    }
                    if (creep.memory.role != "miner" && creep.memory.role != "distributor" && creep.memory.role != "transporter" && creep.memory.role != "scientist" && _.sum(creep.carry) != creep.carry.energy) {
                        // Minerals found in creep
                        creep.storeAllBut(RESOURCE_ENERGY);
                    }
                    else {
                        if (creep.memory.role == 'harvester') {
                            creep.roleHarvester();
                        }
                        else if (creep.memory.role == 'upgrader') {
                            creep.roleUpgrader();
                        }
                        else if (creep.memory.role == 'repairer') {
                            creep.roleRepairer();
                        }
                        else if (creep.memory.role == 'builder') {
                            creep.roleBuilder();
                        }
                        else if (creep.memory.role == 'wallRepairer') {
                            creep.roleWallRepairer();
                        }
                        else if (creep.memory.role == 'remoteHarvester') {
                            creep.roleRemoteHarvester();
                        }
                        else if (creep.memory.role == 'protector') {
                            creep.roleProtector();
                        }
                        else if (creep.memory.role == 'claimer') {
                            creep.roleClaimer();
                        }
                        else if (creep.memory.role == 'bigClaimer') {
                            creep.roleBigClaimer();
                        }
                        else if (creep.memory.role == 'stationaryHarvester') {
                            creep.roleStationaryHarvester();
                        }
                        else if (creep.memory.role == 'miner') {
                            creep.roleMiner();
                        }
                        else if (creep.memory.role == 'distributor') {
                            creep.roleDistributor();
                        }
                        else if (creep.memory.role == 'demolisher') {
                            creep.roleDemolisher();
                        }
                        else if (creep.memory.role == 'energyTransporter') {
                            creep.roleEnergyTransporter();
                        }
                        else if (creep.memory.role == 'energyHauler') {
                            creep.roleEnergyHauler();
                        }
                        else if (creep.memory.role == 'remoteStationaryHarvester') {
                            creep.roleRemoteStationaryHarvester();
                        }
                        else if (creep.memory.role == 'attacker' || creep.memory.role == 'einarr' || creep.memory.role == 'healer' || creep.memory.role == 'archer') {
                            creep.roleUnit();
                        }
                        else if (creep.memory.role == 'scientist') {
                            creep.roleScientist();
                        }
                        else if (creep.memory.role == 'transporter') {
                            creep.roleTransporter();
                        }
                        else if (creep.memory.role == 'bigUpgrader') {
                            creep.roleUpgrader();
                        }
                        else if (creep.memory.role == 'SKHarvester') {
                            creep.roleSKHarvester()
                        }
                        else if (creep.memory.role == 'SKHauler') {
                            creep.roleSKHauler();
                        }
                    }
                }
            }
            if (CPUdebug == true) {
                CPUdebugString = CPUdebugString.concat("<br>Creep " + creep.name + "( " + creep.memory.role + ") finished: " + Game.cpu.getUsed())
            }
        }
    }

    // Cycle through unitGroup flags
    if (Game.cpu.bucket > 0) {
        let groupFlags = _.filter(Game.flags, {memory: {function: "unitGroup"}});
        for (let f in groupFlags) {
            let flag = groupFlags[f];
            if (flag.memory.strategy != undefined) {
                let strategyModule = require("strategies");
                if (flag.memory.attacker == undefined) {
                    flag.memory.attacker = 0;
                }
                if (flag.memory.healer == undefined) {
                    flag.memory.healer = 0;
                }
                if (flag.memory.archer == undefined) {
                    flag.memory.archer = 0;
                }
                if (flag.memory.einarr == undefined) {
                    flag.memory.einarr = 0;
                }
                let flagRoom = Game.rooms[flag.pos.roomName];

                if (flagRoom != undefined) {
                    strategyModule.init(flagRoom.find(FIND_CREEPS, {
                        filter: function (creep) {
                            return !isHostile(creep)
                        }
                    }), flagRoom.find(FIND_CREEPS, {
                        filter: function (creep) {
                            return isHostile(creep)
                        }
                    }))
                    switch (flag.memory.strategy) {
                        case "remoteDrain":
                            strategyModule.remoteDrain(flag);
                            break;

                        case "remoteDestroy":
                            if (strategyModule.remoteDrain(flag) == false) {
                                // TODO: Target room towers drained --> attack target
                            }
                            break;

                        case "test":
                            strategyModule.test(flag);
                            break;
                    }
                }
            }
        }
    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
        console.log(CPUdebugString);
    }
    //console.log("Tickli - " + Game.cpu.tickLimit);
    // console.log("main Finish: " + Game.cpu.getUsed());

    //});
};
