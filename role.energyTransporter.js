Creep.prototype.roleEnergyTransporter = function() {
        // if creep is bringing energy to a structure but has no energy left
        if (this.carry.energy == 0 && this.memory.working == true) {
          // switch state to harvesting
              delete this.memory.sourceBuffer;
              this.memory.working = false;
        }
        else if (_.sum(this.carry) == this.carryCapacity && this.memory.working == false) {
          // switch state to working
              delete this.memory.targetBuffer;
              this.memory.working = true;
        }

        if (this.memory.working == false) {
          if(this.memory.sourceBuffer == undefined) {
            //find source
            var sourceId;
            // find dropped energy close by
            tempArray = this.pos.findInRange(FIND_DROPPED_RESOURCES,3);
            for (var s in tempArray) {
                if (tempArray[s].energy != undefined) {
                  if (tempArray[s].energy > 50) {
                     sourceId = tempArray[s].id;
                  }
                }
            }
            //no dropped energy found
            //find sink link with energy
            if (sourceId == undefined || sourceId == null) {
              sourceId = this.findEnergySource(STRUCTURE_LINK);
            }
            if (sourceId == undefined || sourceId == null) {
              //no source yet, try Terminal
              sourceId = this.findEnergySource(STRUCTURE_TERMINAL);
            }
            if (sourceId == undefined || sourceId == null) {
              //no source yet, try containers
              sourceId = this.findEnergySource(STRUCTURE_CONTAINER);
            }
            if (sourceId == undefined || sourceId == null) {
              //no source yet, Storage
              sourceId = this.findEnergySource(STRUCTURE_STORAGE);
            }
            if (sourceId != undefined && sourceId != null) {
              this.memory.sourceBuffer = sourceId;
            }

          }

          else {
              //check sourceBuffer valid and has energy
              var sourceBufferObject = Game.getObjectById(this.memory.sourceBuffer);
              if(sourceBufferObject == undefined || sourceBufferObject == null || sourceBufferObject.energyAvailable() == 0) {
                //source depleted or gone, switch to working if creep has some energy
                delete this.memory.sourceBuffer;
                if (this.carry.energy > 50) {this.memory.working = true;}
              }
              else {
                var sourceBufferObjectType = sourceBufferObject.getObjectType();

                if(sourceBufferObject.energyAvailable() > 0) {
                    var result;
                    if (sourceBufferObjectType == "Resource") {
                      result = this.pickup(sourceBufferObject);
                    }
                    else {
                      result = this.withdraw(sourceBufferObject, RESOURCE_ENERGY);
                    }
                    if (result == ERR_NOT_IN_RANGE) {
                        this.moveTo(sourceBufferObject, {reusePath: moveReusePath()});
                    }
                }
              }
          }

        }
        else {
          //we have energy, find sink
          if (this.memory.targetBuffer == undefined) {

            var targetId;
              targetId = this.findSpaceEnergy(STRUCTURE_TOWER);
            if (targetId == undefined || targetId == null) {
              targetId = this.findSpaceEnergy(STRUCTURE_SPAWN);
            }
            if (targetId == undefined || targetId == null) {
              targetId = this.findSpaceEnergy(STRUCTURE_EXTENSION);
            }
            if (targetId == undefined || targetId == null) {
              targetId = this.findSpaceEnergy(STRUCTURE_LAB);
            }
            if (targetId == undefined || targetId == null) {
              targetId = this.findSpaceEnergy(STRUCTURE_STORAGE);
              // if (this.memory.sourceBuffer == targetId) {targetId = null;}
            }
            if (targetId != undefined && targetId != null) {
              this.memory.targetBuffer = targetId;
            }
          }
          else {
            //we have a target
            //check sourceBuffer valid and has energy
            var targetBufferObject = Game.getObjectById(this.memory.targetBuffer);
            if(targetBufferObject == undefined || targetBufferObject == null) {
              //source depleted or gone, switch to gathering if creep has not much energy left
              delete this.memory.targetBuffer;
              if (this.carry.energy < 50) {this.memory.working = false;}
            }
            else {
              var targetBufferObjectType = targetBufferObject.getObjectType();
              var result = this.transfer(targetBufferObject, RESOURCE_ENERGY);
              if (result == ERR_NOT_IN_RANGE) {
                  this.moveTo(targetBufferObject, {reusePath: moveReusePath()});
              }
              else if (result != OK) {
                  delete this.memory.targetBuffer;
                  if (this.carry.energy < 50) {this.memory.working = false;}
              }
            }
          }

        }
};
