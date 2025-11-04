export default class WeightedPicker {
constructor(items, weightFn) {

    this.items = items || [];
    this.weightFn = weightFn || (() => 1);

 this.prefix = [];
  let sum = 0;
  for (const it of this.items) {
const w = Math.max(0, Number(this.weightFn(it)) || 0);

sum += w;
this.prefix.push(sum);
}
this.total = sum || 1;
  }
pick(random = Math.random) {
if (!this.items.length) return null;
const r = random() * this.total;
 // binary search over prefix sums
let lo = 0, hi = this.prefix.length - 1, ans = 0;
 while (lo <= hi) {
const mid = (lo + hi) >> 1;
if (this.prefix[mid] >= r) { ans = mid; hi = mid - 1; }
 else lo = mid + 1;
}
return this.items[ans] || null;
}
}

