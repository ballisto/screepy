'use strict';

polier.init = function() {
  if(Memory.polier == undefined) {Memory.polier = {};}
  if(Memory.polier.maxAssignId == undefined) {Memory.polier.maxAssignId = 1;}

  polier.maxAssignId = Memory.polier.maxAssignId;

  if(!Array.isArray(root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey))) {
    var tmpArray = [];
    root.setSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey, tmpArray);
  }
  assignementsSegment: 1,
  assignmentsKey: "assignments",
};

polier.run = function() {
  var tmpjobs = this.getAllUnassignedJobs();
  for (const i in tmpjobs) {
    console.log(tmpjibs[i].jobId);
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
  return _.filter(this.getAllAssignments(), (a) => a.creepId == creepId);
};

polier.getAssignmentsForJob = function(jobId) {
  return _.filter(this.getAllAssignments(), (a) => a.jobId == jobId);
};

polier.jobAssignmentExists = function(jobId) {
  var tmpAssignsForJob = this.getAssignmentsForJob(jobId);
  if(tmpAssignsForJob.length > 0) {
    return true;
  }
  else {
    return false;
  }
};

polier.getAllUnassignedJobs = function() {
  return _.filter(this.getAllUnfinishedJobs(), function(s) { return !this.jobAssignmentExists(s.jobId);} );
};

polier.addAssignment = function(jobId, creepId) {
  const newAssignmentId = this.getAssignmentId();
  var newAssignmentData = {};

  newAssignmentData.id = newAssignmentId;
  newAssignmentData.jobId = jobId;
  newAssignmentData.creepId = creepId;
  newAssignmentData.created = Game.time;

  var tmpAllAssignments = root.getSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey);
  tmpAllAssignments.push(newAssignmentData);
  root.setSegmentObject(config.polier.assignementsSegment, config.polier.assignmentsKey,tmpAllJobs);
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
