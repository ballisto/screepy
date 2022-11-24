Room.prototype.log = function(...messages) {
    console.log(`${Game.time} ${this.name.padEnd(27)} ${messages.join(' ')}`);
  };
  
  RoomObject.prototype.log = function(...messages) {
    console.log(`${Game.time} ${this.room.name.padEnd(6)} ${this.name.padEnd(20)} ${this.pos} ${messages.join(' ')}`);
  };
  
  Room.prototype.my = function() {
    if(this.controller != undefined && this.controller.my) {return true;}
    else {return false;}
  }
  
  Room.prototype.exectueEveryTicks = function(ticks) {
      if(this.controller != undefined)  {
          return (Game.time + this.controller.pos.x + this.controller.pos.y) % ticks === 0;
      }
      else {
          return -1;
      }
    
  };
  
  Room.prototype.run = function() {
    this.refreshMemory();
    this.setDefaultResourceLimits();
    this.cleanupMemory();
    
    this.spawn();
    this.setDistributorPosition();
    this.updateLinkPriorities();
    this.saveHostiles();
    
    this.manageRamparts();
    
    this.handleNukeAttack();
    this.fortifyRCL8();
    this.transferOverstock();
    
    // console.log("Caretaker taking care of room " + this.name);
    this.memory.lastcaretaker = Game.time;
  }
  
  Room.prototype.transferOverstock = function() {
      if ( this.memory.terminalTransfer == undefined && this.storage != undefined && _.sum(this.storage.store) > 800000) {
        for (let r in this.storage.store) {
            if ( this.memory.resourceLimits != undefined && this.memory.resourceLimits[r] != undefined && global.mineralDescriptions[r] != undefined) {
                if ((global.mineralDescriptions[r].tier == 0) && r !== 'energy' && this.storage.store[r] > 100  && this.storage.store[r] > this.memory.resourceLimits[r].maxStorage + 2000 ) {
                    let transferAmount = 1000;
                    if (this.storage.store[r] < 1000) { transferAmount = this.storage.store[r];}
                    terminalTransferX(r, transferAmount, this.name, 'W53N18', true);
                    // console.log(this.name + " "  + r + " - " + this.storage.store[r]);
                    // console.log( (global.mineralDescriptions[r].tier) );
                    // 
                }
            }
        }
      }
      
  }
  
  Room.prototype.factory =
      function () {
        //   this.checkCache();
        //   if ( cache.rooms[this.name].factoryCounter == undefined) {
        //       cache.rooms[this.name].factoryCounter = 1;
        //   }
        //   else {
        //       cache.rooms[this.name].factoryCounter +=1;
        //   }
        //   console.log(cache.rooms[this.name].factoryCounter);
        //   if ( cache.rooms[this.name].factoryInstance == undefined) {
        //       cache.rooms[this.name].factoryInstance = new Factory(this.name);
        //   }
        // return cache.rooms[this.name].factoryInstance;
      };
  
  Room.prototype.getBoostLabs = function() {
    var result = {};
    if(this.memory != undefined && this.memory.boostLabs != undefined) {
      for (const l in this.memory.boostLabs) {
        result[l] = this.memory.boostLabs[l];
      }
    }
    return result;
  };
  
  Room.prototype.getDistributorPosition = function() {
    if(this.storage != undefined && this.terminal == undefined && this.storage.my) {
      let posAdjToStorage = Array.from(this.storage.pos.getAllAdjacentPositions());
      let linksPrio1 = _.filter(this.find(FIND_MY_STRUCTURES), (l) => l.structureType == STRUCTURE_LINK && l.getPriority() ==1);
      for (let l in linksPrio1) {
          let linkAdjPosAdjToStorage = [];
          let adjPosToCurLink = Array.from(linksPrio1[l].pos.getAllAdjacentPositions());
          for (let p in adjPosToCurLink) {                
              for(let s in posAdjToStorage) {
                  if(adjPosToCurLink[p].isEqualTo(posAdjToStorage[s])) {
                      return adjPosToCurLink[p];
                      // linkAdjPosAdjToStorage.push(adjPosToCurLink[p]);
                  }
              }              
          }
        }
    }
    if(this.storage != undefined && this.terminal != undefined && this.storage.my && this.terminal.my) {
        let posAdjToStorage = Array.from(this.storage.pos.getAllAdjacentPositions());
        let posAdjToTerminal = Array.from(this.terminal.pos.getAllAdjacentPositions());
        let linksPrio1 = _.filter(this.find(FIND_MY_STRUCTURES), (l) => l.structureType == STRUCTURE_LINK && l.getPriority() ==1);
        for (let l in linksPrio1) {
            let linkAdjPosAdjToStorage = [];
            let adjPosToCurLink = Array.from(linksPrio1[l].pos.getAllAdjacentPositions());
            for (let p in adjPosToCurLink) {                
                for(let s in posAdjToStorage) {
                    if(adjPosToCurLink[p].isEqualTo(posAdjToStorage[s])) {
                        linkAdjPosAdjToStorage.push(adjPosToCurLink[p]);
                    }
                }                
            }
            for(let t in linkAdjPosAdjToStorage) {
                for(let x in posAdjToTerminal) {
                    if(linkAdjPosAdjToStorage[t].isEqualTo(posAdjToTerminal[x])) {
                        return linkAdjPosAdjToStorage[t];
                    }
                }
            }
        }
    }
    return -1;
  };
  
  Room.prototype.updateLinkPriorities = function() {
    if ( this.memory.links != undefined) {   
  
      for (var linkId in this.memory.links) {
          let curLink = Game.getObjectById(linkId)
          if (curLink != undefined) {
            curLink.autoSetPriority();
          }
      }
    }
  }
  
  Room.prototype.setDistributorPosition = function() {
    if( this.memory.position == undefined || this.memory.position.creep == undefined) {
        this.memory.position = {
            creep: {},
          };
    }
    this.memory.position.creep['distributor'] = this.getDistributorPosition();
  }
  
  Room.prototype.myCreeps =
      function () {
          return this.find(FIND_MY_CREEPS);
      };
  Room.prototype.hostileCreeps =
        function () {
            return _.filter(this.find(FIND_HOSTILE_CREEPS), (h) => !h.isAlly());
        };
  Room.prototype.isSafe = function() {
    var loadedEnemyTowers = _.filter(this.find(FIND_STRUCTURES), (a) => a.energy > 0 && a.structureType == STRUCTURE_TOWER && !a.my );
    if(loadedEnemyTowers.length > 0) {return false;}
  
    if( (_.filter(this.hostileCreeps(), function(h) {return h.isDangerous();})).length > 0 ) {return false;}
    return true;
  };
  
  Room.prototype.refreshMemory =
      function () {
        let roomCreeps = this.myCreeps();
        if (this.my() && this.memory.roomArray != undefined) {
               
          let searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
          for (let s in searchResult) {
  
              delete this.memory.linkInfrastructure;
  
              if(this.memory.links == undefined) {this.memory.links = {};}
              if(this.memory.links[searchResult[s].id] == undefined)  {this.memory.links[searchResult[s].id] = {};}
              if(this.memory.links[searchResult[s].id].priority == undefined) {this.memory.links[searchResult[s].id].priority = 0;}
             
          }
                
        }
  
  
        //  Refresher
        if (this.my() && this.memory.roomArray == undefined) {
            this.memory.roomArray = {};
        }
        else if (this.memory.roomArray == undefined && this.controller != undefined && roomCreeps.length > 0) {
            this.memory.roomArray = {};
        }
  
        let searchResult;
        if ((roomCreeps.length > 0 || (this.my())) && (Game.time % global.DELAYROOMSCANNING == 0 || this.memory.roomArray == undefined)) {
            // Determining whether room secure
  
            var defenseObjects = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
            defenseObjects = _.sortBy(defenseObjects,"hits");
  
            if (defenseObjects != undefined && defenseObjects[0] != undefined && ((this.controller != undefined && this.controller.level == 8 && defenseObjects[0].hits > global.WALLMAX * 3) || (this.controller != undefined && this.controller.level < 8 && defenseObjects[0].hits > global.WALLMAX))) {
                this.memory.roomSecure = true;
            }
            else if (this.memory.roomSecure != undefined) {
                delete this.memory.roomSecure;
            }
  
            if (this.memory.roomArray == undefined) {
                this.memory.roomArray = {};
            }
  
            // Preloading room structure
            if (this.memory.roomArraySources != undefined) {
                delete this.memory.roomArraySources;
            }
            var sourceIDs = [];
            searchResult = this.find(FIND_SOURCES);
            for (let s in searchResult) {
                sourceIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.sources = sourceIDs;
  
            if (this.memory.roomArrayMinerals != undefined) {
                delete this.memory.roomArrayMinerals;
            }
            var mineralIDs = [];
            searchResult = this.find(FIND_MINERALS);
            for (let s in searchResult) {
                mineralIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.minerals = mineralIDs;
  
            if (this.memory.roomArrayContainers != undefined) {
                delete this.memory.roomArrayContainers;
            }
            var containerIDs = [];
            searchResult = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
            for (let s in searchResult) {
                containerIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.containers = containerIDs;
  
            if (this.memory.roomArrayPowerSpawns != undefined) {
                delete this.memory.roomArrayPowerSpawns;
            }
            var powerSpawnIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN});
            for (let s in searchResult) {
                powerSpawnIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.powerSpawns = powerSpawnIDs;
  
            if (this.memory.roomArraySpawns != undefined) {
                delete this.memory.roomArraySpawns;
            }
            var spawnIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
            for (let s in searchResult) {
                spawnIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.spawns = spawnIDs;
  
            if (this.memory.roomArrayExtensions != undefined) {
                delete this.memory.roomArrayExtensions;
            }
            var extensionIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
            for (let s in searchResult) {
                extensionIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.extensions = extensionIDs;
  
            if (this.memory.roomArrayLinks != undefined) {
                delete this.memory.roomArrayLinks;
            }
            
  
  
            if (this.memory.roomArrayLabs != undefined) {
                delete this.memory.roomArrayLabs;
            }
            var LabIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});
            for (let s in searchResult) {
                LabIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.labs = LabIDs;
  
            if (this.memory.roomArrayExtractors != undefined) {
                delete this.memory.roomArrayExtractors;
            }
            var ExtractorIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
            for (let s in searchResult) {
                ExtractorIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.extractors = ExtractorIDs;
  
            if (this.memory.roomArrayRamparts != undefined) {
                delete this.memory.roomArrayRamparts;
            }
            var rampartIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
            for (let s in searchResult) {
                rampartIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.ramparts = rampartIDs;
  
            if (this.memory.roomArrayNukers != undefined) {
                delete this.memory.roomArrayNukers;
            }
            var nukerIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER});
            for (let s in searchResult) {
                nukerIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.nukers = nukerIDs;
  
            if (this.memory.roomArrayObservers != undefined) {
                delete this.memory.roomArrayObservers;
            }
            var observerIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_OBSERVER});
            for (let s in searchResult) {
                observerIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.observers = observerIDs;
  
            if (this.memory.roomArrayTowers != undefined) {
                delete this.memory.roomArrayTowers;
            }
            var towerIDs = [];
            searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
            for (let s in searchResult) {
                towerIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.towers = towerIDs;
  
            if (this.memory.roomArrayLairs != undefined) {
                delete this.memory.roomArrayLairs;
            }
            var lairIDs = [];
            searchResult = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR});
            for (let s in searchResult) {
                lairIDs.push(searchResult[s].id);
            }
            this.memory.roomArray.lairs = lairIDs;
        }
        //Check master spawn
        if (this.memory.masterSpawn != undefined && Game.getObjectById(this.memory.masterSpawn) == null) {
            delete this.memory.masterSpawn;
        }
        if (this.memory.masterSpawn == undefined && this.memory.roomArray != undefined && this.memory.roomArray.spawns != undefined) {
            if (this.memory.roomArray.spawns.length == 1) {
                this.memory.masterSpawn = this.memory.roomArray.spawns[0];
            }
            else if (this.memory.roomArray.spawns.length > 1) {
                for (var id in this.memory.roomArray.spawns) {
                    var testSpawn = Game.getObjectById(this.memory.roomArray.spawns[id]);
                    if (testSpawn.memory.spawnRole == 1) {
                        this.memory.masterSpawn = this.memory.roomArray.spawns[id];
                    }
                }
            }
        }
  
  
      };
  Room.prototype.cleanupMemory =
      function () {
      if ( this.memory.links != undefined) {   
  
        for (var linkId in this.memory.links) {
              if (Game.getObjectById(linkId) == undefined ) {
                // console.log(this.name + linkId);
                delete this.memory.links[linkId];
              }
        }
      }
  };
  
  Room.prototype.setDefaultResourceLimits =
      function () {
        //Set default resource limits:
        if ( this.my()) {
          let roomLimits = {};
          let limit;
          if (this.memory.resourceLimits == undefined ) {
              
              for (var res in RESOURCES_ALL) {
                  roomLimits[RESOURCES_ALL[res]] = {};
  
                  if (this.memory.roomArray != undefined && this.memory.roomArray.minerals != undefined && this.memory.roomArray.minerals.length > 0 && Game.getObjectById(this.memory.roomArray.minerals[0]).mineralType == RESOURCES_ALL[res]) {
                      //Room mineral
                      limit = {minTerminal:0, maxStorage:6000, minMarket:500000, minProduction: 600000};
                  }
                  else if (RESOURCES_ALL[res] == RESOURCE_ENERGY) {
                      //Energy
                      limit = {minTerminal:0, maxStorage:100000, minMarket:900000, minProduction: 1000000};
                  }
                  else {
                      // Rest
                      limit = {minTerminal:0, maxStorage:6000, minMarket:900000, minProduction: 0};
                  }
                  roomLimits[RESOURCES_ALL[res]] = limit;
              }
              this.memory.resourceLimits = roomLimits;
          }
          else {
            for (var res in RESOURCES_ALL) {
              if ( this.memory.resourceLimits[RESOURCES_ALL[res]] == undefined) {
                this.memory.resourceLimits[RESOURCES_ALL[res]] = {minTerminal:0, maxStorage:6000, minMarket:900000, minProduction: 0};
                  // console.log(this.name + RESOURCES_ALL[res] + ' - ' + this.memory.resourceLimits[RESOURCES_ALL[res]]);
              }
            }
          }
        }
      };
  Room.prototype.saveHostiles =
      function () {
        let roomCreeps = this.find(FIND_MY_CREEPS);
        var hostiles = this.find(FIND_HOSTILE_CREEPS);
        let enemies = _.filter(hostiles, function (e) {return (e.isHostile())});
        this.memory.hostiles = [];
        for (let e in enemies) {
            this.memory.hostiles.push(enemies[e].id);
        }
      };
  
  Room.prototype.fortifyRCL8 = function () {
    if(this.my() && this.controller.level == 8) {
      let structures = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_STORAGE});
      for (let s in structures) {
          let foundStructures = structures[s].pos.lookFor(LOOK_STRUCTURES);
          foundStructures = foundStructures.concat(structures[s].pos.lookFor(LOOK_CONSTRUCTION_SITES));
          let ramparts = _.filter(foundStructures, function (s) { return s.structureType == STRUCTURE_RAMPART});
          if (ramparts.length == 0) {
              structures[s].pos.createConstructionSite(STRUCTURE_RAMPART);
          }
      }
    }
  };
  
  Room.prototype.manageRamparts =
      function () {
  
        //Manage ramparts
  
        // let roomCreeps = this.find(FIND_MY_CREEPS);
        // var hostiles = this.find(FIND_HOSTILE_CREEPS);
        // let enemies = _.filter(hostiles, function (e) {return (isHostile(e))});
        //
        // if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername) {
        //     if (this.memory.roomArray != undefined && enemies.length == 0) {
        //         //Allied creeps in room and no hostile creeps
        //         for (let x in this.memory.roomArray.ramparts) {
        //             let ramp = Game.getObjectById(this.memory.roomArray.ramparts[x]);
        //             if (ramp != null) {
        //                 ramp.setPublic(true)
        //             }
        //         }
        //     }
        //     else if (this.memory.roomArray != undefined) {
        //         for (let x in this.memory.roomArray.ramparts) {
        //             let ramp = Game.getObjectById(this.memory.roomArray.ramparts[x]);
        //             if (ramp != null) {
        //                 ramp.setPublic(false)
        //             }
        //         }
        //     }
        // }
      };
  Room.prototype.supportNewRoom = function() {
    
      if (this.memory.roomArray != undefined && (this.memory.roomArray.spawns == undefined || this.memory.roomArray.spawns.length == 0)) {
        //room has no spawn yet
        //console.log('bloed');
        if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername) {
            //room is owned and should be updated
            var claimFlags = this.find(FIND_FLAGS, { filter: (s) => s.pos.roomName == this.name && s.memory.function == "remoteController"});
            var upgraderRecruits = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: this.name}});
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
                        if(Game.rooms[x] != undefined && Game.rooms[x] != this){
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
                        targetCreep.memory.homeroom = this.name;
                        targetCreep.memory.spawn = this.controller.id;
                        console.log("<font color=#ffff00 type='highlight'>" + targetCreep.name + " has been captured in room " + targetCreep.pos.roomName + " as an upgrader by room " + this.name + ".</font>");
                        break;
                    }
                }
            }
  
            var BuilderRecruits = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: this.name}});
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
                        if(Game.rooms[x] != undefined && Game.rooms[x] != this){
                            var newBuilders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "repairer" && s.carry.energy == 0});
                            if (newBuilders.length > 0) {
                                targetCreepBuilder = newBuilders[0];
                                roomName=Game.rooms[x].name;
                            }
                        }
                    }
                }
                if (targetCreepBuilder != undefined && targetCreepBuilder.carry.energy == 0 && targetCreepBuilder.ticksToLive > 500) {
                    targetCreepBuilder.memory.homeroom = this.name;
                    targetCreepBuilder.memory.spawn =  this.controller.id;
                    console.log("<font color=#ffff000 type='highlight'>" + targetCreepBuilder.name + " has been captured in room " + targetCreepBuilder.pos.roomName + " as a repairer by room " + this.name + ".</font>");
                }
            }
  
        }
    }    
  };
  
  Room.prototype.runTerminal = function() {
    if (this.my() && this.terminal != undefined && this.terminal.owner.username == global.playerUsername && this.terminal.cooldown == 0) {
      let terminal = this.terminal;
      terminal.run();
    }
  };
  
  Room.prototype.runLinks = function() {
    if (this.my() && this.memory.links != undefined) {  
  
      for (var linkId in this.memory.links) {
          var link = Game.getObjectById(linkId);
  
          if ( link != undefined && link.energy > 0 && link.cooldown == 0) {
            var targetLink = null;
            targetLink = link.getTargetLink();
            if (targetLink != undefined && targetLink != null && (link.bringEnergy() || (targetLink.energyCapacity - targetLink.energy) >= link.energy)) {
              link.transferEnergy(targetLink);
              break;
            }
          }
        }
      }
  };
  
  Room.prototype.runTowers = function() {
    if ( this.my() ) {
      let towers = _.filter(this.find(FIND_MY_STRUCTURES), (a) => a.structureType == STRUCTURE_TOWER);
      if ( towers.length > 0 ) {
        let damagedStructures = _.filter(this.find(FIND_MY_STRUCTURES), (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART);
        damagedStructures = damagedStructures.concat(_.filter(this.find(FIND_STRUCTURES), (s) => s.hits < s.hitsMax && (s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) ));
        var maxDamagedStructure = null;
        if(damagedStructures.length > 0) {
            maxDamagedStructure = _.max(damagedStructures, (s) => s.hitsMax - s.hits);
        }
        // console.log(this.name + ' - ' + maxDamagedStructure);
        // if(thisIndex == 'W58S2'){console.log(maxDamagedStructure);}
        
        // console.log(sortedDamagedStructures)
        
        let ramparts = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < s.hitsMax && s.hits < 10000000});
        let weakRamparts = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < s.hitsMax && s.hits < 100000});
        ramparts = _.sortBy(ramparts,"hits");
  
        var wallsAndRamparts = this.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)  && s.hits < s.hitsMax && s.hits < 100000000});
        wallsAndRamparts = _.sortBy(wallsAndRamparts,"hits");
        
        const nukes = this.find(FIND_NUKES);
        
        const sortedNukes = _.sortBy(nukes, (object) => {
            return object.timeToLand;
        });
        
        let wounded = this.find(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax });
        
        var repairTarget = null;
  
        const hostiles = this.hostileCreeps();
        if(hostiles.length > 0 && hostiles.length < 3) {         
        
            for (var t in towers) {
                towers[t].attack(hostiles[0]);
            }
            
            return true;
        }
        
        else if (wounded.length > 0) {
            // Tower healing code
            for (var tower in towers) {
                let towerTarget = towers[tower].pos.findClosestByRange(wounded);
                towers[tower].heal(towerTarget);
            }
            return true;
        }
        
        else if (sortedNukes.length > 0) {
            for(const n in sortedNukes) {
                let structuresOnNukePos = sortedNukes[n].pos.lookFor(LOOK_STRUCTURES);
                let rampartsOnNukePos = _.filter(structuresOnNukePos, function (s) { return s.structureType == STRUCTURE_RAMPART && s.hits <= 11000000});
                if(rampartsOnNukePos.length > 0) {
                    repairTarget = rampartsOnNukePos[0];                                
                }
                else {
                    const structuresInRange = sortedNukes[n].pos.findInRange(FIND_STRUCTURES, 4);
                    const sortedStructuresInRange = _.sortBy(structuresInRange, (s) => s.defensePriority());
                    const rampartsInRange = _.filter(sortedStructuresInRange, (s) => s.structureType == STRUCTURE_RAMPART);
                    
                    for(const r in rampartsInRange) {
                        if(rampartsInRange[r].hits < 6000000) {
                            repairTarget = rampartsInRange[r];
                            break;                                        
                        }
                    }
                }
            }
        }
                  
        else if(maxDamagedStructure != undefined) {
            repairTarget = maxDamagedStructure;
            // console.log(this.name + ' - ' + maxDamagedStructure);
        }
        
        else if(weakRamparts.length > 0) {
            repairTarget = weakRamparts[0];
        }
        else if(this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > 700000 && wallsAndRamparts.length > 0) {
            repairTarget = wallsAndRamparts[0];
        }
        
        else if(this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > 100000 && ramparts.length > 0) {
            let structures = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_STORAGE});
            sortedCriticalStructures = _.sortBy(structures, (s) => s.defensePriority());
            for (let s in sortedCriticalStructures) {
                let foundStructures = sortedCriticalStructures[s].pos.lookFor(LOOK_STRUCTURES);
                foundStructures = foundStructures.concat(sortedCriticalStructures[s].pos.lookFor(LOOK_CONSTRUCTION_SITES));
                let criticalRamparts = _.filter(foundStructures, function (s) { return s.structureType == STRUCTURE_RAMPART && s.hits <= 11000000});
                let sortedCriticalRamparts = _.sortBy(criticalRamparts, (r) => r.hits);
                
                // console.log(criticalRamparts)
                if (criticalRamparts.length > 0) {
                    repairTarget = sortedCriticalRamparts[0];
                    break;
                }
            }
        }
        
        if ( this.name == 'W57S4' && this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > 10000 ) {
            let outerWalls = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL && (s.pos.x == 41 || s.pos.x == 42)});
            if ( outerWalls.length > 0) {
                sortedOuterWalls = _.sortBy(outerWalls, (w) => w.hits);
                repairTarget = sortedOuterWalls[0];
            }
        }
        
        // Repair if target found
        if(repairTarget != undefined) {
            for(var i in towers){
                if(towers[i].energy > (towers[i].energyCapacity / 10)* 5) {
                    towers[i].repair(repairTarget);
                }
            }  
            return true;
        }
      }
    }
  };
  
  Room.prototype.getCreepPositionForId = function(to) {
    if (this.memory.position && this.memory.position.creep && this.memory.position.creep[to]) {
      const pos = this.memory.position.creep[to];
      return new RoomPosition(pos.x, pos.y, this.name);
    }
  
    const target = Game.getObjectById(to);
    if (target === null) {
      // this.log('getCreepPositionForId: No object: ' + to);
      return;
    }
    this.memory.position = this.memory.position || {
      creep: {},
    };
    this.memory.position.creep[to] = target.pos.findNearPosition().next().value;
  
    let pos = this.memory.position.creep[to];
    if (!pos) {
      // this.log('getCreepPositionForId no pos in memory take pos of target: ' + to);
      pos = Game.getObjectById(to).pos;
    }
    return new RoomPosition(pos.x, pos.y, this.name);
  };
  
  Room.prototype.findRoute = function(from, to) {
    const routeCallback = function(roomName, fromRoomName) {
      if (roomName === to) {
        return 1;
      }
  
      if (Memory.rooms[roomName] && Memory.rooms[roomName].state === 'Occupied') {
        //         console.log(`Creep.prototype.getRoute: Do not route through occupied rooms ${roomName}`);
        if (config.path.allowRoutingThroughFriendRooms && friends.indexOf(Memory.rooms[roomName].player) > -1) {
          console.log('routing through friendly room' + roomName);
          return 1;
        }
        //         console.log('Not routing through enemy room' + roomName);
        return Infinity;
      }
  
      if (Memory.rooms[roomName] && Memory.rooms[roomName].state === 'Blocked') {
        //         console.log(`Creep.prototype.getRoute: Do not route through blocked rooms ${roomName}`);
        return Infinity;
      }
  
      return 1;
    };
    return Game.map.findRoute(from, to, {
      routeCallback: routeCallback,
    });
  };
  
  Room.prototype.buildPath = function(route, routePos, from, to) {
    if (!to) {
      this.log('newmove: buildPath: no to from: ' + from + ' to: ' + to + ' routePos: ' + routePos + ' route: ' + JSON.stringify(route));
      throw new Error();
    }
    let start;
    if (routePos === 0 || from === 'pathStart') {
      start = this.getCreepPositionForId(from);
    } else {
      start = this.getMyExitTo(from);
    }
    let end;
    if (routePos < route.length - 1) {
      end = this.getMyExitTo(to);
    } else {
      end = this.getCreepPositionForId(to);
      if (!end) {
        return;
      }
    }
    const search = PathFinder.search(
      start, {
        pos: end,
        range: 1,
      }, {
        roomCallback: this.getCostMatrixCallback(end),
        maxRooms: 1,
        swampCost: config.layout.swampCost,
        plainCost: config.layout.plainCost,
      }
    );
  
    search.path.splice(0, 0, start);
    search.path.push(end);
    return search.path;
  };
  
  // Providing the targetId is a bit odd
  Room.prototype.getPath = function(route, routePos, startId, targetId, fixed) {
    if (!this.memory.position) {
      this.log('getPath no position');
      this.updatePosition();
    }
  
    let from = startId;
    if (routePos > 0) {
      from = route[routePos - 1].room;
    }
    let to = targetId;
    if (routePos < route.length - 1) {
      to = route[routePos + 1].room;
    }
  
    const pathName = from + '-' + to;
    if (!this.getMemoryPath(pathName)) {
      const path = this.buildPath(route, routePos, from, to);
      if (!path) {
        // this.log('getPath: No path');
        return;
      }
      this.setMemoryPath(pathName, path, fixed);
    }
    return this.getMemoryPath(pathName);
  };
  
  Room.prototype.getMyExitTo = function(room) {
    // Handle rooms with newbie zone walls
    const exitDirection = this.findExitTo(room);
    const nextExits = this.find(exitDirection);
    const nextExit = nextExits[Math.floor(nextExits.length / 2)];
    return new RoomPosition(nextExit.x, nextExit.y, this.name);
  };
  Room.prototype.legacyProduction = function() {
      // Production Code
      if (Game.cpu.bucket > global.CPU_THRESHOLD && Game.time % global.DELAYPRODUCTION == 0 && this.memory.innerLabs != undefined && this.memory.innerLabs[0].labID != "[LAB_ID]" && this.memory.innerLabs[1].labID != "[LAB_ID]"
      && this.memory.labOrder == undefined && this.memory.labTarget == undefined) {
          for (let res in RESOURCES_ALL) {
              
          //go thru resources, not energy, not power, tier > 0
              if (RESOURCES_ALL[res] != RESOURCE_ENERGY && RESOURCES_ALL[res] != RESOURCE_POWER && global.mineralDescriptions[RESOURCES_ALL[res]] != undefined && global.mineralDescriptions[RESOURCES_ALL[res]].tier > 0) {
                  var storageLevel;
                  if (this.storage.store[RESOURCES_ALL[res]] == undefined) {
                      storageLevel = 0;
                  }
                  else {
                      storageLevel = this.storage.store[RESOURCES_ALL[res]];
                  }
                  //resource in storage is less than minProduction
                  if ((storageLevel) < this.memory.resourceLimits[RESOURCES_ALL[res]].minProduction) {
                      //Try to produce resource
                      let resource = RESOURCES_ALL[res];
                      //delta is missing amount to reach minProduction
                      let delta = Math.ceil((this.memory.resourceLimits[resource].minProduction - storageLevel)/10)*10;
                      if(delta > 3000) {delta =3000;}
                      //delta is bigger than 20% of minProduction or more than 3000
                      
                      if (delta >= this.memory.resourceLimits[resource].minProduction * 0.2 || delta >= 3000) {
                          let genuineDelta = delta;
                          //determine components missing, try to make missing components
                          var productionTarget = whatIsLackingFor(this, delta, resource);
                          let minProductionPacketSize = 100;
                          // console.log(r + ' - ' + resource + ' - '+ JSON.stringify(productionTarget))
                          while (global.mineralDescriptions[productionTarget.resource].tier > 0 && this.memory.labTarget == undefined && Game.cpu.getUsed() < 250) {
                              if (productionTarget.amount == 0) {
                                  productionTarget.amount = genuineDelta;
                              }
                              // console.log(r + ' - ' + productionTarget.resource + ' - ' + global.mineralDescriptions[productionTarget.resource].component1 + ' - '+ this.storage.store[global.mineralDescriptions[productionTarget.resource].component1]);
                              // console.log(r + ' - ' + productionTarget.resource + ' - ' + global.mineralDescriptions[productionTarget.resource].component2 + ' - '+ this.storage.store[global.mineralDescriptions[productionTarget.resource].component2]);
                              if (this.storage.store[global.mineralDescriptions[productionTarget.resource].component1] >= minProductionPacketSize &&
                                  this.storage.store[global.mineralDescriptions[productionTarget.resource].component2] >= minProductionPacketSize) {
                                  //All components ready, start production
                                  console.log(this.name + ' - ' + resource + ' - '+ delta);
                                  let reactionAmount = Math.min(this.storage.store[global.mineralDescriptions[productionTarget.resource].component1], this.storage.store[global.mineralDescriptions[productionTarget.resource].component2]);
                                  if (reactionAmount > genuineDelta) {
                                      reactionAmount = genuineDelta;
                                  }
                                  this.memory.labTarget = reactionAmount + ":" + productionTarget.resource;
                                  if (global.LOG_INFO == true) {
                                      console.log("<font color=#ffca33 type='highlight'>Room " + this.name + " started auto production of " + reactionAmount + " " + productionTarget.resource + ".</font>");
                                  }
                              }
                              else if ( this.storage.store[global.mineralDescriptions[productionTarget.resource].component1] == undefined || this.storage.store[global.mineralDescriptions[productionTarget.resource].component1] < minProductionPacketSize) {
                                  resource = global.mineralDescriptions[productionTarget.resource].component1;
                              }
                              else if ( this.storage.store[global.mineralDescriptions[productionTarget.resource].component2] == undefined || this.storage.store[global.mineralDescriptions[productionTarget.resource].component2] < minProductionPacketSize) {
                                  resource = global.mineralDescriptions[productionTarget.resource].component2;
                              }
                              productionTarget = whatIsLackingFor(this, genuineDelta, resource);
                          }

                          if (global.mineralDescriptions[productionTarget.resource].tier == 0) {
                              //Tier 0 resource missing
                              this.memory.lastMissingComponent = productionTarget.resource;
                          }
                      }
                  }
              }
          }
      }
  };

  Room.prototype.legacyLabCode = function() {
    // Lab code
    if (Game.time % global.DELAYPRODUCTION == 0 && Game.cpu.bucket > global.CPU_THRESHOLD && this.memory.labTarget != undefined && this.memory.labOrder == undefined) {
        // Lab Queueing Code
        var labString = this.memory.labTarget.split(":");
        var origAmount = labString[0];
        var origResource = labString[1];
        if (global.mineralDescriptions[labString[1]].tier == 0) {
            delete this.memory.labTarget;
        }
        else {
            while (global.mineralDescriptions[labString[1]] != undefined && global.mineralDescriptions[labString[1]].tier > 0) {
                var labTarget = global.whatIsLackingFor(this, labString[0], labString[1]);
                var missingComponent1 = global.mineralDescriptions[labTarget.resource].component1;
                var missingComponent2 = global.mineralDescriptions[labTarget.resource].component2;
                if (this.storage.store[missingComponent1] != undefined && this.storage.store[missingComponent2] != undefined
                    && this.storage.store[missingComponent1] >= labTarget.amount && this.storage.store[missingComponent2] >= labTarget.amount) {
                    //All component available
                    if (labTarget.amount == 0) {
                        labTarget.amount = origAmount;
                    }
                    this.memory.labOrder = labTarget.amount + ":" + missingComponent1 + ":" + missingComponent2 + ":prepare:" + Game.time;
                    if (missingComponent1 == global.mineralDescriptions[origResource].component1 && missingComponent2 == global.mineralDescriptions[origResource].component2) {
                        // Last production order given
                        delete this.memory.labTarget;
                    }
                    break;
                }
                else {
                    //Components missing
                    if (this.storage.store[missingComponent1] == undefined || this.storage.store[missingComponent1] < labTarget.amount) {
                        //Component 1 missing
                        if (this.storage.store[missingComponent1] == undefined) {
                            labString[0] = labTarget.amount;
                        }
                        else {
                            labString[0] = labTarget.amount - this.storage.store[missingComponent1];
                        }
                        labString[1] = missingComponent1;
                    }
                    else {
                        //Component 2 missing
                        if (this.storage.store[missingComponent2] == undefined) {
                            labString[0] = labTarget.amount;
                        }
                        else {
                            labString[0] = labTarget.amount - this.storage.store[missingComponent2];
                        }
                        labString[1] = missingComponent2;
                    }
                }
            }
        }

    }

    // Lab Production Code
    if (Game.time % global.DELAYLAB == 0 && Game.cpu.bucket > global.CPU_THRESHOLD) {
        if (this.memory.innerLabs == undefined) {
            // Prepare link roles
            var emptyArray = {};
            var innerLabs = [];
            emptyArray["labID"] = "[LAB_ID]";
            emptyArray["resource"] = "[RESOURCE]";
            innerLabs.push(emptyArray);
            innerLabs.push(emptyArray);
            this.memory.innerLabs = innerLabs;
        }
        if (this.memory.labOrder != undefined) { //FORMAT: 500:H:Z:[prepare/running/done]
            var innerLabs = [];
            if (this.memory.innerLabs == undefined) {
                // Prepare link roles
                var emptyArray = {};
                emptyArray["labID"] = "[LAB_ID]";
                emptyArray["resource"] = "[RESOURCE]";
                innerLabs.push(emptyArray);
                this.memory.innerLabs = innerLabs;
            }
            else if (this.memory.innerLabs[0].labID != "[LAB_ID]" && this.memory.innerLabs[1].labID != "[LAB_ID]") {
                innerLabs = this.memory.innerLabs;
                var labOrder = this.memory.labOrder.split(":");
                if (innerLabs.length == 2) {
                    //There are two innerLabs defined
                    if (innerLabs[0].resource != labOrder[1] || innerLabs[1].resource != labOrder[2]) {
                        //Set inner lab resource to ingredients
                        innerLabs[0].resource = labOrder[1];
                        innerLabs[1].resource = labOrder[2];
                        this.memory.innerLabs = innerLabs;
                    }
                    var rawAmount = labOrder[0];
                    var innerLab0 = Game.getObjectById(innerLabs[0].labID);
                    var innerLab1 = Game.getObjectById(innerLabs[1].labID);
                    if (innerLab0 != null && innerLab0 != undefined) {
                        
                        if (rawAmount > innerLab0.store.getCapacity(innerLab0.mineralType)) {
                            rawAmount = innerLab0.store.getCapacity(innerLab0.mineralType);
                        }
                        if (labOrder[3] == "prepare" && Game.getObjectById(innerLabs[0].labID).mineralType == innerLabs[0].resource && Game.getObjectById(innerLabs[0].labID).mineralAmount >= rawAmount
                            && Game.getObjectById(innerLabs[1].labID).mineralType == innerLabs[1].resource && Game.getObjectById(innerLabs[1].labID).mineralAmount >= rawAmount) {
                            labOrder[3] = "running";
                            this.memory.labOrder = labOrder.join(":");
                        }
                        else if(labOrder[3] == "prepare" && labOrder.length == 5 && (Game.time - labOrder[4]) > 400) {
                            delete this.memory.labOrder;
                            console.log(this.name + " lab order removed");
                        }
                        // else if(labOrder[3] == "prepare") {console.log(r);}
    
                        if (labOrder[3] == "running") {
                            // Reaction can be started
                            for (var lab in this.memory.roomArray.labs) {
                                // if (this.memory.boostLabs != undefined) { console.log(lab)}
                                // if(r == 'W58S3') { console.log(this.memory.boostLabs[this.memory.roomArray.labs[lab]]) }
                                if ((this.memory.boostLabs == undefined || this.memory.boostLabs[this.memory.roomArray.labs[lab]] == undefined) && this.memory.roomArray.labs[lab] != innerLabs[0].labID && this.memory.roomArray.labs[lab] != innerLabs[1].labID) {
                                    if (Game.getObjectById(innerLabs[0].labID).mineralAmount > 4 && Game.getObjectById(innerLabs[1].labID).mineralAmount > 4) {
                                        //Still enough material to do a reaction
                                        var currentLab = Game.getObjectById(this.memory.roomArray.labs[lab]);
                                        if (currentLab.cooldown == 0) {
                                            currentLab.runReaction(Game.getObjectById(innerLabs[0].labID), Game.getObjectById(innerLabs[1].labID));
                                        }
                                    }
                                    else {
                                        labOrder[3] = "done";
                                        this.memory.labOrder = labOrder.join(":");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                console.log("Inner links not defined in room " + this.name);
            }
        }
    }    
};