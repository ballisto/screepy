var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    lorry: require('role.lorry')
};

/*
 * Log creep message based on debug config
 *
 * `config.debug.creepLog.roles` and `config.debug.creepLog.rooms` define
 * logging on common methods
 *
 * @param messages The message to log
 */
Creep.prototype.role = function() {
  return this.memory.role;
};

Creep.prototype.creepLog = function(...messages) {
  if (config.debug.creepLog.roles.indexOf(this.memory.role) < 0) {
    return;
  }
  if (config.debug.creepLog.rooms.indexOf(this.room.name) < 0) {
    return;
  }
  this.log(messages);
};

Creep.prototype.setCacheKey = function(key, value) {
  if(cache.creeps == undefined) { cache.creeps = {};}
  if(cache.creeps[this.id] == undefined) { cache.creeps[this.id] = {};}
  var tmpCacheArray = cache.creeps[this.id];
    tmpCacheArray[key] = value;
};
Creep.prototype.getCacheKey = function(key) {
  if(cache.creeps == undefined) { cache.creeps = {};}
  if(cache.creeps[this.id] == undefined) { return undefined;}
  var tmpCacheArray = cache.creeps[this.id];
  return tmpCacheArray[key];
};

Creep.prototype.moveToMy = function(target, range) {

  var notMovedSince = 0;
  //creep has a history of path conflicts in cache
  if(this.getCacheKey("notMovedSince") != undefined && this.getCacheKey("notMovedSince") > 2) {
    this.moveTo(target);
    return false;
  }
  else {

    if(this.getCacheKey("lastModifiedTick") != undefined && Game.time - this.getCacheKey("lastModifiedTick") < 10) {
        if(this.getCacheKey("lastPosition") != undefined) {
          if(JSON.stringify(this.pos) == this.getCacheKey("lastPosition")) {
            if(this.getCacheKey("notMovedSince") != undefined) {
              var tmpCacheValue = this.getCacheKey("notMovedSince");
              this.setCacheKey("notMovedSince", tmpCacheValue += 1);
            }
            else {
              this.setCacheKey("notMovedSince", 1);
            }
            notMovedSince = this.getCacheKey("notMovedSince");
            this.creepLog('moveToMy notMovedSince', notMovedSince);
          }
          else {

          }
        }
    }
  }
  range = range || 1;
  const search = PathFinder.search(
    this.pos, {
      pos: target,
      range: range,
    }, {
      roomCallback: this.room.getCostMatrixCallback(target, true, this.pos.roomName === (target.pos || target).roomName),
      maxRooms: 0,
      swampCost: config.layout.swampCost,
      plainCost: config.layout.plainCost,
    }
  );

  if (config.visualizer.enabled && config.visualizer.showPathSearches) {
    visualizer.showSearch(search);
  }

  this.creepLog('moveToMy search:', JSON.stringify(search));
  // Fallback to moveTo when the path is incomplete and the creep is only switching positions
  if ((search.path.length < 2 && search.incomplete) || notMovedSince > 2) {
    // this.log(`fallback ${JSON.stringify(target)} ${JSON.stringify(search)}`);
    this.moveTo(target);
    return false;
  }
  const moveReturnCode = this.move(this.pos.getDirectionTo(search.path[0] || target.pos || target));
  if (moveReturnCode != 0 ) {this.creepLog('moveToMy move, err code:', moveReturnCode );}

  this.setCacheKey("lastModifiedTick", Game.time);
  this.setCacheKey("lastPosition", JSON.stringify(this.pos));
  this.setCacheKey("lastTargetPosition", JSON.stringify(search.path[0]));

  return moveReturnCode;
};

Creep.prototype.moveToParking = function() {
  if(this.room.store != undefined) {
    this.moveToMy(this.room.store.pos, 1);
  }
};

Creep.prototype.run = function() {
  var curAssignment = polier.getCurTaskForCreep(this.id);
  if( curAssignment == undefined ) {
    if(this.storeAllBut()) {
      this.moveToParking();
      return true;
    }
  }
  else {
    var curJobData = jobs.getJobData(curAssignment.jobId);
    if(curJobData.status != 'running') {
      curJobData.status = 'running';
      jobs.modifyJob(curJobData);
    }

    this.say("job " +  curAssignment.jobId);
    switch (curJobData.task) {
      case "transfer":
      case "build":
      case "repair":

      case "upgradeController":
        if(this.carry[curJobData.resType] == undefined || (this.carry[curJobData.resType] < curJobData.resAmount &&  this.carry[curJobData.resType] < this.carryCapacity) ) {
          var creepCarriesSomethingElse = false;
          for(const c in this.carry) {
            if(c != curJobData.resType && this.carry[c] > 0) { creepCarriesSomethingElse = true;}
          }
          if(creepCarriesSomethingElse) {
            this.storeAllBut();
            }
          else {
            this.getResource(curJobData.resType, curJobData.resAmount);
          }
        }
        else {
          const targetObject = Game.getObjectById(curJobData.target);
          if(targetObject != undefined) {
            if (this.pos.getRangeTo(targetObject) > 1) {
              this.moveToMy(targetObject.pos, 1);
            }
            else {
            switch (curJobData.task) {
              case "transfer":
                const result = this.transfer(targetObject, curJobData.resType);
                if(result == OK || result == ERR_FULL) {
                  jobs.setDone(curJobData.id);
                }
                else {
                  this.say("I F'Up!");
                }
                break;
              case "pickup":
                const pickupResult = this.pickup(targetObject);
                if(pickupResult == OK || pickupResult == ERR_FULL) {
                  jobs.setDone(curJobData.id);
                }
                else {
                  this.say("I F'Up!");
                }
                break;
                default:
                break;
            }
          }
        }
        else {
          jobs.setDone(curJobData.id);
        }
      }
      break;
      case "withdraw":
      case "pickup":
        if(this.storeAllBut()) {
          const targetObject = Game.getObjectById(curJobData.target);
          if(targetObject != undefined) {
            if (this.pos.getRangeTo(targetObject) > 1) {
              this.moveToMy(targetObject.pos, 1);
            }
            else {
              var result = "";
              if(curJobData.task == 'pickup') {
                 result = this.pickup(targetObject);
              }
              else if(curJobData.task == 'withdraw'){
                 result = this.withdraw(targetObject, curJobData.resType);
              }
              if(result == OK || result == ERR_FULL || result == ERR_NOT_ENOUGH_RESOURCES	) {
                jobs.setDone(curJobData.id);
              }
              else {
                this.say("I F'Up!");
              }
            }
          }
          else {
            jobs.setDone(curJobData.id);
          }
        }
      break;
      default:
      break;
    }
  }
};

Creep.prototype.runRole =
    function () {
        roles[this.memory.role].run(this);
    };

/** @function
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        /** @type {StructureContainer} */
        let container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                             s.store[RESOURCE_ENERGY] > 0
            });
            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            // try to harvest energy, if the source is not in range
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it

                var source_pos = source.pos;

                this.moveTo(source);

            }
        }
    };
Creep.prototype.findEnergySource =
        function (sourceTypes) {
          let IDBasket = [];
          let tempArray = [];

          for (let argcounter = 0; argcounter <= arguments.length - 1; argcounter++) {
              // Go through requested sourceTypes
              switch (arguments[argcounter]) {
                  case FIND_DROPPED_RESOURCES:
                        tempArray = this.room.find(FIND_DROPPED_RESOURCES);
                        for (var s in tempArray) {
                            if (tempArray[s].energy != undefined) {
                              if (tempArray[s].energy > 0) {
                                IDBasket.push(tempArray[s]);
                              }
                            }
                        }
                    break;
                  case FIND_SOURCES:
                          tempArray = this.room.memory.roomArray.sources;
                          for (var s in tempArray) {
                              if (Game.getObjectById(tempArray[s]).energy > 0) {
                                  IDBasket.push(Game.getObjectById(tempArray[s]));
                              }
                          }
                          break;

                  case STRUCTURE_LINK:
                          tempArray = this.room.memory.roomArray.links;
                          for (var s in tempArray) {
                              if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0 && this.room.memory.links[tempArray[s]].priority > 0) {
                                  IDBasket.push(Game.getObjectById(tempArray[s]));
                              }
                          }
                      break;

                  case STRUCTURE_CONTAINER:
                          tempArray = this.room.memory.roomArray.containers;
                          for (var s in tempArray) {
                              if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).store[RESOURCE_ENERGY] > 0) {
                                  IDBasket.push(Game.getObjectById(tempArray[s]));
                              }
                          }
                      break;

                  case STRUCTURE_STORAGE:
                          if (this.room.storage != undefined && this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > 0) {
                              IDBasket.push(this.room.storage);
                          }
                      break;

                  case STRUCTURE_TERMINAL:
                          if (this.room.terminal != undefined && this.room.terminal.store[RESOURCE_ENERGY] > this.room.memory.resourceLimits[RESOURCE_ENERGY].minTerminal) {
                              IDBasket.push(this.room.terminal);
                          }
                      break;
              }
          }

          //Get path to collected objects
          result = this.pos.findClosestByPath(IDBasket);
          if (result != undefined && result != null) {
            return result.id;
          }
          else {
            return null;
          }

        };
Creep.prototype.findSpaceEnergy =
        function (sourceTypes) {
          let IDBasket = [];
          let tempArray = [];
          var result;

          for (let argcounter = 0; argcounter <= arguments.length - 1; argcounter++) {
              // Go through requested sourceTypes
              switch (arguments[argcounter]) {

                  case STRUCTURE_EXTENSION:
                          tempArray = this.room.memory.roomArray.extensions;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                  IDBasket.push(container);
                              }
                          }
                      break;

                  case STRUCTURE_SPAWN:
                          tempArray = this.room.memory.roomArray.spawns;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (container.energy < container.energyCapacity) {
                                  IDBasket.push(container);
                              }
                          }
                      break;

                  case STRUCTURE_LINK:
                          tempArray = this.room.memory.roomArray.links;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                  IDBasket.push(container);
                              }
                          }
                      break;

                  case STRUCTURE_TOWER:
                          tempArray = this.room.memory.roomArray.towers;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (Game.getObjectById(tempArray[s]) != null && container.energy < (container.energyCapacity/10)*8) {
                                  IDBasket.push(container);
                              }
                          }
                      break;

                  case STRUCTURE_CONTAINER:
                          tempArray = this.room.memory.roomArray.containers;
                          for (var s in tempArray) {
                              if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).storeCapacity - _.sum(Game.getObjectById(tempArray[s]).store) > 0) {
                                  IDBasket.push(Game.getObjectById(tempArray[s]));
                              }
                          }
                      break;

                  case STRUCTURE_STORAGE:
                          if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store) > 0) {
                              IDBasket.push(this.room.storage);
                          }
                      break;

                  case STRUCTURE_TERMINAL:
                          if (this.room.terminal != undefined && this.room.terminal.storeCapacity - _.sum(this.room.terminal.store) > 0) {
                              IDBasket.push(this.room.terminal);
                          }
                      break;

                  case STRUCTURE_LAB:
                          tempArray = this.room.memory.roomArray.labs;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                  IDBasket.push(container);
                              }
                          }
                  case STRUCTURE_NUKER:
                          tempArray = this.room.memory.roomArray.nukers;
                          for (var s in tempArray) {
                              let container = Game.getObjectById(tempArray[s]);
                              if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                  IDBasket.push(container);
                              }
                          }
                      break;
              }
          }

          //Get path to collected objects
          result = this.pos.findClosestByPath(IDBasket);
          if (result != undefined && result != null) {
            return result.id;
          }
          else {
            return null;
          }
        };
Creep.prototype.canBeBoosted = function () {
  var possibleBoostMinerals = [];
  for (let c in this.body) {
      var curBodyPart = this.body[c];
      if(curBodyPart.boost != undefined) {
        continue;
      }
      var curBodyPartPossibleBoosts = Object.keys(BOOSTS[curBodyPart.type]);
      switch(curBodyPart.type) {
        case WORK:
          var tmpMinerals = [];
          var tmpAction;
          if(this.role == 'upgrader') {
            tmpAction = 'upgradeController';
          }
          else if(this.role == 'harvester') {
            tmpAction = 'harvest';
          }
          else if(this.role == 'builder') {
            tmpAction = 'build';
          }
          for(const t in curBodyPartPossibleBoosts) {
            const tmpBoostMineral = curBodyPartPossibleBoosts[t];
            if(tmpBoostMineral[tmpAction] != undefined) {
              if(!possibleBoostMinerals.includes(curBodyPartPossibleBoosts[t]))
                possibleBoostMinerals.push(curBodyPartPossibleBoosts[t]);
            }
          }
        break;
        default:
            for(const m in curBodyPartPossibleBoosts) {
              if(!possibleBoostMinerals.includes(curBodyPartPossibleBoosts[m]))
                possibleBoostMinerals.push(curBodyPartPossibleBoosts[m]);
            }
          break;
      }
    }
    return possibleBoostMinerals;
  };

Creep.prototype.bodyMatrix = function () {
          //init matrix
          let tmpBodyMatrix = [];
          for (let i = 0; i < 8; i++) {
              tmpBodyMatrix[i] = 0;
          }

          for (let c in this.body) {
              var curBodyPart = this.body[c];
              var index;
              //translate bodypart types to matrix-index
              switch(curBodyPart.type) {
                case MOVE:
                  index = 0;
                break;
                case WORK:
                  index = 1;
                break;
                case CARRY:
                  index = 2;
                break;
                case ATTACK:
                  index = 3;
                break;
                case RANGED_ATTACK:
                  index = 4;
                break;
                case HEAL:
                  index = 5;
                break;
                case CLAIM:
                  index = 6;
                break;
                case TOUGH:
                  index = 7;
                break;
                default:
                  index = 0;
                  break;
              }
              if(curBodyPart.boost != undefined) {
                tmpBodyMatrix[index] += curBodyPart.hits * 2;
              }
              else {
                tmpBodyMatrix[index] += curBodyPart.hits;
              }
          }
          return tmpBodyMatrix;
        };
