'use strict';

jobs.init = function() {
  if(Memory.jobs == undefined) {Memory.jobs = {};}
  if(Memory.jobs.maxJobId == undefined) {Memory.jobs.maxJobId = 1;}

  jobs.maxJobId = Memory.jobs.maxJobId;

  if(!Array.isArray(root.getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey))) {
    var tmpArray = [];
    root.setSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey, tmpArray);
  }
};

jobs.run = function() {

};

jobs.getAllJobs = function() {
  return root.getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey);
};
jobs.getAllUnfinishedJobs = function() {
  return _.filter(this.getAllJobs(), (j) => j.status != 'done');
};

jobs.jobForStructureExists = function(structureId, task) {
  var openJobsForStructure = _.filter(root.getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey), (j) => j.target == structureId && j.task == task && j.status != 'done');
  if(openJobsForStructure.length > 0) {
    return true;
  }
  else {
    return false;
  }
};
jobs.getNewJobId = function() {
  const result = jobs.maxJobId;
  jobs.maxJobId++;
  Memory.jobs.maxJobId = jobs.maxJobId;

  return result;
};

jobs.addJobWithTemplate = function(template, targetId,resourceType, amount) {
  const newJobId = this.getNewJobId();
  var newJobData = {};

  newJobData.id = newJobId;
  newJobData.target = targetId;
  newJobData.resType = resourceType;
  newJobData.resAmount = amount;
  newJobData.created = Game.time;

  for(const k in template) {
    newJobData[k] = template[k];
  }
  var tmpAllJobs = this.getAllJobs();
  tmpAllJobs.push(newJobData);
  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,tmpAllJobs);
};



jobs.printJobs = function() {
    for(const key in this.getAllJobs()) {
      console.log(JSON.stringifyopenJobsForStructure(tmpJobs[key]));
    }
};

jobs.resetMemory = function() {
  var tmpArray = [];
  root.setSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey, tmpArray);

};
