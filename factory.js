global.Factory = class Factory {
  constructor(roomName) {
    var curRoom = Game.rooms[roomName];
    if (!curRoom) { return null;}
    this.room = curRoom;

    curRoom.checkCache();
    var curRoomFactoryCache = cache.rooms[roomName].factory;
    var labs = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_LAB && a.room.name == roomName);
    if(curRoomFactoryCache.size != undefined) {
      this.size = curRoomFactoryCache.size;
      this.innerLab1 = Game.getObjectById(curRoomFactoryCache.innerLab1);
      this.innerLab2 = Game.getObjectById(curRoomFactoryCache.innerLab2);
    //   this.allLabsInFactory = curRoomFactoryCache.allLabsInFactory;
        this.allLabsInFactory = labs;
        
    }
    else {
      console.log('factory new')
    
      this.size = labs.length;
      curRoomFactoryCache.size = this.size;

      if(labs.length > 2) {
        var sortedByIdLabs = _.sortBy(labs, function(l) {return l.id;})

        var sortedByNeighboringLabs = _.sortBy(sortedByIdLabs, function(n) {return n.getLabsInRange().length;});

        var reversedSortedByNeighboringLabs = sortedByNeighboringLabs.reverse();

        this.innerLab1 = reversedSortedByNeighboringLabs[0];
        curRoomFactoryCache.innerLab1 = this.innerLab1.id;
        this.innerLab2 = reversedSortedByNeighboringLabs[1];
        curRoomFactoryCache.innerLab2 = this.innerLab2.id;

        var allLabsInFactory = [];
        var tmpLabsInRangeOfInnerLab1 = this.innerLab1.getLabsInRange();
        var tmpLabsInRangeOfInnerLab2 = this.innerLab2.getLabsInRange();
        var tmpAllLabsInRange = tmpLabsInRangeOfInnerLab1.concat(tmpLabsInRangeOfInnerLab2);
        for (const l in tmpAllLabsInRange) {
          if(!allLabsInFactory.includes(tmpAllLabsInRange[l])) {
            allLabsInFactory.push(tmpAllLabsInRange[l]);
          }
        }
        this.allLabsInFactory = allLabsInFactory;
        // curRoomFactoryCache.allLabsInFactory = allLabsInFactory;
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

  get isBusy() {
    // factory busy with old code
    if(this.room.memory.labOrder != undefined || this.room.memory.labTarget != undefined) { return true;}
    return false;
  }

  run() {
      
    if (this.innerLab1 != undefined && this.innerLab2 != undefined && this.room.memory.labOrder != undefined) {
      let labOrder = this.room.memory.labOrder.split(":");

      if (labOrder.length > 2 && labOrder[3] == "running") {
        //   if(this.room.name == 'W59S5' ) console.log ( Game.time + ' - ' + this.room.name + ' - ');
          if (this.innerLab1.mineralAmount <= 4 || this.innerLab2.mineralAmount <= 4) {
              labOrder[3] = "done";
              Game.rooms[this.room.name].memory.labOrder = labOrder.join(":");
              return true;
          }
                
          // Reaction can be started
          for (var lab in this.allLabsInFactory) {
            //   if(this.room.name == 'W49N13' ) console.log ( Game.time + ' - ' + this.room.name + ' cool - ' + this.allLabsInFactory[lab].cooldown + ' - ' + Game.getObjectById(this.allLabsInFactory[lab].id).cooldown);
              // if (curRoom.memory.boostLabs != undefined) { console.log(lab)}
              // if(r == 'W58S3') { console.log(curRoom.memory.boostLabs[curRoom.memory.roomArray.labs[lab]]) }
              if ((this.room.memory.boostLabs == undefined || this.room.memory.boostLabs[this.allLabsInFactory[lab].id] == undefined) && this.allLabsInFactory[lab].id != this.innerLab1.id && this.allLabsInFactory[lab].id != this.innerLab2.id) {
                //   console.log(this.room.name)
                  if (this.innerLab1.mineralAmount > 4 && this.innerLab2.mineralAmount > 4) {
                      
                      //Still enough material to do a reaction
                      let currentLab = this.allLabsInFactory[lab];
                    //   
                      if ( Game.getObjectById(currentLab.id).cooldown == 0) {
                          let result = currentLab.runReaction(this.innerLab1, this.innerLab2);
                          // if(this.room.name == 'W59S5' ) console.log ( Game.time + ' - ' + this.room.name + ' - ' + result);
                      }
                  }
                  else {
                      labOrder[3] = "done";
                      this.room.memory.labOrder = labOrder.join(":");
                  }
              }
          }
      }
    }
    // console.log("RUN");
  }
};
