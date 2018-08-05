// import { Graphics } from 'pixi.js'
import PubSub from './pubSub'
import SettingsModel from '../../models/settingsModel'

export default class Point {
  constructor(props) {

    this.settingsModel = new SettingsModel();
    this.pubSub = new PubSub();

    this.props = {
      f: { x: 0, y: 0 }
    };

    if ('name' in props) {
      this.props.pos = props.pos;
      this.props.name = props.name;
      this.createTextureFrom();
    } else {
      this.props.pos = { x: props.x, y: props.y };
      this.props.name = props.y + '_' + props.x;
      this.createTexture();
    }

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

  toText() {
    let state = {
      name: this.props.name,
      pos: { x: this.pointTexture.x, y: this.pointTexture.y }
    };
    return state;
  }

  createTextureFrom() {
    // this.pointTexture = new Graphics();
    // this.pointTexture.beginFill(0x9966FF);
    // this.pointTexture.drawCircle(0, 0, 2);
    // this.pointTexture.endFill();
    this.pointTexture = {};
    this.pointTexture.x = this.props.pos.x;
    this.pointTexture.y = this.props.pos.y;
  }
  createTexture() {
    // this.pointTexture = new Graphics();
    // this.pointTexture.beginFill(0x9966FF);
    // this.pointTexture.drawCircle(0, 0, 2);
    // this.pointTexture.endFill();
    this.pointTexture = {};
    this.pointTexture.x = this.settingsModel.getIndent() + this.props.pos.x * this.settingsModel.getScale();
    this.pointTexture.y = this.settingsModel.getIndent() + this.props.pos.y * this.settingsModel.getScale();
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
    this.pointTexture.x = this.settingsModel.getIndent() + this.props.pos.x * this.settingsModel.getScale();
    this.pointTexture.y = this.settingsModel.getIndent() + this.props.pos.y * this.settingsModel.getScale();
  }
}
