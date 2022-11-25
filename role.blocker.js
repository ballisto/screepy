Creep.prototype.roleBlocker = function () {
    
    //Find flag
    var flagName = this.findMyFlag("block");
    var destinationFlag = Game.flags[flagName]; //_.filter(Game.flags,{ name: flagName})[0];
    let minttl = 100;
    
    if(destinationFlag != undefined) {
        if(this.room.name != destinationFlag.pos.roomName) {
            
                    if(this.goAroundShit(destinationFlag.pos.roomName)) {return true;}
                    
                    this.travelTo(destinationFlag, {reusePath: 88});
            
            
            return true;
        }
        let moveToFlagResult = this.travelTo(destinationFlag);
        
        // if(this.memory.myX == undefined || this.memory.myY == undefined) {
        // // if(true) {
        //     this.memory.myX = destinationFlag.pos.x;
        //     this.memory.myY = destinationFlag.pos.y;
        // }
        // else {
        //     let myPos = new RoomPosition(this.memory.myX, this.memory.myY, destinationFlag.room.name);
        //     if (destinationFlag.pos.getRangeTo(myPos) > 8)  {
        //         this.memory.myX = destinationFlag.pos.x;
        //         this.memory.myY = destinationFlag.pos.y;
        //         return true;
        //     }

        //     else if (this.pos.x == this.memory.myX && this.pos.y == this.memory.myY) {
        //         this.say('!');
        //         const adjacentPositions = Array.from(this.pos.getAllAdjacentPositions());
        //         var result = new Array();
        //         // for(const p in adjacentPositions) {

        //         //     let blockersOnAdjacent = _.filter(destinationFlag.room.find(FIND_MY_CREEPS), (m) => m.memory.role && m.memory.myX && m.memory.myY && m.memory.role == 'blocker' && m.memory.myX == adjacentPositions[p].x && m.memory.myY == adjacentPositions[p].y && adjacentPositions[p].getRangeTo(destinationFlag) < this.pos.getRangeTo(destinationFlag) && m.ticksToLive + 50 < this.ticksToLive );
        //         //     if (blockersOnAdjacent.length > 0) {
        //         //         this.say(blockersOnAdjacent[0].name);
        //         //         blockersOnAdjacent[0].memory.myX = this.memory.myX;
        //         //         blockersOnAdjacent[0].memory.myY = this.memory.myY;
        //         //         this.memory.myX = adjacentPositions[p].x;
        //         //         this.memory.myY = adjacentPositions[p].y;
                        
        //         //     }
        //         // }
        //     }            
        //     else {
        //             let blockersOnFlag = _.filter(destinationFlag.room.find(FIND_MY_CREEPS), (m) => m.memory.role && m.memory.myX && m.memory.myY && m.memory.role == 'blocker' && m.memory.myX == this.memory.myX && m.memory.myY == this.memory.myY);
        //             if (blockersOnFlag.length > 0) {
        //                 const adjacentPositions = Array.from(myPos.getAllAdjacentPositions());
        //                 var result = new Array();
        //                 let max = 0;
        //                 for(const p in adjacentPositions) {
        //                     let blockersOnAdjacent = _.filter(destinationFlag.room.find(FIND_MY_CREEPS), (m) => m.memory.role && m.memory.myX && m.memory.myY && m.memory.role == 'blocker' && m.memory.myX == adjacentPositions[p].x && m.memory.myY == adjacentPositions[p].y);
        //                     if (blockersOnAdjacent.length == 0) {
        //                         this.memory.myX = adjacentPositions[p].x;
        //                         this.memory.myY = adjacentPositions[p].y;
        //                     }
        //                 max = p;                                                  
        //                 }
        //                 if (this.memory.myX == myPos.x && this.memory.myY == myPos.y) {
        //                     let randIdx = Math.floor(Math.random() * max);
        //                     this.memory.myX = adjacentPositions[randIdx].x;
        //                     this.memory.myY = adjacentPositions[randIdx].y;
        //                 }
        //             }
        //             let myNewPos = new RoomPosition(this.memory.myX, this.memory.myY, destinationFlag.room.name);
        //             this.travelTo(myNewPos);
                
        //     }
            
        // }
        
    }
};

