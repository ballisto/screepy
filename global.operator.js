'use strict';

operator.init = function() {
  if(Memory.operator == undefined) {Memory.operator = {};}
  jobs.init();
};

operator.run = function() {
  operator.init();
  operator.loadEnergy();
  operator.unloadLinkDrain();
};

operator.loadEnergy = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.structureType != STRUCTURE_LINK && ( (a.energy < a.energyCapacity && a.structureType != STRUCTURE_TOWER) || (a.energy < a.energyCapacity * 0.8 && a.structureType == STRUCTURE_TOWER) ));

  var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in structuresNeedingEnergyWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.transferResource, structuresNeedingEnergyWithoutOpenJob[s].id, RESOURCE_ENERGY, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
  }
};
operator.unloadLinkDrain = function() {
  // var allLinks = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LINK && a.energy > 100);
  var allLinks = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LINK && a.energy > 400);
  var drainLinks = _.filter(allLinks, function(l) {return l.isDrain();});

  var drainLinksWithoutOpenJob = _.filter(drainLinks, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.withdrawResource.task );});

  for(const d in drainLinks) {
    jobs.addJobWithTemplate(jobTemplates.withdrawResource, drainLinks[d].id, RESOURCE_ENERGY, 0);
  }
};
