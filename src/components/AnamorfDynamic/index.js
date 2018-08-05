import React, { Component } from 'react'
import { Link } from 'react-router'
import AnamorfModel from '../../models/anamorfModel'
import { WIDTH_ANAMORF_DEMO, HEIGHT_ANAMORF_DEMO, SCALE_DEMO, INDENT } from '../../constants/index'
import { autoDetectRenderer } from 'pixi.js'
import AnamorfProcess from '../../modules/anamorf_gpu_demo/anamorf'
import './styles.scss'

export default class Anamorf extends Component {
  constructor() {
    super();
    this.state = {
      widthAnamorf: WIDTH_ANAMORF_DEMO,
      heightAnamorf: HEIGHT_ANAMORF_DEMO,
      anamorf: new AnamorfModel(),
      anamorfProcess: new AnamorfProcess(),
      files: []
    };

    this.startLoop = this.startLoop.bind(this);
    this.loop = this.loop.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.changeAnamorf = this.changeAnamorf.bind(this);
    this.handleClickStep = this.handleClickStep.bind(this);
    this.handleClickDemo = this.handleClickDemo.bind(this);
  }
  componentDidMount() {
    this.renderer = autoDetectRenderer(
      INDENT * 2 + this.state.widthAnamorf * SCALE_DEMO, INDENT * 2 + this.state.heightAnamorf * SCALE_DEMO,
      { antialias: true }
    );
    this.refs.anamorfDraw.appendChild(this.renderer.view);
    this.renderer.backgroundColor = 0xFFFFFF;
    this.state.anamorf.createDemo();
    this.state.anamorfProcess.setMatrix(this.state.anamorf.getMatrix());
    this.renderer.render(this.state.anamorfProcess.getAnamorfScene());

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
  handleClick(e) {
    e.preventDefault();
    this.state.anamorfProcess.setMatrix(this.state.anamorf.getMatrix());
    this.state.anamorfProcess.calcAnamorf();
  }
  handleClickStep(e) {
    e.preventDefault();
    this.state.anamorfProcess.calcAnamorfStep(parseInt(this.inputStep.value));
  }
  handleClickDemo(e) {
    e.preventDefault();
    this.interval = setInterval(this.changeAnamorf, 10000);
  }
  changeAnamorf() {
    let p = Math.random();
    if (p > 0.875) {
      console.log('change ANAMORF');
      this.state.anamorf.changeMatrix();
      this.state.anamorfProcess.matrixSet(this.state.anamorf.getMatrix());
    }
    this.state.anamorfProcess.calcAnamorfOne();
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
            <div className='anamorf-transformations'>
              <div className='anamorf-draw' ref='anamorfDraw'>
              </div>
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
            <div className='calc-anamorf'>
              <button className='calc-anamorf-btn link' onClick={this.handleClickDemo}>Демо</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
