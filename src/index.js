import { createSelector } from './selector';
const state = {
  a: 1,
  b: 2,
}
const selector1 = createSelector(
  (state) => state.a,
  (state) => state.b,
  (a, b) => ({
    c: a * 2,
    d: b * 2,
  })
)
console.log(selector1(state))
console.log(selector1(state))
console.log(selector1.recomputations())