module.exports = {

    //TOWER CODE
    defendMyRoom: function(roomIndex) {

            var towers = [];
            for (let t in Game.rooms[roomIndex].memory.roomArray.towers) {
                towers.push(Game.getObjectById(Game.rooms[roomIndex].memory.roomArray.towers[t]));
            }

            if (Game.rooms[roomIndex].memory.hostiles.length > 0) {
                let hostiles = [];
                for (let h in Game.rooms[roomIndex].memory.hostiles) {
                    hostiles.push(Game.getObjectById(Game.rooms[roomIndex].memory.hostiles[h]));
                }

                for (var tower in towers) {
                    // Tower attack code
                    var maxAttackBodyParts = 0;
                    var AttackBodyParts = 0;
                    var attackingInvader = undefined;

                    for (var h in hostiles) {
                        AttackBodyParts = 0;
                        for (var part in hostiles[h].body) {
                            if (hostiles[h].body[part].type == ATTACK) {
                                //Healing body part found
                                AttackBodyParts++;
                            }
                        }

                        if (AttackBodyParts > maxAttackBodyParts) {
                            maxAttackBodyParts = AttackBodyParts;
                            attackingInvader = hostiles[h].id;
                        }
                    }

                    if (hostiles.length > 0) {
                        let towerTarget = towers[tower].pos.findClosestByRange(hostiles);
                        if (towerTarget != null) {
                            if(tower.room = "W58S4" && towerTarget.pos.y == 0) {}
                            else {
                              towers[tower].attack(towerTarget);
                          }
                        }
                    }
                }
            }
            else {
                var wounded = Game.rooms[roomIndex].find(FIND_CREEPS, {filter: (s) => s.hits < s.hitsMax && isHostile(s) == false});
                if (wounded.length > 0) {
                    // Tower healing code
                    for (var tower in towers) {
                        let towerTarget = towers[tower].pos.findClosestByRange(wounded);
                        towers[tower].heal(towerTarget);
                    }
                }
                else {
                  for(var i in towers){
                       //...repair Buildings! :) But ONLY until HALF the energy of the tower is gone.
                       //Because we don't want to be exposed if something shows up at our door :)
                       if(towers[i].energy > ((towers[i].energyCapacity / 10)* 7)){

                           //Find the closest damaged Structure
                           var closestDamagedStructure = towers[i].pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
                           if(!closestDamagedStructure) {
                             if(roomIndex == 'W58S5' && towers[i].room.storage.store[RESOURCE_ENERGY] > 300000) {
                               //var closestDamagedStructure = towers[i].pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax});
                               var target = undefined;
                               var ramparts = Game.rooms[roomIndex].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                               ramparts = _.sortBy(ramparts,"hits");

                               var walls = Game.rooms[roomIndex].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL});
                               walls = _.sortBy(walls,"hits");

                               if (walls.length > 0 && ((ramparts[0] != undefined && walls[0].hits < ramparts[0].hits) || (ramparts.length == 0))) {
                                   target = walls[0];
                               }
                               else if (ramparts.length > 0) {
                                   target = ramparts[0];
                               }

                               // if we find a wall that has to be repaired
                               if (target != undefined && target.hits < 100000000) {
                                   var result = towers[i].repair(target);
                                 }
                              }
                           }
           	              if(closestDamagedStructure) {
           	 	            towers[i].repair(closestDamagedStructure);
                          // console.log("The tower is repairing buildings.");
                           }

                       }
                   }
                }
            }




            }
        };
