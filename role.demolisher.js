Creep.prototype.roleDemolisher = function() {
    
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) {
      this.run();
       return true;
       
    }
    // this.drop(RESOURCE_ENERGY);
    // return true;
    // return true;
    var flagName = this.findMyFlag("demolish");
    var demolishFlag = Game.flags[flagName];
    // if(this.isFull()) {
    // //   this.storeAllBut();
    // for(var r in this.carry){
    //     // console.log(r)
    //     this.drop(this.carry[r]);
    //     return true;
    // }
    // }
    // else {
    {
        if(this.hits < this.hitsMax) {
            this.heal(this);
        }
      if (demolishFlag != undefined) {
        //   console.log(this.name + demolishFlag.pos.roomName)
        //   if (this.isFull()) {
        //         if(this.goToHomeRoom()) {
        //             this.storeAllBut('',true);
        //         }
        //         return true;
        //     }
        //   console.log(this.name + demolishFlag.pos.roomName)
        // if(this.pos.getRangeTo(demolishFlag.pos) > 5) {
        if (this.room.name != demolishFlag.pos.roomName) {
            
            this.travelTo(demolishFlag);
            return true;
        }
        else if (demolishFlag.memory.target == "marauder") {
            
            let closestHostileStructure = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
            if (this.dismantle(closestHostileStructure) == ERR_NOT_IN_RANGE) {
                this.travelTo(closestHostileStructure);
            }
        }
        else if (demolishFlag.memory.target == "all") {
            if(this.pos.getRangeTo(demolishFlag) > 2) {
                this.travelTo(demolishFlag);
            }
            else {
            
                let closestHostileStructure = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
                let dismantleResult = this.dismantle(closestHostileStructure);
                this.say(dismantleResult);
                if ( dismantleResult == ERR_NOT_IN_RANGE) {
                    this.travelTo(closestHostileStructure);
                }
            }
        }
        else if (demolishFlag.memory.target == "rampart") {
            
            if(this.pos.getRangeTo(demolishFlag) > 2) {
                this.travelTo(demolishFlag);
                return true;
            }
            //demolish flag position structures
            targetlist = _.filter(demolishFlag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_RAMPART);
            // Go through target list
            for (var i in targetlist) {
                // console.log(i)
                if (targetlist[i].structureType != undefined) {
                    if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                        this.travelTo(targetlist[i]);
                    }
                    
                }
            }
            if (targetlist.length == 0) {
                console.log("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
            }
        }
        else if (demolishFlag.memory.target == "object") {
            // console.log(this.name)
            // if (this.isFull()) {
            //     if(this.goToHomeRoom()) {
            //         this.storeAllBut('',true);
            //     }
            //     return true;
            // }
            // console.log(this.pos.getRangeTo(demolishFlag))
            if(this.pos.getRangeTo(demolishFlag) > 2) {
                this.travelTo(demolishFlag);
                return true;
            }
            //demolish flag position structures
            targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
            // Go through target list
            for (var i in targetlist) {
                // console.log(i)
                if (targetlist[i].structureType != undefined) {
                    if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                        this.travelTo(targetlist[i]);
                    }
                    // if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                    //     //empty structure of energy first
                    //     if (this.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //         this.travelTo(targetlist[i]);
                    //     }
                    // }
                    // else if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                    //     this.travelTo(targetlist[i]);
                    // }
                    // break;
                }
            }
            if (targetlist.length == 0) {
                // let containers = _.filter(this.room.find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER);
                // for (var c in containers) {
                //     if(containers[c].store != undefined) {
                //         for(var r in containers[c].store) {
                //             if(containers[c].store[r] != RESOURCE_ENERGY) {
                //                 if (this.withdraw(containers[c], containers[c].store[r]) == ERR_NOT_IN_RANGE) {
                //                     this.travelTo(containers[c]);
                //                 }
                //             }
                //         }
                //     }
                // }
                console.log("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
            }
        }
      }
      else {
        this.storeAllBut();
      }
    }


};
