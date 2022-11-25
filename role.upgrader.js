Creep.prototype.roleUpgrader = function() {
  var curAssignment = polier.getCurTaskForCreep(this.id);
  if( curAssignment != undefined ) { this.run(); }
  else {
      //  let hometarget = Game.rooms[this.memory.homeroom].controller;
    if ( this.memory.role == 'fupgrader')   {
      var flagName = this.findMyFlag("fupgrader");
      if (flagName != undefined) {
          
          var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
          if (destinationFlag != undefined ) {
              if(this.room.name != destinationFlag.pos.roomName)  {
                if(this.goAroundShit(destinationFlag.pos.roomName)) {return true;}       
                
                let moveResult = this.travelTo(destinationFlag, {reusePath: 88});
                if(moveResult != 0) {
                   this.say(moveResult);
                }
                return true;
              }
          }
      }
    }
    else { 
      if (this.goToHomeRoom() != true) {
        return false;
      }
    }
    
    if (this.carry.energy > 0) {
        if(this.pos.getRangeTo(this.room.controller.pos) >=3 ) {
            this.travelTo(this.room.controller);
            return true;
        }
        let upgradeResult = this.upgradeController(this.room.controller);
        
        if (upgradeResult == ERR_NOT_IN_RANGE) {
            this.travelTo(this.room.controller);                                    
        }
    }
    else {
        this.roleCollector();
    }         
    
    // else {
    //     let hometarget = Game.getObjectById(this.memory.spawn);   
    //     for(const resourceType in this.carry) {
    //       this.drop(resourceType);
    //       }
    // }
    }    
};
