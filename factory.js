
global.Factory = class Factory {
  constructor(roomName) {
    var curRoom = Game.rooms[roomName];
    if (!curRoom) { return false;}

    var labs = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LAB && a.room.name == roomName);
    if(labs.length < 3) { return false;}

    var sortedByIdLabs = _.sortBy(labs, function(l) {return l.id;})

    var sortedByNeighboringLabs = _.sortBy(sortedByIdLabs, function(n) {return n.getLabsInRange().length;})
    for(const l in sortedByNeighboringLabs) {
      console.log(sortedByNeighboringLabs[l].id + ' - ' + sortedByNeighboringLabs[l].getLabsInRange().length);
    }
  }
  // Getter
  get area() {
    return this.calcArea();
  }
  // Method
  calcArea() {
    return this.height * this.width;
  }
};
