module.exports = function() {
    // find nearest requested resource and return object, otherwise return null
	Creep.prototype.findSpace = function() {
		return this.room.findSpace();
	};
	Creep.prototype.findResource = function(resource) {
		return this.room.findResource(resource);
	};

	Creep.prototype.findResourceOLD =
	function(resource, sourceTypes) {
	    if (this.memory.targetBuffer != undefined) {
            let tempTarget = Game.getObjectById(this.memory.targetBuffer);
            if (tempTarget == undefined || this.memory.roomBuffer != this.room.name) {
                delete this.memory.targetBuffer;
            }
            else if (resource == global.RESOURCE_SPACE) {
                if (tempTarget.energy != undefined && tempTarget.energyCapacity - tempTarget.energy == 0) {
                    delete this.memory.targetBuffer;
                }
                else if (tempTarget.storeCapacity != undefined && tempTarget.storeCapacity - _.sum(tempTarget.store) == 0) {
                    delete this.memory.targetBuffer;
                }
            }
            else if (resource == RESOURCE_ENERGY && tempTarget.energy != undefined && tempTarget.energy == 0) {
                delete this.memory.targetBuffer;
            }
            else if (resource != RESOURCE_ENERGY && tempTarget.store[resource] == 0) {
                delete this.memory.targetBuffer;
            }
        }

	    if (this.memory.targetBuffer != undefined && this.memory.resourceBuffer != undefined && this.memory.resourceBuffer == resource && Game.time % global.DELAYRESOURCEFINDING != 0)
        {
            //return buffered resource
            return Game.getObjectById(this.memory.targetBuffer);
        }
        else if (this.room.memory.roomArray != undefined) {
            let IDBasket = [];
            let tempArray = [];

            for (let argcounter = 1; argcounter < arguments.length; argcounter++) {
                // Go through requested sourceTypes
                switch (arguments[argcounter]) {
										case FIND_DROPPED_RESOURCES:
											if (resource == RESOURCE_ENERGY) {

													tempArray = this.room.find(FIND_DROPPED_RESOURCES);
													for (var s in tempArray) {
															if (tempArray[s].energy != undefined) {
																if (tempArray[s].energy > 0) {
																	IDBasket.push(tempArray[s]);
																}
															}
													}
											}
											break;
                    case FIND_SOURCES:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.sources;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        break;

                    case STRUCTURE_EXTENSION:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.extensions;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        else if (resource == global.RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.extensions;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_SPAWN:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.spawns;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        else if (resource == global.RESOURCE_SPACE) {
                            // Look for spawns with space left
                            tempArray = this.room.memory.roomArray.spawns;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_LINK:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = _.filter(this.room.find(FIND_MY_STRUCTURES), (s) => s.structureType == STRUCTURE_LINK);
                            for (var s in tempArray) {
                                let curLink = tempArray[s];
                                // console.log(curLink)
                                if (curLink != null && curLink.energy > 0 && curLink.getPriority() > 1) {
                                    IDBasket.push(tempArray[s]);
                                }
                            }
                        }
                        else if (resource == global.RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.links;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_TOWER:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.towers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        else if (resource == global.RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.towers;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_CONTAINER:
                        if (resource == global.RESOURCE_SPACE) {
                            // Look for containers with space left
                            tempArray = this.room.memory.roomArray.containers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).storeCapacity - _.sum(Game.getObjectById(tempArray[s]).store) > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        else {
                            // Look for containers with resource
                            tempArray = this.room.memory.roomArray.containers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).store[resource] > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        break;

                    case STRUCTURE_STORAGE:
                        if (resource == global.RESOURCE_SPACE) {
                            // Look for storage with space left
                            if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store) > 0) {
                                IDBasket.push(this.room.storage);
                            }
                        }
                        else {
                            // Look for containers with resource
                            if (this.room.storage != undefined && this.room.storage != undefined && this.room.storage.store[resource] > 0) {
                                IDBasket.push(this.room.storage);
                            }
                        }
                        break;

                    case STRUCTURE_TERMINAL:
                        if (resource == global.RESOURCE_SPACE) {
                            // Look for storage with space left
                            if (this.room.terminal != undefined && this.room.terminal.storeCapacity - _.sum(this.room.terminal.store) > 0) {
                                IDBasket.push(this.room.terminal);
                            }
                        }
                        else {
                            // Look for containers with resource
                            if (this.room.terminal != undefined && this.room.terminal.store[resource] > 0) {
                                IDBasket.push(this.room.terminal);
                            }
                        }
                        break;
                }
            }

            //Get path to collected objects
            var target = this.pos.findClosestByPath(IDBasket);
            this.memory.resourceBuffer = resource;

            if (target != null) {
                this.memory.targetBuffer = target.id;
                this.memory.roomBuffer = this.room.name;
                return target;
            }

            else {
                return null;
            }
        }
	}
};
