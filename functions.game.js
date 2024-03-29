global.getMasterSpawn = function (roomName) {
    return Game.rooms[roomName].memory.masterSpawn;
};

global.terminalTransfer = function (transferResource, transferAmount, targetRoomName, transferFlag) {
    // transfer resources to remote room from whatever room(s) is cheapest
    var roomCandidates = new Array();
    var tempArray = new Array();
    var resourceTotal = 0;

    if (arguments.length == 0) {
        return "terminalTransfer (transferResource, transferAmount, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    for (var r in global.myRooms) {
        if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername) {
            //Fill candidate array with rooms
            var roomResourceTotal = 0;
            var roomArray = [];

            // Add resource in storage
            if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[transferResource] != undefined) {
                roomResourceTotal += Game.rooms[r].storage.store[transferResource];
            }

            // Add resource in containers
            tempArray = Game.rooms[r].memory.roomArrayContainers;
            var container;
            for (var s in tempArray) {
                container = Game.getObjectById(tempArray[s]);
                if (container != undefined) {
                    if (container.store[transferResource] != undefined) {
                        roomResourceTotal += container.store[transferResource];
                    }
                }
            }

            if (transferResource == RESOURCE_ENERGY) {
                // Add resource in links
                tempArray = Game.rooms[r].memory.roomArrayLinks;
                for (var s in tempArray) {
                    container = Game.getObjectById(tempArray[s]);
                    if (container != undefined) {
                        roomResourceTotal += Game.getObjectById(tempArray[s]).energy;
                    }
                }
            }

            if (roomResourceTotal > 0 && Game.rooms[r].name != targetRoomName) {
                roomArray["name"] = Game.rooms[r].name;
                roomArray["volume"] = roomResourceTotal;

                if (roomResourceTotal > transferAmount) {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(transferAmount, Game.rooms[r].name, targetRoomName);
                }
                else {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(roomResourceTotal, Game.rooms[r].name, targetRoomName);
                }
                roomArray["cost"] = Game.market.calcTransactionCost(100, roomArray.name, targetRoomName);

                if (transferFlag == false) {
                    console.log(roomArray.name + ": " + roomResourceTotal + " of " + transferResource + " (energy factor: " + roomArray.cost + ")");
                }

                roomCandidates.push(roomArray);
                resourceTotal += roomResourceTotal;
            }
        }
    }

    var totalVolume = 0;
    var totalCost = 0;

    if (roomCandidates.length == 0) {
        return "No rooms with " + transferResource + " found.";
    }
    else if (resourceTotal < transferAmount) {
        return "Not enough " + transferResource + " found.";
    }
    else {
        // There are rooms holding enough of the transfer resource
        var candidatesByCost = _.sortBy(roomCandidates,"cost");

        for (var c in candidatesByCost) {
            if (Game.rooms[candidatesByCost[c].name].memory.terminalTransfer == undefined) {
                if (candidatesByCost[c].volume > transferAmount) {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
                        //console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += transferAmount;
                    totalCost += candidatesByCost[c].totalCost;
                    break;
                }
                else {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer";
                        //console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += candidatesByCost[c].volume;
                    totalCost += candidatesByCost[c].totalCost;
                    transferAmount -= candidatesByCost[c].volume;
                }
            }
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.terminalTransferX = function (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) {
    // transfer resources to from source to target
    var roomCandidates = new Array();
    var sourceRoom = Game.rooms[sourceRoomName];
    let targetRoom = Game.rooms[targetRoomName];
    

    if (arguments.length == 0) {
        return "terminalTransferX (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W18S49\", \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    if (sourceRoom.memory.terminalTransfer != undefined) {
        return "There is already an ongoing terminal transfer in room " + sourceRoomName + ".";
    }

    var totalCost = 0;
    if (sourceRoom.storage == undefined || sourceRoom.terminal == undefined || (sourceRoom.storage.store[transferResource] + sourceRoom.terminal.store[transferResource]) < transferAmount) {
        return "Error scheduling terminal transfer job.";
    }
    if (targetRoom.storage == undefined || targetRoom.terminal == undefined || targetRoom.terminal.isPrettyFull()) {
        return "Error scheduling terminal transfer job.";
    }
    else {
        if (transferFlag == false) {
            console.log("Terminal Transfer Preview for room " + sourceRoom.name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName));
        }
        else if (transferFlag == true) {
            sourceRoom.memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
            //console.log(transferAmount + " " + transferResource + " scheduled from room " + sourceRoomName + " to room " + targetRoomName + " for " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName) + " energy.");
        }
        else {
            return "Transfer Flag missing.";
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.ls = function (displayResource) {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = [];
    var total = [];

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].my() && Game.rooms[r].storage != undefined && Game.rooms[r].storage.store != undefined && Game.rooms[r].storage.my) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (let res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    resourceTable = _.sortBy(resourceTable, function (res) {return res.length;});
    for (res in resourceTable) {
        if (arguments.length == 0 || displayResource == resourceTable[res]) {
            returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
            let c = -1;
            for (var r in Game.rooms) {
                if (Game.rooms[r].my() && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername && Game.rooms[r].memory.resourceLimits[resourceTable[res]] != undefined) {
                    // console.log(r);
                    c++;
                    var amount;
                    var color;
                    if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                        amount = 0;
                    }
                    else {
                        amount = Game.rooms[r].storage.store[resourceTable[res]];
                    }
                    if (amount < Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
                        color = "#ff3333";
                    }
                    else if (amount > Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
                        color ="#00ff00"
                    }
                    else {
                        color = "#aaffff";
                    }
                    returnstring = returnstring.concat("<td><font color='" + color + "'>" + prettyInt(amount) + "  </font></td>");

                    if (total[c] == undefined) {
                        total[c] = amount;
                    }
                    else {
                        total[c] += amount;
                    }
                }
            }
            returnstring = returnstring.concat("</tr>");
        }
    }
    returnstring = returnstring.concat("<tr></tr><td>Total  </td>");
    for (let c in total) {
        returnstring = returnstring.concat("<td>" + prettyInt(total[c]) + " </td>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.prettyInt = function (int) {
    var string = int.toString();
    var numbers = string.length;
    var rest = numbers % 3;
    var returnString = "";
    if (rest > 0) {
        returnString = string.substr(0, rest);
        if (numbers > 3) {
            returnString += "'";
        }
    }
    numbers -= rest;

    while (numbers > 0) {
        returnString += string.substr(rest,3);
        if (numbers > 3) {
            returnString += "'";
        }
        rest += 3;
        numbers -= 3;
    }
    return returnString;
};

global.listLimits = function (limitType, displayResource) {
    if (arguments.length == 0) {
        return "listLimits (limitTyoe, [displayResource]) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
    }
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = [];
    if (limitType == "market") {
        limitType = "minMarket"
    }
    else if (limitType == "production") {
        limitType = "minProduction"
    }
    else if (limitType == "terminal") {
        limitType = "minTerminal"
    }
    else if (limitType == "storage") {
        limitType = "maxStorage"
    }
    else {return "Invalid limit type."}

    //Prepare header row
    for (var r in global.myRooms) {
        if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in global.myRooms[r].memory.resourceLimits) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    resourceTable = _.sortBy(resourceTable, function (res) {return res.length;});
    for (res in resourceTable) {
        if (arguments.length == 1 || displayResource == resourceTable[res]) {
            var tempstring ="<tr><td>" + resourceTable[res] + "  </td>";
            var tempsum = 0;
            for (var r in global.myRooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == global.playerUsername) {
                    tempstring = tempstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]][limitType]) + "  </td>");
                    tempsum += Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage;
                }
            }
            if (tempsum > 0) {
                returnstring = returnstring.concat(tempstring + "</tr>");
            }
        }
    }
    returnstring = returnstring.concat("</table>");
    return returnstring;
};

global.setLimit = function(roomName, type, resource, limit) {
    if (arguments.length == 0) {
        return "setLimit (roomName, limitType, resource, limit) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
    }
    var roomNames = [];
    var resources = [];

    if (roomName == "*") {
        for (var t in global.myRooms) {
            roomNames.push(global.myRooms[t].name);
        }
    }
    else {
        roomNames.push(roomName);
    }

    if (resource == "*") {
        for (var t in RESOURCES_ALL) {
            resources.push(RESOURCES_ALL[t]);
        }
    }
    else {
        resources.push(resource);
    }

    for (var i in roomNames) {
        for (let m in resources) {
            switch (type) {
                case "market":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
                    break;
                case "terminal":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
                    break;
                case "storage":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
                    break;
                case "production":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
                    break;
                case "*":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
                default:
                    return "Unknown type";
            }
            console.log("Room " + Game.rooms[roomNames[i]].name + " has set the " + type + " limit for " + resources[m] + " to " + limit + ".");
        }
    }
    return "OK";
};
global.checkTerminalLimits = function (room, resource) {
    // Check if terminal has exactly what it needs. If everything is as it should be true is returned.
    // If material is missing or too much is in terminal, an array will be returned with the following format:
    // delta.type = Type of resource / delta.amount = volume (positive number means surplus material)

    //Check terminal limits
    var uplift = 0;
    var delta = {};
    delta["type"] = resource;
    if (room.memory.resourceLimits == undefined || room.terminal == undefined || room.storage == undefined) {
        delta["amount"] = 0;
        return delta;
    }

    var roomLimits = room.memory.resourceLimits;
    if (roomLimits[resource] != undefined && room.terminal.store[resource] != undefined) {
        delta.amount = room.terminal.store[resource] - roomLimits[resource].minTerminal;
    }
    else if (room.terminal.store[resource] == undefined && roomLimits[resource] != undefined) {
        delta.amount = 0 - roomLimits[resource].minTerminal;
    }
    else {
        delta.amount = 0
    }

    //Check market selling orders to add minerals to terminal
    if (Object.keys(Game.market.orders).length > 0) {
        //Look through orders to determine whether additional material is needed in terminal

        var relevantOrders = _.filter(Game.market.orders,function (order) {
            if (order.resourceType == resource && order.roomName == room.name && order.type == ORDER_SELL) {return true}
            else {return false}
        });

        if (relevantOrders.length > 0) {
            for (let o in relevantOrders) {
                if (relevantOrders[o].remainingAmount > global.TERMINALMARKETSTORE) {
                    uplift += global.TERMINALMARKETSTORE;
                }
                else {
                    uplift += relevantOrders[o].remainingAmount;
                }
            }
            delta.amount -= uplift;
        }
    }

    //Check single buying orders to add energy to terminal
    if (Memory.buyOrder != undefined && Memory.buyRoom == room.name && resource == RESOURCE_ENERGY) {
        let info = Memory.buyOrder.split(":");
        let order = Game.market.getOrderById(info[1]);
        if (order != null) {
            if (info[0] > 500) {
                info[0] = 500;
            }
            if (info[0] > order.amount) {
                info[0] = order.amount;
            }
            let plusEnergy = Game.market.calcTransactionCost(info[0], Memory.buyRoom, order.roomName);
            delta.amount -= plusEnergy;
        }
    }

    return delta;
};

global.checkStorageLimits = function(room, resource) {
    // Check if storage has exactly what it needs. Return delta to maxStorage
    // If everything is as it should be 0 is returned.
    // If material is missing a negative amount will be returned
    // If there is surplus a positive amount will be returned
    var terminalDelta = 0;
    if (room.storage == undefined || room.memory.resourceLimits[resource] == undefined) {
        return 0;
    }
    terminalDelta = checkTerminalLimits(room, resource);
    if (room.storage.store[resource] != undefined ) {
        return (terminalDelta.amount + room.storage.store[resource] - room.memory.resourceLimits[resource].maxStorage)
    }
    else {
        return (terminalDelta.amount - room.memory.resourceLimits[resource].maxStorage);
    }
};

global.whatIsLackingFor = function(room, amount, resource) {
    //Return object [resource, amount] with lowest-tier resource missing in room for target resource
    var returnArray = {};
    returnArray.resource = resource;
    var components = [];
    var targetResourceDescription = global.mineralDescriptions[resource];
    if (targetResourceDescription == undefined) {
        console.log(resource + " not found in global.mineralDescriptions!");
    }
    returnArray["amount"] = amount;

    if (targetResourceDescription.tier == 0) {
        //Tier 0 resource
        return returnArray;
    }
    else {
        // Begin drill-down
        var OKcount = 0;
        do {
            components[0] = targetResourceDescription.component1;
            components[1] = targetResourceDescription.component2;
            for (let c in components) {
                if (room.storage.store[components[c]] == undefined || room.storage.store[components[c]] < returnArray.amount) {
                    // not enough of this component
                    targetResourceDescription = global.mineralDescriptions[components[c]];
                    returnArray.resource = components[c];
                    if (room.storage.store[components[c]] != undefined) {
                        returnArray.amount = amount - room.storage.store[components[c]];
                    }
                    else {
                        returnArray.amount = amount;
                    }
                }
                else {
                    OKcount++;
                }
            }
        }
        while (OKcount < 2 && targetResourceDescription.tier > 0);

        return returnArray;
    }
};

global.buy = function (orderID, amount) {
    if (arguments.length == 0) {
        return "buy (orderID, amount)";
    }
    var order = Game.market.getOrderById(orderID);

    if (order == null) {
        return "Invalid order ID!"
    }
    if (arguments.length == 1) {
        amount = order.amount;
        
    }

    if (order.remainingAmount < amount) {
        return "Order does not contain enough material!"
    }

    if (Game.market.credits < order.price * amount) {
        return "Not enough credits!"
    }

    if (Memory.buyOrder != undefined) {
        return "Active buy order found: " + Memory.buyOrder;
    }

    Memory.buyOrder = amount + ":" + order.id;
    return "Buy queue created!";
};

global.sell = function (orderID, amount, roomName) {
    if (arguments.length == 0) {
        return "sell (orderID, amount, roomName)";
    }
    let order = Game.market.getOrderById(orderID);

    if (order == null) {
        return "Invalid order ID!"
    }
    if (Game.rooms[roomName].memory.terminalTransfer == undefined) {
        Game.rooms[roomName].memory.terminalTransfer = order.id + ":" + amount + ":" + order.resourceType + ":MarketOrder";
        return "Selling transfer scheduled.";
    }
    else {
        return "Ongoing terminal transfer found. Try later.";
    }
};

global.sellBulk = function (amount, resource) {
    // Sell as much as possible as fast as possible, no matter the energy costs or price
    if (arguments.length == 0) {
        return "sellBulk (amount, resource)";
    }
    let amountBuffer = amount;
    let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
    if (orders.length > 0) {


        orders = _.sortBy(orders, "price");
        orders = _.sortBy(orders, "amount");
        orders.reverse();

        let orderIndex = 0;
        for (let r in global.myRooms) {
            if (orders[orderIndex] != undefined && global.myRooms[r].terminal != undefined && global.myRooms[r].memory.terminalTransfer == undefined) {
                let sellAmount;
                if (orders[orderIndex].amount > amount) {
                    sellAmount = amount;
                }
                else {
                    sellAmount = orders[orderIndex].amount;
                }

                if (sellAmount <= 0) {
                    break;
                }
                else {
                    sell(orders[orderIndex].id, sellAmount, r);
                }
                amount-= sellAmount;
                orderIndex++;
            }
        }
    }
    if (amount < 0) {
        amount = 0;
    }
    return (amountBuffer - amount) + " units queued for sale.";
};

global.sellHigh = function (amount, resource) {
    // Sell as much as possible as expensive as possible, no matter the energy costs
    if (arguments.length == 0) {
        return "sellHigh (amount, resource)";
    }
    let amountBuffer = amount;
    let orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
    if (orders.length > 0) {

        orders = _.sortBy(orders, "amount");
        orders = _.sortBy(orders, "price");
        orders.reverse();

        let orderIndex = 0;
        for (let r in global.myRooms) {
            if (global.myRooms[r].terminal != undefined && global.myRooms[r].memory.terminalTransfer == undefined) {
                let sellAmount;
                if (orders[orderIndex].amount > amount) {
                    sellAmount = amount;
                }
                else {
                    sellAmount = orders[orderIndex].amount;
                }

                if (sellAmount <= 0) {
                    break;
                }
                else {
                    sell(orders[orderIndex].id, sellAmount, r);
                }
                amount-= sellAmount;
                orderIndex++;
            }
        }
    }
    if (amount < 0) {
        amount = 0;
    }
    return (amountBuffer - amount) + " units queued for sale.";
};

global.sellOrder = function (amount, resource, roomName, price) {
    if (arguments.length == 0) {
        return "sellOrder (amount, resource, roomName, price)";
    }

    if (Game.rooms[roomName].storage != undefined && Game.rooms[roomName].storage.store[resource] >= amount) {
        if (Game.market.createOrder(ORDER_SELL, resource, price, amount, roomName) == OK) {
            return "Sell order created!";
        }
    }
    else {
        return "Room " + roomName + " is not able to sell this resource.";
    }
};

global.buyOrder = function (amount, resource, roomName, price) {
    if (arguments.length == 0) {
        return "buyOrder (amount, resource, roomName, price)";
    }
    if (Game.market.createOrder(ORDER_BUY, resource, price, amount, roomName) == OK) {
        return "Buy order created!";
    }
};
global.produce = function (roomName, amount, resource) {
    if (arguments.length == 0) {
        return "produce (roomName, amount, resource)";
    }
    Game.rooms[roomName].memory.labTarget = amount + ":" + resource;
    return "OK";
};

global.addBoostLab = function (labID, mineralType) {
    if (arguments.length == 0) {
        return "addBoostLab (labID, mineralType)";
    }
    var lab = Game.getObjectById(labID);
    const mineralDetails = mineralDescriptions[mineralType];

    if (lab != null && mineralDetails != undefined && mineralDetails.bodyPart != undefined ) {

        var boostLabList;
        var room = lab.room;
        if (room.memory.boostLabs == undefined) {
            room.memory.boostLabs = {};
        }
        room.memory.boostLabs[labID] = mineralType;
        return "Lab added as boost lab.";
    }
    else {
      return "Error";
    }
};

global.listBoostLabs = function () {
    var returnstring = "<table><tr><th>Room  </th><th>Entry  </th><th>Lab ID (position)  </th></tr>";

    for (let r in global.myRooms) {
        returnstring = returnstring.concat("<tr><td>" + global.myRooms[r].name + "  </td>");
        for (let l in global.myRooms[r].memory.boostLabs) {
            let lab = Game.getObjectById(global.myRooms[r].memory.boostLabs[l]);
            returnstring = returnstring.concat("<td> " + l + " </td><td>" + lab.id + " (x=" + lab.pos.x + "/y=" + lab.pos.y + ")" + "  </td>");
        }
        returnstring = returnstring.concat("</tr>");
    }
    returnstring = returnstring.concat("</table>");
    return returnstring;
};

global.delBoostLab = function (labId) {
    if (arguments.length == 0) {
        return "delBoostLab (labId)";
    }
    labObject = Game.getObjectById(labId);
    if (labObject instanceof StructureLab) {
      tmpRoomBoostLabs = labObject.room.getBoostLabs();
      if(tmpRoomBoostLabs[labId] != undefined) {
        delete labObject.room.memory.boostLabs[labId];
        return "Boost Lab removed.";
      }
      return "Not a Boostlab";
    }
    return "Invalid LabID";
};

global.addBoost = function (roomName, role, mineralType, volume) {
    if (arguments.length == 0) {
        return "addBoost (roomName, role, mineralType, volume)";
    }

    var boostList;
    var room = Game.rooms[roomName];
    if (room.memory.boostList == undefined) {
        boostList = [];
    }
    else {
        boostList = room.memory.boostList;
    }

    var boostEntry = {};
    boostEntry.role = role;
    boostEntry.mineralType = mineralType;
    boostEntry.volume = volume;

    boostList.push(boostEntry);
    room.memory.boostList = boostList;
    return "Boost entry added.";
};
global.delBoost = function (roomName, entryNr) {
    if (arguments.length == 0) {
        return "delBoost (roomName, entryNr)";
    }
    Game.rooms[roomName].memory.boostList.splice(entryNr, 1);
    return "Boost entry removed.";
};

global.listBoost = function (roomName) {
    if (arguments.length == 0) {
        return "listBoost (roomName)";
    }
    var roomList = [];
    if (roomName == "*") {
        for (let u in global.myRooms) {
            roomList.push(u);
        }
    }
    else {
        roomList.push(roomName)
    }
    var returnstring = "";

    for (roomName in roomList) {
        var roles = [];
        var boostMinerals = [];
        var volumes = [];
        for (let e in global.myRooms[roomList[roomName]].memory.boostList) {
            if (roles.indexOf(Game.rooms[roomList[roomName]].memory.boostList[e].role) == -1) {
                roles.push(Game.rooms[roomList[roomName]].memory.boostList[e].role);
                boostMinerals.push(Game.rooms[roomList[roomName]].memory.boostList[e].mineralType);
                volumes.push(Game.rooms[roomList[roomName]].memory.boostList[e].volume);

            }
        }

        if (boostMinerals.length > 0) {
            returnstring = returnstring.concat(roomList[roomName] + ":<br><table><tr><th>Entry  </th><th>Role  </th><th>Boost  </th><th>Volume  </th></tr>");
            for (let r in roles) {
                returnstring = returnstring.concat("<tr><td>" + r + ":  </td>");
                returnstring = returnstring.concat("<td>" + roles[r] + "  </td><td>" + boostMinerals[r] + "  </td><td>" + volumes[r] + "  </td>");
                returnstring = returnstring.concat("</tr>");
            }
            returnstring = returnstring.concat("</table><br>");
        }
    }
    return returnstring;
};

global.activeTerminals = function () {
    let entries = 0;
    let returnString ="";
    for (r in global.myRooms) {
        if (global.myRooms[r].memory.terminalTransfer != undefined) {
            entries ++;
            var info = global.myRooms[r].memory.terminalTransfer.split(":");
            let targetRoom = info[0];
            let amount = parseInt(info[1]);
            let resource = info[2];
            let comment = info[3];
            if (comment == "MarketOrder") {
                returnString = returnString.concat(global.myRooms[r].name + ": " + "Sending " + amount + " " + resource + " to room " + targetRoom + "<br>");
            }
            else {
                returnString = returnString.concat(global.myRooms[r].name + ": " + "Sending " + amount + " " + resource + " to room " + targetRoom + "<br>");
            }
        }
    }

    if (entries == 0) {
        returnString = "No active terminals.";
    }

    return returnString;
};

global.activeLabs = function () {
    let entries = 0;
    let returnString ="";
    for (r in global.myRooms) {
        if (global.myRooms[r].memory.labOrder != undefined) {
            entries ++;
            var info = global.myRooms[r].memory.labOrder.split(":");
            let amount = parseInt(info[0]);
            let resource1 = info[1];
            let resource2 = info[2];
            returnString = returnString.concat(global.myRooms[r].name + ": " + "Reaction -> [ " + amount + " " + resource1 + " + " + resource2 + " ]<br>");
        }
    }

    if (entries == 0) {
        returnString = "No active labs.";
    }

    return returnString;
};

global.moveReusePath = function(express) {
    if (express == true && Game.cpu.bucket > 99) {
        return 5;
    }

    let minSteps = 10, maxSteps = 60;
    let range = maxSteps - minSteps;

    return minSteps + Math.floor((1 - (Game.cpu.bucket / 10000)) * range);
};

String.prototype.hashCode = function(){
    let hash = 0;
    if (this.length == 0) {
        return hash;
    }

    for (let i = 0; i < this.length; i++) {
        let char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

global.roomCallback = function (roomName) {
    let room = Game.rooms[roomName];
    if (!room) {
        return;
    }
    let costs = new PathFinder.CostMatrix();

    //Set costs for structures
    let structures = room.find(FIND_STRUCTURES);
    for (let s in structures) {
        if (structures[s].structureType == STRUCTURE_ROAD) {
            costs.set(structures[s].pos.x, structures[s].pos.y, 1);
        }
        else if (structures[s].structureType == STRUCTURE_CONTROLLER || structures[s].structureType == STRUCTURE_EXTRACTOR) {
            //Find squares around controllers (claimers) and extractors (miners)

            let top = structures[s].pos.y - 1;
            let bottom = structures[s].pos.y + 1;
            let right = structures[s].pos.x - 1;
            let left = structures[s].pos.x + 1;
            let areaInfo = room.lookForAtArea(LOOK_TERRAIN, top, left, bottom, right, true);
            for (let a in areaInfo) {
                //Check if square is walkable. If it is, set costs to 0xcc. If it isn't, leave the costs be
                if (areaInfo[a].structure != "wall") {
                    costs.set(areaInfo[a].x, areaInfo[a].y, 0xcc)
                }
            }
        }
        else if (structures[s].structureType != STRUCTURE_CONTAINER && structures[s].structureType != STRUCTURE_RAMPART) {
            costs.set(structures[s].pos.x, structures[s].pos.y, 0xff);
        }
    }

    //Find flags for stationaryRemoteHarvesters, stationaryHarvesters
    let flags = room.find(FIND_FLAGS, {filter: (f) => f.memory.function == "haulEnergy" || f.memory.function == "narrowSource" || f.memory.function == "remoteController"});
    for (let f in flags) {
        let top = flags[f].pos.y - 1;
        let bottom = flags[f].pos.y + 1;
        let right = flags[f].pos.x - 1;
        let left = flags[f].pos.x + 1;
        costs.set(flags[f].pos.x, flags[f].pos.y, 0xdd);
        let areaInfo = room.lookForAtArea(LOOK_TERRAIN, top, left, bottom, right, true);
        for (let a in areaInfo) {
            //Check if square is walkable. If it is, set costs to 0xcc. If it isn't, leave the costs be
            if (areaInfo[a].structure != "wall") {
                costs.set(areaInfo[a].x, areaInfo[a].y, 0xcc);
            }
        }
    }
    room.costMatrix = room.costMatrix || costs;
    return room.costMatrix;
};

global.listCreeps = function (displayRole) {
    var returnstring = "<table><tr><th>Role  </th>";
    var roleTable = [];
    var total = [];

    //Prepare header row
    for (var r in global.myRooms) {
        returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
        let roomCreeps = _.filter(Game.creeps, function (c) { return c.memory.homeroom == global.myRooms[r].name; });
        for (let c in roomCreeps) {
            if (roleTable.indexOf(roomCreeps[c].memory.role) == -1) {
                roleTable.push(roomCreeps[c].memory.role);
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    roleTable.sort();
    for (let role in roleTable) {
        if (arguments.length == 0 || displayRole == roleTable[role]) {
            returnstring = returnstring.concat("<tr></tr><td>" + roleTable[role] + "  </td>");
            let c = -1;
            for (var r in global.myRooms) {
                c++;
                let amount;
                let roleCreeps = _.filter(Game.creeps, function (c) { return (c.memory.role == roleTable[role] && c.memory.homeroom == global.myRooms[r].name);});
                amount = roleCreeps.length;
                returnstring = returnstring.concat("<td>" + prettyInt(amount) + "  </td>");
                if (total[c] == undefined) {
                    total[c] = amount;
                }
                else {
                    total[c] += amount;
                }
            }
            returnstring = returnstring.concat("</tr>");
        }
    }
    returnstring = returnstring.concat("<tr></tr><td>Total  </td>");
    for (let c in total) {
        returnstring = returnstring.concat("<td>" + prettyInt(total[c]) + " </td>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};
