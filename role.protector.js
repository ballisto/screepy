Creep.prototype.roleProtector = function() {
    var nameFlag = this.findMyFlag("protector");
    var protectorFlag = Game.flags[nameFlag];
    
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) {
       this.run();
       return true;
       
    }
    // this.goToHomeRoom();
    // return true;
    this.heal(this);
    if( protectorFlag && protectorFlag.pos.roomName != undefined) {
        if (this.room.name != protectorFlag.pos.roomName) {
            if(this.goAroundShit(protectorFlag.pos.roomName)) {return true;}
                            
            this.travelTo(protectorFlag, {ignoreCreeps: false, reusePath: moveReusePath()});
            return true;                        
        }
        let hostiles = this.room.hostileCreeps();
        let hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES);
        if (hostiles.length > 0 || hostileStructures.length > 0) {
            // Attack code
            var target = null;
            if (hostiles.length > 0) {
                target = this.pos.findClosestByPath(hostiles);
            }
            if (target == undefined) {
                let invaders = _.filter(hostileStructures, (s) => s.structureType == STRUCTURE_INVADER_CORE);
                if(invaders.length > 0) {
                    target = invaders[0];
                }
            }
            if (target == undefined) {
                target = this.pos.findClosestByPath(hostileStructures);
            }
            
            let healError = -1;
            if (this.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                this.travelTo(target);
            }
            if (this.hits < this.hitsMax * 0.9 )  {
                healError = this.heal(this);
            }
            
            if (healError != 0) {
                if(this.attack(target) == ERR_NOT_IN_RANGE) {
                    this.travelTo(target);
                }
            }
            return true;
        }
        
        
        else if(_.filter(this.room.find(FIND_MY_CREEPS), p => p.hits < p.hitsMax).length > 0 ) {
                    let patients = _.filter(this.room.find(FIND_MY_CREEPS), p => p.hits < p.hitsMax);
                    if(this.heal(patients[0]) == ERR_NOT_IN_RANGE) {
                        this.travelTo(patients[0]);
                    }
            }
    
        if (protectorFlag != undefined && protectorFlag.memory.volume > 0) {
            //Move to flag if not there
            let range = this.pos.getRangeTo(protectorFlag);
            
            
            if (range > 2) {
                this.travelTo(protectorFlag, {ignoreCreeps: false, reusePath: moveReusePath()});
            }
            
        }
    }
    
    else {
        //No flag for protector anymore
        if (this.goToHomeRoom() == true) {
            let hostiles = this.room.hostileCreeps();
            if (hostiles.length > 0 ) {
                // Attack code
                
                var target = this.pos.findClosestByPath(hostiles);
                
                let healError = -1;
                if (this.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    this.travelTo(target);
                }
                if (this.hits < this.hitsMax * 0.9 )  {
                    healError = this.heal(this);
                }
                
                if (healError != 0) {
                    if(this.attack(target) == ERR_NOT_IN_RANGE) {
                        this.travelTo(target);
                    }
                }
                return true;
            }
            let range = this.pos.getRangeTo(this.room.controller);
            if (range > 1) {
                this.travelTo(this.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
            }
            
            
            else {
                this.memory.sleep = 10;
            }
        }
    }
};