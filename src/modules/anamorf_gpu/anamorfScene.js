import { Container } from 'pixi.js'
import PubSub from './pubSub'

export default class AnamorfScene {
  constructor() {
    this.pubSub = new PubSub();

    this.stage = new Container();
    this.drawObjects = {};

    this.pubSub.subscribe('addTexture', this.addTexture, this);
    this.pubSub.subscribe('removeTexture', this.removeTexture, this);
    this.pubSub.subscribe('getChild', this.getChild, this);
  }

  getStage() {
    return this.stage;
  }

  addTexture(displayObj) {
    this.stage.addChild(displayObj.texture);

    // if (displayObj.parent === 'none') {
    //   this.stage.addChild(displayObj.texture);
    //   this.drawObjects[displayObj.name] = displayObj.texture;
    // } else {
    //   this.drawObjects[displayObj.parent].addChild(displayObj.texture);
    // }
  }

  removeTexture(displayObj) {
    if (displayObj.parent === 'none') {
      this.stage.removeChild(displayObj.texture);
      delete this.drawObjects[displayObj.name];
    } else {
      this.drawObjects[displayObj.parent].removeChild(displayObj.texture);
    }
  }

  clear() {
    this.drawObjects = {};
    while (this.stage.children[0]) {
      this.stage.removeChild(this.stage.children[0]);
    }
  }

  getChild() {
    console.log(this.drawObjects);
  }
}