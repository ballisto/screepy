global.Caretaker = class Caretaker {
    constructor() {
      // var curRoom = Game.rooms[roomName];
      // if (!curRoom) { return null;}
      // this.room = curRoom;
  
      // curRoom.checkCache();
      // var curRoomCaretakerCache = cache.rooms[roomName].caretaker;
      // if(curRoomCaretakerCache.size != undefined) {
      //   this.size = curRoomCaretakerCache.size;      
      // }
      // else {
      //   let size = 1;
      //   this.size = size;
      // }
      // curRoomCaretakerCache
    }
    get summary() {
      var result = "";
      result += 'Caretaker room:' + this.room.name + '\n';
      result += 'Size: ' + this.size + '\n';
      
      return result;
    }
  
    get isBusy() {
      // factory busy with old code
      if(this.room.memory.labOrder != undefined || this.room.memory.labTarget != undefined) { return true;}
      return false;
    }
  
    run() {    
    }
  
    cleanupMemoryCreeps() {
      // check for memory entries of died creeps by iterating over Memory.creeps
      
      for (var name in Memory.creeps) {
          // and checking if the it is still alive
          if (Game.creeps[name] == undefined) {
              // if not, delete the memory entry
              delete Memory.creeps[name];
          }
      }
     
    }
  
    runPanicFlags() {
      //Panic flag code
      
      // Check existing flags
      let panicFlags = _.filter(Game.flags, f => f.memory.function == "protector" && f.memory.panic == true);            
      let curPanicFlagRoom;
      if (panicFlags.length > 0 ) {
          for (let f in panicFlags) {
              curPanicFlagRoom = panicFlags[f].room;
              if( curPanicFlagRoom != undefined && curPanicFlagRoom.hostileCreeps().length == 0 ) {
                  panicFlags[f].remove();
              }                    
          }
      }
  
      //Set new flags
      var remoteFlags = _.filter(Game.flags, function (f) {
          return (f.memory.function == "remoteSource" || f.memory.function == "haulEnergy");
      });
      for (var f in remoteFlags) {
          var flag = remoteFlags[f];
          if (flag.room != undefined) {
              
              // We have visibility in room
              let hostilesInRoom = flag.room.hostileCreeps();
              if (hostilesInRoom.length > 0 ) {
                  let panicFlagsInRoom = flag.room.find(FIND_FLAGS,{filter: (f) => f.memory.function == "protector" && f.memory.panic == true});
                  
                  if(panicFlagsInRoom.length == 0 && flag.memory.skr == undefined) {
                      //Hostiles present in room with remote harvesters
                      let threat = false;
                      for ( let h in hostilesInRoom) {
                          
                          if ( hostilesInRoom[h].isDangerous()) { threat = true; }
                      }
                      if (threat) {
                          console.log("threat  "+flag.room.name)
                          //Hostiles present in room with remote harvesters
                          let panicName = "PanicFlag_" + flag.pos.roomName;
                          var panicFlagResult = flag.pos.createFlag(panicName); // create white panic flag to attract protectors
                          if ( panicFlagResult != -3 ) {
                              let panicFlag = Game.flags[panicFlagResult];
                              flag.room.memory.panicFlag = panicFlag;
                              panicFlag.memory.function = "protector";
                              panicFlag.memory.volume = hostilesInRoom.length;
  
                              var flagSpawnRoomName = "NA";
                              if(flag.memory.spawn != undefined) {
                                  panicFlag.memory.spawn = flag.memory.spawn;
                                  flagSpawnRoomName = Game.getObjectById(panicFlag.memory.spawn).room.name;
                              }
                              
                              panicFlag.memory.panic = true;
  
                              if (global.LOG_PANICFLAG == true) {
                                  console.log("<font color=#ff0000 type='highlight'>Panic flag has been set in room " + flag.room.name + " for room " + flagSpawnRoomName + "</font>");
                              }
                          }
                      }
                  }
              }                    
          }
      }
  }
    
  }
  