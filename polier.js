

function Polier() {
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

Polier.prototype.initFromMemory = function() {

}

Polier.prototype.writeToMemory = function() {

}




module.exports = Polier;
