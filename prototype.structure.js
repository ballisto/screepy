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
