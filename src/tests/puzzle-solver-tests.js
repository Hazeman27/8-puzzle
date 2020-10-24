import solvePuzzle from '../components/puzzle-solver.js';
import StepsAssembler from '../components/steps-assembler.js';
import {manhattanDistance, invalidPlacedItemsCount} from '../heuristics.js';


const puzzleSolverTest = ({
  puzzleSize,
  heuristicFunction,
  initialState,
  targetState,
  correctDirections,
}) => {
  let testsPassed = true;
  
  const steps = solvePuzzle({
    initialState,
    targetState,
    heuristicFunction,
    puzzleSize,
    stepsAssembler: new StepsAssembler({
      puzzleSize,
      selectors: {
        containerId: 'solution-steps',
      },
    }),
  });

  const directions = steps.map(step => step.getAttribute('data-direction'));

  directions.forEach((direction, index) => {
    if (direction !== correctDirections[index]) {
      console.warn(
        `Puzzle solving test failed. Expected direction ${correctDirections[index]}.`,
        `But got ${direction}`,
      );

      testsPassed = false;
    }
  });

  return testsPassed;
};

const runPuzzleSolverTests = () => {
  puzzleSolverTest({
    puzzleSize: 3,
    heuristicFunction: manhattanDistance,
    initialState: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    targetState: [1, 2, 3, 4, 6, 8, 7, 5, 0],
    correctDirections: ['right', 'down', 'left', 'up'],
  });

  puzzleSolverTest({
    puzzleSize: 3,
    heuristicFunction: invalidPlacedItemsCount,
    initialState: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    targetState: [1, 2, 3, 4, 6, 8, 7, 5, 0],
    correctDirections: ['right', 'down', 'left', 'up'],
  });
}

export default runPuzzleSolverTests;
