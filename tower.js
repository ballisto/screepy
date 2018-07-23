module.exports = {

    //TOWER CODE
    defendMyRoom: function(roomIndex) {
            const room = Game.rooms[roomIndex];
            var towers = _.filter(Game.structures, (a) => a.room.name == roomIndex && a.structureType == STRUCTURE_TOWER);

            let damagedStructures = _.filter(room.find(FIND_MY_STRUCTURES), (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART);
            damagedStructures = damagedStructures.concat(_.filter(room.find(FIND_STRUCTURES), (s) => s.hits < s.hitsMax && (s.structureType == STRUCTURE_ROAD || s.structureType == STRUCTURE_CONTAINER) ));
            var maxDamagedStructure = null;
            if(damagedStructures.length > 0) {
                maxDamagedStructure = _.max(damagedStructures, (s) => s.hitsMax - s.hits);
            }
            // if(roomIndex == 'W58S2'){console.log(maxDamagedStructure);}
            
            // console.log(sortedDamagedStructures)
            
            let ramparts = room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < s.hitsMax && s.hits < 10000000});
            let weakRamparts = room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < s.hitsMax && s.hits < 100000});
            ramparts = _.sortBy(ramparts,"hits");

            var wallsAndRamparts = room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)  && s.hits < s.hitsMax && s.hits < 10000000});
            wallsAndRamparts = _.sortBy(wallsAndRamparts,"hits");
            
            const nukes = room.find(FIND_NUKES);
            
            const sortedNukes = _.sortBy(nukes, (object) => {
                return object.timeToLand;
            });
            
            let wounded = Game.rooms[roomIndex].find(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax });
            
            var repairTarget = null;

            const hostiles = room.hostileCreeps();
            if(hostiles.length > 0) {         
            
                for (var t in towers) {
                    towers[t].attack(hostiles[0]);
                }
                return true;
            }
            
            else if (wounded.length > 0) {
                // Tower healing code
                for (var tower in towers) {
                    let towerTarget = towers[tower].pos.findClosestByRange(wounded);
                    towers[tower].heal(towerTarget);
                }
                return true;
            }
            
            else if (sortedNukes.length > 0) {
                for(const n in sortedNukes) {
                    let structuresOnNukePos = sortedNukes[n].pos.lookFor(LOOK_STRUCTURES);
                    let rampartsOnNukePos = _.filter(structuresOnNukePos, function (s) { return s.structureType == STRUCTURE_RAMPART && s.hits <= 11000000});
                    if(rampartsOnNukePos.length > 0) {
                        repairTarget = rampartsOnNukePos[0];                                
                    }
                    else {
                        const structuresInRange = sortedNukes[n].pos.findInRange(FIND_STRUCTURES, 4);
                        const sortedStructuresInRange = _.sortBy(structuresInRange, (s) => s.defensePriority());
                        const rampartsInRange = _.filter(sortedStructuresInRange, (s) => s.structureType == STRUCTURE_RAMPART);
                        
                        for(const r in rampartsInRange) {
                            if(rampartsInRange[r].hits < 6000000) {
                                repairTarget = rampartsInRange[r];
                                break;                                        
                            }
                        }
                    }
                }
            }
                      
            else if(maxDamagedStructure != undefined) {
                repairTarget = maxDamagedStructure;
            }
            
            else if(weakRamparts.length > 0) {
                repairTarget = weakRamparts[0];
            }
            
            else if(room.storage != undefined && room.storage.store[RESOURCE_ENERGY] > 50000 && ramparts.length > 0) {
                let structures = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_STORAGE});
                sortedCriticalStructures = _.sortBy(structures, (s) => s.defensePriority());
                for (let s in sortedCriticalStructures) {
                    let foundStructures = sortedCriticalStructures[s].pos.lookFor(LOOK_STRUCTURES);
                    foundStructures = foundStructures.concat(sortedCriticalStructures[s].pos.lookFor(LOOK_CONSTRUCTION_SITES));
                    let criticalRamparts = _.filter(foundStructures, function (s) { return s.structureType == STRUCTURE_RAMPART && s.hits <= 6000000});
                    let sortedCriticalRamparts = _.sortBy(criticalRamparts, (r) => r.hits);
                    
                    // console.log(criticalRamparts)
                    if (criticalRamparts.length > 0) {
                        repairTarget = sortedCriticalRamparts[0];
                        break;
                    }
                }
            }
            else if(room.storage != undefined && room.storage.store[RESOURCE_ENERGY] > 350000 && wallsAndRamparts.length > 0) {
                repairTarget = wallsAndRamparts[0];
            }
            
            // Repair if target found
            if(repairTarget != undefined) {
                for(var i in towers){
                    if(towers[i].energy > (towers[i].energyCapacity / 10)* 5) {
                        towers[i].repair(repairTarget);
                    }
                }  
                return true;
            }
            
        
            }
        };
