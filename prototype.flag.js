Flag.prototype.setFunctionColor = function() {
    if (this.memory != undefined && this.memory.function != undefined) {
        switch (this.memory.function) {
            case "narrowSource":
                this.setColor(COLOR_BROWN, COLOR_YELLOW);
                break;

            case "remoteController":
                this.setColor(COLOR_CYAN, COLOR_PURPLE);
                break;

            case "attackController":
                this.setColor(COLOR_CYAN, COLOR_RED);
                break;

            case "remoteSource":
                this.setColor(COLOR_GREEN, COLOR_YELLOW);
                break;

            case "haulEnergy":
                this.setColor(COLOR_BLUE, COLOR_YELLOW);
                break;

            case "protector":
                this.setColor(COLOR_RED, COLOR_BROWN);
                break;

            case "demolish":
                this.setColor(COLOR_BLUE, COLOR_RED);
                break;

            case "transporter":
                this.setColor(COLOR_BLUE, COLOR_BROWN);
                break;

            case "SKHarvest":
                this.setColor(COLOR_CYAN, COLOR_YELLOW);
                break;
        }
        return true;
    }
    return false;
};
Flag.prototype.run = function() {
    let fName = this.name;
    if (fName.endsWith('STORAGE')) {        
        if (this.room != undefined && this.pos != undefined) {
            if( this.pos.lookFor(LOOK_STRUCTURES).length == 0 && this.pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0 ) {
                // console.log ( f + );
                this.room.createConstructionSite(this.pos,STRUCTURE_STORAGE);
            }
        }
    }
};