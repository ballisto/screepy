Creep.prototype.roleDrainer = function () {
    if(this.ticksToLive < 200) {this.suicide();}
    //Find flag
    var flagName = this.findMyFlag("drain");
    var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
    let minttl = 100;
    if(this.room.name == this.memory.homeroom && this.hits < this.hitsMax) {
        this.travelTo(this.room.controller);
        return true;
    }
    if(this.hits < (this.hitsMax * 0.75) ) {
        this.goToHomeRoom();
        return true;
    }
    
    if(destinationFlag != undefined) {
        if(this.room != destinationFlag.room) {
            this.notifyWhenAttacked(false);
            this.travelTo(destinationFlag);
            return true;
        }
        let moveToFlagResult = this.travelTo(destinationFlag);
    }
};