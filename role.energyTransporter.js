Creep.prototype.roleEnergyTransporter = function() {
    if (this.storeAllBut(RESOURCE_ENERGY) == true) {
        // if creep is bringing energy to a structure but has no energy left
        if (this.carry.energy == 0) {
          // WIP
        //   if(this.memory.sourceBuffer == undefined) {
        //     //find source
        //     var sourceId;
        //     tempArray = this.pos.findInRange(FIND_DROPPED_RESOURCES,10);
        //     for (var s in tempArray) {
        //         if (tempArray[s].energy != undefined) {
        //           if (tempArray[s].energy > 50) {
        //              sourceId = tempArray[s].id;
        //           }
        //         }
        //     }
        //     if (sourceId == undefined || sourceId == null) {
        //       if(this.room.memory.linkInfrastructure == 1 {
        //         //find link with priority 1
        //         var sourceLinks = [];
        //         for (var linkId in this.room.memory.links) {
        //             var link = Game.getObjectById(linkId);
        //             if ( link != undefined) {
        //                 if(Game.rooms[r].memory.links[linkId].priority == 1) {
        //                   sourceLinks.push(link);
        //                 }
        //             }
        //         }
        //         for (var l in sourceLinks) {
        //           if (sourceLinks[l].energy > 0) {
        //             sourceId = sourceLinks[l].id;
        //           }
        //         }
        //       }
        //     }
        //     if (sourceId == undefined || sourceId == null) {
        //       //no source yet
        //       container = this.findResource(RESOURCE_ENERGY, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
        //       if (container != undefined) {
        //         sourceId = container.id;
        //       }
        //     }
        //     this.memory.sourceBuffer = sourceId;
        //   }
        //   else {
        //       //check sourceBuffer valid and has energy
        //       var sourceBufferObject = Game.getObjectById(this.memory.sourceBuffer);
        //       if(sourceBufferObject == undefined || sourceBufferObject == null) {
        //         delete this.memory.sourceBuffer;
        //       }
        //       else {
        //         var sourceBufferObjectType = sourceBufferObject.getObjectType();
        //
        //         if(sourceBufferObject.energyAvailable > 0) {
        //             var result;
        //             if (sourceBufferObjectType == "Resource") {
        //               result = this.pickup(sourceBufferObject);
        //             }
        //             else {
        //               result = this.withdraw(sourceBufferObject, RESOURCE_ENERGY);
        //             }
        //             if (result == ERR_NOT_IN_RANGE) {
        //                 this.moveTo(sourceBufferObject, {reusePath: moveReusePath()});
        //             }
        //         }
        //       }
        //   }
        //
        // }
        //
        //




            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            // switch state to harvesting
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (_.sum(this.carry) == this.carryCapacity) {
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            this.roleHarvester();
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};
