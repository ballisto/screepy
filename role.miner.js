Creep.prototype.roleMiner = function() {
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) { this.run(); }
    else {
        if (this.goToHomeRoom()) {            
            if (this.memory.statusHarvesting != undefined && this.memory.statusHarvesting != false) {
                // Creep is mining, try to keep mining
                if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK || _.sum(this.carry) == this.carryCapacity) {
                    this.memory.statusHarvesting = false;
                }
            }
            else if (this.room.memory.roomArray.minerals != undefined) {
                // if creep is bringing minerals to a structure but is empty now
                if (_.sum(this.carry) == 0) {
                    // switch state to harvesting
                    this.memory.working = false;
                }
                // if creep is harvesting minerals but is full
                else if (_.sum(this.carry) == this.carryCapacity || this.carry[RESOURCE_ENERGY] > 0) {
                    // switch state
                    this.memory.working = true;
                }
                var storage = this.room.storage;
                var resource;
    
                // if creep is supposed to transfer minerals to a structure
                if (this.memory.working == true) {
                    let container;
                    if (this.memory.container == undefined) {                                
                        let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER) });
                        if (containers.length > 0) {                            
                            this.memory.container = containers[0].id;
                            container = containers[0];
                        }
                    }
                    else {
                        container = Game.getObjectById(this.memory.container);
                    }

                    if (container == undefined) {
                        container = this.room.storage;
                    }
                    for (var t in this.carry) {
                        if (this.transfer(container, t) == ERR_NOT_IN_RANGE) {
                            this.moveTo(container);
                        }
                    }                    
                }
                else {
                    let mineral = this.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
                    if (mineral != undefined) {
                        //minerals waiting at source
                        
                        var result = this.harvest(mineral);
                        if (mineral != null && result == ERR_NOT_IN_RANGE) {
                            this.moveTo(mineral);
                            this.memory.statusHarvesting = false;
                        }
                        else if (mineral != null && result == OK) {
                            this.memory.statusHarvesting = mineral.id;
                            if (this.memory.container == undefined) {                               
                                let containers = this.pos.findInRange(FIND_STRUCTURES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER) });
                                if (containers.length == 0) {
                                    let constructionSites =  this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                    if (containers.length == 0 && constructionSites.length == 0 ) {
                                        this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                    }
                                }                                
                                else {
                                    this.memory.container = containers[0].id;
                                }
                            }
                            else if (_.sum(this.carry) > 0) {
                                let container = Game.getObjectById(this.memory.container);
                                if(container != undefined) {
                                    for (var t in this.carry) {
                                        if (this.transfer(container, t) == ERR_NOT_IN_RANGE) {
                                            // this.moveTo(container);
                                        }
                                    }
                                }    
                            }                        
                        }
                        else if (mineral != null && result == ERR_TIRED) {
                            this.memory.sleep = 3;
                        }
                        else {
                            this.memory.statusHarvesting = false;
                        }
                    }
                    else {
                        this.memory.working = true;
                        this.memory.statusHarvesting = false;
                    }
                }
            }
        }
    }
};