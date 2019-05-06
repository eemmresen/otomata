class PDA {
    constructor(states, transitionFunction, startState, acceptStates) {
      this.states = states;
      this.transitionFunction = transitionFunction;
      this.startState = startState;
      this.acceptStates = acceptStates;
    }
  
    run(word) {
      let currentState = this.startState;
      let stack = ['+'];
  
      for (let ch of word) {
        let top = stack[stack.length-1];
        if (!this.transitionFunction.has([currentState, ch, top])) {
          return false;
        }
        let next = this.transitionFunction.get([currentState, ch, top]);
        currentState = next[0];
        let operation = next[1];
        let toStack = next[2];
  
        if (operation == 0) {
          for (let letter of toStack) {
            stack.push(letter);
          }
        } else if (operation == 1) {
          stack.pop();
        }
      }
      return this.acceptStates.has(currentState);
    }
  
    runTrace(word) {
      let currentState = this.startState;
      let stack = ['+'];
  
      let steps = [currentState];
      let stackSteps = [['+']];
      for (let ch of word) {
        let top = stack[stack.length-1];
        if (!this.transitionFunction.has([currentState, ch, top])) {
          return [steps, stackSteps, false];
        }
        let next = this.transitionFunction.get([currentState, ch, top]);
        currentState = next[0];
        let operation = next[1];
        let toStack = next[2];
  
        steps.push(currentState);
  
        if (operation == 0) {
          for (let letter of toStack) {
            stack.push(letter);
          }
        } else if (operation == 1) {
          stack.pop();
        }
  
        stackSteps.push(stack.slice());
      }
      return [steps, stackSteps, this.acceptStates.has(currentState)];
    }
  
    createOpStr(char, top, op, toStack) {
      let str = char + "," + top + " / ";
      if (op == 0) {
        return str + "push " + toStack;
      } else if (op == 1) {
        return str + "pop " + top;
      } else if (op == 2) {
        return str + "no change";
      }
    }
  
    toGraphviz(colorState, color) {
      let labels = [];
      for (let [key, val] of this.transitionFunction.pairs) {
        let [origin, char, top] = key;
        let [dest, op, toStack] = val;
  
        let found = false;
        for (let i = 0; i < labels.length; i++) {
          if (labels[i][0] == origin && labels[i][2] == dest) {
            found = true;
            labels[i][1] = labels[i][1] + "\n" + this.createOpStr(char, top, op, toStack);
            break;
          }
        }
        if (!found) {
          labels.push([origin, this.createOpStr(char, top, op, toStack), dest]);
        }
      }
  
      let str = "digraph finite_state_machine { rankdir=LR; size=\"8,5\";";
      str += "node [shape = point color = white]; qi;";
  
      for (let state of this.states) {
        if (this.acceptStates.has(state)) {
          if (state == colorState) {
            str += "node [shape = doublecircle style = filled color = " + color + "]";
          } else {
            str += "node [shape = doublecircle style = none color = black] ";
          }
        } else {
          if (state == colorState) {
            str += "node [shape = circle style = filled color = " + color + "]";
          } else {
            str += "node [shape = circle style = none color = black]";
          }
        }
        str += state + ";";
      }
  
      str += "qi -> q0;";
      for (let [origin, label, dest] of labels) {
        str += origin + " -> " + dest + " [label = \"" + label + "\"];";
      }
      str += "}";
      return str;
    }
  
    draw(state, color) {
      let str = this.toGraphviz(state, color);
      let previousDrawing = document.getElementById("graph");
      var viz = new Viz();
      viz.renderSVGElement(str).then(function(element) {
        if (previousDrawing) {
          previousDrawing.parentNode.removeChild(previousDrawing);
        }
        element.setAttribute("id", "graph");
        document.body.appendChild(element);
      });
    }
  }
  