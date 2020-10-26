import { millisecondsToSeconds } from '../utils.js';
import MinHeap from './min-heap.js';
import Puzzle from './puzzle.js';


const generateStateKey = (state) => {
  return state.reduce((stateKey, currentValue) => {
    return `${stateKey ? `${stateKey}-` : ''}${currentValue}`;
  }, '');
};

const generateNewState = (state, cursorIndex, cellIndex) => {
  let newStateKey = '';
  let newState = [];

  for (let index = 0; index < state.length; index++) {
    if (index === cursorIndex)
      newState[index] = state[cellIndex];

    else if (index === cellIndex)
      newState[index] = state[cursorIndex];

    else
      newState[index] = state[index];

    newStateKey += `${newStateKey ? `-` : ''}${newState[index]}`;
  }

  return [newState, newStateKey];
};

const solvePuzzle = ({
  initialState,
  heuristicFunction,
  minimizeOutput = false,
  puzzleSize,
  reverseSteps = false,
  stepsAssembler,
  targetState,
}) => {
  stepsAssembler.clearContainer();

  const startTime = performance.now();
  
  const size = typeof puzzleSize === 'number' ? {cols: puzzleSize, rows: puzzleSize} : puzzleSize;
  const cursorIndex = initialState.indexOf(0);

  const initialStateEntry = {
    cursorIndex: cursorIndex,
    heuristicValue: heuristicFunction(initialState, targetState, size),
    state: initialState,
    stateKey: generateStateKey(initialState),
  };

  const priorityQueue = new MinHeap(initialStateEntry, (state) => state.heuristicValue);

  const visitedStates = new Map([[initialStateEntry.stateKey, {
    parentKey: null,
    stepElement: null,
  }]]);

  while (priorityQueue.size() > 0) {

    if (millisecondsToSeconds(performance.now() - startTime) > 15) {
      stepsAssembler.addMessage('Execution took too much time ⏳. Failed to find Solution 😔');
      return null;
    }

    const {cursorIndex, heuristicValue, state, stateKey: parentStateKey} = priorityQueue.pop();

    if (heuristicValue === 0) {

      const endTime = performance.now();
      const timeElapsed = millisecondsToSeconds(endTime - startTime, 5);

      const sectionDivider = '--------------------------';

      stepsAssembler.addMessage('Solution has been found 😊');
      stepsAssembler.addMessage(sectionDivider);

      const nodesCountMessage = stepsAssembler.addMessage(
        `Nodes created 🧱: ${visitedStates.size}`
      );

      const steps = stepsAssembler.assembleSteps({
        visitedStates,
        minimizeOutput,
        reverseSteps,
        stateKey: parentStateKey,
      });

      const stepsCountMessage = stepsAssembler.addMessage({
        messageText: `Steps count 🚶‍♀️: ${steps.length}`,
        appendAfter: nodesCountMessage,
      });

      const timeElapsedMessage = stepsAssembler.addMessage({
        messageText: `Time elapsed ⏰: ${timeElapsed}s`,
        appendAfter: stepsCountMessage,
      });
      
      if ('memory' in performance) {
        const memory = performance.memory
        const used = (memory.usedJSHeapSize / 1024).toFixed(2);
        const total =  (memory.jsHeapSizeLimit / 1024).toFixed(2);

        stepsAssembler.addMessage({
          messageText: `Heap memory used 💹: ${used}KB / ${total}KB`,
          appendAfter: timeElapsedMessage,
        })
      }

      stepsAssembler.addMessage({
        messageText: sectionDivider,
        appendAfter: 'last-message',
      });

      return steps;
    }

    const cursorPosition = Puzzle.getCellPosition(cursorIndex, size);
    const {col: cursorCol, row: cursorRow} = cursorPosition;

    const possibleIndices = [
      (cursorCol + 1) + cursorRow * size.cols,
      (cursorCol - 1) + cursorRow * size.cols,
      cursorCol + (cursorRow + 1) * size.cols,
      cursorCol + (cursorRow - 1) * size.cols,
    ];

    possibleIndices.forEach(index => {
      const value = state[index];

      if (!value) return;

      const position = Puzzle.getCellPosition(index, size);
      const moveDirection = Puzzle.getCellMoveDirection(cursorPosition, position);

      if (!moveDirection)
        return;

      const [newState, newStateKey] = generateNewState(state, cursorIndex, index);

      if (visitedStates.get(newStateKey))
        return;

      visitedStates.set(newStateKey, {
        parentKey: parentStateKey,
        stepElement: stepsAssembler.createStep(value, moveDirection)
      });

      priorityQueue.push({
        cursorIndex: index,
        heuristicValue: heuristicFunction(newState, targetState, size),
        state: newState,
        stateKey: newStateKey,
      });
    });
  }

  stepsAssembler.addMessage('Failed to find solution 😭');
  return null;
};

export default solvePuzzle;
