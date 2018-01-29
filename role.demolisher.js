Creep.prototype.roleDemolisher = function() {
    var flagName = this.findMyFlag("demolish");
    var demolishFlag = Game.flags[flagName];
    if(this.isFull()) {
      this.storeAllBut();
    }
    else {
      if (demolishFlag != undefined) {
        if (demolishFlag.memory.target == "object") {
            //demolish flag position structures
            targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
            // Go through target list
            for (var i in targetlist) {
                if (targetlist[i].structureType != undefined) {
                    if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                        //empty structure of energy first
                        if (this.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(targetlist[i]);
                        }
                    }
                    else if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                        this.moveTo(targetlist[i]);
                    }
                    break;
                }
            }
            if (targetlist.length == 0) {
                console.log("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
            }
        }
      }
      else {
        this.storeAllBut();
      }
    }


};
