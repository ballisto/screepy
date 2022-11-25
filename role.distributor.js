Creep.prototype.roleDistributor = function() {    
    // var curAssignment = polier.getCurTaskForCreep(this.id);
    // if( curAssignment != undefined ) { this.run(); }
    // else
    {
        if(!this.isEmpty() && this.memory.dropToTerminal != undefined && this.memory.dropToTerminal == true && !this.room.terminal.isFull()) {
            for(const resourceType in this.carry) {
                this.transfer(this.room.terminal,resourceType);
            }
            delete this.memory.dropToTerminal;
            return true;
        }
        if(this.room.name == 'W53N188') {
            let dropResource = 'H';
            let distributorPosition = new RoomPosition(this.room.memory.position.creep.distributor.x, this.room.memory.position.creep.distributor.y, this.room.memory.position.creep.distributor.roomName);
            if(distributorPosition != undefined && this.pos.isEqualTo(distributorPosition)) {
                this.storeAllBut(dropResource);
                if(this.isEmpty()) {
                    this.withdraw(this.room.storage,dropResource);
                    // this.withdraw(this.room.terminal,dropResource);
                    
                }
                else {
                    this.transfer(this.room.terminal,dropResource);
                    // this.transfer(this.room.storage,dropResource);
                    for(const resourceType in this.carry) {
                    // this.drop(resourceType);
                    }
                }
            }
            else {
                this.travelTo(distributorPosition);
            }
            return true;
        }
        
        if(this.room.storage.isAlmostFull() && !this.room.terminal.isAlmostFull()) {
            
            let shitInStorage = [];
        
            for ( let res in this.room.storage.store ) {
                shitInStorage.push({"resource":res,"qty":this.room.storage.store[res]});
            }
            shitInStorage = _.sortBy(shitInStorage, "qty");
            shitInStorage.reverse();
            
            let dropResource = shitInStorage[0].resource;
            // console.log(this.room.memory.position.creep.distributor.roomName);
            if (this.room.memory.position.creep.distributor != undefined && this.room.memory.position.creep.distributor != -1 && this.room.memory.position.creep.distributor.x != undefined && this.room.memory.position.creep.distributor.y != undefined && this.room.memory.position.creep.distributor.roomName != undefined) {
                let distributorPosition = new RoomPosition(this.room.memory.position.creep.distributor.x, this.room.memory.position.creep.distributor.y, this.room.memory.position.creep.distributor.roomName);
                if(distributorPosition != undefined && this.pos.isEqualTo(distributorPosition)) {
                    // this.storeAllBut(dropResource);
                    if(this.isEmpty()) {
                        if ( this.withdraw(this.room.storage,dropResource) == 0 ) {
                            this.memory.dropToTerminal = true;
                        }
                        // this.withdraw(this.room.terminal,dropResource);
                    }
                    else {
                        for(const resourceType in this.carry) {
                            this.transfer(this.room.terminal,resourceType);
                        }
                    }
                }
                else {
                    this.travelTo(distributorPosition);
                }
                return true;
            }
        }
        
        
        if (this.memory.positionReached == undefined && this.room.memory.position.creep.distributor != undefined && this.room.memory.position.creep.distributor != -1 && this.room.memory.position.creep.distributor.x != undefined && this.room.memory.position.creep.distributor.y != undefined && this.room.memory.position.creep.distributor.roomName != undefined) {
            let distributorPosition = new RoomPosition(this.room.memory.position.creep.distributor.x, this.room.memory.position.creep.distributor.y, this.room.memory.position.creep.distributor.roomName);
            if (distributorPosition != undefined && !this.pos.isEqualTo(distributorPosition)) {
                this.travelTo(distributorPosition);
            }
            else if(distributorPosition != undefined && this.pos.isEqualTo(distributorPosition)) {
                this.memory.positionReached = true;
            }
        }
        else if (this.memory.positionReached != undefined && this.memory.myLinkId == undefined) {
            let linksInRange = _.filter(this.pos.findInRange(FIND_MY_STRUCTURES,1), (s) => s.structureType == STRUCTURE_LINK && s.getPriority() == 1);
            if (linksInRange.length > 0) {
                this.memory.myLinkId = linksInRange[0].id;
            }
        }

        if(this.memory.myLinkId != undefined) {
            let link = Game.getObjectById(this.memory.myLinkId);
            if(link != undefined ) {
                if ( link.bringEnergy() && link.cooldown < 5 ) {
                    if ( link.energy < (link.energyCapacity) ) {
                        if (this.carry.energy > 0)  {
                            this.transfer(link, RESOURCE_ENERGY);
                            return true;
                        }
                        else if ( this.carry.energy == 0 && this.storeAllBut(RESOURCE_ENERGY) && this.room.storage.store.energy > this.carryCapacity) {
                            this.withdraw(this.room.storage, RESOURCE_ENERGY);
                            return true;
                        }                    
                    }
                }
                else if ( link.energy > 0) {
                    if (this.storeAllBut()) {
                        this.withdraw(link, RESOURCE_ENERGY);
                        return true;
                    }
                }
            }
        }



      if (this.room.memory.terminalTransfer != undefined ) {
          //ongoing terminal transfer
          if (_.sum(this.carry) > 0) {
              //Creep full
              if (this.pos.getRangeTo(this.room.terminal) > 1) {
                  this.travelTo(this.room.terminal);
              }
              else {
                  // Dump everything into terminal
                  for (var res2 in this.carry) {
                      this.transfer(this.room.terminal, res2);
                  }
              }
          }
          else if (!this.room.terminal.isAlmostFull()) {
              //Creep empty
              var transferAmount;
              var targetRoom;
              var transferResource;
              var energyCost;
              var packageVolume;
              var volumeToCarry;
              var info = this.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
              info = info.split(":");
              targetRoom = info[0];
              transferAmount = parseInt(info[1]);
              transferResource = info[2];
              transferAmount = transferAmount - this.room.terminal.store[transferResource];

              if (transferAmount > this.carryCapacity) {
                  volumeToCarry = this.carryCapacity;
              }
              else {
                  volumeToCarry = transferAmount;
              }

              if (info[3] == "MarketOrder") {
                  var order = Game.market.getOrderById(targetRoom);
                  if (order != null) {
                      energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, order.roomName);
                  }
                  else {
                      //Order invalid
                      delete this.room.memory.terminalTransfer;
                  }
              }
              else {
                  energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, targetRoom);
              }

              // Check resource status
              if (this.room.terminal.store[transferResource] >= packageVolume) {
                  //Check for energy level
                  if ((transferResource != RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] < energyCost + packageVolume)
                      || transferResource == RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] + transferAmount > energyCost) {
                      //Get energy
                      if (energyCost > this.carryCapacity) {
                          energyCost = this.carryCapacity;
                      }
                      if(this.withdraw(this.room.storage, RESOURCE_ENERGY, energyCost) == ERR_NOT_IN_RANGE) {
                          this.travelTo(this.room.storage);
                      }
                  }
                  else if (this.room.terminal.store[transferResource] < global.AUTOSELL_PACKETSIZE) {
                      // Get transfer resource
                      if(this.withdraw(this.room.storage, transferResource, volumeToCarry) == ERR_NOT_IN_RANGE) {
                          this.travelTo(this.room.storage);
                      }
                  }
              }
              else {
                  // Get transfer resource
                  if(this.withdraw(this.room.storage, transferResource, volumeToCarry) == ERR_NOT_IN_RANGE) {
                      this.travelTo(this.room.storage);
                  }
              }
          }
      }
    //   else if (this.checkTerminalLimits(RESOURCE_GHODIUM).amount == 0 && this.room.memory.terminalTransfer == undefined && nuker != undefined
    //       && nuker.ghodium < nuker.ghodiumCapacity && (this.room.storage.store[RESOURCE_GHODIUM] != undefined || this.carry[RESOURCE_GHODIUM] != undefined)) {
    //       //No terminal transfer pending, nuker in need of Ghodium and storage has enough of it
    //       if (this.storeAllBut(RESOURCE_GHODIUM) == true) {
    //           if (_.sum(this.carry) < this.carryCapacity && this.room.storage.store[RESOURCE_GHODIUM] > 0) {
    //               if (this.withdraw(this.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
    //                   this.moveTo(this.room.storage);
    //               }
    //           }
    //           else {
    //               if (this.transfer(nuker, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
    //                   this.moveTo(nuker);
    //               }
    //           }
    //       }
    //   }
      else if (this.room.storage != undefined && this.room.terminal != undefined) {
          //Nothing special going on check for terminal levels
          var terminalDelta;
          if (this.room.memory.terminalDelta == undefined || Game.time % 10 == 0 || this.room.memory.terminalDelta != 0) {
              terminalDelta = 0;
              for (var res in this.room.terminal.store) {
                  delta = this.checkTerminalLimits(res);
                  terminalDelta += Math.abs(delta.amount);
              }

              for (var res in this.room.storage.store) {
                  delta = this.checkTerminalLimits(res);
                  terminalDelta += Math.abs(delta.amount);
              }
          }
          else {
              terminalDelta = this.room.memory.terminalDelta;
          }


          if (terminalDelta == 0) {
              //Everything perfect!
            //   if (this.storeAllBut(RESOURCE_ENERGY) == true) {
            //       this.roleEnergyTransporter();
            //   }
          }
          else {
              if (_.sum(this.carry) > 0) {
                  //Creep full
                  var terminalResources = [];
                  for (var res in this.carry) {
                      delta = this.checkTerminalLimits(res);
                      if (delta.amount < 0 && this.carry[res] > 0) {
                          //Terminal needs material
                          var load = Math.abs(delta.amount);
                          if (load > this.carry[res]) {
                              load = this.carry[res];
                          }
                          if (this.transfer(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                              this.travelTo(this.room.terminal);
                          }
                          terminalResources.push(res);
                          break;
                      }
                  }
                  if (terminalResources.length == 0) {
                      // Material for storage left in creep
                      this.storeAllBut();
                  }
              }
              else {
                  // Creep empty
                  //Check storage for useful resources
                  terminalDelta = 0;
                  for (var res in this.room.terminal.store) {
                      var delta = this.checkTerminalLimits(res);
                      if (delta.amount > 0) {
                          //Terminal has surplus material
                          var load = Math.abs(delta.amount);
                          if (load > this.carryCapacity) {
                              load = this.carryCapacity;
                          }
                          if( !this.room.storage.isAlmostFull() ) {
                              if (this.withdraw(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                                  this.travelTo(this.room.terminal);
                              }
                          }
                          terminalDelta++;
                          break;
                      }
                  }

                  if (terminalDelta == 0) {
                      //Check for surplus material in terminal
                      var breaker = false;
                      for (var res in this.room.storage.store) {
                          delta = this.checkTerminalLimits(res);
                          if (delta.amount < 0) {
                              //Terminal needs material from storage
                              var load = Math.abs(delta.amount);
                              if (load > this.carryCapacity) {
                                  load = this.carryCapacity;
                              }
                              if ( !this.room.terminal.isAlmostFull() ) {
                                
                                  if (this.withdraw(this.room.storage, res, load) == ERR_NOT_IN_RANGE) {
                                      this.travelTo(this.room.storage);
                                  }
                              }
                              breaker = true;
                              break;
                          }
                      }

                  }
              }
          }
      }
    }
};
