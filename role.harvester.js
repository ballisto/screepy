Creep.prototype.roleHarvester = function() {
    
    // if(this.room.name == 'W52S3') {
    //     if(_.sum(this.carry) > 0) {
    //         // console.log(this.name)
    //                                 //   this.storeAllBut();
    //                                 for(var r in this.carry){
    //                                     if(this.carry[r] >0) {
    //                                     // console.log(r)
    //                                     this.drop(r);
    //                                     return true;
    //                                     }
    //                                 }
    //                             }
    //     let containers = _.filter(this.room.find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER);
    //             for (var c in containers) {
    //                 // console.log(c)
    //                 if(containers[c].store != undefined) {
    //                     // console.log(containers[c])
    //                     for(var r in containers[c].store) {
    //                         console.log(r)
    //                         if(r != RESOURCE_ENERGY) {
    //                             console.log(containers[c])
    //                             console.log(this.withdraw(containers[c], r))
    //                             // console.log(r)
    //                             if(containers[c].store[r] > 0) {
    //                                 if (this.withdraw(containers[c], r) == ERR_NOT_IN_RANGE) {
    //                                     this.travelTo(containers[c]);
                                        
    //                                 }
    //                                 return true;
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    // }
    
    if (this.goToHomeRoom() == true) {
        if (this.carry.energy == 0) {
            // if creep is bringing energy to a structure but has no energy left
            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = false;
        }
        else if (this.carry.energy == this.carryCapacity) {
            // if creep is harvesting energy but is full
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            // find closest spawn, extension or tower which is not full
            var structure;
            structure = this.findResourceOLD(global.RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION);
                if(structure == undefined) {
                    structure = this.findResourceOLD(global.RESOURCE_SPACE, STRUCTURE_TOWER);
                }
            
            var nuker;
            var powerSpawn;
            if (this.room.memory.roomArray.nukers != undefined) {
                nuker = Game.getObjectById(this.room.memory.roomArray.nukers[0]);
            }
            else {
                nuker = null;
            }
            if (this.room.memory.roomArray.powerSpawns != undefined) {
                powerSpawn = Game.getObjectById(this.room.memory.roomArray.powerSpawns[0]);
            }
            else {
                powerSpawn = null;
            }

            if (structure != undefined && structure != null) {
                // if we found one -> try to transfer energy, if it is not in range
                if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.travelTo(structure, {reusePath: 88});
                }
            }
            else if (nuker != null && nuker.energy < nuker.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to nuker
                if (this.transfer(nuker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.travelTo(nuker, {reusePath: 88});
                }
            }
            else if (powerSpawn != null && powerSpawn.energy < powerSpawn.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to power spawn
                if (this.transfer(powerSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.travelTo(powerSpawn, {reusePath: 88});
                }
            }
            else {
                let labBreaker = false;
                if (false) {
                    //Check boost labs for energy
                    for (let b in this.room.memory.boostLabs) {
                        let lab = Game.getObjectById(this.room.memory.boostLabs[b]);
                        if (lab.energyCapacity > lab.energy) {
                            //lab needs energy
                            if (this.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                this.travelTo(lab, {reusePath: 88});
                            }
                            labBreaker = true;
                            break;
                        }
                    }
                }

                if (labBreaker == false) {
                    //Nothing needs energy -> store it
                    var container = this.findResourceOLD(global.RESOURCE_SPACE, STRUCTURE_STORAGE);
                    if (container == null || container == undefined) {
                        container = this.findResourceOLD(global.RESOURCE_SPACE, STRUCTURE_CONTAINER);
                    }

                    if ((container == null || container == undefined) && this.getActiveBodyparts(WORK) > 0) {
                        if (this.memory.role == "harvester") {
                            if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                                this.travelTo(this.room.controller, {reusePath: 88});
                            }
                        }
                        else {
                            this.memory.sleep = 3;
                        }
                    }
                    else if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.travelTo(container, {reusePath: 88});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};