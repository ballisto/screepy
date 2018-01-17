Creep.prototype.towerEmergencyFill = function () {
    var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
    if (tower != null) {
        if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(tower);
        }
    }
};

Creep.prototype.goToHomeRoom = function() {
    // send creep back to room indicated in creep.memory.homeroom. Returns true if creep is in homeroom, false otherwise
    if (this.room.name != this.memory.homeroom) {
        let waypointFlag =  Game.rooms[this.memory.homeroom].find(FIND_FLAGS, {filter: (f) => f.memory.waypoints != undefined && this.memory.spawn == Game.rooms[f.pos.roomName].controller.id});
        //console.log(this.room.name + ", " + this.name + ": " + waypointFlag.length);
        if (waypointFlag.length > 0) {
            //Waypoint flag found!
            this.gotoFlag(waypointFlag[0]);
        }
        else {
            let controller = Game.rooms[this.memory.homeroom].controller;
            this.moveTo(controller);
        }
        return false;
    }
    else {return true;}
};

Creep.prototype.isEmpty = function() {
  if(_.sum(this.carry) == 0) { return true;}
  else { return false;}
};

Creep.prototype.checkTerminalLimits = function(resource) {
    return checkTerminalLimits(this.room, resource);
};

Creep.prototype.storeAllBut = function(resource) {
    // send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
    // returns true if only carrying allowed resource
    if (this.isEmpty()) {
        return true;
    }
    if (arguments.length == 1 && (_.sum(this.carry) == this.carry[resource])) {
        return true;
    }

    var targetContainer = this.findSpace();
    if(targetContainer != null) {
      if (this.pos.getRangeTo(targetContainer) > 1) {
          this.moveToMy(targetContainer.pos, 1);
      }
      else {
          for (var res in this.carry) {
              if (arguments.length == 1 && resource == res) {
                  //keep this stuff
              }
              else {
                  this.transfer(targetContainer,res);
              }
          }
      }
    }
    else {
      this.say("NO SPACE!");
    }
    return false;
};

Creep.prototype.getResource = function(resource, amount) {
  if (this.carry[resource] != undefined && this.carry[resource] >= amount) {
      return true;
  }
  var targetContainer = this.findResource(resource);
  if(targetContainer != null) {
    if (this.pos.getRangeTo(targetContainer) > 1) {
        this.moveToMy(targetContainer.pos,1);
    }
    else {
      this.withdraw(targetContainer, resource);
    }
  }
  else {
    this.say("NO " + resource + "!");
  }
  return false;

};

Creep.prototype.flee = function (hostilesArray, range) {
    let hostilesMarker = [];
    for (let h in hostilesArray) {
        hostilesMarker.push({ pos: hostilesArray[h].pos, range: range });
    }
    var flightPath = PathFinder.search(this.pos, hostilesMarker, {flee: true}).path;
    this.moveByPath(flightPath);
};

Creep.prototype.gotoFlag = function (flag) {
    if (flag.memory.waypoints == undefined) {
        // No waypoints set -> proceed directly to flag
        this.moveTo(flag);
    }
    else {
        // Target flag has waypoints set
        if (this.memory.waypointFlag != flag.name) {
            // New flag target -> reset counter;
            this.memory.waypointCounter = 0;
            this.memory.waypointFlag = flag.name;
        }

        if (flag.memory.waypoints.length == this.memory.waypointCounter) {
            // Last waypoint reached -> go to final destination
            if (this.pos.getRangeTo(flag) > 2) {
                this.moveTo(flag);
            }
            else {
                this.memory.sleep = 3;
            }
        }
        else {
            //Go to waypoint
            let waypointFlag = Game.flags[flag.memory.waypoints[this.memory.waypointCounter]];

            if (waypointFlag == null) {
                //Waypoint flag does not exist
                console.log("Flag " + flag.name + " in room " + flag.pos.roomName + " has an invalid way-point #" + this.memory.waypointCounter);
                return false;
            }
            else {
                //Waypoint is valid
                if (this.room.name == waypointFlag.pos.roomName) {
                    // Creep is in waypoint room
                    if (this.pos.getRangeTo(waypointFlag) < 2) {
                        // Waypoint reached
                        this.memory.waypointCounter++;
                    }
                    else {
                        this.moveTo(waypointFlag);
                    }
                }
                else {
                    // Creep not in waypoint room
                    this.moveTo(waypointFlag);
                }
            }
        }
    }
};
