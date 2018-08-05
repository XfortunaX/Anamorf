import AnamorfScene from './anamorfScene'
import Cell from './cell'
import Point from './point'
import Line from './line'
import { HEIGHT_ANAMORF, WIDTH_ANAMORF, COUNT_MIDDLE_VERTEX, RADIUS_INTERACTION } from '../../constants/index'
import PubSub from './pubSub'
import GPU from 'gpu.js'

export default class AnamorfProcess {
  constructor(props) {
    this.props = props;
    this.anamorfScene = new AnamorfScene();
    this.pubSub = new PubSub();

    this.size = {
      width: WIDTH_ANAMORF,
      height: HEIGHT_ANAMORF
    };
    this.points = {};
    this.cells = [];
    this.lines_w = [];
    this.lines_h = [];
    this.average = 0;
    this.gpu = new GPU();
    // console.log(this.gpu);


    const opt = {
      output: [100]
    };

    const myFunc = this.gpu.createKernel(function() {
      return this.thread.x;
    }, opt);

    myFunc();


    this.pubSub.subscribe('addPoint', this.addPoint, this);
    this.pubSub.subscribe('checkPoint', this.checkPoint, this);
    this.pubSub.subscribe('getAverage', this.getAverage, this);
  }

  getAverage() {
    return this.average;
  }
  getAnamorfScene() {
    return this.anamorfScene.getStage();
  }
  addPoint(point) {
    this.points[point.getName()] = point;
  }
  checkPoint(name) {
    if (name in this.points) {
      return this.points[name];
    }
    return false;
  }

  drop() {
    console.log('drop');
  }

  matrixSet(matrix) {

    this.matrix = matrix;
    this.average = 0;

    for(let p in this.points) {
      this.points[p].drop();
    }

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.matrix[i].length; j += 1) {
        this.average += this.matrix[i][j];
      }
    }
    this.average = Math.round(this.average * 100) / 100;
    console.log(this.average);
    this.average /= this.size.height * this.size.width;
    this.average = Math.round(this.average * 100) / 100;
    console.log(this.average);

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.matrix[i].length; j += 1) {
        this.cells[i * this.size.height + j].setValue(this.matrix[i][j]);
      }
    }

    console.log('set');
  }

  setKoef(koef) {
    this.average = koef;
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.matrix[i].length; j += 1) {
        this.cells[i * this.size.height + j].create();
      }
    }
  }

  sumMatrix() {
    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].average();
    }
  }

  reduceMatrix() {
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.cells[i * this.size.width + j].reduceActive();
      }
    }
  }

  addMatrix(matrix) {
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.cells[i * this.size.width + j].addActive();
        this.cells[i * this.size.width + j].setValue(matrix[i][j]);
      }
    }
  }

  setMatrix(matrix) {

    this.points = {};
    this.cells = [];
    this.lines_w = [];
    this.lines_h = [];
    this.average = 0;
    this.anamorfScene.clear();

    this.matrix = matrix;
    this.size.height = this.matrix.length;
    this.size.width = this.matrix[0].length;

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.average += this.matrix[i][j];
      }
    }
    this.average /= this.size.height * this.size.width;
    this.average = Math.round(this.average * 100) / 100;
    console.log(this.average);

    let step = Math.ceil((1 / (COUNT_MIDDLE_VERTEX + 1)) * 100) / 100;
    console.log(step);

    console.log('create');
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        let cell = new Cell({
          pos: { x: j, y: i },
          value: this.matrix[i][j],
          size: { width: this.size.width, height: this.size.height }
        });
        this.cells.push(cell);
      }
    }

    for (let i = 0; i < this.size.height + 1; i += 1) {
      let line = new Line({ num: i, type: 'w' });
      this.lines_w.push(line);
    }

    for (let i = 0; i < this.size.width + 1; i += 1) {
      let line = new Line({ num: i, type: 'h' });
      this.lines_h.push(line);
    }
    console.log('endcreate');

    console.log('lines_points');

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        let point = new Point({ x: j, y: i});
        this.addPoint(point);
        this.lines_w[i].addPoint(point);
        this.lines_h[j].addPoint(point);
        for (let k = step; k < 1; k += step) {
          let point_w = new Point({ x: Math.round((j + k) * 100) / 100, y: i });
          this.addPoint(point_w);
          this.lines_w[i].addPoint(point_w);
        }
        for (let k = step; k < 1; k += step) {
          let point_h = new Point({ x: j, y: Math.round((i + k) * 100) / 100 });
          this.addPoint(point_h);
          this.lines_h[j].addPoint(point_h);
        }
      }
      if (i % 50 === 0) {
        console.log(i);
      }
    }

    for (let i = 0; i < this.size.width; i += 1) {
      for (let k = 0; k < 1; k += step) {
        let point_w = new Point({ x: Math.round((i + k) * 100) / 100, y: this.size.height});
        this.addPoint(point_w);
        this.lines_w[this.size.height].addPoint(point_w);
        if (k === 0) {
          this.lines_h[i].addPoint(point_w);
        }
      }
    }

    for (let i = 0; i < this.size.height; i += 1) {
      for (let k = 0; k < 1; k += step) {
        let point_h = new Point({ x: this.size.width, y: Math.round((i + k) * 100) / 100});
        this.addPoint(point_h);
        this.lines_h[this.size.width].addPoint(point_h);
        if (k === 0) {
          this.lines_w[i].addPoint(point_h);
        }
      }
    }

    let point = new Point({ x: this.size.width, y: this.size.height});
    this.addPoint(point);
    this.lines_w[this.size.height].addPoint(point);
    this.lines_h[this.size.width].addPoint(point);
    console.log('end_lines_points');

    // for (let i = 0; i < this.size.height + 1; i += 1) {
    //   // this.lines_w[i].show();
    //   this.lines_w[i].create();
    // }
    // for (let i = 0; i < this.size.width + 1; i += 1) {
    //   // this.lines_h[i].show();
    //   this.lines_h[i].create();
    // }

    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].addPoints();
    }

    // console.log(this.cells);

    console.log('create_points_inter');

    // let rad = RADIUS_INTERACTION;
    // for (let i = 0; i < this.size.height; i += 1) {
    //   for (let j = 0; j < this.size.width; j += 1) {
    //     // let rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * 7;
    //     // let rad = RADIUS_INTERACTION;
    //     for (let i1 = i - rad; i1 < i + rad + 1; i1 += 1) {
    //       for (let j1 = j - rad; j1 < j + rad + 1; j1 += 1) {
    //         if (i1 > -1 && i1 < this.size.height && j1 > -1 && j1 < this.size.width) {
    //           this.cells[i * this.size.width + j].addPointsInteraction(
    //             this.cells[i1 * this.size.width + j1].getPoints());
    //         }
    //       }
    //     }
    //   }
    //   if (i % 10 === 0) {
    //     console.log(i / 10);
    //   }
    // }

    // for (let i = 0; i < this.size.height; i += 1) {
    //   for (let j = 0; j < this.size.width; j += 1) {
    //     // let rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * 7;
    //     let rad = RADIUS_INTERACTION;
    //     for (let i1 = i - rad; i1 < i + rad + 1; i1 += 1) {
    //       for (let j1 = j - rad; j1 < j + rad + 1; j1 += 1) {
    //         if (i1 > -1 && i1 < this.size.height && j1 > -1 && j1 < this.size.width) {
    //           this.cells[i * this.size.width + j].addPointsInteraction(
    //             this.cells[i1 * this.size.width + j1].getPoints());
    //         }
    //       }
    //     }
    //   }
    //   if (i % 10 === 0) {
    //     console.log(i / 10);
    //   }
    // }

    // for (let i = 0; i < this.cells.length; i += 1) {
    //   for (let j = 0; j < this.cells.length; j += 1) {
    //     if (this.cells[i].checkInteraction(this.cells[j].getCenterMass())) {
    //       this.cells[i].addPointsInteraction(this.cells[j].getPoints());
    //     }
    //   }
    //   if (i % 100 === 0) {
    //     console.log(i / 100);
    //   }
    // }

    console.log('end_create_points_inter');

    console.log('endgen');

    let len = Object.keys(this.points).length;
    this.corp = 0;

    this.testGPUX = this.gpu.createKernel(function(p, cm) {
      let pN = p[this.thread.x][0];
      let str = 0;
      let l = 0;

      let vectorX = 0;
      let vectX = 0; let vectY = 0;

      for (let i1 = 0; i1 < this.constants.w * this.constants.h; i1 += 1) {
        vectX = p[this.thread.x][0] - cm[i1][0];
        vectY = p[this.thread.x][1] - cm[i1][1];
        l = Math.pow(Math.pow(vectX, 2) + Math.pow(vectY, 2), 0.5);
        vectX /= l;
        vectY /= l;
        if (l <= cm[i1][2]) {
          str = l * (cm[i1][3] / cm[i1][2] - 1);
        } else if (l > cm[i1][2]) {
          str = Math.pow(Math.abs(Math.pow(l, 2) + Math.pow(cm[i1][3], 2) - Math.pow(cm[i1][2], 2)), 0.5) - l;
        }
        vectX *= str;
        vectorX += vectX;
      }
      pN += vectorX;

      return pN;
    }, {
      constants: { w: this.size.width, h: this.size.height },
      output: [len]
    });

    this.testGPUY = this.gpu.createKernel(function(p, cm) {
      let pN = p[this.thread.x][1];
      let str = 0;
      let l = 0;

      let vectorY = 0;
      let vectX = 0; let vectY = 0;

      for (let i1 = 0; i1 < this.constants.w * this.constants.h; i1 += 1) {
        vectX = p[this.thread.x][0] - cm[i1][0];
        vectY = p[this.thread.x][1] - cm[i1][1];
        l = Math.pow(Math.pow(vectX, 2) + Math.pow(vectY, 2), 0.5);
        vectY /= l;
        if (l <= cm[i1][2]) {
          str = l * (cm[i1][3] / cm[i1][2] - 1);
        } else if (l > cm[i1][2]) {
          str = Math.pow(Math.abs(Math.pow(l, 2) + Math.pow(cm[i1][3], 2) - Math.pow(cm[i1][2], 2)), 0.5) - l;
        }
        vectY *= str;
        vectorY += vectY;
      }
      pN += vectorY;
      return pN;
    }, {
      constants: { w: this.size.width, h: this.size.height },
      output: [len]
    });

    // this.testGPU = this.gpu.createKernel(function(p, cm) {
    //   let pN = 0;
    //   let str = 0;
    //   let l = 0;
    //
    //   let vectorX = 0; let vectorY = 0;
    //   let vectX = 0; let vectY = 0;
    //
    //   for (let i1 = 0; i1 < this.constants.w * this.constants.h; i1 += 1) {
    //     vectX = p[this.thread.x][0] - cm[i1][0];
    //     vectY = p[this.thread.x][1] - cm[i1][1];
    //     l = Math.pow(vectX * vectX + vectY * vectY, 0.5);
    //     vectX /= l;
    //     vectY /= l;
    //     if (l <= cm[i1][2]) {
    //       str = l * (cm[i1][3] / cm[i1][2] - 1);
    //     } else if (l > cm[i1][2]) {
    //       str = Math.pow(Math.abs(l * l + cm[i1][3] * cm[i1][3] - cm[i1][2] * cm[i1][2]), 0.5) - l;
    //     }
    //     vectX *= str;
    //     vectY *= str;
    //     vectorX += vectX;
    //     vectorY += vectY;
    //   }
    //   // pN = vectorX;
    //   if (vectorX < 0) {
    //     pN = Math.round(-vectorX * 100) * 100000;
    //   } else {
    //     pN = Math.round(vectorX * 100) * 100000;
    //   }
    //   if (vectorY < 0) {
    //     pN += 20000 + Math.round(-vectorY * 100);
    //   } else {
    //     pN += 10000 + Math.round(vectorY * 100);
    //   }
    //   if (vectorX < 0) {
    //     pN = -pN;
    //   }
    //
    //   // if (vectorX < 0) {
    //   //   pN = 2000000000 + Math.round(-vectorX * 100) * 100000;
    //   // } else {
    //   //   pN = 1000000000 + Math.round(vectorX * 100) * 100000;
    //   // }
    //   // if (vectorY < 0) {
    //   //   pN += 20000 + Math.round(-vectorY * 100);
    //   // } else {
    //   //   pN += 10000 + Math.round(vectorY * 100);
    //   // }
    //
    //   // pN = 1000000000 + Math.round(vectorX * 100) * 100000;
    //
    //   return pN;
    // }, {
    //   constants: { w: this.size.width, h: this.size.height },
    //   output: [len]
    // });
  }

  calcAnamorf() {
    let endAnamorf = false;
    let rad = RADIUS_INTERACTION;
    let ps = {};
    let points = [];
    for (let s = 0; s < 100 && endAnamorf === false; s += 1) {

      for (let i = 0; i < this.size.height; i += 1) {
        for (let j = 0; j < this.size.width; j += 1) {
          rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * 12;
          for (let i1 = i - rad; i1 < i + rad + 1; i1 += 1) {
            for (let j1 = j - rad; j1 < j + rad + 1; j1 += 1) {
              if (i1 > -1 && i1 < this.size.height && j1 > -1 && j1 < this.size.width) {
                points = this.cells[i1 * this.size.width + j1].getPoints();
                for (let i = 0; i < points.length; i += 1) {
                  if (points[i].getName() in ps) {
                    continue;
                  }
                  ps[points[i].getName()] = points[i];
                }
              }
            }
          }
          for (let n in ps) {
            ps[n].changeVector(this.cells[i * this.size.width + j].calcInteraction(ps[n]));
          }
          ps = {};
          points = [];
        }
        // if (i % 10 === 0) {
        //   console.log(i / 10);
        // }
      }

      for (let point in this.points) {
        this.points[point].changePos();
      }

      endAnamorf = true;
      for (let i = 0; i < this.cells.length; i += 1) {
        if (this.cells[i].checkSquare() === false) {
          endAnamorf = false;
        }
      }
      if (endAnamorf === true) {
        console.log('count: ', s);
      }
      console.log(endAnamorf);
    }

    this.drawMatrix();
  }

  genDataGPU() {
    let dataGPU = {};
    let i = 0;
    let name = [];
    dataGPU.points = [];
    dataGPU.centerMass = [];

    for (let p in this.points) {
      dataGPU.points[i] = [];
      dataGPU.points[i][0] = this.points[p].getPosTexture().x;
      dataGPU.points[i][1] = this.points[p].getPosTexture().y;
      name = this.points[p].getName().split('_');
      dataGPU.points[i][2] = parseInt(name[0]);
      dataGPU.points[i][3] = parseInt(name[1]);
      i += 1;
    }

    for (let j = 0; j < this.cells.length; j += 1) {
      dataGPU.centerMass[j] = [];
      dataGPU.centerMass[j][0] = this.cells[j].getCenterMass().x;
      dataGPU.centerMass[j][1] = this.cells[j].getCenterMass().y;
      dataGPU.centerMass[j][2] = this.cells[j].getRadCircle();
      dataGPU.centerMass[j][3] = this.cells[j].getRadCircleAn();
    }

    // for (let j = 0; j < this.size.height; j += 1) {
    //   dataGPU.centerMass[j] = [];
    //   for (let k = 0; k < this.size.width; k += 1) {
    //     dataGPU.centerMass[j][k] = [];
    //     dataGPU.centerMass[j][k][0] = this.cells[j * this.size.width + k].getCenterMass().x;
    //     dataGPU.centerMass[j][k][1] = this.cells[j * this.size.width + k].getCenterMass().y;
    //     dataGPU.centerMass[j][k][2] = this.cells[j * this.size.width + k].getRadCircle();
    //     dataGPU.centerMass[j][k][3] = this.cells[j * this.size.width + k].getRadCircleAn();
    //   }
    // }

    return dataGPU;
  }

  setDataGPU(pointsX, pointsY) {
    let i = 0;
    for (let p in this.points) {
      this.points[p].setPos(pointsX[i], pointsY[i]);
      i += 1;
    }

    // let i = 0;
    // for (let p in this.points) {
    //   let dx = Math.floor(points[i] / 100000 % 10000) / 100;
    //   if (points[i] < 0) {
    //     dx = -dx;
    //     points[i] = -points[i];
    //   }
    //   let dy = points[i] % 10000 / 100;
    //   if (parseInt(points[i] / 10000 % 10) === 2) {
    //     dy = -dy;
    //   }
    //   // console.log(points[i], dx, dy);
    //   this.points[p].setPos(dx, dy);
    //   i += 1;
    // }
  }

  calcAnamorfStep(step) {

    // let rad = RADIUS_INTERACTION;
    // let ps = {};
    // let points = [];
    let endAnamorf = false;

    for (let s = 0; s < step && endAnamorf === false; s += 1) {
      let gpu = this.genDataGPU();
      // console.log(gpu);

      const startGPU = window.performance.now();
      let tGPUX = this.testGPUX(gpu.points, gpu.centerMass);
      // console.log(tGPUX);
      const tGPUY = this.testGPUY(gpu.points, gpu.centerMass);
      // console.log(tGPUY);
      // let tGPU = this.testGPU(gpu.points, gpu.centerMass);
      // console.log(tGPU);
      const endGPU = window.performance.now();
      const gpuTime = endGPU - startGPU;
      console.log(`GPU: ${gpuTime}ms`);

      this.setDataGPU(tGPUX, tGPUY);
      endAnamorf = true;
      for (let i = 0; i < this.cells.length; i += 1) {
        if (this.cells[i].checkSquare() === false) {
          endAnamorf = false;
        }
      }
      console.log(endAnamorf);
    }
    // for (let s = 0; s < step; s += 1) {
    //
    //   for (let i = 0; i < this.size.height; i += 1) {
    //     for (let j = 0; j < this.size.width; j += 1) {
    //       // rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) + 5;
    //       // console.log(rad);
    //       rad = this.cells[i * this.size.width + j].getRadius();
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
    //   let endAnamorf = true;
    //   for (let i = 0; i < this.cells.length; i += 1) {
    //     if (this.cells[i].checkSquare() === false) {
    //       endAnamorf = false;
    //     }
    //   }
    //   console.log(endAnamorf);
    // }


    // for (let s = 0; s < step; s += 1) {
    //   for (let i = 0; i < this.cells.length; i += 1) {
    //     let ps = this.cells[i].getPointsInteraction();
    //     for (let n in ps) {
    //       ps[n].changeVector(this.cells[i].calcInteraction(ps[n]));
    //     }
    //   }
    //
    //   for (let point in this.points) {
    //     this.points[point].changePos();
    //   }
    //
    //   let endAnamorf = true;
    //   for (let i = 0; i < this.cells.length; i += 1) {
    //     if (this.cells[i].checkSquare() === false) {
    //       endAnamorf = false;
    //     }
    //   }
    //   console.log(endAnamorf);
    // }

    this.drawMatrix();
  }

  drawMatrix() {
    // for (let i = 0; i < this.lines_w.length; i += 1) {
    //   this.lines_w[i].update();
    // }
    // for (let i = 0; i < this.lines_h.length; i += 1) {
    //   this.lines_h[i].update();
    // }
    this.drawPoly();
  }

  drawPoly() {
    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].drawPoly();
    }
  }
}
