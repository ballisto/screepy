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
  jobs.cleanup();
};

jobs.getAllJobs = function() {
  return root.getSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey);
};
jobs.getAllUnfinishedJobs = function() {
  return _.filter(jobs.getAllJobs(), (j) => j.status != 'done');
};

jobs.getJobData = function(jobId) {
    var tmpResult = _.filter(jobs.getAllJobs(), (j) => j.id == jobId);
    if(Array.isArray(tmpResult)) {
        return tmpResult[0];
    }
    else {return undefined;}
};

jobs.getTargetObject = function(jobId) {
  const jobData = jobs.getJobData(jobId);
  if(jobData) {
    const targetObject = Game.getObjectById(jobData.target);
    return targetObject ? targetObject : null;
  }
  return null;
}

jobs.jobForStructureExists = function(structureId, task) {
  var openJobsForStructure = _.filter(jobs.getAllUnfinishedJobs(), (j) => j.target == structureId && j.task == task);
  if(openJobsForStructure.length > 0) {
    return true;
  }
  else {
    return false;
  }
};
jobs.jobForStructureCount = function(structureId, task) {
  var openJobsForStructure = _.filter(jobs.getAllUnfinishedJobs(), (j) => j.target == structureId && j.task == task);
  return openJobsForStructure.length;  
};

jobs.getOpenJobsForStructure = function(structureId) {
  var openJobsForStructure = _.filter(jobs.getAllUnfinishedJobs(), (j) => j.target == structureId);
  return openJobsForStructure;
};

jobs.getNewJobId = function() {
  const result = jobs.maxJobId;
  jobs.maxJobId++;
  Memory.jobs.maxJobId = jobs.maxJobId;

  return result;
};

jobs.addJobWithTemplate = function(template, targetId,resourceType, amount) {
  const newJobId = jobs.getNewJobId();
  var newJobData = {};

  newJobData.id = newJobId;
  newJobData.target = targetId;
  newJobData.resType = resourceType;
  newJobData.resAmount = amount;
  newJobData.created = Game.time;

  for(const k in template) {
    newJobData[k] = template[k];
  }
  var tmpAllJobs = jobs.getAllJobs();
  tmpAllJobs.push(newJobData);
  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,tmpAllJobs);
};

jobs.deleteJob = function(jobId) {
  var tmpJobs = _.filter(jobs.getAllJobs(), (j) => j.id != jobId);
  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,tmpJobs);
};

jobs.modifyJob = function(jobData) {
  var tmpJobs = _.filter(jobs.getAllJobs(), (j) => j.id != jobData.id);
  tmpJobs.push(jobData);
  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,tmpJobs);
};

jobs.setDone = function(jobId) {
  var tmpJobData = jobs.getJobData(jobId);
  tmpJobData.status = 'done';
  tmpJobData.ttl = 20;
  jobs.modifyJob(tmpJobData);
};

jobs.cleanup = function() {
  //delete all jobs that are done
  // var tmpActiveJobs = _.filter(jobs.getAllJobs(), (j) => j.status != 'done');
  var tmpActiveJobs = _.filter(jobs.getAllJobs(), function(j) { return (Game.time - j.created) < j.ttl; });
  root.setSegmentObject(config.jobs.jobsSegment,config.jobs.jobsKey,tmpActiveJobs);
};

jobs.printJobs = function() {
    const tmpJobs = jobs.getAllJobs();
    for(const key in tmpJobs) {
      console.log(JSON.stringify(tmpJobs[key]));
    }
};
jobs.printJobsForRoom = function(roomName) {
    const tmpJobs = jobs.getAllJobs();
    const tmpJobsForRoom = _.filter(tmpJobs, function(j) {return Game.getObjectById(j.target).room.name == roomName;})
    for(const key in tmpJobsForRoom) {
      console.log(JSON.stringify(tmpJobsForRoom[key]));
    }
};

jobs.resetMemory = function() {
  var tmpArray = [];
  root.setSegmentObject(config.jobs.jobsSegment, config.jobs.jobsKey, tmpArray);

};
