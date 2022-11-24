Creep.prototype.roleWallRepairer = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom) {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget);
    }
    else {
        var curAssignment = polier.getCurTaskForCreep(this.id);
        if( curAssignment != undefined ) { this.run(); }
        else {
            // if creep is trying to repair something but has no energy left
            if (this.carry.energy == 0) {
                // switch state
                this.memory.working = false;
                delete this.memory.myConstructionSite;
            }
            // if creep is full of energy but not working
            else if (this.carry.energy == this.carryCapacity) {
                // switch state
                this.memory.working = true;
            }
    
            // if creep is supposed to repair something
            if (this.memory.working == true) {
                // find closest constructionSite
                let constructionSite;
                constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                    if (constructionSite != null) {
                        // Construction sites found
                        var position = constructionSite.pos;
                        var buildResult = this.build(constructionSite);
                        if (buildResult == ERR_NOT_IN_RANGE) {
                            // move towards the constructionSite
                            this.moveTo(constructionSite);
                        }
                        return true;
                    }
                if (this.memory.myConstructionSite == undefined) {
                    let weakRamparts = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 70000});
                    if (weakRamparts.length > 0) {
                        constructionSite = weakRamparts[0];
                    }
                    else {
                        let wallsRamparts;
                        if(this.room.name == 'W57S4') {

                            wallsRamparts = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL) && s.hits < s.hitsMax && this.room.findPath(this.pos, s.pos).length >= this.pos.getRangeTo(s.pos)});
                        }
                        else {
                            wallsRamparts = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < s.hitsMax - 10000 && this.room.findPath(this.pos, s.pos).length >= this.pos.getRangeTo(s.pos)});
                        }
                        wallsRamparts = _.sortBy(wallsRamparts,"hits");
                        // wallsRamparts = _.orderBy(wallsRamparts,"hits", "ASC");
                        // wallsRamparts = _.orderBy(wallsRamparts);
                        if ( wallsRamparts.length > 0) {
                            constructionSite = wallsRamparts[0];
                        }
                    }                    
                    if (constructionSite != null && constructionSite != undefined) {
                        this.memory.myConstructionSite = constructionSite.id;
                    }
                }
                else {
                    constructionSite = Game.getObjectById(this.memory.myConstructionSite);
                    if (constructionSite == null || this.room.findPath(this.pos, constructionSite.pos).length < this.pos.getRangeTo(constructionSite.pos)) {
                        delete this.memory.myConstructionSite;
                    }
                }

                if (constructionSite != undefined ) {
                    let result = this.repair(constructionSite);
                    if (result == ERR_NOT_IN_RANGE) {
                        // move towards it
                        this.moveTo(constructionSite);                        
                    }
                }
                else {
                    // look for construction sites
                    this.roleBuilder();
                }
            }
            // if creep is supposed to harvest energy from source
            else {
                this.roleCollector();
            }
        }
    }
};
