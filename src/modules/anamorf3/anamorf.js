import AnamorfScene from './anamorfScene'
import Cell from './cell'
import Point from './point'
import Line from './line'
import { HEIGHT_ANAMORF, WIDTH_ANAMORF, COUNT_MIDDLE_VERTEX } from '../../constants/index'
import PubSub from './pubSub'

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

    for (let i = 0; i < this.size.height + 1; i += 1) {
      // this.lines_w[i].show();
      this.lines_w[i].create();
    }
    for (let i = 0; i < this.size.width + 1; i += 1) {
      // this.lines_h[i].show();
      this.lines_h[i].create();
    }

    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].addPoints();
    }

    // console.log(this.cells);

    console.log('create_points_inter');

    for (let i = 0; i < this.size.height; i += 1) {
      for (let j = 0; j < this.size.width; j += 1) {
        let rad = Math.ceil(this.cells[i * this.size.width + j].getValue() / this.average) * 7;
        // let rad = RADIUS_INTERACTION;
        for (let i1 = i - rad; i1 < i + rad + 1; i1 += 1) {
          for (let j1 = j - rad; j1 < j + rad + 1; j1 += 1) {
            if (i1 > -1 && i1 < this.size.height && j1 > -1 && j1 < this.size.width) {
              this.cells[i * this.size.width + j].addPointsInteraction(
                this.cells[i1 * this.size.width + j1].getPoints());
            }
          }
        }
      }
      if (i % 10 === 0) {
        console.log(i / 10);
      }
    }

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
  }

  calcAnamorf() {
    let endAnamorf = false;
    for (let s = 0; s < 100 && endAnamorf === false; s += 1) {
      for (let i = 0; i < this.cells.length; i += 1) {
        let ps = this.cells[i].getPointsInteraction();
        for (let n in ps) {
          ps[n].changeVector(this.cells[i].calcInteraction(ps[n]));
        }
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

  calcAnamorfStep(step) {
    for (let s = 0; s < step; s += 1) {
      for (let i = 0; i < this.cells.length; i += 1) {
        let ps = this.cells[i].getPointsInteraction();
        for (let n in ps) {
          ps[n].changeVector(this.cells[i].calcInteraction(ps[n]));
        }
      }

      for (let point in this.points) {
        this.points[point].changePos();
      }

      let endAnamorf = true;
      for (let i = 0; i < this.cells.length; i += 1) {
        if (this.cells[i].checkSquare() === false) {
          endAnamorf = false;
        }
      }
      console.log(endAnamorf);
    }

    this.drawMatrix();
  }

  drawMatrix() {
    for (let i = 0; i < this.lines_w.length; i += 1) {
      this.lines_w[i].update();
    }
    for (let i = 0; i < this.lines_h.length; i += 1) {
      this.lines_h[i].update();
    }
    // this.drawPoly();
  }

  drawPoly() {
    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i].drawPoly();
    }
  }
}
