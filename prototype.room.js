Room.prototype.myCreeps =
    function () {
        return this.find(FIND_MY_CREEPS);
    };
Room.prototype.hostileCreeps =
        function () {
            return this.find(FIND_HOSTILE_CREEPS);
        };

Room.prototype.refreshMemory =
    function () {
      let roomCreeps = this.myCreeps();
      //  Refresher
      if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername && this.memory.roomArray == undefined) {
          this.memory.roomArray = {};
      }
      else if (this.memory.roomArray == undefined && this.controller != undefined && roomCreeps.length > 0) {
          this.memory.roomArray = {};
      }

      var searchResult;
      if ((roomCreeps.length > 0 || (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername)) && (Game.time % global.DELAYROOMSCANNING == 0 || this.memory.roomArray == undefined)) {
          // Determining whether room secure

          var defenseObjects = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
          defenseObjects = _.sortBy(defenseObjects,"hits");

          if (defenseObjects != undefined && defenseObjects[0] != undefined && ((this.controller != undefined && this.controller.level == 8 && defenseObjects[0].hits > global.WALLMAX * 3) || (this.controller != undefined && this.controller.level < 8 && defenseObjects[0].hits > global.WALLMAX))) {
              this.memory.roomSecure = true;
          }
          else if (this.memory.roomSecure != undefined) {
              delete this.memory.roomSecure;
          }

          if (this.memory.roomArray == undefined) {
              this.memory.roomArray = {};
          }

          // Preloading room structure
          if (this.memory.roomArraySources != undefined) {
              delete this.memory.roomArraySources;
          }
          var sourceIDs = [];
          searchResult = this.find(FIND_SOURCES);
          for (let s in searchResult) {
              sourceIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.sources = sourceIDs;

          if (this.memory.roomArrayMinerals != undefined) {
              delete this.memory.roomArrayMinerals;
          }
          var mineralIDs = [];
          searchResult = this.find(FIND_MINERALS);
          for (let s in searchResult) {
              mineralIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.minerals = mineralIDs;

          if (this.memory.roomArrayContainers != undefined) {
              delete this.memory.roomArrayContainers;
          }
          var containerIDs = [];
          searchResult = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
          for (let s in searchResult) {
              containerIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.containers = containerIDs;

          if (this.memory.roomArrayPowerSpawns != undefined) {
              delete this.memory.roomArrayPowerSpawns;
          }
          var powerSpawnIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN});
          for (let s in searchResult) {
              powerSpawnIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.powerSpawns = powerSpawnIDs;

          if (this.memory.roomArraySpawns != undefined) {
              delete this.memory.roomArraySpawns;
          }
          var spawnIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
          for (let s in searchResult) {
              spawnIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.spawns = spawnIDs;

          if (this.memory.roomArrayExtensions != undefined) {
              delete this.memory.roomArrayExtensions;
          }
          var extensionIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
          for (let s in searchResult) {
              extensionIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.extensions = extensionIDs;

          if (this.memory.roomArrayLinks != undefined) {
              delete this.memory.roomArrayLinks;
          }
          var LinkIDs = [];
          var sourceLinkFound = false;
          var targetLinkFound = false;

          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
          for (let s in searchResult) {

              LinkIDs.push(searchResult[s].id);
              delete this.memory.linkInfrastructure;

              if(this.memory.links == undefined) {this.memory.links = {};}
              if(this.memory.links[searchResult[s].id] == undefined)  {this.memory.links[searchResult[s].id] = {};}
              if(this.memory.links[searchResult[s].id].priority == undefined) {this.memory.links[searchResult[s].id].priority = 0;}
              if(this.memory.links[searchResult[s].id].priority == 0) {sourceLinkFound = true;}
              if(this.memory.links[searchResult[s].id].priority == 1) {targetLinkFound = true;}
              if(sourceLinkFound && targetLinkFound) {this.memory.linkInfrastructure = 1;}
          }
          this.memory.roomArray.links = LinkIDs;


          if (this.memory.roomArrayLabs != undefined) {
              delete this.memory.roomArrayLabs;
          }
          var LabIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});
          for (let s in searchResult) {
              LabIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.labs = LabIDs;

          if (this.memory.roomArrayExtractors != undefined) {
              delete this.memory.roomArrayExtractors;
          }
          var ExtractorIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
          for (let s in searchResult) {
              ExtractorIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.extractors = ExtractorIDs;

          if (this.memory.roomArrayRamparts != undefined) {
              delete this.memory.roomArrayRamparts;
          }
          var rampartIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
          for (let s in searchResult) {
              rampartIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.ramparts = rampartIDs;

          if (this.memory.roomArrayNukers != undefined) {
              delete this.memory.roomArrayNukers;
          }
          var nukerIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER});
          for (let s in searchResult) {
              nukerIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.nukers = nukerIDs;

          if (this.memory.roomArrayObservers != undefined) {
              delete this.memory.roomArrayObservers;
          }
          var observerIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_OBSERVER});
          for (let s in searchResult) {
              observerIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.observers = observerIDs;

          if (this.memory.roomArrayTowers != undefined) {
              delete this.memory.roomArrayTowers;
          }
          var towerIDs = [];
          searchResult = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
          for (let s in searchResult) {
              towerIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.towers = towerIDs;

          if (this.memory.roomArrayLairs != undefined) {
              delete this.memory.roomArrayLairs;
          }
          var lairIDs = [];
          searchResult = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR});
          for (let s in searchResult) {
              lairIDs.push(searchResult[s].id);
          }
          this.memory.roomArray.lairs = lairIDs;
      }
      //Check master spawn
      if (this.memory.masterSpawn != undefined && Game.getObjectById(this.memory.masterSpawn) == null) {
          delete this.memory.masterSpawn;
      }
      if (this.memory.masterSpawn == undefined && this.memory.roomArray != undefined && this.memory.roomArray.spawns != undefined) {
          if (this.memory.roomArray.spawns.length == 1) {
              this.memory.masterSpawn = this.memory.roomArray.spawns[0];
          }
          else if (this.memory.roomArray.spawns.length > 1) {
              for (var id in this.memory.roomArray.spawns) {
                  var testSpawn = Game.getObjectById(this.memory.roomArray.spawns[id]);
                  if (testSpawn.memory.spawnRole == 1) {
                      this.memory.masterSpawn = this.memory.roomArray.spawns[id];
                  }
              }
          }
      }


    };
Room.prototype.setDefaultResourceLimits =
    function () {
      //Set default resource limits:
      if (this.memory.resourceLimits == undefined && this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername) {
          var roomLimits = {};
          var limit;
          for (var res in RESOURCES_ALL) {
              roomLimits[RESOURCES_ALL[res]] = {};

              if (this.memory.roomArray != undefined && this.memory.roomArray.minerals != undefined && this.memory.roomArray.minerals.length > 0 && Game.getObjectById(this.memory.roomArray.minerals[0]).mineralType == RESOURCES_ALL[res]) {
                  //Room mineral
                  limit = {minTerminal:0, maxStorage:6000, minMarket:500000, minProduction: 600000};
              }
              else if (RESOURCES_ALL[res] == RESOURCE_ENERGY) {
                  //Energy
                  limit = {minTerminal:0, maxStorage:100000, minMarket:900000, minProduction: 1000000};
              }
              else {
                  // Rest
                  limit = {minTerminal:0, maxStorage:6000, minMarket:900000, minProduction: 0};
              }
              roomLimits[RESOURCES_ALL[res]] = limit;
          }
          this.memory.resourceLimits = roomLimits;
      }
    };
Room.prototype.saveHostiles =
    function () {
      let roomCreeps = this.find(FIND_MY_CREEPS);
      var hostiles = this.find(FIND_HOSTILE_CREEPS);
      let enemies = _.filter(hostiles, function (e) {return (isHostile(e))});
      this.memory.hostiles = [];
      for (let e in enemies) {
          this.memory.hostiles.push(enemies[e].id);
      }
    };
Room.prototype.manageRamparts =
    function () {
      //Manage ramparts
      let roomCreeps = this.find(FIND_MY_CREEPS);
      var hostiles = this.find(FIND_HOSTILE_CREEPS);
      let enemies = _.filter(hostiles, function (e) {return (isHostile(e))});
      
      if (this.controller != undefined && this.controller.owner != undefined && this.controller.owner.username == global.playerUsername) {
          if (this.memory.roomArray != undefined && enemies.length == 0) {
              //Allied creeps in room and no hostile creeps
              for (let x in this.memory.roomArray.ramparts) {
                  let ramp = Game.getObjectById(this.memory.roomArray.ramparts[x]);
                  if (ramp != null) {
                      ramp.setPublic(true)
                  }
              }
          }
          else if (this.memory.roomArray != undefined) {
              for (let x in this.memory.roomArray.ramparts) {
                  let ramp = Game.getObjectById(this.memory.roomArray.ramparts[x]);
                  if (ramp != null) {
                      ramp.setPublic(false)
                  }
              }
          }
      }
    };
