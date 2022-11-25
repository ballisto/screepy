PowerCreep.prototype.findSpace = function() {
	return this.room.findSpace();
};
PowerCreep.prototype.findResource = function(resource) {
	return this.room.findResource(resource);
};

PowerCreep.prototype.homeRoom = function() {
  if(this.memory.homeroom != undefined && Game.rooms[this.memory.homeroom] != undefined) {
    return Game.rooms[this.memory.homeroom];
  }
  return undefined;
};

PowerCreep.prototype.isEmpty = function() {
  if(_.sum(this.carry) == 0) { return true;}
  else { return false;}
};

PowerCreep.prototype.isFull = function() {
  if(_.sum(this.carry) == this.carryCapacity) { return true;}
  else { return false;}
};
PowerCreep.prototype.storeAllBut = function(resource, uselinks) {
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
        let closerLinks = _.filter(this.room.find(FIND_MY_STRUCTURES), (s) => s.structureType == STRUCTURE_LINK && s.getPriority() == 0 && !s.isHarvesterLink() );
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
                        let secondaryLinks = _.filter(closerLinks, (c) => closerLinks[l].pos.getRangeTo(c.pos) < 2 && closerLinks[l].id != c.id && (c.energyCapacity - c.energy) >= this.carry[RESOURCE_ENERGY]);
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
          this.travelTo(targetContainer.pos);
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
    // else {
    //   this.goToHomeRoom();
    //   this.say("NO SPACE!");
    // }
    return false;
};