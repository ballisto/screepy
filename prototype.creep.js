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
  if(cache.creeps[this.id] == undefined) { cache.creeps[this.id] = {};}
  var tmpCacheArray = cache.creeps[this.id];
    tmpCacheArray[key] = value;  
};
Creep.prototype.getCacheKey = function(key) {
  if(cache.creeps[this.id] == undefined) { return undefined;}
  return cache.creeps[this.id].key;
};

Creep.prototype.moveToMy = function(target, range) {
  const didNotMoveSinceLastTick = false;
  if(this.getCacheKey("lastModifiedTick") != undefined && Game.time - this.getCacheKey("lastModifiedTick") < 3) {
      if(this.getCacheKey("lastPosition") != undefined && JSON.stringify(this.pos) == this.getCacheKey("lastPosition")) {
        didNotMoveSinceLastTick = true;
        this.creepLog('moveToMy ', "I did not move");
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
  if (search.path.length < 2 && search.incomplete) {
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
Creep.prototype.bodyMatrix =
        function () {
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
