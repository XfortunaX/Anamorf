import { COUNT_VERTEX, ACCURACY, COUNT_MIDDLE_VERTEX, RADIUS_INTERACTION, SCALE } from '../../constants/index'
import PubSub from './pubSub'
import Vector from './vector'
import { Graphics } from 'pixi.js'

export default class Cell {
  constructor(props) {
    this.props = {
      active: 0,
      pos: { x: props.pos.x, y: props.pos.y },
      name: props.pos.y * props.size.width + props.pos.x,
      points: [],
      pointsInteraciton: {},
      centerMass: { x: 0, y: 0 },
      squares: [],
      squareAns: [],
      radCircles: [],
      radCircleAns: [],
      values: [],
      countVertex: (COUNT_MIDDLE_VERTEX + 1) * COUNT_VERTEX
    };

    this.props.values[this.props.active] = props.value;

    this.pubSub = new PubSub();
  }

  getCenterMass() {
    return this.props.centerMass;
  }
  getPoints() {
    return this.props.points;
  }
  getPointsInteraction() {
    return this.props.pointsInteraciton;
  }
  getValue() {
    return this.props.values[this.props.active];
  }

  addActive() {
    this.props.active += 1;
  }

  reduceActive() {
    this.props.active -= 1;
  }

  average() {
    let squareAvAn = 0;
    this.props.active = this.props.squares.length;

    for (let i = 0; i < this.props.squareAns.length; i += 1) {
      this.props.squares[this.props.active] = this.props.squares[0];
      squareAvAn += this.props.squareAns[i];
    }
    squareAvAn /= this.props.squareAns.length;
    this.props.squares[this.props.active] = this.props.squares[0];
    this.props.squareAns[this.props.active] = squareAvAn;
    this.calcRadiusCircle();
    this.props.radCircleAns[this.props.active] = Math.round(Math.pow(this.props.squareAns[this.props.active] / Math.PI, 0.5) * 100) / 100;
    // console.log(this.props.squares, this.props.squareAns, this.props.radCircles, this.props.radCircleAns);
  }

  addPointInteraction(point) {
    this.props.pointsInteraciton.push(point);
  }

  checkPointInter(point) {
    if (point.getName() in this.props.pointsInteraciton) {
      return false;
    }
    return true;
  }

  setValue(value) {
    this.props.values[this.props.active] = value;
    this.calcCenterMass();
    this.calcSquare();
    this.calcRadiusCircle();
    this.calcRadiusCircleAnamorf();
    // console.log(this.props.squares[this.props.active], this.props.squareAns[this.props.active]);
  }

  addPointsInteraction(points) {
    for (let i = 0; i < points.length; i += 1) {
      if (points[i].getName() in this.props.pointsInteraciton) {
        continue;
      }
      this.props.pointsInteraciton[points[i].getName()] = points[i];
    }
  }

  checkInteraction(cm) {
    if (Math.sqrt((cm.x - this.props.centerMass.x) * (cm.x - this.props.centerMass.x) +
        (cm.y - this.props.centerMass.y) * (cm.y - this.props.centerMass.y)) < RADIUS_INTERACTION * SCALE) {
      return true;
    }
    return false;
  }

  addPoints() {
    let step = Math.ceil((1 / (COUNT_MIDDLE_VERTEX + 1)) * 100) / 100;
    let x = this.props.pos.x;
    let y = this.props.pos.y;
    this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + (x + 1)));
    for(let i = COUNT_MIDDLE_VERTEX; i > 0; i -= 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + Math.round((x + i * step) * 100) / 100));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + x));
    for(let i = 1; i < COUNT_MIDDLE_VERTEX + 1; i += 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', Math.round((y + i * step) * 100) / 100 + '_' + x));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + x));
    for(let i = 1; i < COUNT_MIDDLE_VERTEX + 1; i += 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + Math.round((x + i * step) * 100) / 100));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + (x + 1)));
    for(let i = COUNT_MIDDLE_VERTEX; i > 0; i -= 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', Math.round((y + i * step) * 100) / 100  + '_' + (x + 1)));
    }

    this.create();
    // this.createPoly();
  }

  addPoint(point) {
    this.props.points.push(point);
  }

  create() {
    this.calcCenterMass();
    this.calcSquare();
    this.calcRadiusCircle();
    this.calcRadiusCircleAnamorf();
    // console.log(this.props);
    // console.log(this.props.squares[this.props.active], this.props.squareAns[this.props.active]);
  }

  calcSquare() {
    let Sq = 0;
    for (let i = 0; i < this.props.countVertex; i += 1) {
      let pos1 = this.props.points[i].getPosTexture();
      let pos2 = this.props.points[(i + 1) % this.props.countVertex].getPosTexture();
      Sq += (pos1.x - pos2.x) * (pos1.y + pos2.y);
    }
    this.props.squares[this.props.active] = Math.round(Math.abs(Sq * 0.5) * 100) / 100;
    this.props.squareAns[this.props.active] = Math.round(this.props.squares[this.props.active] * this.props.values[this.props.active] / this.pubSub.publish('getAverage') * 100) / 100;
    // console.log(this.props.square, this.props.squareAn);
  }

  checkSquare() {
    this.calcCenterMass();
    let Sq = 0;
    for (let i = 0; i < this.props.countVertex; i += 1) {
      let pos1 = this.props.points[i].getPosTexture();
      let pos2 = this.props.points[(i + 1) % this.props.countVertex].getPosTexture();
      Sq += (pos1.x - pos2.x) * (pos1.y + pos2.y);
    }
    this.props.squares[this.props.active] = Math.abs(Sq * 0.5);
    this.calcRadiusCircle();
    if (Math.abs((this.props.squares[this.props.active] - this.props.squareAns[this.props.active]) / this.props.squareAns[this.props.active]) < ACCURACY) {
      return true;
    }
    return false;
  }

  calcCenterMass() {
    let cmx = 0;
    let cmy = 0;
    for (let i = 0; i < this.props.countVertex; i += 1) {
      let pos = this.props.points[i].getPosTexture();
      cmx += pos.x;
      cmy += pos.y;
    }

    this.props.centerMass = {
      x: cmx / this.props.countVertex,
      y: cmy / this.props.countVertex
    };
  }
  calcRadiusCircle() {
    this.props.radCircles[this.props.active] = Math.round(Math.pow(this.props.squares[this.props.active] / Math.PI, 0.5) * 100) / 100;
    // console.log(this.props.radCircle);
  }
  calcRadiusCircleAnamorf() {
    this.props.radCircleAns[this.props.active] = Math.round(Math.pow(this.props.squares[this.props.active] * this.props.values[this.props.active] / (Math.PI * this.pubSub.publish('getAverage')), 0.5) * 100) / 100;
    // console.log(this.props.radCircleAn);
  }

  calcInteraction(point) {
    let vector = new Vector({
      p1: this.props.centerMass,
      p2: point.getPosTexture()
    });
    let strength = 0;

    // if (vector.getLength() <= this.props.radCircles[this.props.active]) {
    //   strength = vector.getLength() * (this.props.radCircleAns[this.props.active] / this.props.radCircles[this.props.active] - 1);
    // } else if (vector.getLength() > this.props.radCircles[this.props.active]) {
    //   strength = Math.pow(Math.abs(Math.pow(vector.getLength(), 2) + Math.pow(this.props.radCircleAns[this.props.active], 2) - Math.pow(this.props.radCircles[this.props.active], 2)), 0.5) - vector.getLength();
    // }

    //
    // if (vector.getLength() <= this.props.radCircles[this.props.active]) {
    //   strength = vector.getLength() * (this.props.radCircleAns[this.props.active] / this.props.radCircles[this.props.active] - 1);
    // } else if (vector.getLength() > this.props.radCircles[this.props.active]) {
    //   strength = Math.pow(Math.abs(Math.pow(vector.getLength(), 2) + Math.pow(this.props.radCircleAns[this.props.active], 2) - Math.pow(this.props.radCircles[this.props.active], 2)), 0.5) - vector.getLength();
    // }


    if (vector.getLength() <= this.props.radCircles[this.props.active]) {
      strength = Math.pow(vector.getLength(), 1.5) * (this.props.radCircleAns[this.props.active] / this.props.radCircles[this.props.active] - 1);
    } else if (vector.getLength() > this.props.radCircles[this.props.active]) {
      strength = Math.pow(Math.abs(Math.pow(vector.getLength(), 3) + Math.pow(this.props.radCircleAns[this.props.active], 2) - Math.pow(this.props.radCircles[this.props.active], 2)), 0.5) - Math.pow(vector.getLength(), 1.5);
    }

    vector.resize(strength);
    let vect = vector.getVector();
    return vect;
  }

  createPoly() {
    this.poly = new Graphics();

    if (this.props.values[this.props.active] > this.pubSub.publish('getAverage')) {
      this.poly.beginFill(0x00FF7F);
      this.poly.alpha = 0.2;
    } else {
      this.poly.beginFill(0xFF0000);
      this.poly.alpha = 0.2;
    }

    let pointsPoly = [];
    for (let i = 0; i < this.props.points.length; i += 1) {
      pointsPoly.push(this.props.points[i].getPosTexture().x);
      pointsPoly.push(this.props.points[i].getPosTexture().y);
    }

    this.poly.drawPolygon(pointsPoly);
    this.poly.endFill();

    this.displayObj = {
      parent: 'none',
      texture: this.poly,
      name: this.props.name
    };

    this.pubSub.publish('addTexture', this.displayObj);
  }

  drawPoly() {
    this.poly.clear();

    if (this.props.values[this.props.active] > this.pubSub.publish('getAverage')) {
      this.poly.beginFill(0x00FF7F);
    } else {
      this.poly.beginFill(0xFF0000);
    }

    let pointsPoly = [];
    for (let i = 0; i < this.props.points.length; i += 1) {
      pointsPoly.push(this.props.points[i].getPosTexture().x);
      pointsPoly.push(this.props.points[i].getPosTexture().y);
    }

    this.poly.drawPolygon(pointsPoly);
    this.poly.endFill();
  }

}
