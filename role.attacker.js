Creep.prototype.roleAttacker = function() {
  //if damaged, goto healer
  if(this.hits < this.hitsMax * 0.9 && this.memory.healer != undefined) {
    const healerObject = Game.getObjectById(this.memory.healer);
    if(healerObject instanceof Creep) {
      if (this.pos.getRangeTo(healerObject) > 1) {
        this.travelTo(healerObject);
        return true;
      }
    }
  }
  
  var curAssignment = polier.getCurTaskForCreep(this.id);
  if( curAssignment != undefined ) {
     this.run();
     return true;
  }

  if(this.hits < (this.hitsMax * 0.75) ) {
    this.goToHomeRoom();
    return true;
  }

  if (this.homeRoom() != undefined) {
    if ( this.homeRoom().memory.attackRoom != undefined ) {
        
      const roomToAttack = Game.rooms[this.homeRoom().memory.attackRoom];
      if (roomToAttack != undefined) {
        
          if(this.room.name != roomToAttack.name) {
            if((this.homeRoom().memory.attackRoom == 'W57N5') && this.memory.W56N1WP == undefined) {
              if(this.pos.getRangeTo(Game.flags['W56N1_WP']) >1) {
                  this.travelTo(Game.flags['W56N1_WP']);
                  return true;
              }
              else {
                  this.memory.W56N1WP = true;
              }
          }
          else if((this.homeRoom().memory.attackRoom == 'W57N5') && this.memory.W55N5WP == undefined) {
              if(this.pos.getRangeTo(Game.flags['W55N5_WP']) >1) {
                  this.travelTo(Game.flags['W55N5_WP']);
                  return true;
              }
              else {
                  this.memory.W55N5WP = true;
              }
          }
          else if ( this.memory.healer == undefined) {
            return true;
          }
          else {
            this.travelTo(roomToAttack.controller);
            return true;
          }
        }
        // if(Game.getObjectById('59c9063cb438bd4e51c47da8') != undefined) {
        //   var tmpWall = Game.getObjectById('59c9063cb438bd4e51c47da8');
        //   if(this.attack(tmpWall) == ERR_NOT_IN_RANGE) {
        //       this.travelTo(tmpWall);
        //   }
        // }
        var prey = null;
        var hostileCreeps = roomToAttack.hostileCreeps();
        hostileCreeps = _.filter(hostileCreeps, function(c) {return c.pos.lookFor(LOOK_STRUCTURES) == 0});
        var dangerousHostileCreeps = _.filter(hostileCreeps, function(h) {return h.isDangerous();});
        if (dangerousHostileCreeps.length > 0) {
          prey = this.pos.findClosestByPath(dangerousHostileCreeps);
        }
        else if(hostileCreeps.length > 0) {
          prey = this.pos.findClosestByPath(hostileCreeps);
        }


        if (prey != undefined) {
          if(this.attack(prey) == ERR_NOT_IN_RANGE) {
            // if(this.room.name == roomToAttack.name) {
            //   const adjacentPositions = Array.from(this.pos.getAllAdjacentPositions());
            //
            //   for(const p in adjacentPositions) {
            //     var strucsOnPosition = adjacentPositions[p].lookFor(LOOK_STRUCTURES);
            //     const wallsInRange = _.filter(strucsOnPosition, (l) => l.structureType == STRUCTURE_WALL);
            //     if(wallsInRange.length > 0) {
            //       const curWallInRange = wallsInRange[0];
            //       this.attack(curWallInRange);
            //       return true;
            //     }
            //   }
            // }
            this.travelTo(prey);
            // console.log(prey.pos)
            return true;
          }
        }
        else {
          let target = null;
          let hostileSpawns = _.filter(roomToAttack.find(FIND_HOSTILE_STRUCTURES), (s) => s.structureType == STRUCTURE_SPAWN);
        
          if(hostileSpawns.length > 0) {target = hostileSpawns[0];}
          if (target == undefined) {
            var hostileExtensions = _.filter(roomToAttack.find(FIND_HOSTILE_STRUCTURES), (s) => s.structureType != STRUCTURE_CONTROLLER);
            // var hostileExtensions = roomToAttack.find(FIND_HOSTILE_STRUCTURES);
            if (hostileExtensions.length > 0) {target = this.pos.findClosestByRange(hostileExtensions);}
          }
          if (target != undefined)  {
            if(this.attack(target) == ERR_NOT_IN_RANGE) {
              this.travelTo(target);
            }
            return true;
          }
          else if(roomToAttack.controller != undefined) {
            this.travelTo(roomToAttack.controller);
            return true;
          }
        }

      }
      else {
        //TODO find an exit and move there without sight
      }
    }
    else {
      if (this.goToHomeRoom()) {
        var hostileCreeps = this.room.hostileCreeps();
        if (hostileCreeps.length > 0) {
          if(this.attack(hostileCreeps[0]) == ERR_NOT_IN_RANGE) {
            this.travelTo(hostileCreeps[0]);
            return true;
        }
      }
      else {
        this.moveRandom(false);
      }
    }
  }
}

  this.goToHomeRoom();

};
