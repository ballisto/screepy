global.Scheduler = class Scheduler {
  constructor() {
    
    let tmp = '';
  }
  get summary() {
    var result = "";
    
    return result;
  }

  get isBusy() {
    // factory busy with old code
    if(this.room.memory.labOrder != undefined || this.room.memory.labTarget != undefined) { return true;}
    return false;
  }

  run() {
    this.runRoomCaretaker();

    let careTaker = new Caretaker();

    careTaker.cleanupMemoryCreeps();

    if (Game.time % global.DELAYPANICFLAG == 0) {
      careTaker.runPanicFlags();
    }

    if (Game.time % global.DELAYMARKETBUY == 0 && Game.cpu.bucket > global.CPU_THRESHOLD && Memory.buyOrder != undefined) {
      global.economy.marketBuy();    
    }

    if (Game.time % global.DELAYMARKETAUTOSELL == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
      global.economy.cancelCompletedOrders();
    }

    // if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Resource Balancing: " + Game.cpu.getUsed())}
    if (Game.time % global.DELAYRESOURCEBALANCING == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
      global.economy.resourceBalancing();
    }

  }
  sellX(room, resource) {
      if(room.terminal != undefined && room.terminal.store != undefined && room.terminal.store[resource] != undefined && room.terminal.store[resource] > 2000 ) {
        let sellResourceType = resource;
        let sellThresholdPrice = 0.03;
        let sellTresholdTotalStockAmount = 500000;
            let sellTerminal = room.terminal;
                if(sellTerminal.store[sellResourceType] != undefined && sellTerminal.store[sellResourceType] > 99 && (sellTerminal.cooldown == undefined || sellTerminal.cooldown == 0) ) {
                    
                    let buyOrdersBelowThreshold = Game.market.getAllOrders((o) => o.type == 'buy' && o.resourceType == sellResourceType && o.price >= sellThresholdPrice && o.amount > 10);
                    buyOrdersBelowThreshold = _.sortBy(buyOrdersBelowThreshold, "price");
                    buyOrdersBelowThreshold.reverse();
                
                    if(buyOrdersBelowThreshold.length > 0) {
                            let sellDealAmount = buyOrdersBelowThreshold[0].amount;
                            if (sellDealAmount > 10000) {sellDealAmount = 10000;}
                            if (sellDealAmount > room.terminal.store[resource]) {sellDealAmount = room.terminal.store[resource];}
                            let sellDealResult = Game.market.deal(buyOrdersBelowThreshold[0].id,sellDealAmount,room.name);
                            
                            console.log(room.name + resource + ' sell ' + sellDealAmount + " - "  + buyOrdersBelowThreshold[0].price + ' - ' + economy.stock[sellResourceType] + ' - result: ' + sellDealResult);
                        
                    }
                }
      }
  }

  runRoomCaretaker() {
    let roomsLastCaretaker = [];

    for (var r in Game.rooms) {
      let curRoom = Game.rooms[r];
      if( curRoom != undefined && curRoom.memory != undefined ) {

        // Tower code
        curRoom.runTowers();
        // Link code
        curRoom.runLinks();
        // Terminal code
        curRoom.runTerminal();

        curRoom.legacyProduction();

        curRoom.legacyLabCode();

        if ( curRoom.memory.lastcaretaker == undefined) {
          curRoom.memory.lastcaretaker = Game.time;
        }
        if (Game.time - curRoom.memory.lastcaretaker >= 10 ) {
          roomsLastCaretaker.push({roomname: curRoom.name, lastcaretaker: curRoom.memory.lastcaretaker});
        }
      }
    
        if (Game.time % 1000 == 0) {
            if (curRoom.memory.terminalTransfer != undefined) {
            delete curRoom.memory.terminalTransfer;
            console.log(r + ": terminal-transfer removed");
            }
        }    
    }
    if ( roomsLastCaretaker.length > 0 ) {
      roomsLastCaretaker = _.sortBy(roomsLastCaretaker, "lastcaretaker");
      // let careTaker = new Caretaker(roomsLastCaretaker[0].roomname);
    //   if (roomsLastCaretaker[0].roomname != 'W58N33' && roomsLastCaretaker[0].roomname != 'W55N28' && roomsLastCaretaker[0].roomname != 'W53N29') {
        for(let i = 0; i <= 1; i++) {
            if (roomsLastCaretaker[i] != undefined) {
                Game.rooms[roomsLastCaretaker[i].roomname].run();
                // Game.rooms['W55N32'].run();
                // if(Game.rooms[roomsLastCaretaker[i].roomname].my()) {this.sellX(Game.rooms[roomsLastCaretaker[i].roomname], 'U');}
            }
        }
    }
  }  
}
