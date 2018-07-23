Creep.prototype.roleUpgrader = function() {
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) { this.run(); }
    else {
      if (this.goToHomeRoom() == true) {
          // if creep is bringing energy to the controller but has no energy left
          if (this.memory.working == true && this.carry.energy == 0) {
              // switch state
              this.memory.working = false;
          }
          else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
              // switch state
              // if creep is harvesting energy but is full
              this.memory.working = true;
          }
  
          // if creep is supposed to transfer energy to the controller
          if (this.memory.working == true) {
              if (this.room.memory.hostiles.length > 0 && this.room.memory.roomArray.towers.length > 0) {
                  // Hostiles present in room
                  this.towerEmergencyFill();
              }
              else if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                  this.moveTo(this.room.controller);
              }            
          }
          // if creep is supposed to harvest energy from source
          else {
              this.roleCollector();
          }
      }
    }
  };
  