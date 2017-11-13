RoomObject.prototype.getObjectType =
    function () {
        if(this instanceof ConstructionSite) {
          return "ConstructionSite";
        }
        if(this instanceof Creep) {
          return "Creep";
        }
        if(this instanceof Flag) {
          return "Flag";
        }
        if(this instanceof Mineral) {
          return "Mineral";
        }
        if(this instanceof Resource) {
          return "Resource";
        }
        if(this instanceof Source) {
          return "Source";
        }
        if(this instanceof StructureController) {
          return "StructureController";
        }
        if(this instanceof StructureExtension) {
          return "StructureExtension";
        }
        if(this instanceof StructureExtractor) {
          return "StructureExtractor";
        }
        if(this instanceof StructureKeeperLair) {
          return "StructureKeeperLair";
        }
        if(this instanceof StructureLab) {
          return "StructureLab";
        }
        if(this instanceof StructureLink) {
          return "StructureLink";
        }
        if(this instanceof StructureNuker) {
          return "StructureNuker";
        }
        if(this instanceof StructureObserver) {
          return "StructureObserver";
        }
        if(this instanceof StructurePowerBank) {
          return "StructurePowerBank";
        }
        if(this instanceof StructurePowerSpawn) {
          return "StructurePowerSpawn";
        }
        if(this instanceof StructureRampart) {
          return "StructureRampart";
        }
        if(this instanceof StructureSpawn) {
          return "StructureSpawn";
        }
        if(this instanceof StructureStorage) {
          return "StructureStorage";
        }
        if(this instanceof StructureTerminal) {
          return "StructureTerminal";
        }
        if(this instanceof StructureTower) {
          return "StructureTower";
        }
        if(this instanceof StructureContainer) {
          return "StructureContainer";
        }
        if(this instanceof StructureRoad) {
          return "StructureRoad";
        }
        if(this instanceof StructureWall) {
          return "StructureWall";
        }

        return "ERROR";
    };
    RoomObject.prototype.energyAvailable =
        function () {
        switch (this.getObjectType()) {
            case "Resource" :
                  if(this.resourceType == RESOURCE_ENERGY) {
                      return this.amount;
                  }
                  else {
                    return 0;
                  }
            break;

            case "Source" :
            case "StructureLink" :
                  return this.energy;
            break;

            case "StructureStorage" :
            case "StructureContainer" :
            case "StructureTerminal" :
                  return this.store[RESOURCE_ENERGY];
            break;
            default:
                  return 0;
            break;
        }
    };
