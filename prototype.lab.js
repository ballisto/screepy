StructureLab.prototype.getLabsInRange =
    function () {
      const adjacentPositions = Array.from(this.pos.getAllAdjacentPositions());
      var result = new Array();
      for(const p in adjacentPositions) {
        var strucsOnPosition = adjacentPositions[p].lookFor(LOOK_STRUCTURES);
        const curLabsInRange = _.filter(strucsOnPosition, (l) => l.structureType == STRUCTURE_LAB);
        if(curLabsInRange.length > 0) {
          const curLabInRange = curLabsInRange[0];
          result.push(curLabInRange);
        }
      }
      return result;
    };
StructureLab.prototype.isEmpty = function() {
  return this.mineralAmount == 0;
};

StructureLab.prototype.isBusy = function() {
  if (this.isBoostLab()) {return true;}
  if (this.factory() != undefined) {return this.factory().isBusy;}
  return false;
};

StructureLab.prototype.isBoostLab = function() {
  const thisRoomsBoostLabs = this.room.getBoostLabs();
  if( thisRoomsBoostLabs[this.id] != undefined) {return true;}
  return false;
};

StructureLab.prototype.factory = function() {
  if(this.room.factory() instanceof Factory) {
    return this.room.factory();
  }
  else {
    return undefined;
  }
};
