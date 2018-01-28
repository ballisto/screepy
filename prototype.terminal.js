StructureTerminal.prototype.run = function() {

  var openJobsForThis = jobs.getOpenJobsForStructure(this.id);

};

StructureTerminal.prototype.isPrettyFull = function() {
  return this.spaceLeft() <= this.storeCapacity * 0.25;
};
