'use strict';

polier.init = function() {
  if(Memory.polier == undefined) {Memory.polier = {};}
  if(Memory.polier.assignmentsSegment == undefined) {Memory.polier.assignmentsSegment = root.getNextSegmentId();}
  polier.assignmentsSegment = Memory.polier.assignmentsSegment;
  if(Memory.polier.maxassignid == undefined) {Memory.polier.maxassignid = 0;}

};

polier.run = function() {

};
