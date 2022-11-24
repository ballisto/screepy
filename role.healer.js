Creep.prototype.roleHealer = function() {
  //if damaged, heal myself
  if(this.hits < this.hitsMax * 0.9) {
    this.heal(this);
    return true;
  }
  var curAssignment = polier.getCurTaskForCreep(this.id);
  if( curAssignment != undefined ) {
     this.run();
     return true;
  }
  if(this.memory.patient != undefined) {
    const patient = Game.getObjectById(this.memory.patient);
    if(patient instanceof Creep) {
      if(this.heal(patient) == ERR_NOT_IN_RANGE) {
        this.moveTo(patient);
        this.heal(this);
        return true;
      }
    }
  }
  else {
    var patientCandidates = _.filter(this.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'attacker' && c.memory.healer == undefined);
    if(patientCandidates.length > 0) {
      this.memory.patient = patientCandidates[0].id;
      patientCandidates[0].memory.healer = this.id;
    }
    else {
      this.say('NO PATIENT');
    }
  }
  this.goToHomeRoom();
  return false;
};
