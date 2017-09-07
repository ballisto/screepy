module.exports = function() {
    // find unoccupied flag and return flag name
	Creep.prototype.findMyFlag =
	function(flagFunction) {
	    let flagList;
        let flag;
        let flagCreeps;
        let volume;

		if (flagFunction == "narrowSource" || flagFunction == "remoteController") {
		    // static volumes
            volume = 1;
        }

        if (this.memory.currentFlag != undefined && this.memory.currentFlag != -1) {
            // There is a current flag

            if (Game.time % global.DELAYFLAGFINDING == 0) {
                flag = Game.flags[this.memory.currentFlag];
                if (flag == undefined) {
                    volume = 0;
                    delete this.memory.currentFlag;
                }
                else if (volume == undefined) {
                    //dynamic volume
                    volume = flag.memory.volume;
                }
                flagCreeps = _.filter(Game.creeps,{ currentFlag: this.memory.currentFlag});

                if (this.memory.currentFlag != undefined && flagCreeps.length <= volume) {
                    if (flagFunction == "haulEnergy") {
                        if (this.memory.role == "remoteStationaryHarvester") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'remoteStationaryHarvester', currentFlag: this.memory.currentFlag}});
                            if (peers == null || peers.length > 1) {
                                //Two remoteStationaryHarvesters on same source
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                        else if (this.memory.role == "energyHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'energyHauler', spawn: this.room.memory.masterSpawn}});
                            if (peers == null || peers.length >= flag.memory.volume) {
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                    }
                    else if (flagFunction == "SKHarvest") {
                        if (this.memory.role == "SKHarvester") {
                            let peers = _.filter(flagCreeps,{ memory: { role: 'SKHarvester', currentFlag: this.memory.currentFlag}});
                            if (peers == null || peers.length > 1) {
                                //Two remoteStationaryHarvesters on same source
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                        else if (this.memory.role == "SKHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'SKHauler', spawn: this.room.memory.masterSpawn}});
                            if (peers == null || peers.length >= flag.memory.volume) {
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                    }
                    else if (flagFunction == "remoteController") {
                        let peers = _.filter(flagCreeps, {memory: {function: "remoteController", role: this.memory.role, currentFlag: this.memory.currentFlag}});
                        if (peers == null || peers.length > 1) {
                            //Too many creeps for this flag
                            delete this.memory.currentFlag;
                        }
                        else {return this.memory.currentFlag;}
                    }
                    else if (flagFunction == "unitGroup") {
                        let peers = _.filter(flagCreeps, {memory: {function: "unitGroup", role: this.memory.role, currentFlag: this.memory.currentFlag}});
                        if (peers == null || peers.length > flag.memory[this.memory.role]) {
                            //Too many creeps for this flag
                            delete this.memory.currentFlag;
                        }
                        else {return this.memory.currentFlag;}
                    }
                    else { //Only volume check
                        let peers = _.filter(flagCreeps, {memory: {role: this.memory.role, currentFlag: this.memory.currentFlag}});
                        if (peers == null || peers.length > flag.memory.volume) {
                            //Too many creeps for this flag
                            delete this.memory.currentFlag;
                        }
                        else {return this.memory.currentFlag;}
                    }

                    //creep still needed at this flag -> OK
                    if (this.memory.currentFlag != undefined) {
                        return this.memory.currentFlag;
                    }
                }
                else {delete this.memory.currentFlag;}
            }
            else {return this.memory.currentFlag;}
        }
        if (this.memory.currentFlag == undefined || this.memory.currentFlag == -1) {
            //Search for new flag necessary

            let mySpawn = this.memory.spawn;

						switch (flagFunction) {
								case "remoteController":
										flagList = _.filter(Game.flags, function (f) {
												let flagRoom = Game.rooms[f.pos.roomName];
												if (f.memory.function == "remoteController" && f.memory.spawn == mySpawn && flagRoom != undefined && flagRoom.controller != undefined && flagRoom.controller.owner == undefined && (flagRoom.controller.reservation == undefined || flagRoom.controller.reservation.ticksToEnd < 3000)) {
														//Flag needing a claimer found
														return true;
												}
										});
								break;

								case "haulEnergy":
										flagList = _.filter(Game.flags, function (f) {
												let flagRoom = Game.rooms[f.pos.roomName];
												if (f.memory.function == "haulEnergy" && f.memory.spawn == mySpawn ) {
														//Flag for remote harvesting for this spawn found
														return true;
												}
										});
								break;

								default:
										flagList = _.filter(Game.flags, {memory: {function: flagFunction}});
								break;
							}

            for (let fl in flagList) {
                this.memory.currentFlag = flagList[fl].name;
								//console.log(flagList[fl].name);
                // Flags with homogeneous volume
                flagCreeps = _.filter(Game.creeps, {memory: {currentFlag: this.memory.currentFlag}});

                switch (flagFunction) {
                    case "haulEnergy":
										//console.log(this.memory.currentFlag);
                        if (this.memory.role == "remoteStationaryHarvester") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'remoteStationaryHarvester'}});
                            if (peers.length <= 1) {
                                return this.memory.currentFlag;
                            }
                        }
                        else if (this.memory.role == "energyHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'energyHauler'}});
                            if (peers.length <= (flagList[fl].memory.volume - 1)) {
                                return this.memory.currentFlag;
                            }
                        }
                        break;

                    case "SKHarvest":
                        if (this.memory.role == "SKHarvester") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'SKHarvester'}});
                            if (peers.length <= 1) {
                                return this.memory.currentFlag;
                            }
                        }
                        else if (this.memory.role == "SKHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'SKHauler'}});
                            if (peers.length <= (flagList[fl].memory.volume - 1)) {
                                return this.memory.currentFlag;
                            }
                        }
                        break;

                    case "unitGroup":
                        var peers = _.filter(flagCreeps, {memory: {role: this.memory.role}});
                        if (peers.length <= flagList[fl].memory[this.memory.role]) {
                            return this.memory.currentFlag;
                        }
                        break;

                    case "remoteController":
                        var peers = _.filter(flagCreeps, {memory: {role: "claimer"}});
                        if (peers.length < 2) {
                            return this.memory.currentFlag;
                        }
                        break;

                    default:
                        if (flagFunction == "narrowSource" || flagFunction == "remoteController") {
                            // static volumes
                            volume = 1;
                        }
                        else {
                            volume = flagList[fl].memory.volume;
                        }

                        if (flagCreeps.length <= volume) {
                            return this.memory.currentFlag;
                        }
                        break;
                }
            }
            delete this.memory.currentFlag;
            return undefined;
        }
    }
};
