global.Economy = class Economy {
    constructor() {
        this.stock = {};
        this.resetStock();
        this.takestock();     
    }

    resetStock() {
        this.stock = {};
        for (var curResourceIndex in RESOURCES_ALL) {
          var curResource = RESOURCES_ALL[curResourceIndex];
          this.stock[curResource] = 0;
        }
    }
      
    takestockCount(store) {
        for (var curStorageResource in store) {
          this.stock[curStorageResource] += store[curStorageResource];
        }
    }
    
    takestock() {
        for (var curRoomName in Game.rooms) {
          if(Game.rooms[curRoomName].storage != undefined && Game.rooms[curRoomName].storage.my) {
            this.takestockCount(Game.rooms[curRoomName].storage.store);
          }
          if(Game.rooms[curRoomName].terminal != undefined && Game.rooms[curRoomName].terminal.my) {
            this.takestockCount(Game.rooms[curRoomName].terminal.store);
          }
        }
    }

    printStock() {
        var returnstring = "<table><tr><th>Resource  </th><th>Amount  </th></tr>";
        var resourceTable = [];
        var total = [];
      
        for (var curResourceIndex in RESOURCES_ALL) {
           var curResource = RESOURCES_ALL[curResourceIndex];
          if(this.stock[curResource] > 0) {
            var color = "#aaffff";
            returnstring = returnstring.concat("<tr></tr><td>" + curResource + "  </td>");
      
            returnstring = returnstring.concat("<td><font color='" + color + "'>" + prettyInt(this.stock[curResource]) + "  </font></td>");
      
            returnstring = returnstring.concat("</tr>");
          }
        }
        returnstring = returnstring.concat("</tr></table>");
        return returnstring;
    }

    get isBusy() {
      // factory busy with old code
      if(this.room.memory.labOrder != undefined || this.room.memory.labTarget != undefined) { return true;}
      return false;
    }

    resourceBalancing() {
        console.log('resource balancing')
        // Inter-room resource balancing
        for (let r in global.myRooms) {
            let curRoom = Game.rooms[r];
            //terminal ready, storage is ours, enough energy, no ongoing transfer
            if (curRoom.terminal != undefined && curRoom.terminal.cooldown == 0 && curRoom.storage != undefined && curRoom.storage.owner.username == global.playerUsername
                && curRoom.storage.store[RESOURCE_ENERGY] > 5000 && curRoom.memory.terminalTransfer == undefined) {
                var combinedResources = [];
                
                // terminal has a/l 25% space
                if (_.sum(curRoom.terminal.store) < curRoom.terminal.storeCapacity * 0.75) {
                    for (let e in curRoom.storage.store) {
                        if (combinedResources.indexOf(e) == -1) {
                            combinedResources.push(e);
                        }
                    }
                }
                for (let e in curRoom.terminal.store) {
                    if (combinedResources.indexOf(e) == -1) {
                        combinedResources.push(e);
                    }
                }
                var checkedResources = [];

                if (_.sum(curRoom.terminal.store) < curRoom.terminal.storeCapacity * 0.75) {
                    combinedResources = _.sortBy(combinedResources, function (res) {return checkTerminalLimits(curRoom, res);});
                    combinedResources = combinedResources.reverse();
                }
                else {
                    combinedResources = _.sortBy(combinedResources, function (res) {return checkStorageLimits(curRoom, res);});
                    combinedResources = combinedResources.reverse();
                }
                
                

                for (let n in combinedResources) {
                    // if (r == 'W58S4') {
                    //                      console.log(r + ' - ' +combinedResources[n] + ' - ');
                                            
                    //             }
                        if(curRoom.totalResourceInStock(combinedResources[n]) < 100) {
                            continue;
                        }
                    //Iterate through resources in terminal and/or storage
                    if (checkedResources.indexOf(combinedResources[n]) == -1) {
                        var storageDelta = checkStorageLimits(curRoom, combinedResources[n]);
                        var packetSize = global.RBS_PACKETSIZE;
                        if (combinedResources[n] == RESOURCE_ENERGY) {
                            packetSize = global.RBS_PACKETSIZE * 2;
                        }
                    
                        //  if(curRoom.name == 'W59S4' ) {
                        //         console.log( (_.sum(curRoom.terminal.store) >= curRoom.terminal.storeCapacity * 0.70 ))
                        //  }
                        //no ongoing transfer, terminal has capacity, delta in sourceroom is more than 10% of maxStorage, sourceroom has more than packetSize
                        if (curRoom.memory.terminalTransfer == undefined && curRoom.memory.resourceLimits[combinedResources[n]] != undefined &&
                            // (storageDelta >= (curRoom.memory.resourceLimits[combinedResources[n]].maxStorage * 0.1) && packetSize <= curRoom.storage.store[combinedResources[n]] && storageDelta <= curRoom.storage.store[combinedResources[n]])) {
                            (storageDelta >= (curRoom.memory.resourceLimits[combinedResources[n]].maxStorage * 0.1) && storageDelta <= curRoom.storage.store[combinedResources[n]])) {
                            // Resource can be shared with other rooms if their maxStorage is not reached yet
                        //     if(curRoom.name == 'W59S4' ) {
                        //         console.log(curRoom.memory.terminalTransfer == undefined && (_.sum(curRoom.terminal.store) >= curRoom.terminal.storeCapacity * 0.70 ))
                        //      console.log(combinedResources[n] + ' - ' + curRoom.memory.resourceLimits[combinedResources[n]].maxStorage + ' - ' + storageDelta + ' - packetsize - ' +  packetSize + ' - store - ' + curRoom.storage.store[combinedResources[n]] )
                        //  }
                        
                        
                            checkedResources.push(n);
                            let recipientRooms = [];
                            let fullRooms = [];
                            for (var ru in global.myRooms) {
                                if (Game.rooms[ru].name != curRoom.name && Game.rooms[ru].storage != undefined && Game.rooms[ru].terminal != undefined && Game.rooms[ru].storage.owner.username == global.playerUsername) {
                                    if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75 && checkStorageLimits(Game.rooms[ru], combinedResources[n]) < 0) {
                                        if( true || combinedResources[n] != RESOURCE_ENERGY) {
                                            recipientRooms.push(Game.rooms[ru]);
                                        }
                                    }
                                    else if (_.sum(Game.rooms[ru].terminal.store) < Game.rooms[ru].terminal.storeCapacity * 0.75) {
                                        // if(ru != 'W52S3' || combinedResources[n] == RESOURCE_ENERGY) {
                                        // if(ru != 'W58S2') { 
                                            fullRooms.push(Game.rooms[ru]);
                                        // }
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
                                        if(curRoom.totalResourceInStock(combinedResources[n]) < transferAmount ) {
                                            transferAmount = curRoom.totalResourceInStock(combinedResources[n]);
                                        }
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

                                    terminalTransferX(combinedResources[n], transferAmount, curRoom.name, recipientRooms[0].name, true);
                                    break;
                                }
                            }
                            else if (fullRooms.length > 0) {
                                // Room is over storage limit --> look for rooms with less of the resource
                                for (let p in fullRooms) {
                                    
                                    if (r == 'W56S2') {
                                        // break;
                                        //  console.log(r + ' - ' + combinedResources[n] + ' - ');
                                        if( true) {
                                            let transferAmount;
                                            transferAmount = curRoom.storage.store[combinedResources[n]];
        
                                            if (transferAmount > 5000) {
                                                transferAmount = 5000;
                                            }
                                            console.log(combinedResources[n] + ' - ' + transferAmount);
                                            terminalTransferX(combinedResources[n], transferAmount, curRoom.name, fullRooms[p].name, true);
                                            break;
                                        }
                                    }
                                
                                    else if (fullRooms[p].storage != undefined && (fullRooms[p].storage.store[combinedResources[n]] == undefined || checkStorageLimits(curRoom, combinedResources[n]) > checkStorageLimits(fullRooms[p], combinedResources[n]) + packetSize)) {
                                        //room with less minerals found
                                        let transferAmount;
                                        transferAmount = packetSize / 2;
                                        if(curRoom.totalResourceInStock(combinedResources[n]) < transferAmount) {
                                            transferAmount = curRoom.totalResourceInStock(combinedResources[n]);
                                        }
                                        //terminalTransferX(combinedResources[n], transferAmount, curRoom.name, fullRooms[p].name, true);
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

    cancelCompletedOrders() {
        //Remove expired market orders
        let expiredOrders = _.filter(Game.market.orders, {remainingAmount: 0});
        if (expiredOrders.length > 0) {
            for (let o in expiredOrders) {
                Game.market.cancelOrder(expiredOrders[o].id);
            }
        }        
    }
    
    marketBuy() {        
        let info = Memory.buyOrder.split(":"); //Format: [AMOUNT]:[ORDERID]
        var left = info[0];
        var order =Game.market.getOrderById(info[1]);
        if (order != null) {
            if (left > 1000) {
                left = 10000;
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
    
    
}