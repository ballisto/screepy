Creep.prototype.roleBuilder = function () {
    // check for home room
    if (this.room.name != this.memory.homeroom && this.memory.targetBuffer == undefined) {
        //return to home room
        if(!this.isEmpty()) {
            for (let r in this.carry) {
                this.drop(r);
                return true;
            }
        }
        var hometarget = Game.getObjectById(this.memory.spawn);
        if(this.goAroundShit(this.memory.homeroom)) {return true;}
                
        this.travelTo(hometarget);
    }
    else {
        
        
        if (this.memory.statusBuilding != undefined) {
            if (this.build(Game.getObjectById(this.memory.statusBuilding)) != OK) {
                delete this.memory.statusBuilding;
            }
        }
        // if creep is trying to complete a constructionSite but has no energy left
        if (this.carry.energy == 0) {
            // switch state
            
            if(this.storeAllBut()) {
                this.memory.working = false;
                
            }
        }
        // if creep is harvesting energy but is full
        else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
            delete this.memory.cursource;
        }
        
        // if creep is supposed to complete a constructionSite
        if (this.memory.working == true) {
            
            {
                // find closest constructionSite
                let constructionSite;
                if (this.memory.myConstructionSite == undefined) {
                    constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
                    }
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                    }
                    if (constructionSite != null && constructionSite != undefined) {
                        this.memory.myConstructionSite = constructionSite.id;
                    }
                }
                else {
                    constructionSite = Game.getObjectById(this.memory.myConstructionSite);
                    if (constructionSite == null) {
                        delete this.memory.myConstructionSite;
                    }
                }
                // if one is found
                if (constructionSite != undefined) {
                    // try to build, if the constructionSite is not in range
                    var result = this.build(constructionSite);
                    if (result == ERR_NOT_IN_RANGE) {
                        // move towards the constructionSite
                        this.travelTo(constructionSite);
                    }
                    else if (result == OK) {
                        this.memory.statusBuilding = constructionSite.id;
                    }
                }
                // if no constructionSite is found
                else {
                    // go upgrading the controller
                    if (this.room.controller.level <= 8) {
                        this.roleUpgrader();
                    }
                    else {
                        let spawn = Game.getObjectById(this.memory.spawn);
                        if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE) {
                            this.travelTo(spawn);
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            let source;
            if(this.memory.cursource != undefined && this.memory.cursource != null) {
                source = Game.getObjectById(this.memory.cursource);
            }
            if (source == undefined) {
                source = this.room.findResource(RESOURCE_ENERGY);
                if (source != undefined) {this.memory.cursource = source.id;}
            }
            if (source == undefined) {
                source = this.pos.findClosestByPath(this.room.find(FIND_SOURCES));
                if (source != undefined) {this.memory.cursource = source.id;}
            }

            if (source != undefined) {
                let res = this.withdraw(source, RESOURCE_ENERGY);
                if (res == ERR_NOT_ENOUGH_RESOURCES) {
                    delete this.memory.cursource;
                }
                if (res != OK && res != ERR_NOT_IN_RANGE) {
                    res = this.harvest(source);
                }

                if (res == ERR_NOT_IN_RANGE) {
                    // console.log(this.name)
                    this.travelTo(source, {reusePath: 50});
                    return true;
                }

            }
            else {
                delete this.memory.cursource;
            }

            // console.log(this.name);
            // this.roleCollector();
            // if (this.room.storage.store.energy != undefined && this.room.storage.store.energy > 0) {
            //     if (this.withdraw(this.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { this.moveTo(this.room.storage); }
            // }
            // else if (this.room.terminal.store.energy != undefined && this.room.terminal.store.energy > 0) {
                
            //     if (this.withdraw(this.room.terminal,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { this.moveTo(this.room.terminal); return true;}
            // }
            // else {
            //     this.roleCollector();
            // }
        }
    }
};
