Structure.prototype.spaceLeft = function () {
  if(this.store != undefined && this.storeCapacity != undefined && _.sum(this.store) < this.storeCapacity) {
    return this.storeCapacity - _.sum(this.store);
  }
  else { return 0;}
};

Structure.prototype.isEmpty = function() {
if(this.store != undefined && this.storeCapacity != undefined && _.sum(this.store) == 0) {
return true;
}
if(this.store != undefined && this.storeCapacity != undefined && _.sum(this.store) > 0) {
return false;
}
else {
return true;
}
};

Structure.prototype.isFull = function() {
if(this.store != undefined && this.storeCapacity != undefined && _.sum(this.store) == this.storeCapacity) {
return true;
}
if(this.store != undefined && this.storeCapacity != undefined && _.sum(this.store) < this.storeCapacity) {
return false;
}
else {
return true;
}
};

Structure.prototype.isAlmostFull = function() {
    let buffer = 0;
    switch (this.structureType) {
        case STRUCTURE_STORAGE: buffer = 20000;
        break;
        case STRUCTURE_TERMINAL: buffer = 10000;    
        break;
        default: buffer = 0;
        break;
    }    
    
    if ( this.spaceLeft() <= buffer ) {
        return true;
    }
    else {
        return false;
    }
};

Structure.prototype.hasEnergy = function( minAmount = 50 ) {
  if(this.energy != undefined && this.energy > minAmount) {
    return true;
  }
  if(this.store != undefined && this.store[RESOURCE_ENERGY] != undefined && this.store[RESOURCE_ENERGY] > minAmount) {
    return true;
  }
  else {
    return false;
  }
};


Structure.prototype.defensePriority = function() {
switch (this.structureType) {
case STRUCTURE_SPAWN: return 1;
break;
case STRUCTURE_STORAGE: return 2;
break;
case STRUCTURE_TERMINAL: return 3;    
break;
case STRUCTURE_NUKER: return 4;
break;
case STRUCTURE_TOWER: return 5;
break;
case STRUCTURE_EXTENSION: return 6;
break;
case STRUCTURE_LAB: return 7;
break;
default: return 9;
break;
}
};
