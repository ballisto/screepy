Creep.prototype.goAroundShit = function (targetRoomName) {
    // if( targetRoomName == 'W57N37' || targetRoomName == 'W57N38' || targetRoomName == 'W57N39' || targetRoomName == 'W58N39' || targetRoomName == 'W56N39') {
    //     if(this.memory.W58N33_WP == undefined ) {
    //         if(this.pos.getRangeTo(Game.flags['W58N33_WP']) > 1) {
    //             this.moveTo(Game.flags['W58N33_WP'], {reusePath: 50});
    //             this.say('W58N33_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W58N33_WP = true;
    //         }
    //     }
    //     if(this.memory.W58N36_WP == undefined && this.memory.W58N33_WP != undefined) {
    //         if(this.pos.getRangeTo(Game.flags['W58N36_WP']) > 1) {
    //             this.moveTo(Game.flags['W58N36_WP'], {reusePath: 50});
    //             this.say('W58N36_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W58N36_WP = true;
    //         }
    //     }     
    // }
    if(targetRoomName == 'W52N36') {
        if(this.memory.W53N33_WP == undefined ) {
            if(this.pos.getRangeTo(Game.flags['W53N33_WP']) > 1) {
                this.travelTo(Game.flags['W53N33_WP'], {reusePath: 50});
                this.say('W53N33_WPrudi')
                return true;
            }
            else {
                this.memory.W53N33_WP = true;
            }
        }
        // if(this.memory.W52N34_WP == undefined && this.memory.W53N33_WP != undefined) {
        //     if(this.pos.getRangeTo(Game.flags['W52N34_WP']) > 1) {
        //         this.moveTo(Game.flags['W52N34_WP'], {reusePath: 50});
        //         this.say('W52N34_WP')
        //         return true;
        //     }
        //     else {
        //         this.memory.W52N34_WP = true;
        //     }
        // }  
        // if(this.memory.W52N35_WP == undefined && this.memory.W52N34_WP != undefined) {
        //     if(this.pos.getRangeTo(Game.flags['W52N35_WP']) > 1) {
        //         this.moveTo(Game.flags['W52N35_WP'], {reusePath: 50});
        //         this.say('W52N35_WP')
        //         return true;
        //     }
        //     else {
        //         this.memory.W52N35_WP = true;
        //     }
        // }  
    }
    if( targetRoomName == 'W53N18' && this.memory.homeroom == 'W56N18') {
        if(this.memory.W53N19_WP == undefined ) {
            if(this.pos.getRangeTo(Game.flags['W53N19_WP']) > 1) {
                this.travelTo(Game.flags['W53N19_WP'], {reusePath: 50});
                this.say('W53N19_WP')
                return true;
            }
            else {
                this.memory.W53N19_WP = true;
            }
        }
    }
    
    if( targetRoomName == 'W53N18' && (this.memory.homeroom == 'W52N14' || this.memory.homeroom == 'W49N13'|| this.memory.homeroom == 'W53N12')) {
        if(this.memory.W50N20_WP == undefined ) {
            if(this.pos.getRangeTo(Game.flags['W50N20_WP']) > 1) {
                this.travelTo(Game.flags['W50N20_WP'], {reusePath: 50});
                this.say('W50N20_WP')
                return true;
            }
            else {
                this.memory.W50N20_WP = true;
            }
        }
        if(this.memory.W52N20_WP == undefined) {
            if(this.pos.getRangeTo(Game.flags['W52N20_WP']) > 1) {
                this.travelTo(Game.flags['W52N20_WP'], {reusePath: 50});
                this.say('W52N20_WP')
                return true;
            }
            else {
                this.memory.W52N20_WP = true;
            }
        }
    }
    
        // if(this.memory.W50N24_WP != undefined && this.memory.W50N20_WP == undefined) {
    //         if(this.pos.getRangeTo(Game.flags['W50N20_WP']) > 1) {
    //             this.moveTo(Game.flags['W50N20_WP'], {reusePath: 50});
    //             this.say('W50N20_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W50N20_WP = true;
    //         }
    //     }
    //     if(this.memory.W50N20_WP != undefined && this.memory.W51N20_WP == undefined) {
    //         if(this.pos.getRangeTo(Game.flags['W51N20_WP']) > 1) {
    //             this.moveTo(Game.flags['W51N20_WP'], {reusePath: 50});
    //             this.say('W51N20_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W51N20_WP = true;
    //         }
    //     }
    //     if(this.memory.W51N20_WP != undefined && this.memory.W52N20_WP == undefined) {
    //         if(this.pos.getRangeTo(Game.flags['W52N20_WP']) > 1) {
    //             this.moveTo(Game.flags['W52N20_WP'], {reusePath: 50});
    //             this.say('W52N20_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W52N20_WP = true;
    //         }
    //     }
    // }
    // if( (targetRoomName == 'W55N28' || targetRoomName == 'W56N29'|| targetRoomName == 'W53N29'|| targetRoomName == 'W54N28') && (this.memory.role != 'remoteStationaryHarvester')) {
    //     if(this.memory.W53N27_WP == undefined) {
    //         if(this.pos.getRangeTo(Game.flags['W53N27_WP']) > 1) {
    //             this.moveTo(Game.flags['W53N27_WP'], {reusePath: 50});
    //             this.say('W53N27_WP')
    //             return true;
    //         }
    //         else {
    //             this.memory.W53N27_WP = true;
    //         }
    //     }
    //     // if(this.memory.W55N20_WP != undefined && this.memory.W55N24_WP == undefined) {
    //     //     // this.goToHomeRoom();
    //     //     // return true;
    //     //     if(this.pos.getRangeTo(Game.flags['W55N24_WP']) > 1) {
    //     //         this.moveTo(Game.flags['W55N24_WP'], {reusePath: 50});
    //     //         this.say('W55N24_WP')
    //     //         return true;
    //     //     }
    //     //     else {
    //     //         this.memory.W55N24_WP = true;
    //     //     }
    //     // }
    //     // if(this.memory.W55N24_WP != undefined && this.memory.W55N24_WP2 == undefined) {
    //     //     if(this.pos.getRangeTo(Game.flags['W55N24_WP2']) > 1) {
    //     //         this.moveTo(Game.flags['W55N24_WP2'], {reusePath: 50});
    //     //         this.say('W55N24_WP2')
    //     //         return true;
    //     //     }
    //     //     else {
    //     //         this.memory.W55N24_WP2 = true;
    //     //     }
    //     // }
    //     // if(this.memory.W55N24_WP2 != undefined && this.memory.W55N26_WP == undefined) {
    //     //     if(this.pos.getRangeTo(Game.flags['W55N26_WP']) > 1) {
    //     //         this.moveTo(Game.flags['W55N26_WP'], {reusePath: 50});
    //     //         this.say('W55N26_WP')
    //     //         return true;
    //     //     }
    //     //     else {
    //     //         this.memory.W55N26_WP = true;
    //     //     }
    //     // }
    //     // if(this.memory.W55N26_WP != undefined && this.memory.W54N26_WP == undefined) {
    //     //     if(this.pos.getRangeTo(Game.flags['W54N26_WP']) > 1) {
    //     //         this.moveTo(Game.flags['W54N26_WP'], {reusePath: 50});
    //     //         this.say('W54N26_WP')
    //     //         return true;
    //     //     }
    //     //     else {
    //     //         this.memory.W54N26_WP = true;
    //     //     }
    //     // }
    // }
    return false;
};

Creep.prototype.towerEmergencyFill = function () {
    var tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});
    if (tower != null) {
        if (this.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(tower);
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
            this.travelTo(controller, {reusePath: 100});
        }
        return false;
    }
    else {return true;}
};

Creep.prototype.isAlly = function() {
  if(global.allies.includes(this.owner.username)) {return true;}
  else {return false;}  
  };

Creep.prototype.homeRoom = function() {
  if(this.memory.homeroom != undefined && Game.rooms[this.memory.homeroom] != undefined) {
    return Game.rooms[this.memory.homeroom];
  }
  return undefined;
};

Creep.prototype.isEmpty = function() {
  if(_.sum(this.carry) == 0) { return true;}
  else { return false;}
};

Creep.prototype.isFull = function() {
  if(_.sum(this.carry) == this.carryCapacity) { return true;}
  else { return false;}
};

Creep.prototype.isDangerous = function() {
  if ( (_.filter( this.body, (b) => b.type == ATTACK ||  b.type == RANGED_ATTACK )).length > 0 ) {return true;}
  return false;
};

Creep.prototype.isHostile = function() {
  if( !this.my && !this.isAlly() ) {return true;}
  else {return false;}  
  };

Creep.prototype.checkTerminalLimits = function(resource) {
    return checkTerminalLimits(this.room, resource);
};

Creep.prototype.storeAllBut = function(resource, uselinks) {
    // send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
    // returns true if only carrying allowed resource
    let useLinks = false;
    
    if (this.isEmpty()) {
        return true;
    }
    if (arguments.length == 1 && resource != '' && (_.sum(this.carry) == this.carry[resource])) {
        return true;
    }
    if (arguments.length == 2 && uselinks != '' && uselinks == true) {
        useLinks = true;
    }
    
    var targetContainer = this.findSpace();
    
    if(useLinks && (_.sum(this.carry) == this.carry[RESOURCE_ENERGY])) {
        let closerLinks = _.filter(this.room.find(FIND_MY_STRUCTURES), (s) => s.structureType == STRUCTURE_LINK && s.getPriority() == 0);// && !s.isHarvesterLink() );
        closerLinks = _.sortBy(closerLinks, (l) => this.pos.getRangeTo(l.pos));
        if(closerLinks.length > 0) {
            let distanceToContainer = 999;
            if(targetContainer != null) { 
                let pathToContainer = this.room.findPath(this.pos, targetContainer.pos);
                distanceToContainer = (pathToContainer.length ? pathToContainer.length : 999);
                // this.say(distanceToContainer);
            }
            
            for(let l in closerLinks) {
                let pathToLink = this.room.findPath(this.pos, closerLinks[l].pos);
                let distanceToLink = (pathToLink.length ? pathToLink.length : 9999);
                if(distanceToLink < distanceToContainer) {
                    if( (closerLinks[l].energyCapacity - closerLinks[l].energy) < this.carry[RESOURCE_ENERGY] ) {
                        let secondaryLinks = _.filter(closerLinks, (c) => closerLinks[l].pos.getRangeTo(c.pos) <= 2 && closerLinks[l].id != c.id && (c.energyCapacity - c.energy) >= this.carry[RESOURCE_ENERGY]);
                        if ( secondaryLinks.length > 0) {
                             targetContainer = secondaryLinks[l];
                            break;
                        }
                    }
                    targetContainer = closerLinks[l];
                    
                    break;
                }
            }
        }
    }
    
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
      this.goToHomeRoom();
      this.say("NO SPACE!");
    }
    return false;
};

Creep.prototype.getResource = function(resource, amount) {
  if (this.carry[resource] != undefined && (this.carry[resource] >= amount || this.carry[resource] == this.carryCapacity) ) {
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
        this.travelTo(flag);
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
                this.travelTo(flag);
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
                        this.travelTo(waypointFlag);
                    }
                }
                else {
                    // Creep not in waypoint room
                    this.travelTo(waypointFlag);
                }
            }
        }
    }
};

Creep.prototype.moveRandom = function(onPath) {
  const startDirection = _.random(1, 8);
  let direction = 0;
  for (let i = 0; i < 8; i++) {
    direction = RoomPosition.changeDirection(startDirection, i);
    const pos = this.pos.getAdjacentPosition(direction);
    if (pos.isBorder(-1)) {
      continue;
    }
    if (onPath && !pos.inPath()) {
      continue;
    }
    if (pos.checkForWall()) {
      continue;
    }
    if (pos.checkForObstacleStructure()) {
      continue;
    }
    break;
  }
  this.move(direction);
};
