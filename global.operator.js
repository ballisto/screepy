'use strict';

operator.init = function() {
  if(Memory.operator == undefined) {Memory.operator = {};}
};

operator.run = function() {
  operator.init();
  operator.loadEnergy();
};

operator.loadEnergy = function() {
  var structuresNeedingEnergy = _.filter(Game.structures, (a) => a.energy < a.energyCapacity && a.structureType != STRUCTURE_LINK);
  var structuresNeedingEnergyWithoutOpenJob = _.filter(structuresNeedingEnergy, function(s) { return polier.jobForStructureExists(s.target, s.task);});

  for(const s in structuresNeedingEnergyWithoutOpenJob) {
    polier.addJobWithTemplate(jobTemplates.loadEnergy, structuresNeedingEnergyWithoutOpenJob[s].id, structuresNeedingEnergyWithoutOpenJob[s].energyCapacity - structuresNeedingEnergyWithoutOpenJob[s].energy);
  }
};
