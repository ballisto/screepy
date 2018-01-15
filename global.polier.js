'use strict';

polier.init = function() {
  if(Memory.polier == undefined) {Memory.polier = {};}
  if(Memory.polier.maxAssignId == undefined) {Memory.polier.maxAssignId = 1;}

  polier.maxAssignId = Memory.polier.maxAssignId;

  if(!Array.isArray(root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey))) {
    var tmpArray = [];
    root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey, tmpArray);
  }
};

polier.run = function() {
  polier.assignJobs();
  // var tmpjobs = polier.getAllUnassignedJobs();
  // for (const i in tmpjobs) {
  //   console.log(tmpjobs[i].id);
  // }
};

polier.getAssignmentId = function() {
  const result = polier.maxAssignId;
  polier.maxAssignId++;
  Memory.polier.maxAssignId = polier.maxAssignId;

  return result;
};
polier.getAllAssignments = function() {
  return root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey);
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

  var tmpAllAssignments = root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey);
  tmpAllAssignments.push(newAssignmentData);
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey,tmpAllAssignments);
  return true;
};

polier.creepMatchesBodyReq = function(creepId, bodyReqString) {
  if(bodyReqString.length != 8) {return false;}
  const creepObject = Game.getObjectById(creepId);
  if(creepObject == undefined) {return false;}

  var result = true;
  const creepBodyMatrix = creepObject.bodyMatrix();
  const bodyReqMatrix = polier.bodyReqString2Hitpoints(bodyReqString);

  for (let m = 0; m < 8; m++) {
    if(creepBodyMatrix[m] < bodyReqMatrix[m]) {
      result = false;
    }
  }
  return result;
};
polier.bodyReqString2Hitpoints = function(bodyReqString) {
  if(bodyReqString.length != 8) {return false;}
  var result = [];
  for (let i = 0; i < 8; i++) {
      result[i] = bodyHitpointsMatrix[bodyReqString.charAt(i)];
  }
  return result;
};

polier.findCreepForJob = function(jobData) {
  const targetStructure = Game.getObjectById(jobData.target);
  if(targetStructure == undefined) {return false;}

  var creepsInRoom = _.filter(Game.creeps, (c) => c.room.name == targetStructure.room.name);
  var creepsInRoomMatchingBodyReq = _.filter(creepsInRoom, function(c) {return polier.creepMatchesBodyReq(c.id, jobData.bodyReq);});
  // TODO - make an intelligent choice if multiple candidates found
  var creepWithLessAssignments = _.min(creepsInRoomMatchingBodyReq, function(c) { return polier.getAssignmentsForCreep(c.id).length;});
  if(creepWithLessAssignments) {return creepWithLessAssignments;}
  else {return false;}
};

polier.assignJobs = function() {
  var unassignedJobs = polier.getAllUnassignedJobs();
  for(const j in unassignedJobs) {
    const tmpCreepForJob = polier.findCreepForJob(unassignedJobs[j]);
    if(tmpCreepForJob) {
      polier.addAssignment(unassignedJobs[j].id, tmpCreepForJob.id);
    }
  }
};

polier.printAssignments = function() {
    const tmpAssigns = root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey);
    for(const key in tmpAssigns) {
      console.log(JSON.stringify(tmpAssigns[key]));
    }
};

polier.resetMemory = function() {
  var tmpArray = [];
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey, tmpArray);
};
