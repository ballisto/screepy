'use strict';

jobs.init = function() {
  if(Memory.jobs == undefined) {Memory.jobs = {};}
  if(Memory.jobs.maxJobId == undefined) {Memory.jobs.maxJobId = 1;}

  jobs.maxJobId = Memory.jobs.maxJobId;
};

jobs.run = function() {

};

jobs.jobForStructureExists = function(structureId, task) {
  var openJobsForStructure = _.filter(getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey), (j) => j.target == structureId && j.task == task && j.status != 'done');
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

  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,newJobData);
};

jobs.printJobs = function() {
    const tmpJobs = root.getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey);
    for(const key in tmpJobs) {
      console.log(JSON.stringify(tmpJobs[key]));
    }
};
