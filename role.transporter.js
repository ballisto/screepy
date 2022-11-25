Creep.prototype.roleTransporter = function () {
    //Find flag
    var flagName = this.findMyFlag("transporter");
    var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
    let minttl = 100;
    
    var curAssignment = polier.getCurTaskForCreep(this.id);
    if( curAssignment != undefined ) { this.run(); }
    
    // else if(destinationFlag.room != undefined && destinationFlag.room.name == 'W58S6' && this.memory.WP57S8 == undefined && this.room.name != this.memory.homeroom ) {
                        
    //     // if(this.pos.getRangeTo(Game.flags['W57S8_WP']) >1) {
    //     if( (this.room.name != 'W57S8' || this.pos.getRangeTo(Game.flags['W57S8_WP']) >1)) {
    //         this.say('W57S8')
    //         // this.travelTo(Game.rooms['W57S7'].controller);
    //         this.travelTo(Game.flags['W57S8_WP']);
    //         return true;
    //     }
    //     else {
    //         this.memory.WP57S8 = true;
    //     }
    // }
    
    else {
    
        if (destinationFlag != null) {
            if(destinationFlag.memory.minttl != undefined) {
            minttl = destinationFlag.memory.minttl;
        }
            // if(Game.rooms[destinationFlag.pos.roomName] == undefined) {
            //     let moveResult = this.travelTo(destinationFlag);
            //                           if(moveResult != 0) {
            //                               this.say(moveResult);
            //                           }
            // }
            // else {
            
                // if(target != undefined) {
                    // console.log(target);
                    // collect
                    if(destinationFlag.memory.direction != undefined && destinationFlag.memory.direction == 'collect') {
                        if(this.memory.task == undefined ) {
                            if(this.isEmpty()) {
                                this.memory.task = 'go';
                            }
                            else {
                                this.memory.task = 'return';
                            }
                        }
                        
                        switch(this.memory.task) {
                            
                            case 'go' :
                                
                                    if (this.ticksToLive < minttl) {
                                        if(this.isEmpty()) {
                                            this.suicide();
                                        }
                                        else {
                                            this.memory.task = 'return';
                                            delete this.memory.W50N10_WP;
                                            delete this.memory.W50N4_WP;
                                            delete this.memory.W53N10_WP;
                                            return true;
                                        }
                                    }
                                    else if(this.pos.getRangeTo(destinationFlag) > 1) {
                                        if ( destinationFlag.pos.roomName == 'W53N31' && this.room.name == destinationFlag.pos.roomName  ) {
                                            let owPositions = [];
                                            owPositions.push(new RoomPosition(25,41,'W53N31'));
                                            owPositions.push(new RoomPosition(24,40,'W53N31'));
                                            owPositions.push(new RoomPosition(23,39,'W53N31'));
                                            owPositions.push(new RoomPosition(22,38,'W53N31'));
                                            owPositions.push(new RoomPosition(21,37,'W53N31'));
                                            owPositions.push(new RoomPosition(21,36,'W53N31'));
                                            
                                            for ( let curPos in owPositions) {
                                                // console.log(owPositions[curPos])
                                                let creepOnCurPos = owPositions[curPos].lookFor(LOOK_CREEPS);
                                                if (creepOnCurPos.length > 0) {
                                                    if(creepOnCurPos[0].id != this.id) {
                                                    
                                                        this.travelTo(new RoomPosition(19,46,'W53N31'));
                                                        return true;
                                                    }
                                                }
                                                // return true;
                                            }
                                            
                                        }
                                        if(this.room.name != destinationFlag.pos.roomName)  {
                                            
                                        }
                                        
                                       let moveResult = this.travelTo(destinationFlag, {reusePath: 88});
                                       if(moveResult != 0) {
                                           this.say(moveResult);
                                       }
                                       return true;
                                    }
                                    else {
                                        let target = _.filter(destinationFlag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LAB || s.structureType == STRUCTURE_TERMINAL);
                                        // console.log(target )
                                        if(this.isFull() ) {
                                            this.memory.task = 'return';
                                            delete this.memory.W50N10_WP;
                                            delete this.memory.W50N4_WP;
                                            delete this.memory.W53N10_WP;
                                            return true;
                                        }
                                        else {
                                            let resourceToTransport = destinationFlag.memory.resource;
                                            if(destinationFlag.memory.resource == '*') {
                                                // console.log(this.room.storage.store)
                                                
                                                if(_.filter(destinationFlag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_STORAGE).length >0) {
                                                    target = this.room.storage;
                                                }
                                                else if(_.filter(destinationFlag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_TERMINAL).length >0) {
                                                    target = this.room.terminal;
                                                }
                                                // console.log(target)
                                                if(target.store != undefined) {
                                                    for ( let s in target.store) {
                                                        // console.log(s)
                                                        if (target.store[s] > 0) { 
                                                            resourceToTransport = s; 
                                                            // break;
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            let withdrawResult = this.withdraw(target,resourceToTransport);
                                            // console.log(resourceToTransport + ' - '+ this.room.name);
                                            this.say(withdrawResult);
                                            return true;
                                        }
                                    }
                            break;
                            case 'return' :
                                if (this.ticksToLive < minttl) {
                                        if(this.isEmpty()) {
                                            this.suicide();
                                        }
                                    }
                                
                                if(this.room.name != this.memory.homeroom)  {
                                    
                                    
                                }
                                if ( this.memory.homeroom == 'W53N38') {
                                    if (this.room.name != 'W52N36') {
                                        this.travelTo(Game.getObjectById('5cc8ad66f5c7191a43296f70'));
                                    }
                                    else {
                                        if(this.storeAllBut()) {
                                            this.memory.task = 'go';
                                            delete this.memory.W50N10_WP;
                                            delete this.memory.W50N4_WP;
                                            delete this.memory.W53N10_WP;
                                            return true;
                                        }
                                    }
                                }
                                else if(this.goToHomeRoom()) {
                                    if(this.storeAllBut()) {
                                        this.memory.task = 'go';
                                        delete this.memory.W50N10_WP;
                                        delete this.memory.W50N4_WP;
                                        delete this.memory.W53N10_WP;
                                        return true;
                                    }
                                }
                            break;
                            
                            default :
                            break;
                        }
                    }
                    else {
                        if(this.memory.task == undefined ) {
                            if(this.goToHomeRoom() == true && this.storeAllBut() == true) {
                                this.memory.task = 'return';
                            }
                            
                        }
                        
                        switch(this.memory.task) {
                            
                            case 'go' :
                                    if(this.room.name != destinationFlag.pos.roomName)  {
                                        if(this.goAroundShit(destinationFlag.pos.roomName)) {return true;}
                                        
                                        
                                        let moveResult = this.travelTo(destinationFlag, {reusePath: 88});
                                        if(moveResult != 0) {
                                           this.say(moveResult);
                                        }
                                        return true;
                                    }
                                    else {
                                        // console.log(target )
                                        if(this.storeAllBut() ) {
                                            if (this.ticksToLive < minttl) {
                                                if(this.storeAllBut()) {
                                                    this.suicide();
                                                }
                                            }
                                            this.memory.task = 'return';
                                            delete this.memory.W53N11_WP;
                                            delete this.memory.W52N11_WP;
                                            delete this.memory.W51N11_WP;
                                            delete this.memory.W50N24_WP;
                                            delete this.memory.W50N20_WP;
                                            delete this.memory.W51N20_WP;
                                            delete this.memory.W52N20_WP;
                                            delete this.memory.W58N33_WP;
                                            delete this.memory.W58N36_WP;
                                            delete this.memory.W52N35_WP;
                                            delete this.memory.W52N34_WP;
                                            delete this.memory.W53N33_WP;
                                            return true;
                                        }
                                    }
                            break;
                            case 'return' :
                                if(this.room.name != this.memory.homeroom)  {
                                    if(this.goAroundShit(this.memory.homeroom)) {return true;}
                                    if( destinationFlag.pos.roomName == 'W57N38') {
                                        if( this.memory.W58N36_WP == undefined) {
                                            if(this.pos.getRangeTo(Game.flags['W58N36_WP']) > 1) {
                                                this.travelTo(Game.flags['W58N36_WP']);
                                                this.say('W58N36_WP')
                                                return true;
                                            }
                                            else {
                                                this.memory.W58N36_WP = true;
                                            }
                                        }
                                        if(this.memory.W58N36_WP != undefined && this.memory.W58N33_WP == undefined) {
                                            if(this.pos.getRangeTo(Game.flags['W58N33_WP']) > 1) {
                                                this.travelTo(Game.flags['W58N33_WP']);
                                                this.say('W58N33_WP')
                                                return true;
                                            }
                                            else {
                                                this.memory.W58N33_WP = true;
                                            }
                                        }
                                    }
                                    if( destinationFlag.pos.roomName == 'W53N38') {
                                        if(this.memory.W52N35_WP == undefined) {
                                            if(this.pos.getRangeTo(Game.flags['W52N35_WP']) > 1) {
                                                this.travelTo(Game.flags['W52N35_WP'], {reusePath: 50});
                                                this.say('W52N35_WP')
                                                return true;
                                            }
                                            else {
                                                this.memory.W52N35_WP = true;
                                            }
                                        }
                                        if(this.memory.W52N34_WP == undefined && this.memory.W52N35_WP != undefined) {
                                            if(this.pos.getRangeTo(Game.flags['W52N34_WP']) > 1) {
                                                this.travelTo(Game.flags['W52N34_WP'], {reusePath: 50});
                                                this.say('W52N34_WP')
                                                return true;
                                            }
                                            else {
                                                this.memory.W52N34_WP = true;
                                            }
                                        }  
                                        if(this.memory.W53N33_WP == undefined && this.memory.W52N34_WP != undefined) {
                                            if(this.pos.getRangeTo(Game.flags['W53N33_WP']) > 1) {
                                                this.travelTo(Game.flags['W53N33_WP'], {reusePath: 50});
                                                this.say('W53N33_WP')
                                                return true;
                                            }
                                            else {
                                                this.memory.W53N33_WP = true;
                                            }
                                        }
                                    }
                                    this.goToHomeRoom();
                                }    
                                else if(this.goToHomeRoom()) {
                                    if (this.ticksToLive < minttl) {
                                        if(this.storeAllBut()) {
                                            this.suicide();
                                        }
                                    }
                                    else if(this.getResource(destinationFlag.memory.resource, this.carryCapacity)) {
                                       delete this.memory.W53N11_WP;
                                            delete this.memory.W52N11_WP;
                                            delete this.memory.W51N11_WP;
                                            delete this.memory.W50N24_WP;
                                            delete this.memory.W50N20_WP;
                                            delete this.memory.W51N20_WP;
                                            delete this.memory.W52N20_WP;
                                            delete this.memory.W58N33_WP;
                                            delete this.memory.W58N36_WP;
                                            delete this.memory.W52N35_WP;
                                            delete this.memory.W52N34_WP;
                                            delete this.memory.W53N33_WP;
                                        this.memory.task = 'go';
                                        return true;
                                    }
                                }
                            break;
                            
                            default :
                            break;
                        }
                    }
                    
        
                // }
            
                // else {
                //     this.say("NOTARGET!");
                // }
            // }
        }
        else {
            this.say("NOFLAG!");
        }
    }
};