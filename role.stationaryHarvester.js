Creep.prototype.roleStationaryHarvester = function() {
    //Look for vacant source marked as narrowSource
if (this.memory.currentFlag == undefined) {
    this.memory.currentFlag = this.findMyFlag("narrowSource");
}

if (this.memory.currentFlag == undefined) {
    console.log(this.name + " has no source to stationary harvest in room " + this.room.name + ".");
}
else {
    var flag = Game.flags[this.memory.currentFlag];
    if (this.pos.isEqualTo(flag)) {
        // Harvesting position reached
        if (this.carry.energy == this.carryCapacity) {
            //Identify and save container
            if (this.memory.narrowContainer == undefined) {
                var container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                if (container != null) {
                    this.memory.narrowContainer = container.id;
                }
            }
            else {
                container = Game.getObjectById(this.memory.narrowContainer);
            }
            if (this.transfer(container, RESOURCE_ENERGY) != OK) {
                delete this.memory.narrowContainer;

            }
        }

        if (this.carry.energy < this.carryCapacity) {
            //Time to refill
            //Identify and save source
            tempArray = this.pos.findInRange(FIND_DROPPED_RESOURCES,1);
            for (var s in tempArray) {
                if (tempArray[s].energy != undefined) {
                  if (tempArray[s].energy > 0) {
                    this.pickup(tempArray[s]);
                  }
                }
            }

            if (this.memory.narrowSource == undefined) {
                var source = this.pos.findClosestByRange(FIND_SOURCES);
                this.memory.narrowSource = source.id;
            }
            else {
                var source = Game.getObjectById(this.memory.narrowSource);
            }

            if (source.energy == 0) {
                this.memory.sleep = source.ticksToRegeneration;
            }
            else {
                if (this.harvest(source) != OK) {
                    this.memory.statusHarvesting = false;
                    delete this.memory.narrowSource;
                }
                else {
                    this.memory.statusHarvesting = source.id;
                }
            }
        }
    }
    else if (flag != undefined) {
        // Move to harvesting point
        this.moveTo(flag, {reusePath:moveReusePath()});
    }
    else {
        console.log(this.name + " in room " + this.room.name + " has a problem.");
    }
}
};
