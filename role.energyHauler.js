Creep.prototype.roleEnergyHauler = function() {
    if (this.ticksToLive == 1) {
      console.log(this.name + ' - livetime hauled - ' + this.memory.totalenergyhauled + ' - Flag - ' + this.memory.currentFlag);
    }
    if (_.sum(this.carry) == 0) {
        // switch state to collecting
        if (this.memory.working == true) {
            delete this.memory._move;
        }
        this.memory.working = false;
    }
    else if (_.sum(this.carry) == this.carryCapacity || (this.room.name == this.memory.homeroom && _.sum(this.carry) > 0)) {
        // creep is collecting energy but is full
        if (this.memory.working == false) {
            delete this.memory._move;
        }
        this.memory.working = true;
    }
    if (this.memory.working == true) {
        // creep is supposed to transfer energy to a structure
        // Find construction sites
        var constructionSites = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 5);

        if (constructionSites.length > 0 && this.room.name != this.memory.homeroom) {
            // Construction sites found, build them!
            let site = this.pos.findClosestByPath(constructionSites);
            if (this.build(site) == ERR_NOT_IN_RANGE) {
                this.moveTo(site);
            }
        }
        else {
            // Move to structure
            var road = this.pos.lookFor(LOOK_STRUCTURES);
            if (this.room.controller != undefined && (this.room.controller.owner == undefined || this.room.controller.owner.username != Game.getObjectById(this.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom) {
                // Found road to repair
                if (this.getActiveBodyparts(WORK) > 0) {
                    this.repair(road[0]);
                }
                else {
                    var spawn = Game.getObjectById(this.memory.spawn);
                    this.moveTo(spawn)
                }
            }
            else {
                if (this.room.name != this.memory.homeroom) {
                    // Find exit to spawn room
                    //this.moveTo(Game.getObjectById(this.memory.spawn))
                    this.moveTo(Game.getObjectById(this.memory.spawn).pos);
                }
                else {
                    // back in spawn room
                    var structure;
                    // if (this.room.storage != undefined) {
                    //     structure = this.room.storage;
                    // }
                    if (_.sum(this.carry) == this.carry[RESOURCE_ENERGY]) {
                        //Creep has only energy loaded
                        // structure = this.findResource(global.RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_EXTENSION);
                        structure = this.findResource(global.RESOURCE_SPACE, STRUCTURE_LINK, STRUCTURE_STORAGE);
                    }
                    else {
                        //Creep has minerals loaded
                        structure = this.findResource(global.RESOURCE_SPACE, STRUCTURE_CONTAINER);
                    }
                    if (structure == undefined) {
                      structure = Game.getObjectById(this.memory.spawn);
                    }

                    // if we found one
                    if (structure != null) {
                        // try to transfer energy, if it is not in range
                        if (this.memory.totalenergyhauled == undefined) {
                          this.memory.totalenergyhauled = 0;
                        }
                        var carriedEnergyBefore = this.carry[RESOURCE_ENERGY];

                        if (structure.store != undefined && structure.storeCapacity != undefined) {
                            var structureTotalAmount = 0;
                            for (var curResource in structure.store) {
                              structureTotalAmount += structure.store[curResource];
                            }
                            var structureRemainingCapacity = structure.storeCapacity - structureTotalAmount;
                        }

                        for (let c in this.carry) {
                            var amountToTransfer = 0;
                            if (this.carry[c] < structureRemainingCapacity) {
                                amountToTransfer = this.carry[c];
                            }
                            else
                            {
                              amountToTransfer = structureRemainingCapacity;
                            }
                            var result = this.transfer(structure, c, amountToTransfer);
                            switch (result) {
                              case ERR_NOT_IN_RANGE :
                                  this.moveTo(structure, {reusePath: moveReusePath(), ignoreCreeps: false});
                                  break;
                              case OK :
                                  if (c == RESOURCE_ENERGY) {
                                      this.memory.totalenergyhauled += amountToTransfer ;
                                      //console.log(this.name + ' - ' + this.memory.totalenergyhauled);
                                  }
                              break;

                              default:
                              if (c == RESOURCE_ENERGY) {
                                  this.drop(c);

                              }
                              break;
                            }
                          }
                    }
                    else {

                        this.say("No Structure!");
                    }
                }
            }
        }
    }
    // if creep is supposed to harvest energy from source
    else {
        //Find remote source
        var remoteSource = Game.flags[this.findMyFlag("haulEnergy")];
        if (remoteSource != undefined) {
            // Find exit to target room
            if (this.room.name != remoteSource.pos.roomName) {
                //still in old room, go out
                this.moveTo(remoteSource);
            }
            else {
                //new room reached, start collecting
                if (this.room.memory.hostiles.length == 0) {
                    let flag = Game.flags[this.memory.currentFlag];
                    //No enemy creeps
                    let container = flag.pos.lookFor(LOOK_STRUCTURES);
                    container = _.filter(container, {structureType: STRUCTURE_CONTAINER});
                    if (container.length > 0) {
                        for (let s in container[0].store) {
                            if (this.withdraw(container[0], s) == ERR_NOT_IN_RANGE) {
                                //this.moveTo(container[0]);
                                this.moveTo(container[0].pos);
                            }
                        }
                    }
                    else {
                        // this.roleCollector();
                    }
                }
                else {
                    //Hostiles creeps in new room
                    this.memory.fleeing = true;
                    this.goToHomeRoom();
                }
            }
        }
    }
};
