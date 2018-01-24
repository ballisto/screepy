StructureLab.prototype.getLabsInRange =
    function () {
      const adjacentPositions = Array.from(this.pos.getAllAdjacentPositions());
      var result = new Array();
      for(const p in adjacentPositions) {
        var strucsOnPosition = adjacentPositions[p].lookFor(LOOK_STRUCTURES);
        const curLabsInRange = _.filter(strucsOnPosition, (l) => l.structureType == STRUCTURE_LAB);
        if(curLabsInRange.length > 0) {
          const curLabInRange = curLabsInRange[0];
          result.push(curLabInRange);
        }
      }
      return result;
    };
