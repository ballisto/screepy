'use strict';

economy.resetStock= function() {
  economy.stock = {};
  for (curResource in RESOURCES_ALL) {
    economy.stock[curResource] = 0;
  }
};
economy.takestockCount = function(store) {
  for (var curStorageResource in store.store) {
    economy.stock[curStorageResource] += store.store[curStorageResource];
  }
};
economy.takestock = function() {
  for (var curRoomName in Game.rooms) {
    if(Game.rooms[curRoomName].storage != undefined && Game.rooms[curRoomName].storage.my) {
      economy.takestockCount(Game.rooms[curRoomName].storage.store);
    }
    if(Game.rooms[curRoomName].terminal != undefined && Game.rooms[curRoomName].terminal.my) {
      economy.takestockCount(Game.rooms[curRoomName].terminal.store);
    }
  }
};
economy.printStock = function() {
  var returnstring = "<table><tr><th>Resource  </th><th>Amount  </th></tr>";
  var resourceTable = [];
  var total = [];

  for (curResource in RESOURCES_ALL) {
    if(economy.stock[curResource] > 0) {
      color = "#aaffff";
      returnstring = returnstring.concat("<tr></tr><td>" + curResource + "  </td>");

      returnstring = returnstring.concat("<td><font color='" + color + "'>" + prettyInt(economy.stock[curResource]) + "  </font></td>");

      returnstring = returnstring.concat("</tr>");
    }
  }



  returnstring = returnstring.concat("</tr></table>");
  return returnstring;
};
