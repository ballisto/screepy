Creep.prototype.roleEnergyLoader = function() {
    if(this.goToHomeRoom()) {
        if(this.isEmpty()) {
            delete this.memory.cursink;
            let source;
            if(this.memory.cursource != undefined) {
                source = Game.getObjectById(this.memory.cursource);
                if ( !source.hasEnergy() ) {
                    delete this.memory.cursource;
                    source = undefined;
                }
            }
            if (source == undefined) {
                source = this.room.findResource(RESOURCE_ENERGY);                
            }            

            if (source != undefined) {
                this.memory.cursource = source.id;
                let res = this.withdraw(source, RESOURCE_ENERGY);
                if (res == ERR_NOT_IN_RANGE) {
                    this.moveTo(source, {reusePath: 50});
                    return true;
                }              
                else {
                    delete this.memory.cursource;
                }
                
            }
            else {
                delete this.memory.cursource;
            }
            
        }
        else {
            let sink;
            if(this.memory.cursink != undefined) {
                sink = Game.getObjectById(this.memory.cursink);
            }

            if ( sink == undefined || ( (sink.getObjectType() == 'StructureTower' || sink.getObjectType() == 'StructurePowerSpawn') && sink.energy > sink.energyCapacity * 0.8) ) {
                let structuresNeedingEnergy = _.filter(this.room.find(FIND_MY_STRUCTURES), (a) => a.structureType != STRUCTURE_LINK && ( (a.energy < a.energyCapacity && a.structureType != STRUCTURE_TOWER && a.structureType != STRUCTURE_POWER_SPAWN) || (a.energy < a.energyCapacity * 0.8 && ( a.structureType == STRUCTURE_TOWER || a.structureType == STRUCTURE_POWER_SPAWN) ) ));
                if (structuresNeedingEnergy.length > 0) {
                    sink = this.pos.findClosestByPath(structuresNeedingEnergy);
                }       
            }
            if ( sink != undefined && sink.energy < sink.energyCapacity) {
                this.memory.cursink = sink.id;
                let res = this.transfer(sink, RESOURCE_ENERGY);
                
                if (res == ERR_NOT_IN_RANGE) {
                    this.moveTo(sink, {reusePath: 50});
                    return true;
                }
                else {
                    delete this.memory.cursink;
                }
            }
            else {
                delete this.memory.cursink;
            }        
        }

    }
}