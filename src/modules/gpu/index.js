const gpu = new GPU();

let mat = [];
let mat2 = [];

function genMat(x, y) {
  let m = [];
  for (let i = 0; i < x; i += 1) {
    m[i] = [];
    for (let j = 0; j < y; j += 1) {
      m[i][j] = Math.random();
    }
  }
  return m;
}

function genMat2(x, y) {
  let m = [];
  for (let i = 0; i < x; i += 1) {
    m[i] = [];
    for (let j = 0; j < y; j += 1) {
      m[i][j] = [];
      m[i][j][0] = Math.random() * 5;
      m[i][j][1] = Math.random() * 5;
    }
  }
  return m;
}

function genPoints (x, y) {
  let p = [];
  for (let i = 0; i < x * y * 8; i += 1) {
    p[i] = [];
    p[i][0] = Math.random() * i;
    p[i][1] = Math.random() * i;
  }
  return p;
}

function genCenterMass (x, y) {
  let cm = [];
  for (let i = 0; i < x * y; i += 1) {
    cm[i] = [];
    cm[i][0] = Math.random() * i;
    cm[i][1] = Math.random() * i;
  }
  return cm;
}

function cpuMatMult (m, n) {
  var result = [];
  for (var i = 0; i < m.length; i++) {
    result[i] = [];
    for (var j = 0; j < n[0].length; j++) {
      var sum = 0;
      for (var k = 0; k < m[0].length; k++) {
        sum += m[i][k] * n[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

// function calcAnam() {
//   for (let i = 0; i < this.size.height; i += 1) {
//     for (let j = 0; j < this.size.width; j += 1) {
//       rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * 12;
//       for (let i1 = i - rad; i1 < i + rad + 1; i1 += 1) {
//         for (let j1 = j - rad; j1 < j + rad + 1; j1 += 1) {
//           if (i1 > -1 && i1 < this.size.height && j1 > -1 && j1 < this.size.width) {
//             points = this.cells[i1 * this.size.width + j1].getPoints();
//             for (let i = 0; i < points.length; i += 1) {
//               if (points[i].getName() in ps) {
//                 continue;
//               }
//               ps[points[i].getName()] = points[i];
//             }
//           }
//         }
//       }
//       for (let n in ps) {
//         ps[n].changeVector(this.cells[i * this.size.width + j].calcInteraction(ps[n]));
//       }
//       ps = {};
//       points = [];
//     }
//     // if (i % 10 === 0) {
//     //   console.log(i / 10);
//     // }
//   }
//
//   for (let point in this.points) {
//     this.points[point].changePos();
//   }
//
//   endAnamorf = true;
//   for (let i = 0; i < this.cells.length; i += 1) {
//     if (this.cells[i].checkSquare() === false) {
//       endAnamorf = false;
//     }
//   }
// }


function testCPU (mat) {
  let r = 50;
  let sum = 0;
  let result = [];
  for (let i = 0; i < mat.length; i += 1) {
    result[i] = [];
    for (let j = 0; j < mat[0].length; j += 1) {
      let sum = 0;
      for (let i1 = i - r; i1 < i + r; i1 += 1) {
        for (let j1 = j - r; j1 < j + r; j1 += 1) {
          if (i + i1 > -1 && i + i1 < mat.length && j + j1 > -1 && j + j1 < mat[0].length) {
            sum += mat[i + i1][j + j1] * mat[i + i1][j + j1];
          }
        }
      }
      result[i][j] = sum;
    }
  }
}

function testCPU2 (mat) {
  let r = 50;
  let sum = 0;
  let result = [];
  for (let i = 0; i < mat.length; i += 1) {
    result[i] = [];
    for (let j = 0; j < mat[0].length; j += 1) {
      let sum = 0;
      for (let i1 = i - r; i1 < i + r; i1 += 1) {
        for (let j1 = j - r; j1 < j + r; j1 += 1) {
          if (i + i1 > -1 && i + i1 < mat.length && j + j1 > -1 && j + j1 < mat[0].length) {
            sum += mat[i + i1][j + j1] * mat[i + i1][j + j1];
          }
        }
      }
      result[i][j] = sum;
    }
  }
}

const testGPU = gpu.createKernel(function(a) {
  let sum = 0;
  let r = 150;
  for (let i1 = this.thread.x - r; i1 < this.thread.x + r; i1 += 1) {
    for (let j1 = this.thread.y - r; j1 < this.thread.y + r; j1 += 1) {
      if (this.thread.x + i1 > -1 && this.thread.x + i1 < 512 && this.thread.y + j1 > -1 && this.thread.y + j1 < 512) {
        sum += a[this.thread.x + i1][this.thread.y + j1] * a[this.thread.x + i1][this.thread.y + j1];
      }
    }
  }
  return sum;
}).setOutput([512, 512]);

let size = {
  w: 128,
  h: 128
};
let np = 0;

const testGPU2 = gpu.createKernel(function(a, p1) {
  let sum = 0;
  let r = 50;
  for (let i1 = this.thread.x - r; i1 < this.thread.x + r; i1 += 1) {
    for (let j1 = this.thread.y - r; j1 < this.thread.y + r; j1 += 1) {
      if (this.thread.x + i1 > -1 && this.thread.x + i1 < 512 && this.thread.y + j1 > -1 && this.thread.y + j1 < 512) {
        sum += a[this.thread.x + i1][this.thread.y + j1][0] * a[this.thread.x + i1][this.thread.y + j1][1];
        sum += this.constants.w;

        // p[1][1] *= a[this.thread.x + i1][this.thread.y + j1][0];
      }
    }
  }
  return sum;
}, {
  constants: { w: size.w, h: size.h, p: 1 },
  output: [size.w, size.h]
});

const testGPU3 = gpu.createKernel(function(p, cm) {
  let pN = p[this.thread.x][this.constants.np];
  let str = 0;
  let l = 0;

  for (let i = this.thread.x - this.constants.w * 30 - 15;
       i < this.thread.x + this.constants.w * 30 + 15; i += 1) {
    if (i > -1 && i < this.constants.w * this.constants.h) {
      l = Math.pow(Math.pow(cm[i][0] - p[this.thread.x][0], 2) +
        Math.pow(cm[i][1] - p[this.thread.x][1], 2), 0.5);
      if (l < 10) {
        str += l * 2;
      } else {
        str += l * 3;
      }
    }
  }
  pN += str;
  // pN[1] += str;

  return pN;
}, {
  constants: { w: size.w, h: size.h, np: np },
  output: [size.w * size.h * 8]
});

// const testGPU3 = gpu.createKernel(function(p, cm) {
//   let pN = 1;
//   let str = 0;
//   let l = 0;
//
//   l = Math.pow(Math.pow(cm[this.thread.y][0] - p[this.thread.x][0], 2) +
//     Math.pow(cm[this.thread.y][1] - p[this.thread.x][1], 2), 0.5);
//   if (l < 10) {
//     str += l * 2;
//   } else {
//     str += l * 3;
//   }
//   pN += str;
//   // pN[1] += str;
//
//   return pN;
// }, {
//   constants: { w: size.w, h: size.h },
//   output: [size.w * size.h, size.w * size.h * 8]
// });


// var ch = 0;

const gpuMatMult = gpu.createKernel(function(a, b) {
  let sum = 0;
  for (let i = 0; i < 1024; i++) {
    sum += a[this.thread.y][i] * b[i][this.thread.x];
    // ch += 1
  }
  return sum;
}).setOutput([1024, 1024]);

mat = genMat(512, 512);
mat2 = genMat2(256, 256);

let points = genPoints(size.w, size.h);
let centMass = genCenterMass(size.w, size.h);
// console.log(mat2);

// const startCPU = window.performance.now();
// const cpuResult = testCPU(mat);
// const endCPU = window.performance.now();
// const cpuTime = endCPU - startCPU;
// console.log(`CPU: ${cpuTime}ms`);


const startGPU = window.performance.now();
// const result = testGPU2(mat2, [[1,2],[2,3], []]);
// let p = [[1, 2], [2, 3], [4, 5]];
const result = testGPU3(points, centMass);
// console.log(result);
const endGPU = window.performance.now();
const gpuTime = endGPU - startGPU;
console.log(`GPU: ${gpuTime}ms`);


// function cpuMatMult(m, n) {
//   var result = [];
//   for (var i = 0; i < m.length; i++) {
//     result[i] = [];
//     for (var j = 0; j < n[0].length; j++) {
//       var sum = 0;
//       for (var k = 0; k < m[0].length; k++) {
//         sum += m[i][k] * n[k][j];
//       }
//       result[i][j] = sum;
//     }
//   }
//   return result;
// }



// // const opt = {
// //   output: [100]
// // };
// //
// // const myFunc = gpu.createKernel(function() {
// //   return this.thread.x;
// // }, opt);
// //
// // myFunc();
//
// const matrices = generateMatrices();
// console.log(matrices)
// const A = matrices.A;
// const B = matrices.B;
//
//CPU
// const startCPU = window.performance.now();
// const cpuResult = cpuMatMult(A, B);
// const endCPU = window.performance.now();
// const cpuTime = endCPU - startCPU;
// console.log(`CPU: ${cpuTime}ms`);
//
// const gpuMatMult = gpu.createKernel(function (A, B) {
//   var sum = 0;
//   for (var i = 0; i < 512; i++) {
//     sum += A[this.thread.y][i] * B[i][this.thread.x];
//   }
//   return sum;
// })
//   .setDimensions([A.length, B.length])
//   .setOutputToTexture(true);
//
// // //GPU
// const startGPU = window.performance.now();
// const result = gpuMatMult(A, B);
// const endGPU = window.performance.now();
// const gpuTime = endGPU - startGPU;
// console.log(`GPU: ${gpuTime}ms`);
//
// function generateMatrices() {
//   const matSize = 512;
//   let A = [];
//   let B = [];
//   for (let n = 0; n < matSize * matSize; n++) {
//     const randA = Math.random();
//     const randB = Math.random();
//     A.push(randA);
//     B.push(randB);
//   }
//
//   A = splitArray(A, matSize);
//   B = splitArray(B, matSize);
//
//   function splitArray(array, part) {
//     var tmp = [];
//     for (var i = 0; i < array.length; i += part) {
//       tmp.push(array.slice(i, i + part));
//     }
//     return tmp;
//   }
//
//   return {
//     A,
//     B
//   };
// }
// //
// function cpuMatMult(m, n) {
//   var result = [];
//   for (var i = 0; i < m.length; i++) {
//     result[i] = [];
//     for (var j = 0; j < n[0].length; j++) {
//       var sum = 0;
//       for (var k = 0; k < m[0].length; k++) {
//         sum += m[i][k] * n[k][j];
//       }
//       result[i][j] = sum;
//     }
//   }
//   return result;
// }
// //
// const gpu = new GPU({mode: 'webgl'});

//
// const gpuMatMult = gpu.createKernel(function (A, B) {
//   var sum = 0;
//   for (var i = 0; i < 512; i++) {
//     sum += A[this.thread.y][i] * B[i][this.thread.x];
//   }
//   return sum;
// })
//   .setDimensions([A.length, B.length])
//   .setOutputToTexture(true);
//
// //CPU
// const startCPU = window.performance.now();
// const cpuResult = cpuMatMult(A, B);
// const endCPU = window.performance.now();
// const cpuTime = endCPU - startCPU;
// console.log(`CPU: ${cpuTime}ms`);
//
// // //GPU
// const startGPU = window.performance.now();
// const result = gpuMatMult(A, B);
// const endGPU = window.performance.now();
// const gpuTime = endGPU - startGPU;
// console.log(`GPU: ${gpuTime}ms`);
//
// //Diff
// const diff = (cpuTime - gpuTime) / (gpuTime);
// console.log(`%c ${diff}`, 'color: red;', `times faster!`)