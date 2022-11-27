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
  polier.runCreeps();
  // var tmpjobs = polier.getAllUnassignedJobs();
  // for (const i in tmpjobs) {
  //   console.log(tmpjobs[i].id);
  // }
  //  console.log(polier.summary());
};

polier.runCreeps = function() {
  //Cycle through creeps
  // if (CPUdebug == true) {
  //   CPUdebugString = CPUdebugString.concat("<br>Starting creeps: " + Game.cpu.getUsed())
  // }
  for (let name in Game.creeps) {
    // get the creep object
    var creep = Game.creeps[name];
    //Check for miniharvester
    if (creep.memory.role == "miniharvester") {
        creep.memory.role = "harvester";
    }
    //Check for fleeing creeps
    if (false && creep.room.memory.hostiles.length == 0 && creep.memory.fleeing == true) {
        //Get away from the exit
        if ((creep.pos.x < 10 || creep.pos.x > 40) || (creep.pos.y < 10 || creep.pos.y > 40)) {
            var area = creep.room.lookAtArea(20, 20, 40, 40, true);
            area = _.filter(area, function (a) {
                return (a.terrain != "wall")
            });
            if (area.length > 0) {
                let destPos = creep.room.getPositionAt(area[0].x, area[0].y);
                creep.moveTo(destPos);
            }
            else {
                console.log(creep.name + " - No safe area found in room " + curRoom.name + ".");
            }
        }
        else {
            //Creep has distance to any room exit
            creep.memory.sleep = 50;
            delete creep.memory.fleeing;
        }
    }
    else { // Check for sleeping creeps
        if (creep.memory.sleep != undefined && creep.memory.jobQueueTask == undefined) {
            creep.memory.sleep--;
            //creep.say("Zzz: " + creep.memory.sleep);
            if (creep.memory.sleep < 1) {
                delete creep.memory.sleep;
            }
        }
        else {
            if (creep.spawning == false) {
                // if (CPUdebug == true) {
                //     CPUdebugString = CPUdebugString.concat("<br>Start creep " + creep.name + "( " + creep.memory.role + "): " + Game.cpu.getUsed())
                // }

                {
                    if (creep.memory.role == 'harvester') {
                        creep.roleHarvester();
                    }
                    else if (creep.memory.role == 'upgrader') {
                        creep.roleUpgrader();
                    }
                    else if (creep.memory.role == 'repairer') {
                        creep.roleRepairer();
                    }
                    else if (creep.memory.role == 'builder') {
                        creep.roleBuilder();
                    }
                    else if (creep.memory.role == 'wallRepairer') {
                        creep.roleWallRepairer();
                    }
                    else if (creep.memory.role == 'remoteHarvester') {
                        creep.roleRemoteHarvester();
                    }
                    else if (creep.memory.role == 'protector') {
                        creep.roleProtector();
                    }
                    else if (creep.memory.role == 'claimer') {
                        creep.roleClaimer();
                    }
                    else if (creep.memory.role == 'bigClaimer') {
                        creep.roleBigClaimer();
                    }
                    else if (creep.memory.role == 'stationaryHarvester') {
                        creep.roleStationaryHarvester();
                    }
                    else if (creep.memory.role == 'miner') {
                        creep.roleMiner();
                    }
                    else if (creep.memory.role == 'distributor') {
                        creep.roleDistributor();
                    }
                    else if (creep.memory.role == 'demolisher') {
                        creep.roleDemolisher();
                    }
                    else if (creep.memory.role == 'energyLoader') {
                        creep.roleEnergyLoader();
                    }
                    else if (creep.memory.role == 'energyTransporter') {
                        creep.run();
                    }
                    else if (creep.memory.role == 'energyHauler') {
                        creep.roleEnergyHauler();
                    }
                    else if (creep.memory.role == 'remoteStationaryHarvester') {
                        creep.roleRemoteStationaryHarvester();
                    }
                    // else if (creep.memory.role == 'attacker' || creep.memory.role == 'einarr' || creep.memory.role == 'healer' || creep.memory.role == 'archer') {
                    //     creep.roleUnit();
                    // }
                    else if (creep.memory.role == 'healer') {
                        creep.roleHealer();
                    }
                    else if (creep.memory.role == 'attacker') {
                        creep.roleAttacker();
                    }
                    else if (creep.memory.role == 'einarr') {
                        creep.roleEinarr();
                    }
                    else if (creep.memory.role == 'scientist') {
                        creep.roleScientist();
                    }
                    else if (creep.memory.role == 'transporter') {
                        creep.roleTransporter();
                    }
                    else if (creep.memory.role == 'blocker') {
                        creep.roleBlocker();
                    }
                    else if (creep.memory.role == 'fupgrader') {
                        creep.roleUpgrader();
                    }
                    else if (creep.memory.role == 'SKHarvester') {
                        creep.roleSKHarvester()
                    }
                    else if (creep.memory.role == 'SKHauler') {
                        creep.roleSKHauler();
                    }
                    else if (creep.memory.role == 'test') {
                        creep.roleTest();
                    }
                    else if (creep.memory.role == 'drainer') {
                        creep.roleDrainer();
                    }
                }
            }
        }
        // if (CPUdebug == true) {
        //     CPUdebugString = CPUdebugString.concat("<br>Creep " + creep.name + "( " + creep.memory.role + ") finished: " + Game.cpu.getUsed())
        // }
    }
  }
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
    //   var creepsInRoom = _.filter(Game.creeps, (c) => c.ticksToLive > 300 && c.room.supportRooms().includes(targetStructure.room) && !c.spawning && config.polier.rolesToAssign.includes(c.role()));
    //  var creepsInRoom = _.filter(Game.creeps, (c) => c.ticksToLive > 300 && c.room.supportRooms().includes(targetStructure.room) && !c.spawning && config.polier.rolesToAssign.includes(c.role()));
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
  var sortedUnassignedJobsForCreeps = _.sortBy(unassignedJobsForCreeps, function(s) {return s.priority;});
  for(const j in sortedUnassignedJobsForCreeps) {

    const tmpCreepForJob = polier.findCreepForJob(sortedUnassignedJobsForCreeps[j]);
    if(tmpCreepForJob instanceof Creep) {
      if(polier.getAssignmentsForCreep(tmpCreepForJob.id).length < config.polier.maxAssignmentsPerWorker) {
        polier.addAssignment(sortedUnassignedJobsForCreeps[j].id, tmpCreepForJob.id);
        sortedUnassignedJobsForCreeps[j].status = 'assigned';
        jobs.modifyJob(sortedUnassignedJobsForCreeps[j]);
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
  returnstring = returnstring.concat("<table><tr><th>Room  </th><th>Job  </th><th>Prio  </th><th>Task  </th><th>Target  </th><th>Status  </th><th>Age  </th><th>TTL  </th></tr>");
  var resourceTable = [];
  var total = [];

  for (const curJob in sortedJobList) {
    const jobData = sortedJobList[curJob];
    const curJobTargetObject = jobs.getTargetObject(jobData.id);

      var color = "#aaffff";
      returnstring = returnstring.concat("<tr></tr><td>" + curJobTargetObject.room.name + "  </td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + jobData.id + "  </font></td>");
      returnstring = returnstring.concat("<td><font color='" + color + "'>" + jobData.priority + "  </font></td>");
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
