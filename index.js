import { createSelectorCreator } from 'reselect';

// const selector = createSelector(
//   () => ({
//     value: 1,
//   }),
//   () => ({
//     value: 2,
//   }),
//   (option1, option2) => option1.value + option2.value
// )
const selector = (key) => {
  console.log(key)
}
console.log('5')

selector('3')