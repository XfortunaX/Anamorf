import AnamorfScene from './anamorfScene'
import Cell from './cell'
import Point from './point'
import { HEIGHT_ANAMORF, WIDTH_ANAMORF } from '../../constants/index'
import PubSub from './pubSub'
import SettingsModel from '../../models/settingsModel'
import GPU from 'gpu.js'
import fileDownload from 'js-file-download'


export default class AnamorfProcess {
  constructor(props) {
    if (AnamorfProcess.instance) {
      return AnamorfProcess.instance;
    }
    this.props = props;

    this.gpu = new GPU();

    this.anamorfScene = new AnamorfScene();
    this.settingsModel = new SettingsModel();

    this.size = {
      width: WIDTH_ANAMORF,
      height: HEIGHT_ANAMORF
    };
    this.points = {};
    this.cells = [];
    this.average = 0;
    this.min = 0;
    this.max = 0;

    this.pubSub = new PubSub();
    this.pubSub.subscribe('addPoint', this.addPoint, this);
    this.pubSub.subscribe('checkPoint', this.checkPoint, this);
    this.pubSub.subscribe('getAverage', this.getAverage, this);
    this.pubSub.subscribe('getMin', this.getMin, this);
    this.pubSub.subscribe('getMax', this.getMax, this);

    AnamorfProcess.instance = this;
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
  calcMin() {
    this.min = this.cells[0].getValue();
    for (let i = 1; i < this.cells.length; i += 1) {
      if (this.min > this.cells[i].getValue()) {
        this.min = this.cells[i].getValue();
      }
    }
  }
  calcMax() {
    this.max = this.cells[0].getValue();
    for (let i = 0; i < this.cells.length; i += 1) {
      if (this.max < this.cells[i].getValue()) {
        this.max = this.cells[i].getValue();
      }
    }
  }
  getMin() {
    return this.min;
  }
  getMax() {
    return this.max;
  }

  reset() {
    for (let p in this.points) {
      this.points[p].drop();
    }
    this.calcMax();
    this.calcMin();
    this.drawMatrix();
  }

  matrixSet(matrix) {

    // console.log(matrix);
    this.matrix = matrix;
    this.size.height = matrix.length;
    this.size.width = matrix[0].length;

    this.average = 0;

    for(let p in this.points) {
      this.points[p].drop();
    }

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.average += this.matrix[i][j];
      }
    }
    this.average /= this.size.height * this.size.width;
    this.average = Math.round(this.average * 100) / 100;

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.cells[i * this.size.width + j].setValue(this.matrix[i][j]);
      }
    }

    this.calcMin();
    this.calcMax();

    // console.log(this.cells);
    console.log('set');
  }

  setKoef(koef) {
    this.average = parseFloat(koef);
    this.cells.forEach( item => {
      item.create();
    });
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
  addActive() {
    this.cells.forEach( item => {
      item.addActive();
    });
  }
  addMatrix(matrix) {
    this.average = 0;
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.average += matrix[i][j];
      }
    }
    this.average /= this.size.height * this.size.width;
    this.average = Math.round(this.average * 100) / 100;
    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        this.cells[i * this.size.width + j].setValue(matrix[i][j]);
      }
    }
  }

  setMatrix(matrix) {
    this.points = {};
    this.cells = [];
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
    // console.log(this.average);

    let step = Math.ceil((1 / (this.settingsModel.getCountMiddleVertex() + 1)) * 100) / 100;
    // console.log(step);

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
    console.log('endcreate');

    console.log('lines_points');

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        let point = new Point({ x: j, y: i});
        this.addPoint(point);
        for (let k = step; k < 1; k += step) {
          let point_w = new Point({ x: Math.round((j + k) * 100) / 100, y: i });
          this.addPoint(point_w);
        }
        for (let k = step; k < 1; k += step) {
          let point_h = new Point({ x: j, y: Math.round((i + k) * 100) / 100 });
          this.addPoint(point_h);
        }
      }
    }

    for (let i = 0; i < this.size.width; i += 1) {
      for (let k = 0; k < 1; k += step) {
        let point_w = new Point({ x: Math.round((i + k) * 100) / 100, y: this.size.height});
        this.addPoint(point_w);
      }
    }

    for (let i = 0; i < this.size.height; i += 1) {
      for (let k = 0; k < 1; k += step) {
        let point_h = new Point({ x: this.size.width, y: Math.round((i + k) * 100) / 100});
        this.addPoint(point_h);
      }
    }

    let point = new Point({ x: this.size.width, y: this.size.height});
    this.addPoint(point);
    console.log('end_lines_points');

    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].addPoints();
    }

    console.log('endgen');

    this.calcMax();
    this.calcMin();

    this.createGPU();
  }
  createFrom(data) {
    // console.log(data);
    this.points = {};
    this.cells = [];
    this.size = data.size;
    this.settingsModel.setScale(data.scale);
    this.average = 0;
    this.anamorfScene.clear();

    for (let i = 0; i < data.cells.length; i += 1) {
      this.average += data.cells[i].values[0];
    }
    this.average /= data.cells.length;
    this.average = Math.round(this.average * 100) / 100;

    for (let i = 0; i < data.cells.length; i += 1) {
      let cell = new Cell({
        pos: data.cells[i].pos,
        value: data.cells[i].values[0],
        name: data.cells[i].name,
        points: data.cells[i].points,
        region: data.cells[i].region
      });
      this.cells.push(cell);
    }

    this.createGPU();

    this.pubSub.publish('resize');
    // console.log(this.cells, this.points);
    this.calcMin();
    this.calcMax();
  }

  createGPU() {
    let len = Object.keys(this.points).length;
    let numCell = this.cells.length;

    this.testGPUX = this.gpu.createKernel(function(p, cm) {
      let pN = p[this.thread.x][0];
      let str = 0;
      let l = 0;

      let vectorX = 0;
      let vectX = 0; let vectY = 0;

      for (let i1 = 0; i1 < this.constants.numCell; i1 += 1) {
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
      // pN += vectorX;
      pN += vectorX / 5;

      return pN;
    }, {
      constants: { numCell: numCell },
      output: [len]
    });

    this.testGPUY = this.gpu.createKernel(function(p, cm) {
      let pN = p[this.thread.x][1];
      let str = 0;
      let l = 0;

      let vectorY = 0;
      let vectX = 0; let vectY = 0;

      for (let i1 = 0; i1 < this.constants.numCell; i1 += 1) {
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
      // pN += vectorY;
      pN += vectorY / 5;

      return pN;
    }, {
      constants: { numCell: numCell },
      output: [len]
    });
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
      dataGPU.points[i][2] = parseFloat(name[0]);
      dataGPU.points[i][3] = parseFloat(name[1]);
      i += 1;
    }

    for (let j = 0; j < this.cells.length; j += 1) {
      dataGPU.centerMass[j] = [];
      dataGPU.centerMass[j][0] = this.cells[j].getCenterMass().x;
      dataGPU.centerMass[j][1] = this.cells[j].getCenterMass().y;
      dataGPU.centerMass[j][2] = this.cells[j].getRadCircle();
      dataGPU.centerMass[j][3] = this.cells[j].getRadCircleAn();
    }
    return dataGPU;
  }
  setDataGPU(pointsX, pointsY) {
    let i = 0;
    for (let p in this.points) {
      this.points[p].setPos(pointsX[i], pointsY[i]);
      i += 1;
    }
  }

  calcAnamorf() {
    let endAnamorf = false;

    for (let s = 0; s < 100 && endAnamorf === false; s += 1) {
      let gpu = this.genDataGPU();

      const startGPU = window.performance.now();
      const tGPUX = this.testGPUX(gpu.points, gpu.centerMass);
      const tGPUY = this.testGPUY(gpu.points, gpu.centerMass);
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

    this.drawMatrix();
    return endAnamorf;
  }
  calcAnamorfStep(step) {

    let endAnamorf = false;

    // let rad = 150;
    // let cs = this.cells;
    // let points = this.points;

    // this.testGPU();
    // const startCPU = window.performance.now();
    // for (let c in this.cells) {
    //   for (let p in points) {
    //     points[p].changeVector(this.cells[c].calcInteraction(points[p]));
    //   }
    // }

    // for (let point in this.points) {
    //   this.points[point].changePos();
    // }

    // for (let s = 0; s < step; s += 1) {
    //
    //   for (let i = 0; i < this.size.height; i += 1) {
    //     for (let j = 0; j < this.size.width; j += 1) {
    //       for (let n in this.points) {
    //         this.points[n].changeVector(this.cells[i * this.size.width + j].calcInteraction(this.points[n]));
    //       }
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
    // const endCPU = window.performance.now();
    // const cpuTime = endCPU - startCPU;
    // console.log(`CPU: ${cpuTime}ms`);




    const startGPU = window.performance.now();

    for (let s = 0; s < step && endAnamorf === false; s += 1) {

      let gpu = this.genDataGPU();

      // const startGPU = window.performance.now();
      let tGPUX = this.testGPUX(gpu.points, gpu.centerMass);
      // console.log(tGPUX);
      const tGPUY = this.testGPUY(gpu.points, gpu.centerMass);
      // console.log(tGPUY);
      // let tGPU = this.testGPU(gpu.points, gpu.centerMass);
      // console.log(tGPU);
      // const endGPU = window.performance.now();
      // const gpuTime = endGPU - startGPU;
      // console.log(`GPU: ${gpuTime}ms`);

      this.setDataGPU(tGPUX, tGPUY);
      endAnamorf = true;
      for (let i = 0; i < this.cells.length; i += 1) {
        if (this.cells[i].checkSquare() === false) {
          endAnamorf = false;
        }
      }
      console.log(endAnamorf);
    }
    const endGPU = window.performance.now();
    const gpuTime = endGPU - startGPU;
    console.log(`GPU: ${gpuTime}ms`);

    this.drawMatrix();
    return endAnamorf;
  }


  save() {
    let cells = [];
    for (let i = 0; i < this.cells.length; i += 1) {
      cells.push(this.cells[i].toText())
    }
    let points = [];
    for (let p in  this.points) {
      points.push(this.points[p].toText())
    }
    let anamorf = {
      size: this.pubSub.publish('getSize'),
      scale: this.settingsModel.getScale(),
      cells: cells,
      points: points
    };
    fileDownload(JSON.stringify(anamorf), 'anamorf.json');
  }

  drawMatrix() {
    this.drawPoly();
  }
  drawPoly() {
    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].drawPoly();
      this.cells[i].drawLine();
    }
  }
}
