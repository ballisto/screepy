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
  var allLinks = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LINK);
  var drainLinks = _.filter(allLinks, (l) => l.takeEnergy() && l.energy >= 400 );
  var linksNeedEnergy = _.filter(allLinks, (l) => l.bringEnergy() && l.energy < (l.energyCapacity) );

  var drainLinksWithoutOpenJob = _.filter(drainLinks, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.withdrawResource.task );});
  var linksNeedEnergyWithoutOpenJob = _.filter(linksNeedEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const d in drainLinksWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.withdrawResource, drainLinksWithoutOpenJob[d].id, RESOURCE_ENERGY, 0);
  }
  for(const e in linksNeedEnergyWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.transferResource, linksNeedEnergyWithoutOpenJob[e].id, RESOURCE_ENERGY, (linksNeedEnergyWithoutOpenJob[e].energyCapacity - linksNeedEnergyWithoutOpenJob[e].energy) );
  }
};

operator.pickupResources = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.structureType != STRUCTURE_LINK && ( (a.energy < a.energyCapacity && a.structureType != STRUCTURE_TOWER) || (a.energy < a.energyCapacity * 0.8 && a.structureType == STRUCTURE_TOWER) ));
  //
  // var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});
  //
  // tempArray = this.room.find(FIND_DROPPED_RESOURCES);
  // for (var s in tempArray) {
  //     if (tempArray[s].energy != undefined) {
  //       if (tempArray[s].energy > 0) {
  //         IDBasket.push(tempArray[s]);
  //       }
  //     }
  // }
  // break;
  //
  //
  // for(const s in structuresNeedingEnergyWithoutOpenJob) {
  //   jobs.addJobWithTemplate(jobTemplates.transferResource, structuresNeedingEnergyWithoutOpenJob[s].id, RESOURCE_ENERGY, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
  // }
};
