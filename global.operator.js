'use strict';

operator.init = function() {
  if(Memory.operator == undefined) {Memory.operator = {};}
  jobs.init();
};

operator.run = function() {
  operator.init();
//   operator.loadEnergy();
//   operator.unloadLinkDrain();
//   operator.pickupResources();
  operator.loadLabs();
  operator.boostCreeps();
  operator.unLoadLabs();
//   operator.steal();
//   operator.supportTransport();
  operator.unloadSourceContainers();
  operator.loadPower();
  operator.loadProxyContainers();
  operator.loadTowers();
  operator.loadNuker();
};

operator.loadPower = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingPower = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_POWER_SPAWN && a.power < (a.powerCapacity / 2) );

  var structuresNeedingPowerWithoutOpenJob = _.filter(structuresNeedingPower, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in structuresNeedingPowerWithoutOpenJob) {
    let curPowerSpawn = structuresNeedingPowerWithoutOpenJob[s];    
    const curRoomStorage = curPowerSpawn.room.storage;
    if(curRoomStorage != undefined && curRoomStorage.store != undefined && curRoomStorage.store[RESOURCE_POWER] != undefined && curRoomStorage.store[RESOURCE_POWER] >= curPowerSpawn.powerCapacity - curPowerSpawn.power) {
      const jobId = jobs.addJobWithTemplate(jobTemplates.transferResource, curPowerSpawn.id, RESOURCE_POWER, curPowerSpawn.powerCapacity - curPowerSpawn.power);
      // const jobData = jobs.getJobData(jobId);
      jobs.setPriority(jobId, 999);
    }
  }
};

operator.loadNuker = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var nukersNeedingG = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_NUKER && a.ghodium < a.ghodiumCapacity );

  var nukersNeedingGWithoutOpenJob = _.filter(nukersNeedingG, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in nukersNeedingGWithoutOpenJob) {
    let curNuker = nukersNeedingGWithoutOpenJob[s];    
    const curRoomStorage = curNuker.room.storage;
    if(curRoomStorage != undefined && curRoomStorage.store != undefined && curRoomStorage.store[RESOURCE_GHODIUM] != undefined && curRoomStorage.store[RESOURCE_GHODIUM] >= 1000) {
      const jobId = jobs.addJobWithTemplate(jobTemplates.transferResource, curNuker.id, RESOURCE_GHODIUM, curNuker.ghodiumCapacity - curNuker.ghodium);
      // const jobData = jobs.getJobData(jobId);
      jobs.setPriority(jobId, 999);
    }
  }
};

operator.loadTowers = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity * 0.8 && a.structureType == STRUCTURE_TOWER);

  var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in structuresNeedingEnergyWithoutOpenJob) {
    const jobId = jobs.addJobWithTemplate(jobTemplates.transferResource, structuresNeedingEnergyWithoutOpenJob[s].id, RESOURCE_ENERGY, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
    const roomEnergySource = structuresNeedingEnergyWithoutOpenJob[s].room.findResource(RESOURCE_ENERGY);
    if(roomEnergySource != undefined) {
      const jobData = jobs.getJobData(jobId);
      jobs.setPriority(jobId, jobData.priority + structuresNeedingEnergyWithoutOpenJob[s].pos.getRangeTo(roomEnergySource));
    }
  }
};

operator.loadEnergy = function() {
  // var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.structureType != STRUCTURE_LINK && ( (a.energy < a.energyCapacity && a.structureType != STRUCTURE_TOWER) || (a.energy < a.energyCapacity * 0.8 && a.structureType == STRUCTURE_TOWER) ));

  var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const s in structuresNeedingEnergyWithoutOpenJob) {
    const jobId = jobs.addJobWithTemplate(jobTemplates.transferResource, structuresNeedingEnergyWithoutOpenJob[s].id, RESOURCE_ENERGY, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
    const roomEnergySource = structuresNeedingEnergyWithoutOpenJob[s].room.findResource(RESOURCE_ENERGY);
    if(roomEnergySource != undefined) {
      const jobData = jobs.getJobData(jobId);
      jobs.setPriority(jobId, jobData.priority + structuresNeedingEnergyWithoutOpenJob[s].pos.getRangeTo(roomEnergySource));
    }
  }
};
operator.loadProxyContainers = function() {
  var allRooms = _.filter(Game.rooms, (r) => r.controller != undefined && r.controller.my);
  for(const r in allRooms) {
    var targetContainers = _.filter(allRooms[r].find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER && !s.isHarvesterStorage() && s.spaceLeft() >= 500 && !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task ) );
    for(const c in targetContainers) {
      jobs.addJobWithTemplate(jobTemplates.transferResource, targetContainers[c].id, RESOURCE_ENERGY, targetContainers[c].storeCapacity);
    }
  }

};

operator.loadLabs = function() {
  //load boost labs
  for ( const r in Game.rooms) {
    for (const l in Game.rooms[r].getBoostLabs()) {
      const curLabObject = Game.getObjectById(l);
    //   if(Memory.rooms[r].boostLabs[l] == 'GH2O') {Memory.rooms[r].boostLabs[l] = 'XGH2O';}
      if(curLabObject.isEmpty() || curLabObject.mineralType == Memory.rooms[r].boostLabs[l]) {
          const mineralAmountNeeded = curLabObject.mineralCapacity - curLabObject.mineralAmount;
          if(curLabObject != undefined && !jobs.jobForStructureExists(l, jobTemplates.transferResource.task) && (curLabObject.mineralCapacity - curLabObject.mineralAmount) > 150 && Game.rooms[r].totalResourceInStock(Memory.rooms[r].boostLabs[l]) >= mineralAmountNeeded) {
            jobs.addJobWithTemplate(jobTemplates.transferResource, l, Memory.rooms[r].boostLabs[l], mineralAmountNeeded );
          }
      }
    }
  }
};

operator.unLoadLabs = function() {
  //load boost labs
  var labsNotBusyWithMinerals = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LAB && !a.isBusy() && !a.isEmpty());
  var labsNotBusyWithMineralsWithoutOpenJob = _.filter(labsNotBusyWithMinerals, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.withdrawResource.task );});
  for(const l in labsNotBusyWithMineralsWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.withdrawResource, labsNotBusyWithMineralsWithoutOpenJob[l].id, labsNotBusyWithMineralsWithoutOpenJob[l].mineralType, 0);
  }
  // for ( const r in Game.rooms) {
  //   for (const l in Game.rooms[r].getBoostLabs()) {
  //     const curLabObject = Game.getObjectById(l);
  //     if(curLabObject != undefined && !jobs.jobForStructureExists(l, jobTemplates.withdrawResource.task) && (curLabObject.mineralCapacity - curLabObject.mineralAmount) > 150) {
  //       jobs.addJobWithTemplate(jobTemplates.withdrawResource, l, Memory.rooms[r].boostLabs[l], curLabObject.mineralCapacity - curLabObject.mineralAmount);
  //     }
  //   }
  // }
};

operator.steal = function() {
  if(false) {
    var targetStorage = Game.rooms['W57S3'].storage;
    if(_.sum(targetStorage.store) > 0 && targetStorage.room.isSafe()) {
      var resourceArray = [];
      for(const r in targetStorage.store) {
        var curResourceArr = {resource: r, amount: targetStorage.store[r]};
        resourceArray.push(curResourceArr);
      }
      resourceArray = _.sortBy(resourceArray, function(r) {return r.amount;});
      resourceArray.reverse();
      if(resourceArray.length > 0 ) {
        const resourceToSteal = resourceArray[0].resource;

        if(jobs.jobForStructureCount(targetStorage.id, jobTemplates.steal.task) < 5) {
          jobs.addJobWithTemplate(jobTemplates.steal, targetStorage.id, resourceToSteal, 0);
        }
      }
    }
  }
};

operator.supportTransport = function() {
  var roomsUnderSix = _.filter(Game.rooms, (r) => r.controller!= undefined && r.controller.level < 6 && r.controller.my);
  for (const r in roomsUnderSix) {
    // var structureWithSpaceInRoom = _.sortBy(roomsUnderSix[r].findSpace(), function(s) { return s.spaceLeft();});
    var structureWithSpaceInRoom = roomsUnderSix[r].findSpace();
    if (structureWithSpaceInRoom != undefined) {
      // structureWithSpaceInRoom.reverse();
      // for (const f in structureWithSpaceInRoom) {
        if(!jobs.jobForStructureExists(structureWithSpaceInRoom.id, jobTemplates.supportTransport.task)) {
          jobs.addJobWithTemplate(jobTemplates.supportTransport, structureWithSpaceInRoom.id, RESOURCE_ENERGY, 5000);
        // }
      }
    }
  }
}

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
  var drainLinks = _.filter(allLinks, (l) => l.takeEnergy() && l.energy >= 90);
  var linksNeedEnergy = _.filter(allLinks, (l) => l.bringEnergy() && l.energy < (l.energyCapacity) && l.cooldown == 0 );

  var drainLinksWithoutOpenJob = _.filter(drainLinks, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.withdrawResource.task );});
  var linksNeedEnergyWithoutOpenJob = _.filter(linksNeedEnergy, function(s) { return !jobs.jobForStructureExists(s.id, jobTemplates.transferResource.task );});

  for(const d in drainLinksWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.withdrawResource, drainLinksWithoutOpenJob[d].id, RESOURCE_ENERGY, 0);
  }
  for(const e in linksNeedEnergyWithoutOpenJob) {
    jobs.addJobWithTemplate(jobTemplates.transferResource, linksNeedEnergyWithoutOpenJob[e].id, RESOURCE_ENERGY, (linksNeedEnergyWithoutOpenJob[e].energyCapacity - linksNeedEnergyWithoutOpenJob[e].energy) );
  }
};
operator.unloadSourceContainers = function() {
  var allRooms = _.filter(Game.rooms, (r) => r.controller != undefined && r.controller.my);
  for(const r in allRooms) {
    var sourceContainers = _.filter(allRooms[r].find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER && s.isHarvesterStorage() && _.sum(s.store) > s.storeCapacity * 0.5 && !jobs.jobForStructureExists(s.id, jobTemplates.withdrawResource.task ) );
    for(const c in sourceContainers) {
      for (let r in sourceContainers[c].store) {
        if (sourceContainers[c].store[r] > 0) {
          jobs.addJobWithTemplate(jobTemplates.withdrawResource, sourceContainers[c].id, r, 0);
        }
      }
    }
  }
};

operator.pickupResources = function() {
  var allRooms = _.filter(Game.rooms, (r) => r.controller != undefined && r.controller.my);
  for(const r in allRooms) {
    let droppedResources = allRooms[r].find(FIND_DROPPED_RESOURCES);
    // let droppedResourcesWithoutOpenJob = droppedResources;
    let droppedResourcesWithoutOpenJob = _.filter(droppedResources, function(s) { return jobs.jobForStructureCount(s.id, jobTemplates.pickupResource.task ) < 2 && s.amount > 150;});
    // droppedResourcesWithoutOpenJob = droppedResources;
    for(const e in droppedResourcesWithoutOpenJob) {
      jobs.addJobWithTemplate(jobTemplates.pickupResource, droppedResourcesWithoutOpenJob[e].id, droppedResourcesWithoutOpenJob[e].resourceType, droppedResourcesWithoutOpenJob[e].amount );
    }
  }
};

operator.resourceBalancing = function() {


};
