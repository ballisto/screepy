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
  polier.cleanup();
  polier.assignJobs();
  // var tmpjobs = polier.getAllUnassignedJobs();
  // for (const i in tmpjobs) {
  //   console.log(tmpjobs[i].id);
  // }
  //  console.log(polier.summary());
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
  var tmpAssignsForCreep = _.filter(polier.getAllAssignments(), (a) => a.creepId == creepId);
  return _.sortBy(tmpAssignsForCreep, function(a) { jobs.getJobData(a.jobId).priority; });
};

polier.getCurTaskForCreep = function(creepId) {
  var tmpAssignsForCreep = polier.getAssignmentsForCreep(creepId);
  if(Array.isArray(tmpAssignsForCreep)) {
    return tmpAssignsForCreep[0];
  }
  else {return undefined;}
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

polier.deleteAssignment = function(assignmentId) {
  var tmpAllAssignments = _.filter(root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey), (a) => a.id != assignmentId);
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey,tmpAllAssignments);
};

polier.modifyAssignment = function(assigmentData) {
  var tmpAllAssignments = _.filter(root.getSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey), (a) => a.id != assigmentData.id);
  tmpAllAssignments.push(assigmentData);
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey,tmpAllAssignments);
};

polier.cleanup = function() {
  //delete all assignments for done jobs and nonexistent jobs
  var tmpAllActiveAssignments = _.filter(polier.getAllAssignments(), function(a) { return jobs.getJobData(a.jobId) ? jobs.getJobData(a.jobId).status != 'done' : false; });
  var tmpAllActiveAssignmentsWithLivingCreeps = _.filter(tmpAllActiveAssignments, function(c) { return Game.getObjectById(c.creepId) ? true : false;});
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey,tmpAllActiveAssignmentsWithLivingCreeps);
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

polier.findCandidatesForJob = function(jobData) {
  const targetStructure = Game.getObjectById(jobData.target);
  if(targetStructure == undefined) {return false;}

  if(jobData.task == 'boostCreep') {
    var creepsInRoom = _.filter(Game.creeps, (c) => c.room.name == targetStructure.room.name && c.ticksToLive > 1000 && config.polier.rolesToBoost.includes(c.role()));
    var creepsInRoomBoostable = _.filter(creepsInRoom, function(c) {return c.canBeBoosted().includes(jobData.resType);});
    return creepsInRoomBoostable;
  }
  else {
    if(jobData.job != undefined && (jobData.job == 'steal' || jobData.job == 'supportTransport')) {
      var creepsInRoom = _.filter(Game.creeps, (c) => (c.room.name == targetStructure.room.name || c.room.supportRooms().includes(targetStructure.room) || (c.room.name == 'W57S4' && targetStructure.room.name == 'W57S3' ) ) && !c.spawning && config.polier.rolesToAssign.includes(c.role()));
    }
    else {
      var creepsInRoom = _.filter(Game.creeps, (c) => c.room.name == targetStructure.room.name && !c.spawning && config.polier.rolesToAssign.includes(c.role()));
    }

    var creepsInRoomMatchingBodyReq = _.filter(creepsInRoom, function(c) {return polier.creepMatchesBodyReq(c.id, jobData.bodyReq);});
    return creepsInRoomMatchingBodyReq;
  }
};

polier.findCreepForJob = function(jobData) {
  var candidatesForJob = polier.findCandidatesForJob(jobData);
  // TODO - make an intelligent choice if multiple candidates found
  var creepWithLessAssignments = _.min(candidatesForJob, function(c) { return polier.getAssignmentsForCreep(c.id).length;});
  if(creepWithLessAssignments) {return creepWithLessAssignments;}
  else {return false;}
};

polier.assignJobs = function() {
  var unassignedJobs = polier.getAllUnassignedJobs();
  var unassignedJobsForCreeps = _.filter(unassignedJobs, (j) => j.entity == 'creep');
  for(const j in unassignedJobs) {
    const tmpCreepForJob = polier.findCreepForJob(unassignedJobs[j]);
    if(tmpCreepForJob instanceof Creep) {
      if(polier.getAssignmentsForCreep().length <= config.polier.maxAssignmentsPerWorker) {
        polier.addAssignment(unassignedJobs[j].id, tmpCreepForJob.id);
        unassignedJobs[j].status = 'assigned';
        jobs.modifyJob(unassignedJobs[j]);
      }
    }
  }
};

polier.balanceAssignments = function() {
  var assignmentsByCreep = _.indexBy(polier.getAllAssignments(), 'creepId');


};
polier.prioritize = function() {

  var assignmentsByCreep = _.indexBy(polier.getAllAssignments(), 'creepId');


};
polier.printAssignments = function() {
    const tmpAssigns = polier.getAllAssignments();
    for(const key in tmpAssigns) {
      console.log(JSON.stringify(tmpAssigns[key]));
    }
};

polier.summary = function() {
  var sortedJobList = _.sortBy(jobs.getAllJobs(), function(j) { return Game.getObjectById(j.target).room.name; });

  var returnstring = "Jobs summary\n"
  returnstring = returnstring.concat("<table><tr><th>Room  </th><th>Job  </th><th>Task  </th><th>Target  </th><th>Status  </th><th>Age  </th><th>TTL  </th></tr>");
  var resourceTable = [];
  var total = [];

  for (const curJob in sortedJobList) {
    const jobData = sortedJobList[curJob];
    const curJobTargetObject = jobs.getTargetObject(jobData.id);

      var color = "#aaffff";
      returnstring = returnstring.concat("<tr></tr><td>" + curJobTargetObject.room.name + "  </td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + jobData.id + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + jobData.task + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + curJobTargetObject.structureType + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + jobData.status + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + (Game.time - jobData.created) + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + (jobData.ttl - (Game.time - jobData.created)) + "  </font></td>");

      returnstring = returnstring.concat("</tr>");

  }
  const curAssignments = polier.getAllAssignments();
  if(curAssignments.length > 0) {
    returnstring = returnstring.concat("<table><tr><th>Creep  </th><th>Id  </th></tr>");
    for(const curassign in curAssignments) {
      const assignedCreep = Game.getObjectById(curAssignments[curassign].creepId);
      if (assignedCreep) {
        returnstring = returnstring.concat("<tr></tr><td>" + assignedCreep.name + "  </td>");
        returnstring = returnstring.concat("<td><font color='" + color + "'>" + curAssignments[curassign].creepId + "  </font></td>");
      }
    }
      returnstring = returnstring.concat("</tr>");
  }

  returnstring = returnstring.concat("</tr></table>");
  return returnstring;
};

polier.resetMemory = function() {
  var tmpArray = [];
  root.setSegmentObject(config.polier.assignmentsSegment, config.polier.assignmentsKey, tmpArray);
};
