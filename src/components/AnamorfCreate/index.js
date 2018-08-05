import React, { Component } from 'react'
import { Link } from 'react-router'
import './styles.scss'
import ImageModel from '../../models/imageModel'
import MatrixModel from '../../models/matrixModel'
import Dropzone from 'react-dropzone'

export default class AnamorfCreate extends Component {
  constructor() {
    super();
    this.state = {
      imageLoaded: false,
      image: new ImageModel(),
      matrix: new MatrixModel(),
      files: [],
      k: 1
    };
    this.inputs = {};
    this.handleChange = this.handleChange.bind(this);
    this.handleClickSaveR = this.handleClickSaveR.bind(this);
    this.handleClickSaveG = this.handleClickSaveG.bind(this);
    this.handleClickSaveB = this.handleClickSaveB.bind(this);
    this.drawMatrix = this.drawMatrix.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickNorm = this.handleClickNorm.bind(this);
    this.handleClickInvert = this.handleClickInvert.bind(this);
    this.handleClickNoise = this.handleClickNoise.bind(this);
  }
  componentDidMount() {
    let canvas = document.getElementsByClassName('canv')[0];
    let self = this;
    canvas.addEventListener('click', (event) => {
      let pos = {
        x: event.pageX - canvas.offsetLeft - 10,
        y: event.pageY - canvas.offsetTop - 10
      };

      self.state.matrix.setPos(pos);
      self.drawMatrix();

    })
  }
  drawMatrix() {
    let canvas = document.getElementsByClassName('canv')[0];
    let ctx = canvas.getContext('2d');
    let pos = this.state.matrix.getData().pos;
    ctx.strokeStyle = '#000000';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.state.image.getData().srcImage, 0, 0);

    if (this.inputs.distanceWidth.value > 7 || this.inputs.distanceHeight.value > 7) {
      ctx.lineWidth = 3;
      for (let i = 0; i < this.inputs.height.value; i += 1) {
        for (let j = 0; j < this.inputs.width.value; j += 1) {
          ctx.beginPath();
          ctx.arc(
            pos.x + j * this.inputs.distanceWidth.value,
            pos.y + i * this.inputs.distanceHeight.value,
            1, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    } else {
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        pos.x, pos.y,
        this.inputs.distanceWidth.value * this.inputs.width.value,
        this.inputs.distanceHeight.value * this.inputs.height.value
      );
      ctx.stroke();
    }

  }
  onDrop(files) {
    this.setState({
      files
    });

    let canvas = document.getElementsByClassName('canv')[0];
    let context = canvas.getContext('2d');
    let img = new Image();

    let reader = new FileReader();
    let self = this;
    reader.readAsDataURL(files[0]);
    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => {
        console.log(img.naturalHeight, img.naturalWidth);
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0);
        self.state.image.setData({
          url: event.target.result,
          srcImage: img,
          size: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        });

        self.inputs.distanceWidth.value = 1;
        self.inputs.distanceHeight.value = 1;
        self.inputs.width.value = 10;
        self.inputs.height.value = 10;

        self.state.imageLoaded = true;
        self.forceUpdate();
      };
    }
  }
  handleClick() {
    let canvas = document.getElementsByClassName('canv')[0];
    let ctx = canvas.getContext('2d');
    let pos = this.state.matrix.getData().pos;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.state.image.getData().srcImage, 0, 0);
    let data = {};
    let imData = '';

    for (let i = 0; i < this.inputs.height.value; i += 1) {
      for (let j = 0; j < this.inputs.width.value; j += 1) {
        imData = ctx.getImageData(
          pos.x + this.inputs.distanceWidth.value * j,
          pos.y + this.inputs.distanceHeight.value * i,
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

        this.state.matrix.setMatrix(data);
      }
    }

    // this.state.matrix.show();
    this.drawMatrix();
  }
  handleClickNorm() {
    let data = {
      down: this.inputs.normDown.value,
      top: this.inputs.normTop.value
    };
    this.state.matrix.norm(data)
  }
  handleClickInvert() {
    this.state.matrix.invert()
  }
  handleClickNoise() {
    this.state.matrix.noise();
  }
  handleClickSaveR() {
    this.state.matrix.toText('r');
    this.state.matrix.saveMatrix();
  }
  handleClickSaveG() {
    this.state.matrix.toText('g');
    this.state.matrix.saveMatrix();
  }
  handleClickSaveB() {
    this.state.matrix.toText('b');
    this.state.matrix.saveMatrix();
  }
  handleChange() {
    let data = {
      width: this.inputs.width.value,
      height: this.inputs.height.value
    };
    this.state.matrix.reset(data);
    this.drawMatrix();
  }
  render() {
    return (
      <div className='create-page'>
        <div className='back'>
          <Link className='link' to='/'>Вернуться</Link>
        </div>
        <div className='main'>
          <div className='name'>
            Создание матрицы
          </div>
          <div className='menu'>
            <div className='dropzone'>
              <Dropzone onDrop={this.onDrop.bind(this)}>
                <p>Загрузите файл...</p>
              </Dropzone>
            </div>
            <aside>
              <h2>Загруженные файлы</h2>
              <ul>
                { this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>) }
              </ul>
            </aside>
          </div>
          <div className='image'>
            <canvas className='canv'>
            </canvas>
          </div>
          <div className='control-panel'>
            <div className='control-panel__param'>
              <h3>Расстояние по ширине</h3>
              <input className='distanceWidth'
                     ref={(input) => { this.inputs.distanceWidth = input; }}
                     onChange={this.handleChange}
              />
            </div>
            <div className='control-panel__param'>
              <h3>Расстояние по высоте</h3>
              <input className='distanceHeight'
                     ref={(input) => { this.inputs.distanceHeight = input; }}
                     onChange={this.handleChange}
              />
            </div>
            <div className='control-panel__param'>
              <h3>Ширина</h3>
              <input className='width'
                     ref={(input) => { this.inputs.width = input; }}
                     onChange={this.handleChange}
              />
            </div>
            <div className='control-panel__param'>
              <h3>Высота</h3>
              <input className='height'
                     ref={(input) => { this.inputs.height = input; }}
                     onChange={this.handleChange}
              />
            </div>
            <div className='control-panel__param'>
              <h3>Нормирование низ</h3>
              <input className='height'
                     ref={(input) => { this.inputs.normDown = input; }}
              />
            </div>
            <div className='control-panel__param'>
              <h3>Нормирование верх</h3>
              <input className='height'
                     ref={(input) => { this.inputs.normTop = input; }}
              />
            </div>
          </div>
          <button
            className='link set_matrix'
            onClick={this.handleClick}
          >Создать матрицу</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickInvert}
          >Инвертировать</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickNorm}
          >Нормировать</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickNoise}
          >Шум</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickSaveR}
          >Сохранить Red</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickSaveG}
          >Создать Green</button>
          <button
            className='link save_matrix'
            onClick={this.handleClickSaveB}
          >Создать Blue</button>
        </div>
      </div>
    )
  }
}
