'use strict';

polier.init = function() {
  if(Memory.polier == undefined) {Memory.polier = {};}
  if(Memory.polier.maxAssignId == undefined) {Memory.polier.maxAssignId = 1;}

  polier.maxAssignId = Memory.polier.maxAssignId;

  if(!Array.isArray(root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey))) {
    var tmpArray = [];
    root.setSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey, tmpArray);
  }
};

polier.run = function() {
  var tmpjobs = polier.getAllUnassignedJobs();
  for (const i in tmpjobs) {
    console.log(tmpjobs[i].id);
  }
};

polier.getAssignmentId = function() {
  const result = polier.maxAssignId;
  polier.maxAssignId++;
  Memory.polier.maxAssignId = polier.maxAssignId;

  return result;
};
polier.getAllAssignments = function() {
  return root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey);
};

polier.getAssignmentsForCreep = function(creepId) {
  return _.filter(polier.getAllAssignments(), (a) => a.creepId == creepId);
};

polier.getAssignmentsForJob = function(jobId) {
  return _.filter(polier.getAllAssignments(), (a) => a.jobId == jobId);
};

polier.jobAssignmentExists = function(jobId) {
  var tmpAssignsForJob = polier.getAssignmentsForJob(jobId);
  if(tmpAssignsForJob.length > 0) {
    return true;
  }
  else {
    return false;
  }
};

polier.getAllUnassignedJobs = function() {
  return _.filter(jobs.getAllUnfinishedJobs(), function(s) { return !polier.jobAssignmentExists(s.id);} );
};

polier.addAssignment = function(jobId, creepId) {
  //check if job already assigned. Abort
  if(polier.jobAssignmentExists(jobId)) {return false;}

  const newAssignmentId = polier.getAssignmentId();
  var newAssignmentData = {};

  newAssignmentData.id = newAssignmentId;
  newAssignmentData.jobId = jobId;
  newAssignmentData.creepId = creepId;
  newAssignmentData.created = Game.time;

  var tmpAllAssignments = root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey);
  tmpAllAssignments.push(newAssignmentData);
  root.setSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey,tmpAllJobs);
  return true;
};

jobs.printAssignments = function() {
    const tmpAssigns = root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey);
    for(const key in tmpAssigns) {
      console.log(JSON.stringify(tmpAssigns[key]));
    }
};

jobs.resetMemory = function() {
  var tmpArray = [];
  root.setSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey, tmpArray);
};
