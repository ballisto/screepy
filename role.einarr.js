Creep.prototype.roleEinarr = function() {

  //   this.heal(this);
    // //if damaged, goto healer
    // if(this.hits < this.hitsMax * 0.9 && this.memory.healer != undefined) {
    //   const healerObject = Game.getObjectById(this.memory.healer);
    //   if(healerObject instanceof Creep) {
    //     if (this.pos.getRangeTo(healerObject) > 1) {
    //       this.travelTo(healerObject);
    //       return true;
    //     }
    //   }
    // }
  
    if(this.hits < this.hitsMax * 0.7) {
        if (this.goToHomeRoom()) {
            var hostileCreeps = this.room.hostileCreeps();
            if (hostileCreeps.length > 0) {
              if(this.rangedAttack(hostileCreeps[0]) == ERR_NOT_IN_RANGE) {
                this.travelTo(hostileCreeps[0]);
                return true;
            }
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
        
        const roomToAttack = Game.rooms[this.homeRoom().memory.attackRoom];
        // console.log(roomToAttack)
        if (roomToAttack != undefined) {
          if (this.hits < this.hitsMax * 0.75) {
            this.goToHomeRoom();
            return true;
          }
          if(this.room.name != roomToAttack.name) {
            // const exitDir = this.room.findExitTo(roomToAttack);
            // const exit = this.pos.findClosestByRange(exitDir);
            // const exit = Game.getObjectById('59bbc39d2052a716c3ce66ea');
            this.travelTo(roomToAttack.controller);
            // console.log(roomToAttack);
            return true;
          }
          // if(Game.getObjectById('59c9063cb438bd4e51c47da8') != undefined) {
          //   var tmpWall = Game.getObjectById('59c9063cb438bd4e51c47da8');
          //   if(this.attack(tmpWall) == ERR_NOT_IN_RANGE) {
          //       this.travelTo(tmpWall);
          //   }
          // }
          let fixWeakRampart = new RoomPosition(19,29,'W57N5');
          if(this.pos.getRangeTo(fixWeakRampart) > 1) {
            this.travelTo(fixWeakRampart);
  
          }
          else {
            let fixRampart = this.room.lookForAt(LOOK_STRUCTURES, fixWeakRampart);
            fixRampart = _.filter(fixRampart, (r) => r.structureType == STRUCTURE_RAMPART);
            if(fixRampart.length > 0) {
                this.rangedAttack(fixRampart[0]);
                let damnRampart = Game.getObjectById('5b94a45e66f72507f93b5d69');
              let dismResult = this.dismantle(fixRampart[0]);
              
              // console.log(dismResult);
              return true;
            }
          }
          
          let weakRamparts = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART });
          weakRamparts = _.sortBy(weakRamparts,"hits");
  
          if(weakRamparts.length > 0) {
            if(this.dismantle(weakRamparts[0]) == ERR_NOT_IN_RANGE) {
              this.travelTo(weakRamparts[0]);
              return true;
            }
          }
  
          let spawns = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN });
          if(spawns.length > 0) {
            if(this.dismantle(spawns[0]) == ERR_NOT_IN_RANGE) {
              this.travelTo(spawns[0]);
              return true;
            }
          }
  
  
          var prey = null;
          var hostileCreeps = roomToAttack.hostileCreeps();
          var dangerousHostileCreeps = _.filter(hostileCreeps, function(h) {return h.isDangerous();});
          // var dangerousHostileCreeps = _.filter(hostileCreeps, (d) => d.isDangerous() && !d.isAlly() );
          if (dangerousHostileCreeps.length > 0) {
            prey = this.pos.findClosestByRange(dangerousHostileCreeps);
          }
          else if(hostileCreeps.length > 0) {
            prey = this.pos.findClosestByRange(hostileCreeps);
          }
  
  
          if (prey != undefined) {
            if(this.rangedAttack(prey) == ERR_NOT_IN_RANGE) {
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
              return true;
            }
          }
          else {
            // var hostileExtensions = _.filter(roomToAttack.find(FIND_HOSTILE_STRUCTURES), (s) => s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_STORAGE);
            var hostileExtensions = roomToAttack.find(FIND_HOSTILE_STRUCTURES);
            if (hostileExtensions.length > 0) {
              closestHostileExtension = this.pos.findClosestByRange(hostileExtensions);
              if(this.attack(closestHostileExtension) == ERR_NOT_IN_RANGE) {
                this.travelTo(closestHostileExtension);
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
            if(this.rangedAttack(hostileCreeps[0]) == ERR_NOT_IN_RANGE) {
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
  
    
  
  };
  