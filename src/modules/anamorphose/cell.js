import { COUNT_VERTEX } from '../../constants/index'
import PubSub from './pubSub'
import Vector from './vector'
import Point from './point'
import { Graphics, utils } from 'pixi.js'
import SettingsModel from '../../models/settingsModel'


export default class Cell {
  constructor(props) {

    this.settingsModel = new SettingsModel();
    this.pubSub = new PubSub();

    this.props = {
      active: 0,
      pos: { x: props.pos.x, y: props.pos.y },
      points: [],
      centerMass: { x: 0, y: 0 },
      squares: [],
      squareAns: [],
      radCircles: [],
      radCircleAns: [],
      values: [],
      radInter: 1,
      countVertex: (this.settingsModel.getCountMiddleVertex() + 1) * COUNT_VERTEX
    };

    this.props.values[this.props.active] = props.value;

    if ('name' in props) {
      this.props.name = props.name;
      for (let i = 0; i < props.points.length; i += 1) {
        let p = this.pubSub.publish('checkPoint', props.points[i].name);
        console.log(p);
        if (p !== false) {
          this.props.points.push(p);
        } else {
          let point = new Point({
            name: props.points[i].name,
            pos: props.points[i].pos
          });
          this.pubSub.publish('addPoint', point);
          this.props.points.push(point);
        }
      }
      this.create();
      this.createPoly();
      this.createLine();
    } else {
      this.props.name = props.pos.y * props.size.width + props.pos.x;
    }

    this.props.values[this.props.active] = props.value;
  }

  getCenterMass() {
    return this.props.centerMass;
  }
  getPoints() {
    return this.props.points;
  }
  getValue() {
    return this.props.values[this.props.active];
  }
  getRadius() {
    return this.props.radInter;
  }
  getRadCircle() {
    return this.props.radCircles[this.props.active];
  }
  getRadCircleAn() {
    return this.props.radCircleAns[this.props.active];
  }

  toText() {
    let points = this.props.points.map( (item) => {
      return item.toText();
    });
    let state = {
      name: this.props.name,
      pos: this.props.pos,
      values: this.props.values,
      points: points
    };
    if (this.props.region) {
      state.region = this.props.region;
    }
    return state;
  }

  addActive() {
    this.props.active += 1;
  }
  reduceActive() {
    this.props.active -= 1;
  }

  average() {
    let squareAvAn = 0;
    let valueAv = 0;
    this.props.active = this.props.squares.length;

    for (let i = 0; i < this.props.squareAns.length; i += 1) {
      this.props.squares[this.props.active] = this.props.squares[0];
      squareAvAn += this.props.squareAns[i];
      valueAv += this.props.values[i];
    }
    squareAvAn /= this.props.squareAns.length;
    valueAv /= this.props.squareAns.length;
    this.props.squares[this.props.active] = this.props.squares[0];
    this.props.squareAns[this.props.active] = squareAvAn;
    this.props.values[this.props.active] = valueAv;
    this.calcRadiusCircle();
    this.props.radCircleAns[this.props.active] = Math.round(Math.pow(this.props.squareAns[this.props.active] / Math.PI, 0.5) * 100) / 100;
    // console.log(this.props.squares, this.props.squareAns, this.props.radCircles, this.props.radCircleAns);
  }

  setValue(value) {
    this.props.values[this.props.active] = value;
    this.calcCenterMass();
    this.calcSquare();
    this.calcRadiusCircle();
    this.calcRadiusCircleAnamorf();
  }

  addPoints() {
    let step = Math.ceil((1 / (this.settingsModel.getCountMiddleVertex() + 1)) * 100) / 100;
    let x = this.props.pos.x;
    let y = this.props.pos.y;
    this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + (x + 1)));
    for(let i = this.settingsModel.getCountMiddleVertex(); i > 0; i -= 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + Math.round((x + i * step) * 100) / 100));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', y + '_' + x));
    for(let i = 1; i < this.settingsModel.getCountMiddleVertex() + 1; i += 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', Math.round((y + i * step) * 100) / 100 + '_' + x));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + x));
    for(let i = 1; i < this.settingsModel.getCountMiddleVertex() + 1; i += 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + Math.round((x + i * step) * 100) / 100));
    }
    this.props.points.push(this.pubSub.publish('checkPoint', (y + 1) + '_' + (x + 1)));
    for(let i = this.settingsModel.getCountMiddleVertex(); i > 0; i -= 1) {
      this.props.points.push(this.pubSub.publish('checkPoint', Math.round((y + i * step) * 100) / 100  + '_' + (x + 1)));
    }

    this.create();
    this.createPoly();
    this.createLine();
  }
  addPoint(point) {
    this.props.points.push(point);
  }

  create() {
    this.calcCenterMass();
    this.calcSquare();
    this.calcRadiusCircle();
    this.calcRadiusCircleAnamorf();
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
    if (Math.abs((this.props.squares[this.props.active] - this.props.squareAns[this.props.active]) / this.props.squareAns[this.props.active]) < this.settingsModel.getAccuracy()) {
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
  }
  calcRadiusCircleAnamorf() {
    this.props.radCircleAns[this.props.active] = Math.round(Math.pow(this.props.squares[this.props.active] * this.props.values[this.props.active] / (Math.PI * this.pubSub.publish('getAverage')), 0.5) * 100) / 100;
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
    if (vector.getLength() <= this.props.radCircles[this.props.active]) {
      strength = vector.getLength() * (this.props.radCircleAns[this.props.active] / this.props.radCircles[this.props.active] - 1);
    } else if (vector.getLength() > this.props.radCircles[this.props.active]) {
      strength = Math.pow(Math.abs(Math.pow(vector.getLength(), 2) + Math.pow(this.props.radCircleAns[this.props.active], 2) - Math.pow(this.props.radCircles[this.props.active], 2)), 0.5) - vector.getLength();
    }

    // if (vector.getLength() <= this.props.radCircles[this.props.active]) {
    //   strength = Math.pow(vector.getLength(), 1.5) * (this.props.radCircleAns[this.props.active] / this.props.radCircles[this.props.active] - 1);
    // } else if (vector.getLength() > this.props.radCircles[this.props.active]) {
    //   strength = Math.pow(Math.abs(Math.pow(vector.getLength(), 3) + Math.pow(this.props.radCircleAns[this.props.active], 2) - Math.pow(this.props.radCircles[this.props.active], 2)), 0.5) - Math.pow(vector.getLength(), 1.5);
    // }

    vector.resize(strength);
    let vect = vector.getVector();
    return vect;
  }

  createPoly() {
    let self = this;
    this.poly = new Graphics();

    // let color = this.props.values[this.props.active] / 12;
    // this.poly.beginFill(utils.rgb2hex([color, color, color]));
    // this.poly.alpha = 1;
    // if (this.props.values[this.props.active] > this.pubSub.publish('getAverage')) {
    //   let color = this.props.values[this.props.active] / 12 * 255;
    //   this.poly.beginFill('#' + (color).toString(16) + (color).toString(16) + (color).toString(16));
    //   this.poly.alpha = 1;
    // } else {
    //   let color = this.props.values[this.props.active] / 12 * 255;
    //   this.poly.beginFill('#' + (155).toString(16) + (102).toString(16) + (102).toString(16));
    //   this.poly.alpha = 1;
    // }
    // this.poly.beginFill(utils.rgb2hex([255, 255, 255]));

    this.poly.beginFill(0xFFFFFF);
    let pointsPoly = [];
    for (let i = 0; i < this.props.points.length; i += 1) {
      pointsPoly.push(this.props.points[i].getPosTexture().x);
      pointsPoly.push(this.props.points[i].getPosTexture().y);
    }

    this.poly.drawPolygon(pointsPoly);
    this.poly.endFill();

    this.poly.interactive = true;
    this.poly.buttonMode = true;
    this.poly.click = () => {
      self.pubSub.publish('setCellValue', {
        state: true,
        value: self.props.values[self.props.active],
        name: self.props.name
      });
    };
    // this.poly.mouseover = function() {
    //   self.pubSub.publish('setCellValue', {
    //     state: true,
    //     value: self.props.values[self.props.active]
    //   });
    // };
    // this.poly.mouseout = function() {
    //   self.pubSub.publish('setCellValue', {
    //     state: false,
    //     value: self.props.values[self.props.active]
    //   });
    // };


    this.displayObj = {
      parent: 'none',
      texture: this.poly,
      name: this.props.name
    };

    this.pubSub.publish('addTexture', this.displayObj);
  }

  drawPoly() {
    this.poly.clear();

    if (this.settingsModel.getColor() === 'white') {
      this.poly.beginFill(0xFFFFFF);
      let pointsPoly = [];
      for (let i = 0; i < this.props.points.length; i += 1) {
        pointsPoly.push(this.props.points[i].getPosTexture().x);
        pointsPoly.push(this.props.points[i].getPosTexture().y);
      }
      this.poly.drawPolygon(pointsPoly);
      this.poly.endFill();
    } else if (this.settingsModel.getColor() === 'blue-red') {
      // let min = this.pubSub.publish('getMin');
      // let max = this.pubSub.publish('getMax');
      if (this.props.values[this.props.active] < this.pubSub.publish('getAverage')) {
        let color = 1.0;
        // let color = 0.54 * this.props.values[this.props.active] / min;
        this.poly.beginFill(utils.rgb2hex([color, 0, 0]));
      } else {
        let color = 1.0;
        // let color = 0.54 * max / this.props.values[this.props.active];
        this.poly.beginFill(utils.rgb2hex([0, 0, color]));
      }
      let pointsPoly = [];
      for (let i = 0; i < this.props.points.length; i += 1) {
        pointsPoly.push(this.props.points[i].getPosTexture().x);
        pointsPoly.push(this.props.points[i].getPosTexture().y);
      }
      this.poly.drawPolygon(pointsPoly);
      this.poly.endFill();
    } else if (this.settingsModel.getColor() === 'white-black') {
      let min = this.pubSub.publish('getMin');
      let max = this.pubSub.publish('getMax');
      let color = (this.props.values[this.props.active] - min) / (max - min);
      this.poly.beginFill(utils.rgb2hex([color, color, color]));
      let pointsPoly = [];
      for (let i = 0; i < this.props.points.length; i += 1) {
        pointsPoly.push(this.props.points[i].getPosTexture().x);
        pointsPoly.push(this.props.points[i].getPosTexture().y);
      }
      this.poly.drawPolygon(pointsPoly);
      this.poly.endFill();
    }

    // let color = parseInt(this.props.values[this.props.active] / 12.0 * 255);
    // console.log(color);
    // this.poly.beginFill('#' + (color).toString(16) + (color).toString(16) + (color).toString(16));
    // let color = this.props.values[this.props.active] / 12;
    // this.poly.beginFill(utils.rgb2hex([color, color, color]));
    // this.poly.alpha = 1;
    // if (this.props.values[this.props.active] > this.pubSub.publish('getAverage')) {
    //   this.poly.beginFill(0xFFFFFF);
    // } else {
    //   this.poly.beginFill(0x000000);
    // }
    // this.poly.beginFill(utils.rgb2hex([1, 1, 1]))

  }

  createLine() {
    this.line = new Graphics();

    this.line.lineStyle(2, 0x212121, 1);
    this.line.moveTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);
    for (let i = 1; i < this.props.points.length; i += 1) {
      this.line.lineTo(this.props.points[i].getPosTexture().x, this.props.points[i].getPosTexture().y);
    }
    this.line.lineTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);

    this.line.x = 0;
    this.line.y = 0;

    this.displayObjLine = {
      parent: 'none',
      texture: this.line,
      name: this.props.name + 'l'
    };

    this.pubSub.publish('addTexture', this.displayObjLine);
  }

  drawLine() {
    this.line.clear();

    if (this.settingsModel.getGrid()) {
      this.line.lineStyle(2, 0x212121, 1);
      this.line.moveTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);
      for (let i = 1; i < this.props.points.length; i += 1) {
        this.line.lineTo(this.props.points[i].getPosTexture().x, this.props.points[i].getPosTexture().y);
      }
      this.line.lineTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);
    }
  }
}
