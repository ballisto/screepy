Creep.prototype.roleAttacker = function() {
    //if damaged, goto healer
    if(this.hits < this.hitsMax * 0.9 && this.memory.healer != undefined) {
      const healerObject = Game.getObjectById(this.memory.healer);
      if(healerObject instanceof Creep) {
        if (this.pos.getRangeTo(healerObject) > 1) {
          this.moveTo(healerObject);
          return true;
        }
      }
    }
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) {
       this.run();
       return true;
    }

    if (this.homeRoom() != undefined) {
      if ( this.homeRoom().memory.attackRoom != undefined ) {
        const roomToAttack = Game.rooms[this.homeRoom().memory.attackRoom];
        if (roomToAttack != undefined) {
          if(this.room.name != roomToAttack.name) {
            const exitDir = this.room.findExitTo(roomToAttack);
            const exit = this.pos.findClosestByRange(exitDir);
            this.moveTo(exit);
            return true;
          }
          // if(Game.getObjectById('59c9063cb438bd4e51c47da8') != undefined) {
          //   var tmpWall = Game.getObjectById('59c9063cb438bd4e51c47da8');
          //   if(this.attack(tmpWall) == ERR_NOT_IN_RANGE) {
          //       this.moveTo(tmpWall);
          //   }
          // }
          var prey = null;
          var hostileCreeps = roomToAttack.hostileCreeps();
          var dangerousHostileCreeps = _.filter(hostileCreeps, function(h) {return h.isDangerous();});
          if (dangerousHostileCreeps.length > 0) {
            prey = this.pos.findClosestByRange(dangerousHostileCreeps);
          }
          else if(hostileCreeps.length > 0) {
            prey = this.pos.findClosestByRange(hostileCreeps);;
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
              this.moveTo(prey);
              return true;
            }
          }
          else {
            var hostileExtensions = _.filter(roomToAttack.find(FIND_HOSTILE_STRUCTURES), (s) => s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_TOWER);
            if (hostileExtensions.length > 0) {
              closestHostileExtension = this.pos.findClosestByRange(hostileExtensions);
              if(this.attack(closestHostileExtension) == ERR_NOT_IN_RANGE) {
                this.moveTo(closestHostileExtension);
              }
              return true;
            }
            else if(roomToAttack.controller != undefined) {
              this.moveTo(roomToAttack.controller);
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
              this.moveTo(hostileCreeps[0]);
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
