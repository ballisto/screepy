StructureLab.prototype.getLabsInRange =
    function () {
      const adjacentPositions = this.pos.getAllAdjacentPositions();
      var result = [];
      for(const p in adjacentPositions) {
        const curLabInRange = adjacentPositions[p].checkForStructure(STRUCTURE_LAB);
        if(curLabInRange.length > 0) {
          result[curLabInRange.id] = curLabInRange;
        }
      }
      return result;
    };
