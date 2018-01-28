Creep.prototype.roleRemoteStationaryHarvester = function() {
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false || this.carry.energy == this.carryCapacity || Game.time % 7 == 0) {
        if (this.memory.currentFlag == undefined) {
            this.memory.currentFlag = this.findMyFlag("haulEnergy");
        }

        if (this.memory.currentFlag == undefined) {
            console.log(this.name + " has no sources to stationary harvest in room " + this.room.name + ".");
        }
        else {
            var flag = Game.flags[this.memory.currentFlag];
            var sourceKeeper = [];

            if (flag != undefined) {
                if (flag.pos.roomName != this.room.name) {
                    // Creep not in assigned room
                    this.moveTo(flag);
                }
                else if (this.pos.isEqualTo(flag) == true) {
                    // Harvesting position reached
                    if (this.carry.energy > 0 && sourceKeeper.length == 0) {
                        //Identify and save container
                        var buildRoad = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {filter: (s) => s.structureType == STRUCTURE_ROAD});
                        var buildContainers = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                        var repairContainers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax});
                        //console.log(this.name + '  ' + buildContainers);
                        if (buildContainers.length > 0) {
                            this.build(buildContainers[0]);
                        }
                        else if (repairContainers.length > 0) {
                            this.repair(repairContainers[0]);
                        }
                        else if (buildRoad.length > 0) {
                            this.build(buildRoad[0]);
                        }
                        else {
                            if (this.memory.container == undefined) {
                                var container;
                                var containers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                                if (containers.length > 0) {
                                    this.memory.container = containers[0].id;
                                    container = containers[0];
                                }
                            }
                            else {
                                container = Game.getObjectById(this.memory.container);
                            }

                            if (this.transfer(container, RESOURCE_ENERGY) != OK) {
                                delete this.memory.container;
                                containers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                var constructionSites =  this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                if (containers.length == 0 && constructionSites.length == 0 && this.pos.isEqualTo(flag) == true) {
                                    this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                }
                            }
                        }
                    }
                    else if (this.carry.energy < this.carryCapacity) {
                        var source = this.pos.findClosestByRange(FIND_SOURCES);
                        if (source.energy > 0) {
                          this.memory.statusHarvesting = source.id;
                        }
                    }
                }
                else if (sourceKeeper.length == 0) {
                    // Move to harvesting point
                    this.moveTo(flag);
                    //this.moveTo(flag.pos);
                }
            }
            else {
                console.log(this.name + " in room " + this.room.name + " has a problem.");
            }
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        var source = Game.getObjectById(this.memory.statusHarvesting);
        if (this.harvest(source) != OK || this.carry.energy == this.carryCapacity) {
            this.memory.statusHarvesting = false;
        }
    }
};
