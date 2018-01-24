
global.Factory = class Factory {
  constructor(roomName) {
    var curRoom = Game.rooms[roomName];
    if (!curRoom) { return null;}
    this.room = curRoom;
    var labs = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LAB && a.room.name == roomName);
    this.size = labs.length;
    if(labs.length > 2) {
      var sortedByIdLabs = _.sortBy(labs, function(l) {return l.id;})

      var sortedByNeighboringLabs = _.sortBy(sortedByIdLabs, function(n) {return n.getLabsInRange().length;});

      var reversedSortedByNeighboringLabs = sortedByNeighboringLabs.reverse();

      this.innerLab1 = reversedSortedByNeighboringLabs[0];
      this.innerLab2 = reversedSortedByNeighboringLabs[1];
      for(const l in reversedSortedByNeighboringLabs) {
        // console.log(reversedSortedByNeighboringLabs[l].id + ' - ' + reversedSortedByNeighboringLabs[l].getLabsInRange().length);
      }
    }
  }
  get summary() {
    var result = "";
    result += 'Factory room:' + this.room.name + '\n';
    result += 'Size: ' + this.size + '\n';
    if(this.innerLab1 != undefined && this.innerLab2 != undefined) {
      result += 'Inner lab 1: ' + this.innerLab1.id + '\n';
      result += 'Inner lab 2: ' + this.innerLab2.id + '\n';
    }
    return result;
  }
};
