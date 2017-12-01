

function Job(jobid) {
    if(jobid == 0 || jobid == null || jobid == undefined) {
      // create new id
      if(Memory.maxjobid == undefined) {
        maxJobId = 0;
      }
      else {
        maxJobId = Memory.maxjobid;
      }
      this.id = maxJobId + 1;
      Memory.maxjobid = this.id;
    }
    else {
      this.id = jobid;
      this.initFromMemory();
    }
  }

  Job.prototype.initFromMemory = function() {

  }

  Job.prototype.writeToMemory = function() {
    if(Memory.jobs == undefined) {Memory.jobs = {};}
    if(Memory.jobs[this.id] == undefined) {Memory.jobs[this.id] = {};}

    Memory.jobs[this.id].created = this.created;
    Memory.jobs[this.id].created = this.targetId;
    Memory.jobs[this.id].task = this.task;
    Memory.jobs[this.id]. = this.targetId;

    
  }



module.exports = Job;
