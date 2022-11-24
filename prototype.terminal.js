
StructureTerminal.prototype.makeSpace = function() {
//   return this.spaceLeft() <= this.storeCapacity * 0.25;
  
    // let sellResourceType = 'H';
    // 
    // let sellTresholdTotalStockAmount = 500000;
    // let sellTerminal = Game.rooms[sellRoom].terminal;
    console.log(this.room.name + " - TerminalMakeSpace - ");
    if (this.cooldown == 0 && this.store['energy'] > 5000) {
        let shitInTerminal = [];
        
        for ( let res in this.store ) {
            if ( res != 'energy' || this.store[res] > 200000) {
            // {
                shitInTerminal.push({"resource":res,"qty":this.store[res]});
            }
        }
        
        shitInTerminal = _.sortBy(shitInTerminal, "qty");
        shitInTerminal.reverse();
        
        
        console.log(JSON.stringify(shitInTerminal));
        
        for ( let sellResource in shitInTerminal) {
            
            let sellResourceType = shitInTerminal[sellResource].resource;
            let sellThresholdPrice = 0.001;
            
            let buyOrdersBelowThreshold = Game.market.getAllOrders((o) => o.type == 'buy' && o.resourceType == sellResourceType && o.price > sellThresholdPrice && o.amount > 100);
            buyOrdersBelowThreshold = _.sortBy(buyOrdersBelowThreshold, "price");
            buyOrdersBelowThreshold.reverse();
            // console.log(JSON.stringify(shitInTerminal[sellResource].resource));
            if(buyOrdersBelowThreshold.length > 0) {
                let sellDealAmount = buyOrdersBelowThreshold[0].amount;
                if (sellDealAmount > 5000) {sellDealAmount = 5000;}
                if (sellDealAmount > shitInTerminal[sellResource].qty ) {sellDealAmount = shitInTerminal[sellResource].qty;}
                let sellDealResult = Game.market.deal(buyOrdersBelowThreshold[0].id,sellDealAmount,this.room.name);
                // let sellDealResult = "!";
                
                console.log(this.room.name + " -MakeSpace SELL - " + buyOrdersBelowThreshold[0].resourceType + " - "  + shitInTerminal[sellResource].qty + " - "  +sellDealAmount + " - "  + buyOrdersBelowThreshold[0].price + ' - ' + sellDealResult);
                return 0;
            }
        }
    }
    // if(sellFlag && Game.time % global.DELAYMARKETBUY == 0 && sellTerminal.store[sellResourceType] != undefined && sellTerminal.store[sellResourceType] > 5000 && (sellTerminal.cooldown == undefined || sellTerminal.cooldown == 0) ) {
                
    
    // }
  
};

StructureTerminal.prototype.run = function() {

//   var openJobsForThis = jobs.getOpenJobsForStructure(this.id);
//   console.log(this.room.name);
    let terminal = this;
    
    if ( terminal.isAlmostFull()) {
        this.makeSpace();
    }
      //Terminal exists
      
      // Terminal Transfer
      if ( this.room.memory.terminalTransfer != undefined && this.cooldown == 0) {
          var targetRoom;
          var amount;
          var resource;
          var comment;
          var energyCost;
          var info = this.room.memory.terminalTransfer;
          info = info.split(":");
          targetRoom = info[0];
          amount = parseInt(info[1]);
          resource = info[2];
          comment = info[3];
      
          if (amount >= 100) {
              energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
              this.room.memory.terminalEnergyCost = energyCost;
              if (comment != "MarketOrder") {
                  var energyTransferAmount = parseInt(energyCost) + parseInt(amount);
                  var stdEnergyCost = Game.market.calcTransactionCost(global.TERMINAL_PACKETSIZE, terminal.room.name, targetRoom);
                  if ((resource != RESOURCE_ENERGY && amount >= global.TERMINAL_PACKETSIZE && terminal.store[resource] >= global.TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) >= stdEnergyCost)
                      || (resource == RESOURCE_ENERGY && amount >= global.TERMINAL_PACKETSIZE && terminal.store[resource] >= global.TERMINAL_PACKETSIZE && (terminal.store[RESOURCE_ENERGY]) - global.TERMINAL_PACKETSIZE >= stdEnergyCost)) {
                      if (terminal.send(resource, global.TERMINAL_PACKETSIZE, targetRoom, comment) == OK) {
                          info[1] -= global.TERMINAL_PACKETSIZE;
                          this.room.memory.terminalTransfer = info.join(":");
                          if (global.LOG_TERMINAL == true) {
                              console.log("<font color=#009bff type='highlight'>" + this.room.name + ": " + global.TERMINAL_PACKETSIZE + "/" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + stdEnergyCost + " energy: " + comment + "</font>");
                          }
                      }
                      else {
                          console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + this.room.name + "): " + terminal.send(resource, 500, targetRoom, comment) + "</font>");
                      }
                  }
                  else if ((resource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyTransferAmount)
                      || (resource != RESOURCE_ENERGY && terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost)) {
                      // Amount to be transferred reached and enough energy available -> GO!
                      if (terminal.send(resource, amount, targetRoom, comment) == OK) {
                          // delete this.memory.terminalTransfer;
                          // delete this.memory.terminalEnergyCost;
                          info[1] = 0;
                          this.room.memory.terminalTransfer = info.join(":");
                          if (global.LOG_TERMINAL == true) {
                              console.log("<font color=#009bff type='highlight'>" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + energyCost + " energy: " + comment + "</font>");
                          }
                      }
                      else {
                          if (amount < 100) {
                              delete this.room.memory.terminalTransfer;
                          }
                          else {
                              console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + this.room.name + "): " + terminal.send(resource, amount, targetRoom, comment) + "</font>");
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
                      this.room.memory.terminalEnergyCost = energyCost;
                      if (terminal.store[resource] >= amount) {
                          if (resource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= amount + energyCost ||
                              resource != RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyCost) {
                              //Do the deal!
                              if (parseInt(info[1]) <= global.AUTOSELL_PACKETSIZE && Game.market.deal(orderID, amount, this.room.name) == OK) {
                                  if (global.LOG_MARKET == true) {
                                      console.log("<font color=#33ffff type='highlight'>" + this.room.name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                  }
                                  delete this.room.memory.terminalTransfer;
                              }
                              else if (Game.market.deal(orderID, amount, this.room.name) == OK) {
                                  if (global.LOG_MARKET == true) {
                                      console.log("<font color=#33ffff type='highlight'>" + this.room.name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                  }
                                  info[1] -= amount;
                                  this.room.memory.terminalTransfer = info.join(":");
                              }
                          }
                      }
                  }
                  else {
                      delete this.room.memory.terminalTransfer;
                  }
              }
          }
          else {
              delete this.room.memory.terminalTransfer;
          }
      }
};

StructureTerminal.prototype.isPrettyFull = function() {
  return this.spaceLeft() <= this.storeCapacity * 0.25;
};
