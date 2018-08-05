// import { Graphics } from 'pixi.js'
import PubSub from './pubSub'
import { SCALE, INDENT } from '../../constants/index'

export default class Point {
  constructor(pos) {
    this.props = {
      pos: { x: pos.x, y: pos.y },
      name: pos.y + '_' + pos.x,
      f: { x: 0, y: 0 }
    };

    if ('name' in pos) {
      this.props.name = pos.name;
    }

    this.pubSub = new PubSub();
    this.createTexture();
    // this.createDisplayObj();
    // this.addTexture();
  }

  getPosTexture() {
    return {
      x: this.pointTexture.x,
      y: this.pointTexture.y
    };
  }
  getName() {
    return this.props.name;
  }

  createTexture() {
    // this.pointTexture = new Graphics();
    // this.pointTexture.beginFill(0x9966FF);
    // this.pointTexture.drawCircle(0, 0, 2);
    // this.pointTexture.endFill();
    this.pointTexture = {};
    this.pointTexture.x = INDENT + this.props.pos.x * SCALE;
    this.pointTexture.y = INDENT + this.props.pos.y * SCALE;
  }
  createDisplayObj() {
    this.displayObj = {
      parent: 'none',
      texture: this.pointTexture,
      name: this.props.name
    };
  }
  addTexture() {
    this.pubSub.publish('addTexture', this.displayObj);
  }

  setPos(x, y) {
    this.pointTexture.x = x;
    this.pointTexture.y = y;
  }

  changeVector(vect) {
    this.props.f.x += vect.x;
    this.props.f.y += vect.y;
  }

  changePos() {
    this.pointTexture.x += this.props.f.x / 5;
    this.pointTexture.y += this.props.f.y / 5;
    this.props.f.x = 0;
    this.props.f.y = 0;
  }

  drop() {
    this.pointTexture.x = INDENT + this.props.pos.x * SCALE;
    this.pointTexture.y = INDENT + this.props.pos.y * SCALE;
  }
}
