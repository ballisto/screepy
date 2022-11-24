Creep.prototype.roleEnergyHauler = function() {
    let minttl = 100;
    let cpuStart = Game.cpu.getUsed();
    
    // try to transfer energy, if it is not in range
    if (this.memory.totalenergyhauled == undefined || this.memory.totalenergyhauled == null) {
      this.memory.totalenergyhauled = 0;
    }
    // if (this.ticksToLive == 1) {
    //   console.log(this.name + ' - livetime hauled - ' + this.memory.totalenergyhauled + ' - Flag - ' + this.memory.currentFlag);
    // }
    if (_.sum(this.carry) == 0) {
        // switch state to collecting
        if (this.memory.working == true) {
            delete this.memory._move;
            delete this.memory.WP54S5;
            delete this.memory.W54S5_WP2;
            delete this.memory.W55S3_WP1;
            delete this.memory.W55S4_WP1;
        }
        this.memory.working = false;
    }
    else if (_.sum(this.carry) == this.carryCapacity || (this.room.name == this.memory.homeroom && _.sum(this.carry) > 0)) {
        // creep is collecting energy but is full
        if (this.memory.working == false) {
            delete this.memory._move;
            delete this.memory.WP54S5;
            delete this.memory.W54S5_WP2;
            delete this.memory.W55S3_WP1;
            delete this.memory.W55S4_WP1;
        }
        this.memory.working = true;
    }
    
    if (this.memory.working == true) {
        // creep is supposed to transfer energy to a structure
        // Find construction sites
        var road = this.pos.lookFor(LOOK_STRUCTURES);
        if (road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom && this.ticksToLive > 180) {
                // Found road to repair
                if (this.getActiveBodyparts(WORK) > 0) {
                    this.repair(road[0]);
                    return true;
                }
        }
        
        var constructionSites = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 5);

        if (constructionSites.length > 0 && this.room.name != this.memory.homeroom) {
            // Construction sites found, build them!
            let site = this.pos.findClosestByPath(constructionSites);
            if (this.build(site) == ERR_NOT_IN_RANGE) {
                this.moveTo(site);
            }
        }
        else {
            // Move to structure
            var road = this.pos.lookFor(LOOK_STRUCTURES);
            // console.log(this.room.name)
            if (this.room.controller != undefined && (this.room.controller.owner == undefined || this.room.controller.owner.username != Game.getObjectById(this.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom) {
                // Found road to repair
                if (this.getActiveBodyparts(WORK) > 0) {
                    this.repair(road[0]);
                }
                else {
                    var spawn = Game.getObjectById(this.memory.spawn);
                    this.moveTo(spawn, {reusePath: 50});
                }
            }
            else {
                if (this.room.name != this.memory.homeroom) {
                    // Find exit to spawn room
                    //this.moveTo(Game.getObjectById(this.memory.spawn))
                    // if((this.room.name == 'W56S3' || this.room.name == 'W55S3') && this.memory.W55S3_WP1 == undefined) {
                    //         if(this.pos.getRangeTo(Game.flags['W55S3_WP1']) > 1) {
                    //             this.moveTo(Game.flags['W55S3_WP1']);
                    //             this.say('WP')
                    //             return true;
                    //         }
                    //         else {
                    //             this.memory.W55S3_WP1 = true;
                    //         }
                    //     }
                        
                        if((this.room.name == 'W55S4' || this.room.name == 'W55S4') && this.memory.W55S4_WP1 == undefined) {
                            if(this.pos.getRangeTo(Game.flags['W55S4_WP1']) > 1) {
                                this.moveTo(Game.flags['W55S4_WP1']);
                                this.say('WP')
                                return true;
                            }
                            else {
                                this.memory.W55S4_WP1 = true;
                            }
                        }
                        if((this.room.name == 'W55S4') && this.memory.W55S3_WP1 == undefined && this.memory.W55S4_WP1 != undefined) {
                            if(this.pos.getRangeTo(Game.flags['W55S3_WP1']) > 1) {
                                this.moveTo(Game.flags['W55S3_WP1']);
                                this.say('WP')
                                return true;
                            }
                            else {
                                this.memory.W55S3_WP1 = true;
                            }
                        }
                    
                    if(( this.room.name == 'W54S5') && this.memory.W54S5_WP1 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP1']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP1']);
                            this.say('WP')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP1 = true;
                        }
                    }
                    
                    if(this.room.name == 'W54S5' && this.memory.W54S5_WP2 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP2']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP2']);
                            this.say('WP2')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP2 = true;
                        }
                    }
                    
                    if(this.room.name == 'W54S5' && this.memory.W54S5_WP2 != undefined && this.memory.W54S5_WP1 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP1']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP1']);
                            this.say('WP')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP1 = true;
                        }
                    }
                    
                    
                    this.moveTo(Game.getObjectById(this.memory.spawn).pos);
                }
                else {
                    this.storeAllBut('',true);
                }
             
            }
        }
    }
    // if creep is supposed to harvest energy from source
    else {
        //Find remote source
        var remoteSource = Game.flags[this.findMyFlag("haulEnergy")];
        if (remoteSource != undefined) {
            if(remoteSource.memory.minttl != undefined) {
                minttl = remoteSource.memory.minttl;
            }
            
            if (this.ticksToLive < minttl) {
                if(this.isEmpty()) {
                    this.suicide();
                }
            }
            
            // Find exit to target room
            if (this.room.name != remoteSource.pos.roomName) {
                // if((this.room.name == 'W56S3' || this.room.name == 'W55S3') && this.memory.W55S3_WP1 == undefined) {
                //             if(this.pos.getRangeTo(Game.flags['W55S3_WP1']) > 1) {
                //                 this.moveTo(Game.flags['W55S3_WP1']);
                //                 this.say('WP')
                //                 return true;
                //             }
                //             else {
                //                 this.memory.W55S3_WP1 = true;
                //             }
                //         }
                        
                        if((this.room.name == 'W55S4' || this.room.name == 'W55S4') && this.memory.W55S4_WP1 == undefined) {
                            if(this.pos.getRangeTo(Game.flags['W55S4_WP1']) > 1) {
                                this.moveTo(Game.flags['W55S4_WP1']);
                                this.say('WP')
                                return true;
                            }
                            else {
                                this.memory.W55S4_WP1 = true;
                            }
                        }
                if((this.room.name == 'W54S5') && this.memory.W54S5_WP1 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP1']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP1']);
                            this.say('WP')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP1 = true;
                        }
                    }
                    
                    if(this.room.name == 'W54S5' && this.memory.W54S5_WP2 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP2']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP2']);
                            this.say('WP2')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP2 = true;
                        }
                    }
                    
                    if(this.room.name == 'W54S5' && this.memory.W54S5_WP2 != undefined && this.memory.W54S5_WP1 == undefined) {
                        if(this.pos.getRangeTo(Game.flags['W54S5_WP1']) > 1) {
                            this.moveTo(Game.flags['W54S5_WP1']);
                            this.say('WP')
                            return true;
                        }
                        else {
                            this.memory.W54S5_WP1 = true;
                        }
                    }
                //still in old room, go out
                
                this.moveTo(remoteSource, {reusePath: 50});
            }
            else {
                //new room reached, start collecting
                // if (this.room.memory.hostiles.length == 0) {
                    // var droppedResources = this.room.find(FIND_DROPPED_RESOURCES);
                    // if(droppedResources != undefined && droppedResources.length > 0) {
                    //     for(const r in droppedResources) {
                    //         if(droppedResources[r].resourceType == RESOURCE_ENERGY ) {
                    //             if(this.pickup(droppedResources[r]) != OK) {
                    //                 this.moveTo(droppedResources[r]);
                    //                 return true;
                    //             }
                    //             else {
                    //                 return true;
                    //             }
                    //         }
                    //     }
                    // }
                    // else {
                    if(true) {
                    {
                    if(remoteSource.name == 'W55S5_S1') {
                        let sourceHaulerPos1 = new RoomPosition(47, 13, 'W55S5');
                        let sourceHaulerPos2 = new RoomPosition(48, 13, 'W55S5');
                        let sourceWaitPos = new RoomPosition(43, 18, 'W55S5');
                        
                        let haulerCreepOnPos1 = sourceHaulerPos1.lookFor(LOOK_CREEPS);
                        let haulerCreepOnPos2 = sourceHaulerPos2.lookFor(LOOK_CREEPS);
                        
                        if(haulerCreepOnPos1.length == 0 && this.pos.x == sourceHaulerPos2.x && this.pos.y == sourceHaulerPos2.y) {
                            this.moveTo(sourceHaulerPos1);
                            return true;
                        }
                        if(haulerCreepOnPos1.length && !(this.pos.x == sourceHaulerPos1.x && this.pos.y == sourceHaulerPos1.y)) {
                            this.moveTo(sourceWaitPos);
                            return true;
                        }
                        // else {
                        //     this.moveTo(sourceHaulerPos);
                        // }
                    }
                        
                        let flag = Game.flags[this.memory.currentFlag];
                        //No enemy creeps
                        let container = flag.pos.lookFor(LOOK_STRUCTURES);
                        container = _.filter(container, {structureType: STRUCTURE_CONTAINER});
                        if (container.length > 0) {
                            for (let s in container[0].store) {
                                if (this.withdraw(container[0], s) == ERR_NOT_IN_RANGE) {
                                    //this.moveTo(container[0]);
                                    this.moveTo(container[0].pos, {reusePath: 50});
                                }
                            }
                        }
                    }
                }
                else {
                    //Hostiles creeps in new room
                    this.memory.fleeing = true;
                    this.goToHomeRoom();
                }
            }
        }
    }
    // console.log("<font color=#00ff22 type='highlight'> .Hauler (CPU used: " + (Game.cpu.getUsed() - cpuStart) + ")</font>");
};
