'use strict';

broker.init = function() {
  if(Memory.broker == undefined) {Memory.broker = {};}
};

broker.run = function() {
  broker.init();

};
