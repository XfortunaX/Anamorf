import React, { Component } from 'react'
import { Link } from 'react-router'
import AnamorfModel from '../../models/anamorfModel'
import { WIDTH_ANAMORF, HEIGHT_ANAMORF, SCALE, INDENT } from '../../constants/index'
import { autoDetectRenderer } from 'pixi.js'
import AnamorfProcess from '../../modules/anamorf_gpu/anamorf'
import './styles.scss'
import Dropzone from 'react-dropzone'

export default class Anamorf extends Component {
  constructor() {
    super();
    this.state = {
      widthAnamorf: WIDTH_ANAMORF,
      heightAnamorf: HEIGHT_ANAMORF,
      anamorf: new AnamorfModel(),
      anamorfProcess: new AnamorfProcess(),
      files: []
    };

    this.startLoop = this.startLoop.bind(this);
    this.loop = this.loop.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickStep = this.handleClickStep.bind(this);
    this.handleClickLoad = this.handleClickLoad.bind(this);
    this.handleClickSet = this.handleClickSet.bind(this);
    this.handleClickSetKoef = this.handleClickSetKoef.bind(this);
    this.handleClickDrop = this.handleClickDrop.bind(this);
    this.handleClickAdd = this.handleClickAdd.bind(this);
    this.handleClickRed = this.handleClickRed.bind(this);
    this.handleClickSum = this.handleClickSum.bind(this);
  }
  componentDidMount() {
    this.renderer = autoDetectRenderer(
      INDENT * 2 + this.state.widthAnamorf * SCALE, INDENT * 2 + this.state.heightAnamorf * SCALE,
      { antialias: true }
    );
    this.refs.anamorfDraw.appendChild(this.renderer.view);
    this.renderer.view.onclick = function (event) {
      event.preventDefault();
      console.log('canvas');
    };
    this.renderer.backgroundColor = 0xFFFFFF;

    console.log('gen');
    this.state.anamorfProcess.setMatrix(this.state.anamorf.getMatrix());

    console.log('draw');
    this.renderer.render(this.state.anamorfProcess.getAnamorfScene());
    console.log('enddraw');

    this.startLoop();
  }
  startLoop() {
    if( !this._frameId ) {
      this._frameId = window.requestAnimationFrame( this.loop );
    }
  }
  loop() {
    this._frameId = window.requestAnimationFrame( this.loop );
    this.renderer.render(this.state.anamorfProcess.getAnamorfScene());
  }
  handleChange(e) {
    e.preventDefault();
    let pos = e.target.id.split('_');
    this.state.anamorf.setCell({
      h: parseInt(pos[0]),
      w: parseInt(pos[1]),
      value: parseFloat(e.target.value)
    })
  }
  handleClick(e) {
    e.preventDefault();
    this.state.anamorfProcess.setMatrix(this.state.anamorf.getMatrix());
    this.state.anamorfProcess.calcAnamorf();
  }
  handleClickStep(e) {
    e.preventDefault();
    this.state.anamorfProcess.calcAnamorfStep(parseInt(this.inputStep.value));
  }
  handleClickLoad(e) {
    e.preventDefault();
    this.state.widthAnamorf = parseInt(this.inputWidth.value);
    this.state.heightAnamorf = parseInt(this.inputHeight.value);
    console.log(this.state.widthAnamorf, this.state.heightAnamorf);
    this.state.anamorf.update(this.state.widthAnamorf, this.state.heightAnamorf);
    this.renderer.resize(INDENT * 2 + this.state.widthAnamorf * SCALE, INDENT * 2 + this.state.heightAnamorf * SCALE);
    this.state.anamorfProcess.setMatrix(this.state.anamorf.getMatrix());
    this.inputKoef.value = this.state.anamorfProcess.getAverage();
    this.forceUpdate()
  }
  handleClickSet(e) {
    e.preventDefault();
    this.state.anamorfProcess.matrixSet(this.state.anamorf.getMatrix());
    this.inputKoef.value = this.state.anamorfProcess.getAverage();
  }
  handleClickSetKoef(e) {
    e.preventDefault();
    this.state.anamorfProcess.setKoef(this.inputKoef.value);
  }
  handleClickDrop(e) {
    e.preventDefault();
    this.state.anamorfProcess.drop();
  }
  handleClickRed(e) {
    e.preventDefault();
    this.state.anamorf.reduceActive();
    // this.state.anamorfProcess.reduceMatrix();
    console.log('Red');
  }
  handleClickAdd(e) {
    e.preventDefault();
    this.state.anamorf.addActive();
    console.log('Add');
  }
  handleClickSum(e) {
    e.preventDefault();
    this.state.anamorfProcess.sumMatrix();
    // self.renderer.resize(INDENT * 2 + self.state.widthAnamorf * SCALE, INDENT * 2 + self.state.heightAnamorf * SCALE);
    // self.forceUpdate();
    console.log('All');
  }
  createMatrix() {
    return (
      <div className='anamorf-matrix'>
        {this.state.anamorf.getMatrix().map((val, i) =>
          <div className='anamorf-matrix__width' key={i}>
            {val.map((num, item) =>
              <input
                className='cell'
                type='text'
                size={4}
                key={i + '_' + item}
                value={num}
                onBlur={this.handleChange}
              />
            )}
          </div>
        )}
      </div>
    );
  }
  onDrop(files) {
    this.setState({
      files
    });
    const reader = new FileReader();
    let self = this;
    reader.onload = () => {
      const fileAsBinaryString = reader.result;
      let anamorf = fileAsBinaryString.split('\n');
      // console.log(anamorf);

      let matrix = [];
      for (let i = 0; i < anamorf.length; i += 1) {
        let arr = anamorf[i].split(';');
        matrix.push(arr);
      }
      console.log(matrix);

      let m = matrix.map(function (arr) {
        let a = arr.map(function (item) {
          return parseFloat(item);
        });
        return a;
      });
      console.log(m);

      if (self.state.anamorf.getNumMatrix() === 1) {
        self.state.heightAnamorf = m.length;
        self.state.widthAnamorf = m[0].length;

        self.state.anamorf.update(self.state.widthAnamorf, self.state.heightAnamorf);
        self.state.anamorf.setMatrix(m);
        self.renderer.resize(INDENT * 2 + self.state.widthAnamorf * SCALE, INDENT * 2 + self.state.heightAnamorf * SCALE);
        self.state.anamorfProcess.setMatrix(self.state.anamorf.getMatrix());
        self.inputKoef.value = self.state.anamorfProcess.getAverage();
        self.inputWidth.value = self.state.widthAnamorf;
        self.inputHeight.value = self.state.heightAnamorf;
        self.forceUpdate();
      } else {
        self.state.anamorf.update(self.state.widthAnamorf, self.state.heightAnamorf);
        self.state.anamorf.setMatrix(m);
        self.renderer.resize(INDENT * 2 + self.state.widthAnamorf * SCALE, INDENT * 2 + self.state.heightAnamorf * SCALE);
        self.state.anamorfProcess.addMatrix(self.state.anamorf.getMatrix());
        self.inputKoef.value = self.state.anamorfProcess.getAverage();
        self.inputWidth.value = self.state.widthAnamorf;
        self.inputHeight.value = self.state.heightAnamorf;
        self.forceUpdate();
      }
    };

    reader.readAsBinaryString(files[0]);
  }
  render() {
    return (
      <div className='home-page'>
        <div className='back'>
          <Link className='link' to='/'>Вернуться</Link>
        </div>
        <div className='main'>
          <div className='name'>
            Анаморфозные преобразования
          </div>
          <div className='menu'>
            <div className='reduceMatrix'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickRed}>Предыдущая</button>
            </div>
            <div className='addMatrix'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickAdd}>Добавить</button>
            </div>
            <div className='allMatrix'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickSum}>Объединение</button>
            </div>
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
            <div className='anamorf-size'>
              <div className='anamorf-size-height'>
                Высота
                <input
                  className='anamorf-size-height'
                  defaultValue={this.state.heightAnamorf}
                  ref={(input) => { this.inputHeight = input; }}
                />
              </div>
              <div className='anamorf-size-width'>
                Ширина
                <input
                  className='anamorf-size-width'
                  defaultValue={this.state.widthAnamorf}
                  ref={(input) => { this.inputWidth = input; }}
                />
              </div>
            </div>
            <div className='anamorf-koef'>
              Коэф ан
              <input
                className='anamorf-koef__koef'
                defaultValue={0.1}
                ref={(input) => { this.inputKoef = input; }}
              />
            </div>
            <div className='anamorf-transformations'>
              {/*{this.createMatrix()}*/}
              <div className='anamorf-draw' ref='anamorfDraw'>
              </div>
            </div>
            <div className='calc-anamorf-load'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickLoad}>Обновить</button>
            </div>
            <div className='calc-anamorf-set'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickSet}>Установить</button>
            </div>
            <div className='calc-anamorf-set'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickSetKoef}>Уст коэф</button>
            </div>
            <div className='calc-anamorf'>
              <button className='calc-anamorf-btn link' onClick={this.handleClick}>Вычислить</button>
            </div>
            <div className='calc-anamorf-step'>
              <div className='anamorf-steps'>
                Число шагов
                <input
                  className='anamorf-steps__num'
                  defaultValue={1}
                  ref={(input) => { this.inputStep = input; }}
                />
              </div>
              <button className='calc-anamorf-step-btn link' onClick={this.handleClickStep}>Шаги</button>
            </div>
            <div className='calc-anamorf-drop'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickDrop}>Сбросить</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
