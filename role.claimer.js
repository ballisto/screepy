Creep.prototype.roleClaimer = function() {
    // Find exit to target room
    var remoteControllerFlag;
    if (this.memory.currentFlag == undefined) {
        remoteControllerFlag = Game.flags[this.findMyFlag("remoteController")];
    }
    else {
        remoteControllerFlag = Game.flags[this.memory.currentFlag];
    }
    if (remoteControllerFlag != undefined) {
        this.memory.currentFlag = remoteControllerFlag.name;
    }
                
    if (remoteControllerFlag != undefined && this.room.name != remoteControllerFlag.pos.roomName) {
        //still in wrong room, go out
        if(this.goAroundShit(remoteControllerFlag.pos.roomName)) {return true;}
        this.gotoFlag(remoteControllerFlag);
    }
    else if (remoteControllerFlag != undefined) {
        //new room reached, start reserving / claiming
        var returncode;

        // if (this.room.memory.hostiles.length == 0) {
        if ( true) {
            // try to claim the controller
            if (this.room.controller != undefined && this.room.controller.owner == undefined) {
                
                // if(this.room.controller.sign == undefined || this.room.controller.sign.username != global.playerUsername) {
                //     returncode = this.signController(this.room.controller, "The sky above the port was the color of television, tuned to a dead channel");
                // }
                if (remoteControllerFlag.memory.claim == 1) {
                    returncode = this.claimController(this.room.controller);
                }
                else {
                    returncode = this.reserveController(this.room.controller);
                }
            }
            else {
                this.moveTo(this.room.controller);
            }

            if (returncode == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            }
            
            // console.log('name:' + this.name + 'errorcode: ' +  returncode);
            if (this.room.controller.owner != undefined && this.room.controller.owner.username == global.playerUsername) {
                //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
                let spawns = this.room.find(FIND_MY_SPAWNS).length;
                if (spawns == 0) {

                    var spawnConstructionsites = this.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                    if (spawnConstructionsites == 0) {
                        remoteControllerFlag.pos.createConstructionSite(STRUCTURE_SPAWN);
                    }
                }

                let oldBuildings = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
                for (var b in oldBuildings) {
                    if (oldBuildings[b].isActive() == false) {
                        oldBuildings[b].destroy();
                    }
                }
            }
        }
        // else {
        //     //Hostiles creeps in new room
        //     this.memory.fleeing = true;
        //     this.goToHomeRoom()
        // }
    }
};