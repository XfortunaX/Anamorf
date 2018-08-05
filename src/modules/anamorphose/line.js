import { Graphics } from 'pixi.js'
import PubSub from './pubSub'

export default class Line {
  constructor(props) {
    this.props = {
      name: props.num + '_' + props.type,
      type: props.type,
      points: []
    };

    this.pubSub = new PubSub();
  }

  addPoint(point) {
    this.props.points.push(point);
  }
  show() {
    console.log(this.props.points);
  }

  create() {
    this.createTexture();
    this.createDisplayObj();
    this.addTexture();
  }
  check(name) {
    if (name === this.props.name) {
      return true;
    }
    return false;
  }

  createTexture() {
    this.line = new Graphics();
    this.line.lineStyle(1, 0x9966FF, 1);
    this.line.moveTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);

    for (let i = 1; i < this.props.points.length; i += 1) {
      this.line.lineTo(this.props.points[i].getPosTexture().x, this.props.points[i].getPosTexture().y);
    }

    this.line.x = 0;
    this.line.y = 0;
  }
  createDisplayObj() {
    this.displayObj = {
      parent: 'none',
      texture: this.line,
      name: this.props.name
    };
  }
  addTexture() {
    this.pubSub.publish('addTexture', this.displayObj);
  }

  update() {
    this.line.clear();
    this.line.lineStyle(1, 0x9966FF, 1);
    this.line.moveTo(this.props.points[0].getPosTexture().x, this.props.points[0].getPosTexture().y);

    for (let i = 1; i < this.props.points.length; i += 1) {
      this.line.lineTo(this.props.points[i].getPosTexture().x, this.props.points[i].getPosTexture().y);
    }

    this.line.x = 0;
    this.line.y = 0;
  }
}
