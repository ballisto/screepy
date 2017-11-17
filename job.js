

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

  }


  // Getter
  Rectangle.prototype.getArea = function() {
    return this.calcArea();
  }
  // Method
  Rectangle.prototype.calcArea = function() {
    return this.height * this.width;
  }


module.exports = Job;
