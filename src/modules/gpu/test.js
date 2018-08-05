// const GPU = require('gpu.js')
//
// console.log(GPU)

// var gpu = new GPU((A, B) => {
//   var sum = 0;
//   for (var i=0; i<512; i++) {
//     sum += A[this.thread.y][i] * B[i][this.thread.x];
//   }
//   return sum;
// })

// const gpu = new GPU();
//
// const opt = {
//   output: [100]
// };
//
// const myFunc = gpu.createKernel(function() {
//   return this.thread.x;
// }, opt);
//
// myFunc();