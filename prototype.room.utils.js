'use strict';

Room.prototype.supportRooms = function() {
    
  return _.filter(Game.rooms, (r) => this.totalResourceInStock(RESOURCE_ENERGY) > 100000 && r.controller != undefined && r.controller.level < 7 && r.controller.my &&  (Game.map.getRoomLinearDistance(this.name,r.name) < 3));
}

Room.structureHasEnergy = (structure) => structure.store && structure.store.energy || structure.energy;

Room.structureIsEmpty = (structure) => (!structure.store || _.sum(structure.store) === 0) && !structure.energy && !structure.mineralAmount && !structure.ghodium && !structure.power;

Room.prototype.findSpace = function(structures) {
  var selectedStructureTypes = {};
  if(arguments.length == 0) {
    selectedStructureTypes = [STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_CONTAINER];
  }
  else {
    selectedStructureTypes = arguments;
  }
  for (let argcounter = 0; argcounter < selectedStructureTypes.length; argcounter++) {
      // Go through requested sourceTypes
      switch (selectedStructureTypes[argcounter]) {
        case STRUCTURE_STORAGE:
            if (this.storage != undefined && this.storage.my && this.storage.storeCapacity - _.sum(this.storage.store) > 0) {
                return this.storage;
            }
        break;
        case STRUCTURE_TERMINAL:
            if (this.terminal != undefined && this.terminal.my && this.terminal.storeCapacity - _.sum(this.terminal.store) < this.terminal.storeCapacity * 0.75) {
                return this.terminal;
            }
        break;
        case STRUCTURE_CONTAINER:
        var tempContainers = _.filter(this.find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER && !s.isFull() && !s.isHarvesterStorage() );
        if(tempContainers.length > 0 && this.controller.my) {
          return tempContainers[0];
        }
        break;
      }
    }
    return null;
};
Room.prototype.findResource = function(resource) {
  var selectedStructureTypes = [STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_CONTAINER];

  for (let argcounter = 0; argcounter < selectedStructureTypes.length; argcounter++) {
      // Go through requested sourceTypes
      switch (selectedStructureTypes[argcounter]) {
        case STRUCTURE_STORAGE:
            if (this.storage != undefined && this.storage.store[resource] > 0) {
                return this.storage;
            }
        break;
        case STRUCTURE_TERMINAL:
            if (this.terminal != undefined && this.terminal.store[resource] > 0) {
                return this.terminal;
            }
        break;
        case STRUCTURE_CONTAINER:
        var tempContainers = _.filter(this.find(FIND_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTAINER && s.store[resource] != undefined && s.store[resource] > 0 );
        if(tempContainers.length > 0) {
          return tempContainers[0];
        }
        break;
      }
    }
    return null;
};

Room.prototype.totalResourceInStock = function(resourceType) {
  var totalResourceInStock = 0;
  if(this.storage != undefined && this.storage.store[resourceType] != undefined) {
    totalResourceInStock += this.storage.store[resourceType];
  }
  if(this.terminal != undefined && this.terminal.store[resourceType] != undefined) {
    totalResourceInStock += this.terminal.store[resourceType];
  }
  return totalResourceInStock;
};

Room.prototype.sortMyRoomsByLinearDistance = function(target) {
  const sortByLinearDistance = function(object) {
    return Game.map.getRoomLinearDistance(target, object);
  };

  return _.sortBy(Memory.myRooms, sortByLinearDistance);
};

Room.prototype.nearestRoomName = function(roomsNames, limit) {
  const roomName = this.name;
  const filterByLinearDistance = function(object) {
    const dist = Game.map.getRoomLinearDistance(roomName, object);
    return dist <= limit;
  };
  roomsNames = _.filter(roomsNames, filterByLinearDistance);
  const sortByLinearDistance = function(object) {
    const dist = Game.map.getRoomLinearDistance(roomName, object);
    return dist;
  };
  return _.min(roomsNames, sortByLinearDistance);
};

/**
 * use a static array for filter a find.
 *
 * @param  {Number}  findTarget      one of the FIND constant. e.g. [FIND_MY_STRUCTURES]
 * @param  {String}  property        the property to filter on. e.g. 'structureType' or 'memory.role'
 * @param  {Array}  properties      the properties to filter. e.g. [STRUCTURE_ROAD, STRUCTURE_RAMPART]
 * @param  {object} [opts={}] Additional options.
 * @param  {function} [opts.filter] Additional filter that wil be applied after cache.
 * @param  {Boolean} [opts.inverse=false] Exclude or include the properties to find.
 * @param  {Number} [opts.timeSpan=0] Return cached data even if it is outdated by `timeSpan` ticks.
 * @return {Array}                  the objects returned in an array.
 */
Room.prototype.findPropertyFilter = function(findTarget, property, properties, opts = {}) {
  const {filter, timeSpan = 0, inverse = false} = opts;
  const cache = this._findPropertyFilterCacheOne(findTarget, property, properties, timeSpan, inverse);
  if (cache.resolveTime !== Game.time) {
    this._findPropertyFilterResolveOutdatedCacheOne(cache);
  }
  if (filter) {
    return _.filter(cache.result, filter);
  } else {
    return cache.result;
  }
};

const localFindCache = {};

Room.prototype._findPropertyFilterCacheTwo = function(findTarget, property, timeSpan) {
  const key = `${this.name} ${findTarget} ${property}`;
  if (!localFindCache[key] || localFindCache[key].time < Game.time + timeSpan) {
    localFindCache[key] = {
      time: Game.time,
      result: _.groupBy(this.find(findTarget), property),
    };
  }
  return localFindCache[key];
};

Room.prototype._findPropertyFilterCacheOne = function(findTarget, property, properties, timeSpan, inverse) {
  const key = `${this.name} ${findTarget} ${property} ${properties} ${inverse}`;
  if (!localFindCache[key] || localFindCache[key].time < Game.time + timeSpan) {
    const cacheTwoItem = this._findPropertyFilterCacheTwo(findTarget, property, timeSpan);
    const cacheOneItem = localFindCache[key] = {
      resolveTime: Game.time,
      time: Game.time,
      result: [],
    };
    for (const propertyValue of Object.keys(cacheTwoItem.result)) {
      if (properties.includes(propertyValue) !== inverse) {
        Array.prototype.push.apply(cacheOneItem.result, cacheTwoItem.result[propertyValue]);
      }
    }
  }
  return localFindCache[key];
};

Room.prototype._findPropertyFilterResolveOutdatedCacheOne = function(cache) {
  cache.result = cache.result.map((o) => Game.getObjectById(o.id)).filter((o) => o);
  cache.resolveTime = Game.time;
};

Room.prototype.closestSpawn = function(target) {
  const pathLength = {};
  const roomsMy = this.sortMyRoomsByLinearDistance(target);

  for (const room of roomsMy) {
    const route = Game.map.findRoute(room, target);
    const routeLength = global.utils.returnLength(route);

    if (route && routeLength) {
      // TODO @TooAngel please review: save found route from target to myRoom Spawn by shortest route!
      // Memory.rooms[room].routing = Memory.rooms[room].routing || {};
      // Memory.rooms[room].routing[room + '-' + target] = Memory.rooms[room].routing[room + '-' + target] || {
      //    path: room + '-' + route,
      //    created: Game.time,
      //    fixed: false,
      //    name: room + '-' + target,
      //    category: 'moveToByClosestSpawn'
      //  };

      pathLength[room] = {
        room: room,
        route: route,
        length: routeLength,
      };
    }
  }

  const shortest = _.sortBy(pathLength, global.utils.returnLength);
  return _.first(shortest).room;
};

Room.prototype.getEnergyCapacityAvailable = function() {
  let offset = 0;
  if (this.memory.misplacedSpawn && this.controller.level === 4) {
    offset = 300;
  }
  return this.energyCapacityAvailable - offset;
};

Room.prototype.splitRoomName = function() {
  const patt = /([A-Z]+)(\d+)([A-Z]+)(\d+)/;
  const result = patt.exec(this.name);
  return result;
};

Room.pathToString = function(path) {
  if (!config.performance.serializePath) {
    return path;
  }

  let result = path[0].roomName + ':';
  result += path[0].x.toString().padStart(2, '0') + path[0].y.toString().padStart(2, '0');
  let last;
  for (const pos of path) {
    if (!last) {
      last = new RoomPosition(pos.x, pos.y, pos.roomName);
      continue;
    }
    const current = new RoomPosition(pos.x, pos.y, pos.roomName);
    result += last.getDirectionTo(current);
    last = current;
  }
  //   console.log(result);
  return result;
};

Room.stringToPath = function(string) {
  if (!config.performance.serializePath) {
    return string;
  }

  const parts = string.split(':');
  const roomName = parts[0];
  string = parts[1];
  const path = [];
  const x = parseInt(string.slice(0, 2), 10);
  string = string.substring(2);
  const y = parseInt(string.slice(0, 2), 10);
  string = string.substring(2);
  let last = new RoomPosition(x, y, roomName);
  path.push(last);
  for (const direction of string) {
    const current = last.getAdjacentPosition(parseInt(direction, 10));
    path.push(current);
    last = current;
  }
  //   console.log(path);
  return path;
};

Room.test = function() {
  const original = Memory.rooms.E37N35.routing['pathStart-harvester'].path;
  const string = Room.pathToString(original);
  const path = Room.stringToPath(string);
  for (const i of Object.keys(Memory.rooms.E37N35.routing['pathStart-harvester'].path)) {
    if (original[i].x !== path[i].x) {
      console.log('x unequal', i, original[i].x, path[i].x);
    }
    if (original[i].y !== path[i].y) {
      console.log('y unequal', i, original[i].y, path[i].y);
    }
    if (original[i].roomName !== path[i].roomName) {
      console.log('roomName unequal', i, original[i].roomName, path[i].roomName);
    }
  }
};
