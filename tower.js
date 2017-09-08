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
                            towers[tower].attack(towerTarget);
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
                       if(towers.energy > ((towers.energyCapacity / 10)* 9)){

                           //Find the closest damaged Structure
                           var closestDamagedStructure = towers.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
           	            if(closestDamagedStructure) {
           	 	            towers.repair(closestDamagedStructure);
           	 	            console.log("The tower is repairing buildings.");
                           }
                       }
                   }
                }
            }




            }
        };
