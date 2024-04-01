export function makeCounter(element) {
  let counter = 0;
  element.innerHTML = "count is 0";
  element.addEventListener('click', () => {
    element.innerHTML =`count is ${++counter}`;
  })
}

export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    if (count !== undefined)
      counter = count - 1;
    element.innerHTML = `count is ${++counter}`
  }
  element.addEventListener('click', () => setCounter())
  setCounter(0)
}

export const makeCounter2 = (element) => {
  let counter = 0;
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `count is ${count}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
