import { WIDTH_ANAMORF, HEIGHT_ANAMORF, MIN_ANAMORF } from '../constants/index'

export default class AnamorphoseModel {

  constructor() {
    if (AnamorphoseModel.instance) {
      return AnamorphoseModel.instance;
    }
    this.props = {
      numMatrix: 1,
      active: 0,
      matrixes: [],
      width: WIDTH_ANAMORF,
      height: HEIGHT_ANAMORF
    };

    this.reset();
    AnamorphoseModel.instance = this;
  }
  update(width, height) {
    this.props = {
      numMatrix: this.props.numMatrix,
      active: this.props.active,
      matrixes: this.props.matrixes,
      width: width,
      height: height
    };
    this.props.matrixes[this.props.active] = [];
    this.reset();
  }
  reset() {
    this.props.matrixes[this.props.active] = [];
    for (let i = 0; i < this.props.height; i += 1) {
      this.props.matrixes[this.props.active][i] = [];
      for (let j = 0; j < this.props.width; j += 1) {
        this.props.matrixes[this.props.active][i][j] = MIN_ANAMORF;
      }
    }
  }
  // createDemo() {
  //   this.props = {
  //     numMatrix: 1,
  //     active: 0,
  //     matrixes: [],
  //     width: WIDTH_ANAMORF_DEMO,
  //     height: HEIGHT_ANAMORF_DEMO
  //   };
  //
  //   this.props.matrixes[this.props.active] = [];
  //   for (let i = 0; i < this.props.height; i += 1) {
  //     this.props.matrixes[this.props.active][i] = [];
  //     for (let j = 0; j < this.props.width; j += 1) {
  //       this.props.matrixes[this.props.active][i][j] = MIN_ANAMORF + Math.random();
  //     }
  //   }
  //
  //   for (let i = 5; i < this.props.height - 5; i += 1) {
  //     for (let j = 5; j < this.props.width - 5; j += 1) {
  //       let p = Math.random();
  //       if (p > 0.98) {
  //         let r = 6 * Math.random();
  //         if (this.props.matrixes[this.props.active][i][j] < 3) {
  //           for (let i1 = i - parseInt(r / 2) - 5; i1 < i + parseInt(r / 2) + 6; i1 += 1) {
  //             for (let j1 = j - parseInt(r / 2) - 5; j1 < j + parseInt(r / 2) + 6; j1 += 1) {
  //               if (i1 > -1 && j1 > -1 && i1 < HEIGHT_ANAMORF_DEMO && j1 < WIDTH_ANAMORF_DEMO) {
  //                 let d = Math.abs(i - i1) * (0.6 + Math.random() * 0.4) + Math.abs(j - j1)  * (0.6 + Math.random() * 0.4);
  //                 if (MIN_ANAMORF + r - d > 1.1 && MIN_ANAMORF + r - d > this.props.matrixes[this.props.active][i1][j1]) {
  //                   this.props.matrixes[this.props.active][i1][j1] = MIN_ANAMORF + r - d;
  //                 }
  //               }
  //             }
  //           }
  //           this.props.matrixes[this.props.active][i][j] = MIN_ANAMORF + r;
  //         }
  //       }
  //     }
  //   }
  // }
  // changeMatrix() {
  //   console.log('change');
  //   this.props.matrixes[this.props.active] = [];
  //   for (let i = 0; i < this.props.height; i += 1) {
  //     this.props.matrixes[this.props.active][i] = [];
  //     for (let j = 0; j < this.props.width; j += 1) {
  //       this.props.matrixes[this.props.active][i][j] = MIN_ANAMORF + Math.random();
  //     }
  //   }
  //   for (let i = 5; i < this.props.height - 5; i += 1) {
  //     for (let j = 5; j < this.props.width - 5; j += 1) {
  //       let p = Math.random();
  //       if (p > 0.98) {
  //         let r = 6 * Math.random();
  //         if (this.props.matrixes[this.props.active][i][j] < 3) {
  //           for (let i1 = i - parseInt(r / 2) - 5; i1 < i + parseInt(r / 2) + 6; i1 += 1) {
  //             for (let j1 = j - parseInt(r / 2) - 5; j1 < j + parseInt(r / 2) + 6; j1 += 1) {
  //               if (i1 > -1 && j1 > -1 && i1 < HEIGHT_ANAMORF_DEMO && j1 < WIDTH_ANAMORF_DEMO) {
  //                 let d = Math.abs(i - i1) * (0.6 + Math.random() * 0.4) + Math.abs(j - j1)  * (0.6 + Math.random() * 0.4);
  //                 if (MIN_ANAMORF + r - d > 1.1 && MIN_ANAMORF + r - d > this.props.matrixes[this.props.active][i1][j1]) {
  //                   this.props.matrixes[this.props.active][i1][j1] = MIN_ANAMORF + r - d;
  //                 }
  //               }
  //             }
  //           }
  //           this.props.matrixes[this.props.active][i][j] = MIN_ANAMORF + r;
  //         }
  //       }
  //     }
  //   }
  // }
  getSize() {
    return {
      width: this.props.width,
      height: this.props.height
    }
  }
  getMatrix() {
    return this.props.matrixes[this.props.active];
  }
  getActive() {
    return this.props.active;
  }
  getNumMatrix() {
    return this.props.numMatrix;
  }

  addActive() {
    this.props.active += 1;
    if (this.props.active === this.props.numMatrix) {
      this.props.numMatrix += 1;
      this.reset();
    }
  }
  reduceActive() {
    if (this.props.active !== 0) {
      this.props.active -= 1;
    }
  }

  setMatrix(matrix) {
    for (let i = 0; i < this.props.height; i += 1) {
      for (let j = 0; j < this.props.width; j += 1) {
        this.props.matrixes[this.props.active][i][j] = matrix[i][j];
      }
    }
  }
  setCell(cell) {
    this.props.matrixes[this.props.active][cell.h][cell.w] = cell.value;
  }
  getCell(pos){
    return this.props.matrixes[this.props.active][pos.height][pos.width];
  }
}
