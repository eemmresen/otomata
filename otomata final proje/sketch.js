var stateElements = [];
var pda;

var currentWord;
var currentStep;

var steps;
var stackSteps;
var success;

function addState() {
  let stateElem = document.getElementById("states");
  let newItem = document.createElement("li");
  let tickbox = document.createElement("input");
  tickbox.setAttribute("type", "checkbox");
  tickbox.onclick = createPDA;
  let name = document.createElement("span");
  name.innerText = "q" + stateElements.length;
  newItem.appendChild(name);
  newItem.appendChild(tickbox);
  stateElements.push(newItem);
  stateElem.appendChild(newItem);
  updateDropdowns();
  createPDA();
}

function removeState() {
  if (stateElements.length <= 1) {
    return;
  }
  let lastItem = stateElements.pop();
  lastItem.parentNode.removeChild(lastItem);
  updateDropdowns();
  createPDA();
}

function updateDropdowns() {
  let dropdowns = document.getElementsByClassName("transition-dropdown");
  let dropdownItem = document.createElement("select");
  for (let stateElem of stateElements) {
    option = document.createElement("option");
    option.innerText = stateElem.children[0].innerText;
    dropdownItem.appendChild(option);
  }

  for (let dropdown of dropdowns) {
    let index = dropdown.selectedIndex;
    dropdown.innerHTML = dropdownItem.innerHTML;
    dropdown.selectedIndex = index;
  }
}

function checkTransitionFilled() {
  let transitionElem = document.getElementById("transitions").children[1];
  for (let transition of transitionElem.children) {
    let originFilled = transition.children[1].children[0].selectedIndex != -1;
    let characterFilled = transition.children[2].children[0].value != "";
    let topFilled = transition.children[3].children[0].value != "";
    let destinationFilled = transition.children[4].children[0].selectedIndex != -1;
    let operation = transition.children[5].children[0].selectedIndex;
    let operationFilled = operation != -1;

    let toStackFilled = true;
    if (operation == 0) {
      toStackFilled = transition.children[6].children[0].value != "";
    } else {
      toStackFilled = transition.children[6].children[0].value == "";
    }
  
    if (!originFilled || !characterFilled || !topFilled || !destinationFilled || !operationFilled || !toStackFilled) {
      return false;
    }
  }
  return true;
}

function addTransition() {
  let transitionElem = document.getElementById("transitions").children[1];
  let newTransition = document.createElement("tr");

  let minus = document.createElement("td");
  let minusButton = document.createElement("button");
  minusButton.className = "table-icon";
  minusButton.innerText = "-";
  minusButton.onclick = function() {
    newTransition.parentNode.removeChild(newTransition);
    createPDA();
  }
  minus.appendChild(minusButton);

  let origin = document.createElement("td");
  let originDropdown = document.createElement("select");
  originDropdown.className = "transition-dropdown";
  origin.onchange = createPDA;
  origin.appendChild(originDropdown);

  let character = document.createElement("td");
  let characterInput = document.createElement("input");
  characterInput.setAttribute("maxlength", 1);
  characterInput.className = "table-input";
  characterInput.onkeyup = createPDA;
  character.appendChild(characterInput);

  let top = document.createElement("td");
  let topInput = document.createElement("input");
  topInput.setAttribute("maxlength", 1);
  topInput.className = "table-input";
  topInput.onkeyup = createPDA;
  top.appendChild(topInput);

  let destination = document.createElement("td");
  let destinationDropdown = document.createElement("select");
  destinationDropdown.className = "transition-dropdown";
  destinationDropdown.onchange = createPDA;
  destination.appendChild(destinationDropdown);

  let operation = document.createElement("td");
  let operationDropdown = document.createElement("select");
  option1 = document.createElement("option");
  option1.innerText = "Push";
  option2 = document.createElement("option");
  option2.innerText = "Pop";
  option3 = document.createElement("option");
  option3.innerText = "No change";
  operationDropdown.appendChild(option1);
  operationDropdown.appendChild(option2);
  operationDropdown.appendChild(option3);
  operationDropdown.selectedIndex = 2;
  operationDropdown.onchange = createPDA;
  operation.appendChild(operationDropdown);

  let toStack = document.createElement("td");
  let toStackInput = document.createElement("input");
  toStackInput.className = "table-input";
  toStackInput.onkeyup = createPDA;
  toStack.appendChild(toStackInput);

  newTransition.appendChild(minus);
  newTransition.appendChild(origin);
  newTransition.appendChild(character);
  newTransition.appendChild(top);
  newTransition.appendChild(destination);
  newTransition.appendChild(operation);
  newTransition.appendChild(toStack);

  transitionElem.appendChild(newTransition);
  updateDropdowns();
}

function createPDA() {
  currentWord = undefined;
  currentStep = undefined;
  steps = undefined;
  success = undefined;
  document.getElementById("word-view").innerHTML = "Press \"Run!\" to start";

  if (!checkTransitionFilled()) {
    return;
  }
  let states = [];
  let acceptStates = [];
  for (let state of stateElements) {
    states.push(state.children[0].innerText);
    if (state.children[1].checked) {
      acceptStates.push(state.children[0].innerText);
    }
  }
  
  let transitions = [];
  let transitionElements = document.getElementById("transitions").children[1];
  for (let transitionElem of transitionElements.children) {
    let origin = transitionElem.children[1].children[0].selectedIndex;
    let character = transitionElem.children[2].children[0].value;
    let top = transitionElem.children[3].children[0].value;
    let destination = transitionElem.children[4].children[0].selectedIndex;
    let operation = transitionElem.children[5].children[0].selectedIndex;
    let toStack = transitionElem.children[6].children[0].value;
    transitions.push([[states[origin], character, top], [states[destination], operation, toStack]]);
  }
  
  pda = new PDA(new Set(states), new Dictionary(transitions), states[0], new Set(acceptStates));
  pda.draw();
}

function setStep() {
  if (steps === undefined) {
    document.getElementById("stack").style.display = "none";
    return;
  }
  
  currentStep = Math.max(currentStep, 0);
  currentStep = Math.min(currentStep, steps.length - 1);

  let color = "yellow";
  if (currentStep == steps.length - 1) {
    if (success) {
      color = "green";
    } else {
      color = "red";
    }
  }

  pda.draw(steps[currentStep], color);
  let wordViewElem = document.getElementById("word-view");

  let beforeChar = document.createElement("span");
  beforeChar.innerText = currentWord.substring(0, currentStep-1);
  let currentChar = document.createElement("span");
  currentChar.style.color = "lime";
  if (currentStep == 0) {
    currentChar.innerText = "";
  } else {
    currentChar.innerText = currentWord[currentStep-1];
  }
  let afterChar = document.createElement("span");
  afterChar.innerText = currentWord.substring(currentStep);

  wordViewElem.innerHTML = "";
  wordViewElem.appendChild(beforeChar);
  wordViewElem.appendChild(currentChar);
  wordViewElem.appendChild(afterChar);

  let stackElem = document.getElementById("stack");
  stackElem.style.display = "block";
  stackElem.innerHTML = "";
  let pos = 0;
  for (let stackItem of stackSteps[currentStep]) {
    let newItem = document.createElement("h3");
    newItem.innerText = stackItem;
    newItem.style.bottom = pos + "vw";
    stackElem.appendChild(newItem);
    pos += 2;
  }
}

function run() {
  currentWord = prompt("Enter input");
  currentStep = 0;
  [steps, stackSteps, success] = pda.runTrace(currentWord);
  setStep();
}

window.addEventListener("load", addState);

document.onkeydown = function(e) {
  if (e.keyCode == 39) {
    currentStep++;
    setStep();
  }
  else if (e.keyCode == 37) {
    currentStep--;
    setStep();
  }
}