StructureTerminal.prototype.run = function() {

  var openJobsForThis = jobs.getOpenJobsForStructure(this.id);
  
};

StructureTerminal.prototype.spaceLeft = function() {
  return this.storeCapacity - _.sum(this.store);
};
StructureTerminal.prototype.isEmpty = function() {
  return this.storeCapacity == this.spaceLeft();
};
StructureTerminal.prototype.isFull = function() {
  return this.spaceLeft() == 0;
};
StructureTerminal.prototype.isPrettyFull = function() {
  return this.spaceLeft() <= this.storeCapacity * 0.25;
};
