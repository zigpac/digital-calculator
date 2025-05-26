// script.js

// DOM Elements
const screen = document.getElementById('screen');

// Calculator State
let currentOperand = '';
let previousOperand = '';
let operation = undefined;
let shouldResetScreen = false;

// --- Core Logic Functions ---

/**
 * Clears all calculator data and resets the display.
 */
function clearAll() {
  currentOperand = '';
  previousOperand = '';
  operation = undefined;
  shouldResetScreen = false;
  updateDisplay();
}

/**
 * Appends a number to the current operand.
 * Prevents multiple decimal points.
 * @param {string} number - The number to append (0-9 or .).
 */
function appendNumber(number) {
  if (screen.value === 'Error') {
    clearAll(); // Reset if starting after an error
  }
  if (number === '.' && currentOperand.includes('.')) return; // Prevent multiple decimals
  if (shouldResetScreen) {
    currentOperand = '';
    shouldResetScreen = false;
  }
  currentOperand = currentOperand.toString() + number.toString();
  updateDisplay();
}

/**
 * Sets the operation for the calculation.
 * If a previous operation is pending, it computes it first.
 * @param {string} selectedOperation - The operator (+, -, *, /).
 */
function chooseOperation(selectedOperation) {
  if (screen.value === 'Error') {
    clearAll();
    return;
  }
  if (currentOperand === '' && previousOperand === '') {
    // Allow starting with minus for negative numbers
    if (selectedOperation === '-') {
        currentOperand = '-';
        updateDisplay();
        return;
    }
    return; // Don't allow other operators if no numbers
  }

  // If an operator is clicked and currentOperand is just '-', reset it or handle appropriately
  if (currentOperand === '-' && previousOperand === '') {
      currentOperand = ''; // Or potentially show an error / do nothing
      return;
  }


  if (previousOperand !== '') {
    // If there's an existing previousOperand, it means an operation is pending.
    // We should compute it before setting the new operation, unless currentOperand is empty.
    if (currentOperand !== '') {
        compute();
    } else {
        // User clicked an operator twice, or after an equals, update the operation
        operation = selectedOperation;
        updateDisplay(true); // Show operator in display
        return;
    }
  }

  operation = selectedOperation;
  previousOperand = currentOperand;
  currentOperand = '';
  shouldResetScreen = false; // Let the next number start fresh, but display will show previous + op
  updateDisplay(true); // Update display to show operator
}

/**
 * Computes the pending operation.
 */
function compute() {
  if (screen.value === 'Error') return; // Don't compute if already error

  let computation;
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  if (isNaN(prev) || (isNaN(current) && currentOperand !== '')) { // Second check for cases like "5 * " then equals
    if (isNaN(prev) && !isNaN(current) && operation === undefined) { // Case: just a number and then equals
        currentOperand = current.toString();
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = true;
        updateDisplay();
        return;
    }
    // If current is NaN but it's not an empty string, it implies an invalid input before equals
    if (isNaN(current) && currentOperand !== '') {
        screen.value = 'Error';
        currentOperand = 'Error'; // Keep error state
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = true;
        return;
    }
     // If only previous is available (e.g. 5 * =) then do nothing or keep prev as current
    if(!isNaN(prev) && isNaN(current) && previousOperand !== '' && operation !== undefined) {
        currentOperand = prev.toString(); // Or simply return, or show error
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = true;
        updateDisplay();
        return;
    }
    // If currentOperand is empty and an operation is set (e.g. "5 * =" ), use previousOperand as current.
    if (previousOperand !== '' && currentOperand === '' && operation) {
        // This behavior can be debated: some calculators repeat the operation with the same number,
        // some do nothing, some use 0. Here, let's assume we use the previousOperand as the second operand.
        // Or, more simply, if current is empty, just don't compute.
        return; // Or show error, or use previousOperand as current
    }
    
    // If no operation, or operands are not numbers, don't compute
    if (!operation || (isNaN(prev) && isNaN(current))) return;
  }


  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '*':
      computation = prev * current;
      break;
    case '/':
      if (current === 0) {
        screen.value = 'Error'; // Display error directly
        currentOperand = 'Error'; // Set currentOperand to Error to maintain state
        previousOperand = '';
        operation = undefined;
        shouldResetScreen = true;
        return; // Exit early
      }
      computation = prev / current;
      break;
    default:
      return; // Should not happen
  }

  currentOperand = computation.toString();
  operation = undefined;
  previousOperand = '';
  shouldResetScreen = true; // Next number input should clear the result
  updateDisplay();
}

/**
 * Updates the calculator screen.
 * @param {boolean} showOperation - If true, appends the current operation to the display.
 */
function updateDisplay(showOperation = false) {
    if (currentOperand === 'Error') {
        screen.value = 'Error';
        return;
    }
    if (showOperation && operation != null && previousOperand !== '') {
        // Shows "previousOperand operation" when an operator is chosen
        screen.value = `${previousOperand} ${operation}`;
    } else if (currentOperand === '' && previousOperand !== '' && operation) {
        // Handles the case where an operator is selected, and we are waiting for the next number
        // e.g., "123 +" should show "123 +"
        screen.value = `${previousOperand} ${operation}`;
    }
    else {
        screen.value = currentOperand === '' && previousOperand === '' ? '0' : currentOperand;
    }
    // If screen is empty and currentOperand is also empty (e.g. after clear), show 0
    if (screen.value === '') screen.value = '0';
}


// --- Event Listener Setup (Example, assuming buttons exist in HTML) ---
// This part would typically be more robust, perhaps by selecting all buttons
// and adding listeners based on classes or data attributes.
// For now, we rely on onclick="" attributes in the HTML calling these functions.

// Initial display update
updateDisplay();
