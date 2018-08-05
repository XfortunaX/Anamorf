import { SCALE, INDENT, ACCURACY, COUNT_MIDDLE_VERTEX } from '../constants/index'

export default class SettingsModel {

  constructor() {
    if (SettingsModel.instance) {
      return SettingsModel.instance;
    }
    this.props = {
      scale: SCALE,
      indent: INDENT,
      accuracy: ACCURACY,
      countMiddleVertex: COUNT_MIDDLE_VERTEX,
      heightImage: 10,
      widthImage: 10,
      distanceHeight: 1,
      distanceWidth: 1,
      grid: true,
      color: 'white',
      takeColor: false
    };

    SettingsModel.instance = this;
  }

  setScale(scale) {
    this.props.scale = scale;
  }
  setIndent(indent) {
    this.props.indent = indent;
  }
  setAccuracy(accuracy) {
    this.props.accuracy = accuracy;
  }
  setCountMiddleVertex(countMiddleVertex) {
    this.props.countMiddleVertex = parseInt(countMiddleVertex);
  }
  setHeight(height) {
    this.props.heightImage = height;
  }
  setWidth(width) {
    this.props.widthImage = width;
  }
  setDistanceHeight(distHeight) {
    this.props.distanceHeight = distHeight;
  }
  setDistanceWidth(distWidth) {
    this.props.distanceWidth = distWidth;
  }
  setGrid(grid) {
    this.props.grid = grid;
  }
  setColor(color) {
    this.props.color = color;
  }
  setTakeColor(takeColor) {
    this.props.takeColor = takeColor;
  }

  getScale() {
    return this.props.scale;
  }
  getIndent(){
    return this.props.indent;
  }
  getAccuracy() {
    return this.props.accuracy;
  }
  getCountMiddleVertex() {
    return this.props.countMiddleVertex;
  }
  getHeight() {
    return this.props.heightImage;
  }
  getWidth() {
    return this.props.widthImage;
  }
  getDistanceHeight() {
    return this.props.distanceHeight;
  }
  getDistanceWidth() {
    return this.props.distanceWidth;
  }
  getGrid() {
    return this.props.grid;
  }
  getColor() {
    return this.props.color;
  }
  getTakeColor() {
    return this.props.takeColor;
  }

  reset() {
    this.props = {
      scale: SCALE,
      indent: INDENT,
      accuracy: ACCURACY,
      countMiddleVertex: COUNT_MIDDLE_VERTEX,
      heightImage: 10,
      widthImage: 10,
      distanceHeight: 1,
      distanceWidth: 1,
      grid: true,
      color: 'white',
      takeColor: false
    };
  }
}
