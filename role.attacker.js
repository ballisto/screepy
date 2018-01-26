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

    if (this.homeroom() != undefined) {
      if ( this.homeroom().memory.attackRoom != undefined ) {
        const roomToAttack = Game.rooms[this.homeroom().memory.attackRoom];
        if (roomToAttack != undefined) {
          var prey = null;
          var hostileCreeps = roomToAttack.hostileCreeps();
          var dangerousHostileCreeps = _.filter(hostileCreeps, function(h) {return h.isDangerous();});
          if (dangerousHostileCreeps.length > 0) {
            prey = dangerousHostileCreeps[0];
          }
          else if(hostileCreeps.length > 0) {
            prey = hostileCreeps[0];
          }

          if (prey != undefined) {
            if(this.attack(prey) == ERR_NOT_IN_RANGE) {
              if(this.room.name == roomToAttack.name) {
                const adjacentPositions = Array.from(this.pos.getAllAdjacentPositions());

                for(const p in adjacentPositions) {
                  var strucsOnPosition = adjacentPositions[p].lookFor(LOOK_STRUCTURES);
                  const wallsInRange = _.filter(strucsOnPosition, (l) => l.structureType == STRUCTURE_WALL);
                  if(wallsInRange.length > 0) {
                    const curWallInRange = curLabsInRange[0];
                    this.attack(curWallInRange);
                    return true;
                  }
                }
              }
              this.moveTo(prey);
              return true;
            }
          }
          else {
            if (roomToAttack.controller != undefined) {
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

    this.goToHomeRoom();
};
