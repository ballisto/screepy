'use strict';

polier.init = function() {
  if(Memory.polier == undefined) {Memory.polier = {};}
  if(Memory.polier.maxJobId == undefined) {Memory.polier.maxJobId = 1;}
  if(Memory.polier.maxAssignId == undefined) {Memory.polier.maxAssignId = 1;}

  polier.maxJobId = Memory.polier.maxJobId;
  polier.maxAssignId = Memory.polier.maxAssignId;
};

polier.run = function() {

};

polier.jobForStructureExists = function(structureId, task) {
  var openJobsForStructure = _.filter(root.getSegment(config.polier.jobsSegment), (j) => j.target == structureId && j.task == task && j.status != 'done');
  if(openJobsForStructure.length > 0) {
    return true;
  }
  else {
    return false;
  }
};
polier.getNewJobId = function() {
  const result = polier.maxJobId;
  polier.maxJobId++;
  Memory.polier.maxJobId = polier.maxJobId;

  return result;
};

polier.addJobWithTemplate = function(template, targetId, amount) {
  const newJobId = this.getNewJobId();
  var newJobData = template.slice();
  newJobData.push(id: newJobId);
  newJobData.push(target: targetId);
  newJobData.push(resAmount: amount);
  newJobData.push(created: Game.time);

  root.setSegmentObject(config.polier.jobsSegment,newJobId,newJobData);
};

polier.printJobs = function() {
    const tmpJobs = root.getSegment(config.polier.jobsSegment);
    for(const key in tmpJobs) {
      console.log(JSON.stringify(tmpJobs[key]));
    }
};
