'use strict';

operator.init = function() {
  if(Memory.operator == undefined) {Memory.operator = {};}
  jobs.init();
};

operator.run = function() {
  operator.init();
  operator.loadEnergy();
  operator.unloadLinkDrain();
  operator.pickupResources();
  operator.loadLabs();
  operator.boostCreeps();
};

operator.loadEnergy = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.structureType != STRUCTURE_LINK && ( (a.energy < a.energyCapacity && a.structureType != STRUCTURE_TOWER) || (a.energy < a.energyCapacity * 0.8 && a.structureType == STRUCTURE_TOWER) ));

  var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in structuresNeedingEnergyWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.transferResource, structuresNeedingEnergyWithoutOpenJob[s].id, RESOURCE_ENERGY, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
  }
};

operator.loadLabs = function() {
  //load boost labs
  for ( const r in Game.rooms) {
    for (const l in Game.rooms[r].getBoostLabs()) {
      const curLabObject = Game.getObjectById(l);
      if(curLabObject != undefined && !jobs.jobForStructureExists(l, jobTemplates.transferResource.task) && (curLabObject.mineralCapacity - curLabObject.mineralAmount) > 150) {
        jobs.addJobWithTemplate(jobTemplates.transferResource, l, Memory.rooms[r].boostLabs[l], curLabObject.mineralCapacity - curLabObject.mineralAmount);
      }
    }
  }
};

operator.unLoadLabs = function() {
  //load boost labs
  // for ( const r in Game.rooms) {
  //   for (const l in Game.rooms[r].getBoostLabs()) {
  //     const curLabObject = Game.getObjectById(l);
  //     if(curLabObject != undefined && !jobs.jobForStructureExists(l, jobTemplates.withdrawResource.task) && (curLabObject.mineralCapacity - curLabObject.mineralAmount) > 150) {
  //       jobs.addJobWithTemplate(jobTemplates.withdrawResource, l, Memory.rooms[r].boostLabs[l], curLabObject.mineralCapacity - curLabObject.mineralAmount);
  //     }
  //   }
  // }
};

operator.boostCreeps = function() {
  //load boost labs
  for ( const r in Game.rooms) {
    for (const l in Game.rooms[r].getBoostLabs()) {
      const curLabObject = Game.getObjectById(l);
      if(curLabObject != undefined && curLabObject.mineralType == Memory.rooms[r].boostLabs[l] && curLabObject.mineralAmount > 150 && !jobs.jobForStructureExists(l, jobTemplates.boostCreep.task)) {
        jobs.addJobWithTemplate(jobTemplates.boostCreep, l, curLabObject.mineralType, 0);
      }
    }
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
  var allStorages = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_STORAGE);
  for(const s in allStorages) {
    var droppedResources = allStorages[s].room.find(FIND_DROPPED_RESOURCES);
    var droppedResourcesWithoutOpenJob = _.filter(droppedResources, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.pickupResource.task ) && s.amount > 150;});
    for(const e in droppedResourcesWithoutOpenJob) {
      jobs.addJobWithTemplate(jobTemplates.pickupResource, droppedResourcesWithoutOpenJob[e].id, droppedResourcesWithoutOpenJob[e].resourceType, droppedResourcesWithoutOpenJob[e].amount );
    }
  }
};

operator.resourceBalancing = function() {


};
