import React, { Component } from 'react'
import PubSub from '../../../modules/anamorphose/pubSub'
import ImageModel from '../../../models/imageModel'
import MatrixModel from '../../../models/matrixModel'
import SettingsModel from '../../../models/settingsModel'


export default class Image extends Component {
  constructor() {
    super();

    this.imageModel = new ImageModel();
    this.matrixModel = new MatrixModel();
    this.settingsModel = new SettingsModel();
    this.pubSub = new PubSub();

    this.createMatrix = this.createMatrix.bind(this);
    this.drawMatrix = this.drawMatrix.bind(this);
    this.addEvent = this.addEvent.bind(this);

    this.pubSub.subscribe('createMatrix', this.createMatrix, this);
    this.pubSub.subscribe('drawMatrix', this.drawMatrix, this);
  }
  componentDidMount() {
    let canvas = document.getElementsByClassName('canv')[0];
    canvas.width = this.imageModel.getData().size.width;
    canvas.height = this.imageModel.getData().size.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(this.imageModel.getData().srcImage, 0, 0);
    this.addEvent();
  }
  componentWillUnmount() {
    this.pubSub.remove('createMatrix');
    this.pubSub.remove('drawMatrix');
  }
  addEvent() {
    let self = this;
    let canvas = document.getElementsByClassName('canv')[0];
    let im = document.getElementsByClassName('image')[0];
    canvas.addEventListener('click', (event) => {
      let pos = {
        x: event.pageX - canvas.offsetLeft + Math.floor(im.scrollLeft),
        y: event.pageY - canvas.offsetTop + Math.floor(im.scrollTop)
      };
      if (!this.settingsModel.getTakeColor()) {
        console.log(pos);
        self.matrixModel.setPos(pos);
        self.drawMatrix();
      } else {
        let canvas = document.getElementsByClassName('canv')[0];
        let ctx = canvas.getContext('2d');
        let color = ctx.getImageData(pos.x, pos.y, 1, 1);
        console.log('color', color);
      }
    })
  }
  drawMatrix() {
    let canvas = document.getElementsByClassName('canv')[0];
    let ctx = canvas.getContext('2d');
    let pos = this.matrixModel.getData().pos;
    ctx.strokeStyle = '#000000';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.imageModel.getData().srcImage, 0, 0);

    if (this.settingsModel.getDistanceWidth() > 7 || this.settingsModel.getDistanceHeight() > 7) {
      ctx.lineWidth = 3;
      for (let i = 0; i < this.settingsModel.getHeight(); i += 1) {
        for (let j = 0; j < this.settingsModel.getWidth(); j += 1) {
          ctx.beginPath();
          ctx.arc(
            pos.x + j * this.settingsModel.getDistanceWidth(),
            pos.y + i * this.settingsModel.getDistanceHeight(),
            1, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    } else {
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        pos.x, pos.y,
        this.settingsModel.getDistanceWidth() * this.settingsModel.getWidth(),
        this.settingsModel.getDistanceHeight() * this.settingsModel.getHeight()
      );
      ctx.stroke();
    }

  }
  createMatrix() {
    let canvas = document.getElementsByClassName('canv')[0];
    let ctx = canvas.getContext('2d');
    let pos = this.matrixModel.getData().pos;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.imageModel.getData().srcImage, 0, 0);
    let data = {};
    let imData = '';

    this.matrixModel.reset({
      width: this.settingsModel.getWidth(),
      height: this.settingsModel.getHeight()
    });

    for (let i = 0; i < this.settingsModel.getHeight(); i += 1) {
      for (let j = 0; j < this.settingsModel.getWidth(); j += 1) {
        imData = ctx.getImageData(
          pos.x + this.settingsModel.getDistanceWidth() * j,
          pos.y + this.settingsModel.getDistanceHeight() * i,
          1, 1
        );

        data = {
          x: j,
          y: i,
          color: {
            r: imData.data[0],
            g: imData.data[1],
            b: imData.data[2],
            t: imData.data[3]
          }
        };
        this.matrixModel.setMatrix(data);
      }
    }

    this.drawMatrix();
  }
  render() {
    return (
      <div className='image' style={styles.image}>
        <canvas className='canv' style={{padding: 0}}>
        </canvas>
      </div>
    );
  }
}

const styles = {
  image: {
    maxHeight: '74vh',
    overflowY: 'auto',
    overflowX: 'auto',
    maxWidth: 'calc(100% - 10px)',
    marginTop: 20,
    display: 'inline-block'
  }
};
