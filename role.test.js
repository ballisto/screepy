Creep.prototype.roleTest = function () {
    
    if(this.pos.getRangeTo(Game.flags['W58S4_O'].pos) > 1) {
        this.travelTo(Game.flags['W58S4_O']);
        return true;
    }
    let source = Game.getObjectById('59bbc643ae9e1411a425ab83');
    let harvestResult = this.harvest(source);
    console.log(harvestResult);
    
    
    // var targetFlag = Game.flags["Flag1"];
    // if (creep.pos.isEqualTo(targetFlag.pos) == false) {
    //     creep.MoveToRemoteFlag(targetFlag.name);
    // }

};