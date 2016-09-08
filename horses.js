var Horse = class Horse {
  constructor(number, speed) {
    this.number = number;
    this.speed = speed;
    this.children = [];
  }

  getChildrenAtDepth(depth) {
    var children = [];
    if (depth < 0) {
      return [];
    } else if (depth === 0) {
      return [this];
    } else {
      this.children.forEach(function (child) {
        children = children.concat(child.getChildrenAtDepth(depth - 1));
      });
    }

    return children;
  }
}

Horse.prototype.addChild = function (child) {
    if (child instanceof Horse) {
      this.children.push(child);
    }
};

var HorseRace = class HorseRace {
  constructor(horseCount, trackLanes) {
    this.horseCount = horseCount;
    this.trackLanes = trackLanes;
  }

  buildHorses() {
    var horses = [];
    var speeds = this._getSpeeds(this.horseCount);
    speeds.forEach(function (speed, i) {
      var horse = new Horse(i, speed);
      horses.push(horse);
    });

    return horses;
  }

  initialRaces(horses) {
    var races = [];
    var raceCount = Math.ceil(this.horseCount/this.trackLanes);
    //race 5 sets of 5 horses
    for (var i = 0; i < raceCount; i++) {
      var min = (i * this.trackLanes);
      var max = min + this.trackLanes;
      var race = this.race(horses.slice(min, max));
      races.push(race);
    }
    // connect winners
    races.forEach(function (race) {
      this._connect(race);
    }.bind(this));

    console.log
    return races;
  }

  winnersRace(races) {
    //race winners
    var winners = [];
    for (var j = 0; j < races.length; j++) {
      winners.push(races[j][0]);
    }
    winners = this.race(winners);
    //connect winners
    this._connect(winners);

    return winners;
  }

  lastRace(winners) {
    var lastRace = [];
    lastRace = lastRace.concat(winners[0].getChildrenAtDepth(1));
    lastRace = lastRace.concat(winners[0].getChildrenAtDepth(2));
    lastRace = this.race(lastRace);
    //connect last race
    var fastest = [winners[0], lastRace[0], lastRace[1]];
    return fastest;
  }

  sortHorses(horses) {
    var races = this.initialRaces(horses);
    var winners = this.winnersRace(races);
    var top3 = this.lastRace(winners);
    return top3;
  }
}

HorseRace.prototype.race = function (horses) {
  horses.sort(function (a, b) {
    if (a.speed < b.speed) {
      return 1;
    }
    if (a.speed > b.speed) {
      return -1;
    }
    return 0;
  });

  return horses;
};


HorseRace.prototype._connect = function (race) {
  for (var i = 0; i < race.length - 1; i++) {
    race[i].addChild(race[i + 1]);
  }
};

HorseRace.prototype._getSpeeds = function (count) {
  var speeds = [];
  for (var i = 1; i <= count; i++) {
    speeds.push(i);
  }

  return this._shuffle(speeds);
};

HorseRace.prototype._shuffle = function (array) {
  var i, j, temp;
  for (i = array.length; i > 0; i--) {
    j = Math.floor(Math.random() * i);
    temp = array[i - 1];
    array[i - 1] = array[j];
    array[j] = temp;
  }

  return array;
};

//~~~~~~~~~~~~~~~~~ Draw ~~~~~~~~~~~~~~~~~~~~~~~~~//
var setupPage = function () {
  document.addEventListener('DOMContentLoaded', addButtons);
}

var setupRace = function () {
  var horseList = document.getElementById("horse-list");
  while (horseList.firstChild) {
    horseList.removeChild(horseList.firstChild);
  }

  horseList = document.getElementById("winners-list");
  while (horseList.firstChild) {
    horseList.removeChild(horseList.firstChild);
  }

  var horseRace = new HorseRace(25, 5)
  var horses = horseRace.buildHorses();
  drawHorses(horses, false);
  var top3 = horseRace.sortHorses(horses);
  drawHorses(top3, true);
}

var addButtons = function () {
  var buttonBar = document.getElementById("button-bar");

  buttonBar.appendChild(buildButton("Race New Horses", setupRace));
}

var buildButton = function (name, callback) {
  var button = document.createElement("button");
  button.innerHTML = name;
  button.onclick = callback;

  return button;
}

var drawHorses = function (horses, winner) {
  if (winner) {
    var horseList = document.getElementById("winners-list");
  } else {
    horseList = document.getElementById("horse-list");
  }
  horses.forEach(function (horse, i) {
    var horseItem = document.createElement("li");
    if (winner) {
      horseItem.classList.add("winner-" + i);
    }
    horseItem.classList.add("horse");
    var details = document.createElement("p");
    details.innerHTML = "# " + horse.number + " Speed: " + horse.speed;
    details.classList.add("horse-details");
    horseItem.appendChild(details);
    horseList.appendChild(horseItem);
  });
}

//~~~~~~~~~~~~~~~~~~~~~TESTING~~~~~~~~~~~~~~~~~~~~//
var runTests = function () {
  horseTest();
  raceTest();
};

var horseTest = function () {
  var horse = new Horse(1, 5);
  console.log("Create Horse");
  checkValue(horse.speed, 5);
  checkValue(horse.number, 1);

  var horse1 = new Horse(1, 5);
  var horse2 = new Horse(2, 4);
  var horse3 = new Horse(3, 3);
  var horse4 = new Horse(4, 2);
  var horse5 = new Horse(5, 1);

  horse1.addChild(horse2);
  horse1.addChild(horse3);
  horse2.addChild(horse4);
  horse4.addChild(horse5);
  console.log("addChild");
  checkValue(horse1.children[0], horse2);
  checkValue(horse1.children[1], horse3);

  console.log("getChildrenAtDepth");
  var children = horse1.getChildrenAtDepth(-1);
  checkValue(children[0], undefined);
  children = horse1.getChildrenAtDepth(0);
  checkValue(children[0], horse1);
  children = horse1.getChildrenAtDepth(1);
  checkValue(children[0], horse2);
  checkValue(children[1], horse3);
  children = horse1.getChildrenAtDepth(2);
  checkValue(children[0], horse4);
  children = horse1.getChildrenAtDepth(3);
  checkValue(children[0], horse5);
};

var raceTest = function () {
  var race = new HorseRace(25, 5);
  console.log("New Race");
  checkValue(race.horseCount, 25);
  checkValue(race.trackLanes, 5);

  console.log("buildHorses");
  var horses = race.buildHorses();
  checkValue(horses.length, 25);
  checkValue((horses[0] instanceof Horse), true);
  checkValue((horses[horses.length - 1] instanceof Horse), true);

  console.log("initialRaces");
  var races = race.initialRaces(horses);
  var race1 = races[0];
  var race2 = races[1];
  var race3 = races[2];
  var race4 = races[3];
  var race5 = races[4];
  console.log("Race 1");
  checkValue((race1[0].speed > race1[1].speed), true);
  checkValue(race1[0].children[0], race1[1]);
  checkValue((race1[1].speed > race1[2].speed), true);
  checkValue(race1[1].children[0], race1[2]);
  checkValue((race1[2].speed > race1[3].speed), true);
  checkValue(race1[2].children[0], race1[3]);
  checkValue((race1[3].speed > race1[4].speed), true);
  checkValue(race1[3].children[0], race1[4]);
  console.log("Race 2");
  checkValue((race2[0].speed > race2[1].speed), true);
  checkValue((race2[1].speed > race2[2].speed), true);
  checkValue((race2[2].speed > race2[3].speed), true);
  checkValue((race2[3].speed > race2[4].speed), true);
  console.log("Race 3");
  checkValue((race3[0].speed > race3[1].speed), true);
  checkValue((race3[1].speed > race3[2].speed), true);
  checkValue((race3[2].speed > race3[3].speed), true);
  checkValue((race3[3].speed > race3[4].speed), true);
  console.log("Race 4");
  checkValue((race4[0].speed > race4[1].speed), true);
  checkValue((race4[1].speed > race4[2].speed), true);
  checkValue((race4[2].speed > race4[3].speed), true);
  checkValue((race4[3].speed > race4[4].speed), true);
  console.log("Race 5");
  checkValue((race5[0].speed > race5[1].speed), true);
  checkValue((race5[1].speed > race5[2].speed), true);
  checkValue((race5[2].speed > race5[3].speed), true);
  checkValue((race5[3].speed > race5[4].speed), true);

  console.log("Winners Race");
  var winners = race.winnersRace(races);
  checkValue((winners[0].speed > winners[1].speed), true);
  checkValue(winners[0].children[1], winners[1]);
  checkValue((winners[1].speed > winners[2].speed), true);
  checkValue(winners[1].children[1], winners[2]);
  checkValue((winners[2].speed > winners[3].speed), true);
  checkValue(winners[2].children[1], winners[3]);
  checkValue((winners[3].speed > winners[4].speed), true);
  checkValue(winners[3].children[1], winners[4]);

  console.log("Last Race")
  var topThree = race.lastRace(winners);
  checkValue((topThree[0].speed > topThree[1].speed), true);
  checkValue((topThree[1].speed > topThree[2].speed), true);

  console.log("Sort Horses")
  var horses2 = race.buildHorses();
  topThree = race.sortHorses(horses2);
  checkValue((topThree[0].speed > topThree[1].speed), true);
  checkValue((topThree[1].speed > topThree[2].speed), true);
};

var checkValue = function (value, expected) {
  if (value === expected) {
    console.log("Passed");
  } else {
    console.log("FAILED: Expected: " + expected + " Value: " + value);
  }
};

// runTests();
(function() {setupPage();})();
