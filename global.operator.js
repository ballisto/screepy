'use strict';

operator.init = function() {
  if(Memory.operator == undefined) {Memory.operator = {};}
  if(Memory.operator.jobsSegment == undefined) {Memory.operator.jobsSegment = root.getNextSegmentId();}
  operator.jobsSegment = Memory.operator.jobsSegment;
  if(Memory.operator.maxjobid == undefined) {Memory.operator.maxjobid = 0;}

  operator.jobs = [];
  for (const key of root.getSegmentKeys(operator.jobsSegment)) {
      operator.jobs[key] = root.getSegmentObject(operator.jobsSegment, key);
  }
};

operator.run = function() {
  operator.init();

};

operator.loadEnergy = function() {
  
};
