Room.prototype.spawn = function() {
    if(this.my()) {
        let globalSpawningStatus = 0;
        let cpuStart = Game.cpu.getUsed();
        //console.log('spawn start'+ '  ' + cpuStart);
        
        const wallRepairerEnergyRatio = 0.00001;

        if (this.memory.roomArray != undefined) {
            for (var s in this.memory.roomArray.spawns) {
                var testSpawn = Game.getObjectById(this.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    globalSpawningStatus++;
                }
            }
        }
    //        console.log(globalSpawningStatus);
        if (globalSpawningStatus == 0) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.homeroom == this.name && (c.ticksToLive > (c.body.length*3) - 3 || c.spawning == true));

        //Check for sources & minerals
        let numberOfSources = this.memory.roomArray.sources.length;
        let numberOfExploitableMineralSources = this.memory.roomArray.extractors.length;
        let roomMineralType;

        //Check mineral type of the room
        if (numberOfExploitableMineralSources > 0) {
            // Assumption: There is only one mineral source per room
            let mineral = Game.getObjectById(this.memory.roomArray.minerals[0]);
            if (mineral != undefined) {
                roomMineralType = mineral.mineralType;
            }
        }

        // Define spawn minima
        let minimumSpawnOf = {};
        //Volume defined by flags
        minimumSpawnOf["remoteHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["bigClaimer"] = 0;
        minimumSpawnOf["protector"] = 0;
        minimumSpawnOf["blocker"] = 0;
        minimumSpawnOf["drainer"] = 0;
        minimumSpawnOf["stationaryHarvester"] = 0;
        minimumSpawnOf["remoteStationaryHarvester"] = 0;
        minimumSpawnOf["demolisher"] = 0;
        minimumSpawnOf["distributor"] = 0;
        minimumSpawnOf["energyHauler"] = 0;
        minimumSpawnOf["attacker"] = 0;
        minimumSpawnOf["healer"] = 0;
        minimumSpawnOf["einarr"] = 0;
        minimumSpawnOf["archer"] = 0;
        minimumSpawnOf["scientist"] = 0;
        minimumSpawnOf["transporter"] = 0;
        minimumSpawnOf["SKHarvester"] = 0;
        minimumSpawnOf["SKHauler"] = 0;
        minimumSpawnOf["energyTransporter"] = 1;
        minimumSpawnOf["energyLoader"] = 1;
        minimumSpawnOf["harvester"] = 0;
        minimumSpawnOf["fupgrader"] = 0;
        if(this.name == 'W58N33') {
            // minimumSpawnOf["energyTransporter"] = 2;
        //   minimumSpawnOf["attacker"] = 1;
        //   minimumSpawnOf["healer"] = 1;
        //   // minimumSpawnOf["distributor"] = 1;
        //   minimumSpawnOf["transporter"] = 4;
        }
        // if(this.name == 'W57S2') {
        //   minimumSpawnOf["transporter"] = 1;
        // }

        let myFlags = _.filter(Game.flags,{ memory: { spawn: this.memory.masterSpawn}});

        let vacantFlags = {};
        for (let flag in myFlags) {
            var mem = myFlags[flag].memory;
            var vol = mem.volume;

            switch (mem.function) {
                case "transporter":
                    minimumSpawnOf.transporter += vol;
                    break;
                case "fupgrader":
                    minimumSpawnOf.fupgrader += vol;
                    break;
                case 'demolish':
                    minimumSpawnOf.demolisher += vol;
                    break;
                case 'protector':
                    minimumSpawnOf.protector += vol;
                    break;
                case 'block':
                    minimumSpawnOf.blocker += vol;
                    break;
                case 'drain':
                    minimumSpawnOf.drainer += vol;
                    break;
                case 'remoteSource':
                    minimumSpawnOf.remoteHarvester += vol;
                    break;
                case 'haulEnergy':
                    if (vol > 0) {
                        minimumSpawnOf.remoteStationaryHarvester++;
                        minimumSpawnOf.energyHauler += vol - 1;
                    }
                    break;
                case 'narrowSource':
                    minimumSpawnOf.stationaryHarvester++;
                    minimumSpawnOf.energyTransporter += vol - 1;
                    break;
                case "remoteController":
                    vacantFlags = _.filter(myFlags, function (f) {
                        if (f.memory.function == "remoteController" && _.filter(Game.creeps, {memory: {currentFlag: f.name}}).length == 0) {
                            if (Game.rooms[f.pos.roomName] != undefined) {
                                // Sight on room
                                let controller = Game.rooms[f.pos.roomName].controller;
                                if (controller.owner == undefined && (controller.reservation == undefined || controller.reservation.ticksToEnd < 3000 || f.memory.claim == 1)) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                            else {
                                // No sight on room
                                return true;
                            }
                        }
                    });
                    if (vacantFlags.length > 0) {
                        minimumSpawnOf.claimer = 1;
                    }
                    break;
                case 'attackController':
                    if (myFlags[flag].room.controller != undefined && (myFlags[flag].room.controller.upgradeBlocked == undefined || myFlags[flag].room.controller.upgradeBlocked < 200)) {
                    minimumSpawnOf.bigClaimer += vol;
                    }
                    break;
                case "unitGroup":
                    if (mem.attacker != undefined) {
                        minimumSpawnOf.attacker += mem.attacker;
                    }
                    if (mem.healer != undefined) {
                        minimumSpawnOf.healer += mem.healer;
                    }
                    if (mem.einarr != undefined) {
                        minimumSpawnOf.einarr += mem.einarr;
                    }
                    if (mem.archer != undefined) {
                        minimumSpawnOf.archer += mem.archer;
                    }
                    break;
            }
        }

        /**Spawning volumes scaling with # of sources in room**/
        var constructionSites = this.find(FIND_CONSTRUCTION_SITES);
        var constructionOfRampartsAndWalls = 0;
        // Builder
        if (constructionSites.length == 0) {
            minimumSpawnOf.builder = 0;
        }
        else {
            //There are construction sites
            var progress = 0;
            var totalProgress = 0;
            for (var w in constructionSites) {
                progress += constructionSites[w].progress;
                totalProgress += constructionSites[w].progressTotal;
                if (constructionSites[w].structureType == STRUCTURE_RAMPART || constructionSites[w].structureType == STRUCTURE_WALL) {
                    constructionOfRampartsAndWalls++;
                }
            }
            minimumSpawnOf.builder = Math.ceil((totalProgress - progress) / 5000);
        }
        if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)) {
            minimumSpawnOf.builder = Math.ceil(numberOfSources * 1.5);
        }
        
        // Upgrader
        if (this.controller.ticksToDowngrade < 10000) {
            minimumSpawnOf.upgrader = 1;
        }
        else if (this.controller.level == 8) {
            minimumSpawnOf.upgrader = 0;
            if(this.totalResourceInStock(RESOURCE_ENERGY) > 400000) {
                minimumSpawnOf["wallRepairer"] = Math.round(this.totalResourceInStock(RESOURCE_ENERGY) * wallRepairerEnergyRatio);
            }
            
            if (this.controller.ticksToDowngrade < 50000 || this.totalResourceInStock(RESOURCE_ENERGY) > 250000) {
                minimumSpawnOf.upgrader = 1;
            }
        }
        else {
            if(this.totalResourceInStock(RESOURCE_ENERGY) > 300000) {
                minimumSpawnOf["upgrader"] = 3;
            }
            else if(this.totalResourceInStock(RESOURCE_ENERGY) > 150000) {
                minimumSpawnOf["upgrader"] = 3;
            }
            else if(this.totalResourceInStock(RESOURCE_ENERGY) > 75000) {
                minimumSpawnOf["upgrader"] = 2;
            }
            else if(this.totalResourceInStock(RESOURCE_ENERGY) > 25000) {
                minimumSpawnOf["upgrader"] = 1;
            }
            else {
                minimumSpawnOf.upgrader = 0; 
            }
        }
        
        
        // if(this.memory.border != undefined && this.memory.border == true && this.totalResourceInStock(RESOURCE_ENERGY) > 350000) {
        //         minimumSpawnOf["wallRepairer"] = 1;
        //         if(this.totalResourceInStock(RESOURCE_ENERGY) > 300000) {
        //             minimumSpawnOf["wallRepairer"] = 1;
        //         }
        // }
        // else if (this.memory.roomSecure == true && constructionOfRampartsAndWalls == 0) {
        //     minimumSpawnOf["wallRepairer"] = 0;
        // }
        // else {
        //     //minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        //     minimumSpawnOf["wallRepairer"] = 0;
        // }
        
        
        
        // if (this.name == 'W55N28'|| this.name == 'W55N32'|| this.name == 'W57S4'|| this.name == 'W57N38'|| this.name == 'W53N29'|| this.name == 'W53N38'|| this.name == 'W59S5'|| this.name == 'W51N4'|| this.name == 'W52N1' || this.name == 'W52N36'|| this.name == 'W58N39') {
        //     // console.log(numberOf["remoteStationaryHarvester"]);
        //     // minimumSpawnOf["energyLoader"] = 2;
        //     minimumSpawnOf["wallRepairer"] = 1;
        // }
        
        // if(this.totalResourceInStock(RESOURCE_ENERGY) > 500000) {
        //     minimumSpawnOf["wallRepairer"] = 4;
        // }
        // if(this.totalResourceInStock(RESOURCE_ENERGY) > 600000) {
        //     minimumSpawnOf["wallRepairer"] = 5;
        // }
        // if(this.totalResourceInStock(RESOURCE_ENERGY) > 700000) {
        //     minimumSpawnOf["wallRepairer"] = 6;
        // }
        
        // if(this.memory.border != undefined && this.memory.border == true && this.totalResourceInStock(RESOURCE_ENERGY) > 300000) {
        //     // minimumSpawnOf["wallRepairer"] = 1;
        // }
        // if (this.totalResourceInStock(RESOURCE_ENERGY) > 100000 && constructionOfRampartsAndWalls > 0 && minimumSpawnOf["wallRepairer"] == 0) {
        //     minimumSpawnOf["wallRepairer"] = 1;
        // }
        // if(this.name == 'W58S2') { minimumSpawnOf["wallRepairer"] = 4; }
        // if(this.name == 'W55S8') { minimumSpawnOf["wallRepairer"] = 3; }
        // Distributor
        // if (this.memory.terminalTransfer != undefined) {
        //     // console.log(this.name);
        //     //ongoing terminal transfer
        //     minimumSpawnOf["distributor"] = 1;
        // }
        // else if (this.terminal != undefined && this.storage != undefined) {
        //     for (var rs in RESOURCES_ALL) {
        //         if ((checkTerminalLimits(this, RESOURCES_ALL[rs]).amount < 0 && this.storage.store[RESOURCES_ALL[rs]] > 0)
        //             || checkTerminalLimits(this, RESOURCES_ALL[rs]).amount > 0) {
        //             minimumSpawnOf["distributor"] = 1;
        //             break;
        //         }
        //     }
        // }
        
        if(this.name == 'W55N32') {minimumSpawnOf.upgrader = 2;}
        // if(this.name == 'W57N12' && _.filter(Game.creeps, (c) => c.memory.homeroom != undefined && c.memory.homeroom == 'W58N12' && c.memory.role != undefined && c.memory.role == 'builder' && c.memory.foreign != undefined).length <= 5 ) {minimumSpawnOf.builder = 1;}
        // if(this.name == 'W57N38' && _.filter(Game.creeps, (c) => c.memory.homeroom != undefined && c.memory.homeroom == 'W58N39' && c.memory.role != undefined && c.memory.role == 'builder' && c.memory.foreign != undefined).length <= 2 ) {minimumSpawnOf.builder = 1;}

        
        if ( this.controller.level >= 5 ) {
            minimumSpawnOf["distributor"] = 1;
        }
        
        // EnergyTransporter, Harvester & Repairer
                
        if(this.controller.level < 4){
            minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);
        }
        
        /** Rest **/
        // Miner
        minimumSpawnOf["miner"] = numberOfExploitableMineralSources;
        
        if (this.storage == undefined || Game.getObjectById(this.memory.roomArray.minerals[0]) == null || Game.getObjectById(this.memory.roomArray.minerals[0]).mineralAmount == 0 || this.memory.resourceLimits[roomMineralType] == undefined || (this.storage != undefined && this.storage.store[roomMineralType] > this.memory.resourceLimits[roomMineralType].minProduction)) {
            minimumSpawnOf.miner = 0;
        }
        
        // Scientist
        if (this.memory.labOrder != undefined) {
            var info = this.memory.labOrder.split(":");
            if (info[3] == "prepare" || info[3] == "done") {
                minimumSpawnOf.scientist = 1;
            }
        }
        // Adjustments in case of hostile presence
        // if (this.hostileCreeps().length > 0) {
        //     if (this.memory.roomArray.towers.length > 0) {
        //         minimumSpawnOf.protector = this.memory.hostiles.length - 1;
        //     }
        //     else {
        //         minimumSpawnOf.protector = this.memory.hostiles.length;
        //     }
        //     minimumSpawnOf.upgrader = 0;
        //     minimumSpawnOf.builder = 0;
        //     minimumSpawnOf.remoteHarvester = 0;
        //     minimumSpawnOf.miner = 0;
        //     minimumSpawnOf.distributor = 0;
        //     minimumSpawnOf.remoteStationaryHarvester = 0;
        //     minimumSpawnOf.energyHauler = 0;
        //     minimumSpawnOf.demolisher = 0;
        //     minimumSpawnOf.wallRepairer *= 2;
        // }
        // if(this.storage == undefined) {
        //     // console.log(this.store)
        
        // Measuring number of active creeps
        let counter = _.countBy(allMyCreeps, "memory.role");
        let roleList = (Object.getOwnPropertyNames(minimumSpawnOf));
        for (let z in roleList) {
            if (roleList[z] != "length" && counter[roleList[z]] == undefined) {
                counter[roleList[z]] = 0;
            }
        }
        let numberOf = counter;
        numberOf.claimer = 0; //minimumSpawnOf only contains claimer delta. Hence numberOf.claimer is always 0
        // if ( this.name == 'W57N38' || this.name == 'W53N38') {
        //     minimumSpawnOf["energyLoader"] = 2;
        // }

        
        // Role selection
        let energy = this.energyCapacityAvailable;
        let name = undefined;
        let rcl = this.controller.level;

        //Check whether spawn trying to spawn too many creeps
        let missingBodyParts = 0;
        for (let rn in minimumSpawnOf){
            if(minimumSpawnOf[rn] != undefined && global.buildingPlans[rn] != undefined) {
                missingBodyParts+=minimumSpawnOf[rn]*global.buildingPlans[rn][rcl-1].body.length;
            }
        }
        let neededTicksToSpawn = 3 * missingBodyParts;
        let neededTicksThreshold = 1300 * this.memory.roomArray.spawns.length;
        if (neededTicksToSpawn > neededTicksThreshold) {
            console.log("<font color=#ff0000 type='highlight'>Warning: Possible bottleneck to spawn creeps needed for room " + this.name + "  detected: " + neededTicksToSpawn + " ticks > " + neededTicksThreshold + " ticks</font>");
        }
        let spawnList = this.getSpawnList(minimumSpawnOf, numberOf);
        let spawnEntry = 0;
        if (spawnList != null && spawnList.length > 0) {
            for (var s in this.memory.roomArray.spawns) {
                // Iterate through spawns
                let testSpawn = Game.getObjectById(this.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    // Spawn!
                    if (spawnList[spawnEntry] == "claimer") {
                        name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], this.memory.masterSpawn, vacantFlags);
                    }
                    else {
                        name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], this.memory.masterSpawn);
                    }
                    testSpawn.memory.lastSpawnAttempt = spawnList[spawnEntry];
                    if (!(name < 0) && name != undefined) {
                        testSpawn.memory.lastSpawn = spawnList[spawnEntry];
                        if (global.LOG_SPAWN == true) {
                            console.log("<font color=#00ff22 type='highlight'>" + testSpawn.name + " is spawning creep: " + name + " (" + spawnList[spawnEntry] + ") in room " + this.name + ". (CPU used: " + (Game.cpu.getUsed() - cpuStart) + ")</font>");
                        }
                        spawnEntry++;
                    }
                }
                if (spawnEntry >= spawnList.length) {
                    break;
                }
            }
        }
    }
};

Room.prototype.getSpawnList = function (minimumSpawnOf, numberOf) {
    
    let rcl = this.controller.level;
    let tableImportance = {
        harvester: {
            name: "harvester",
            prio: 10,
            energyRole: true,
            min: minimumSpawnOf.harvester,
            max: numberOf.harvester,
            minEnergy: global.buildingPlans.harvester[rcl - 1].minEnergy
        },
        miniharvester: {
            name: "miniharvester",
            prio: 5,
            energyRole: true,
            min: 0,
            max: 0,
            minEnergy: global.buildingPlans.miniharvester[rcl - 1].minEnergy
        },
        stationaryHarvester: {
            name: "stationaryHarvester",
            prio: 100,
            energyRole: true,
            min: minimumSpawnOf.stationaryHarvester,
            max: numberOf.stationaryHarvester,
            minEnergy: global.buildingPlans.stationaryHarvester[rcl - 1].minEnergy
        },
        builder: {
            name: "builder",
            prio: 140,
            energyRole: false,
            min: minimumSpawnOf.builder,
            max: numberOf.builder,
            minEnergy: global.buildingPlans.builder[rcl - 1].minEnergy
        },
        repairer: {
            name: "repairer",
            prio: 170,
            energyRole: false,
            min: minimumSpawnOf.repairer,
            max: numberOf.repairer,
            minEnergy: global.buildingPlans.repairer[rcl - 1].minEnergy
        },
        wallRepairer: {
            name: "wallRepairer",
            prio: 210,
            energyRole: false,
            min: minimumSpawnOf.wallRepairer,
            max: numberOf.wallRepairer,
            minEnergy: global.buildingPlans.wallRepairer[rcl - 1].minEnergy
        },
        miner: {
            name: "miner",
            prio: 200,
            energyRole: false,
            min: minimumSpawnOf.miner,
            max: numberOf.miner,
            minEnergy: global.buildingPlans.miner[rcl - 1].minEnergy
        },
        upgrader: {
            name: "upgrader",
            prio: 160,
            energyRole: false,
            min: minimumSpawnOf.upgrader,
            max: numberOf.upgrader,
            minEnergy: global.buildingPlans.upgrader[rcl - 1].minEnergy
        },
        distributor: {
            name: "distributor",
            prio: 19,
            energyRole: false,
            min: minimumSpawnOf.distributor,
            max: numberOf.distributor,
            minEnergy: global.buildingPlans.distributor[rcl - 1].minEnergy
        },
        energyTransporter: {
            name: "energyTransporter",
            prio: 20,
            energyRole: true,
            min: minimumSpawnOf.energyTransporter,
            max: numberOf.energyTransporter,
            minEnergy: global.buildingPlans.energyTransporter[rcl - 1].minEnergy
        },
        energyLoader: {
            name: "energyLoader",
            prio: 18,
            energyRole: true,
            min: minimumSpawnOf.energyLoader,
            max: numberOf.energyLoader,
            minEnergy: global.buildingPlans.energyLoader[rcl - 1].minEnergy
        },
        scientist: {
            name: "scientist",
            prio: 220,
            energyRole: false,
            min: minimumSpawnOf.scientist,
            max: numberOf.scientist,
            minEnergy: global.buildingPlans.scientist[rcl - 1].minEnergy
        },
        remoteHarvester: {
            name: "remoteHarvester",
            prio: 130,
            energyRole: true,
            min: minimumSpawnOf.remoteHarvester,
            max: numberOf.remoteHarvester,
            minEnergy: global.buildingPlans.remoteHarvester[rcl - 1].minEnergy
        },
        remoteStationaryHarvester: {
            name: "remoteStationaryHarvester",
            prio: 110,
            energyRole: true,
            min: minimumSpawnOf.remoteStationaryHarvester,
            max: numberOf.remoteStationaryHarvester,
            minEnergy: global.buildingPlans.remoteStationaryHarvester[rcl - 1].minEnergy
        },
        claimer: {
            name: "claimer",
            prio: 40,
            energyRole: false,
            min: minimumSpawnOf.claimer,
            max: numberOf.claimer,
            minEnergy: global.buildingPlans.claimer[rcl - 1].minEnergy
        },
        bigClaimer: {
            name: "bigClaimer",
            prio: 60,
            energyRole: false,
            min: minimumSpawnOf.bigClaimer,
            max: numberOf.bigClaimer,
            minEnergy: global.buildingPlans.bigClaimer[rcl - 1].minEnergy
        },
        protector: {
            name: "protector",
            prio: 30,
            energyRole: false,
            min: minimumSpawnOf.protector,
            max: numberOf.protector,
            minEnergy: global.buildingPlans.protector[rcl - 1].minEnergy
        },
        demolisher: {
            name: "demolisher",
            prio: 230,
            energyRole: true,
            min: minimumSpawnOf.demolisher,
            max: numberOf.demolisher,
            minEnergy: global.buildingPlans.demolisher[rcl - 1].minEnergy
        },
        energyHauler: {
            name: "energyHauler",
            prio: 120,
            energyRole: true,
            min: minimumSpawnOf.energyHauler,
            max: numberOf.energyHauler,
            minEnergy: global.buildingPlans.energyHauler[rcl - 1].minEnergy
        },
        attacker: {
            name: "attacker",
            prio: 80,
            energyRole: false,
            min: minimumSpawnOf.attacker,
            max: numberOf.attacker,
            minEnergy: global.buildingPlans.attacker[rcl - 1].minEnergy
        },
        archer: {
            name: "archer",
            prio: 80,
            energyRole: false,
            min: minimumSpawnOf.apaHatchi,
            max: numberOf.apaHatchi,
            minEnergy: global.buildingPlans.archer[rcl - 1].minEnergy
        },
        healer: {
            name: "healer",
            prio: 90,
            energyRole: false,
            min: minimumSpawnOf.healer,
            max: numberOf.healer,
            minEnergy: global.buildingPlans.healer[rcl - 1].minEnergy
        },
        einarr: {
            name: "einarr",
            prio: 50,
            energyRole: false,
            min: minimumSpawnOf.einarr,
            max: numberOf.einarr,
            minEnergy: global.buildingPlans.einarr[rcl - 1].minEnergy
        },
        transporter: {
            name: "transporter",
            prio: 2400,
            energyRole: false,
            min: minimumSpawnOf.transporter,
            max: numberOf.transporter,
            minEnergy: global.buildingPlans.transporter[rcl - 1].minEnergy
        },
        blocker: {
            name: "blocker",
            prio: 2400,
            energyRole: false,
            min: minimumSpawnOf.blocker,
            max: numberOf.blocker,
            minEnergy: global.buildingPlans.blocker[rcl - 1].minEnergy
        },
        drainer: {
            name: "drainer",
            prio: 2400,
            energyRole: false,
            min: minimumSpawnOf.drainer,
            max: numberOf.drainer,
            minEnergy: global.buildingPlans.drainer[rcl - 1].minEnergy
        },
        fupgrader: {
            name: "fupgrader",
            prio: 2400,
            energyRole: false,
            min: minimumSpawnOf.fupgrader,
            max: numberOf.fupgrader,
            minEnergy: global.buildingPlans.fupgrader[rcl - 1].minEnergy
        }
    };

    if (numberOf.harvester + numberOf.energyLoader == 0 && (this.energyAvailable < global.buildingPlans.harvester[rcl - 1].minEnergy || this.energyAvailable < global.buildingPlans.energyLoader[rcl - 1].minEnergy) ) {
        // Set up miniHarvester to spawn
        tableImportance.miniharvester.min = 1;
    }

    tableImportance = _.filter(tableImportance, function (x) {
        return (!(x.min == 0 || x.min == x.max || x.max > x.min))
    });
    if (tableImportance.length > 0) {
        tableImportance = _.sortBy(tableImportance, "prio");

        let spawnList = [];
        for (let c in tableImportance) {
            for (let i = 0; i < (tableImportance[c].min - tableImportance[c].max); i++) {
                spawnList.push(tableImportance[c].name);
            }
        }
        //Surplus Upgrader Spawning
        // if (numberOf.harvester + numberOf.energyTransporter > 0 && this.memory.hostiles.length == 0 && this.controller.level < 8 && numberOf.upgrader < (minimumSpawnOf.upgrader * 2)) {
        //     let container = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE});
        //     let containerEnergy = 0;
        //     for (let e in container) {
        //         containerEnergy += container[e].store[RESOURCE_ENERGY];
        //     }
        //     if (containerEnergy > this.energyAvailable * 2 || containerEnergy > this.memory.resourceLimits[RESOURCE_ENERGY].minMarket * 0.9) {
        //         spawnList.push("upgrader");
        //     }
        // }
        // console.log(minimumSpawnOf.harvester);
        // console.log(numberOf.harvester);
        // console.log(minimumSpawnOf.energyHauler);
        return spawnList;
    }
    else {
        return null;
    }
};