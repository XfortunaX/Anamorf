import PubSub from './pubSub'

export default class Vector {
  constructor(points) {
    this.props = {
      p1: points.p1,
      p2: points.p2,
      vector: { x: 0, y: 0 },
      normVector: { x: 0, y: 0},
      length: 0
    };

    this.pubSub = new PubSub();

    this.calcVector();
    this.norm();
  }

  getLength() {
    return this.props.length;
  }

  getNormVector() {
    return this.props.normVector;
  }

  getVector() {
    return this.props.vector;
  }

  calcVector() {
    // console.log(this.props);
    this.props.vector = {
      x: this.props.p2.x - this.props.p1.x,
      y: this.props.p2.y - this.props.p1.y
    };
    this.props.length = Math.pow(Math.pow(this.props.vector.x, 2) + Math.pow(this.props.vector.y, 2), 0.5);
  }

  norm() {
    this.props.normVector.x = this.props.vector.x / this.props.length;
    this.props.normVector.y = this.props.vector.y / this.props.length;
  }

  resize(koef) {
    this.props.vector.x = this.props.normVector.x * koef;
    this.props.vector.y = this.props.normVector.y * koef;
  }
}
