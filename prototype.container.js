StructureContainer.prototype.isHarvesterStorage = function () {

  var nearBySources = _.filter(this.room.find(FIND_SOURCES), (s) => this.pos.inRangeTo(s,2));
  var nearByMinerals = _.filter(this.room.find(FIND_MINERALS), (s) => this.pos.inRangeTo(s,2));
  if(nearBySources.length > 0 || nearByMinerals.length > 0) {return true;}

  return false;
};
