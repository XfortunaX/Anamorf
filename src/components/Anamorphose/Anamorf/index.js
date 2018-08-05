import React, { Component } from 'react'
import Paper from 'material-ui/Paper';
import { Application } from 'pixi.js'
import Grid from 'material-ui/Grid'
import Divider from 'material-ui/Divider'
import Button from 'material-ui/Button'
import Icon from 'material-ui/Icon'
import Matrix from '../Matrix/index';
import LoadFile from '../loadFile/index'
import AnamorphoseModel from '../../../models/anamorphoseModel'
import SettingsModel from '../../../models/settingsModel'
import AnamorfProcess from '../../../modules/anamorphose/anamorf'
import PubSub from '../../../modules/anamorphose/pubSub'


export default class Anamorf extends Component {
  constructor() {
    super();

    this.state = {
      anamorf: true,
      download: false
    };

    this.anamorphoseModel = new AnamorphoseModel();
    this.settingsModel = new SettingsModel();
    this.anamorphoseProcess = new AnamorfProcess();
    this.pubSub = new PubSub();

    this.startLoop = this.startLoop.bind(this);
    this.loop = this.loop.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.resize = this.resize.bind(this);
    this.addAnamorf = this.addAnamorf.bind(this);
    this.reset = this.reset.bind(this);
    this.download = this.download.bind(this);
    this.saveAnamorf = this.saveAnamorf.bind(this);
    this.saveAnamorfImage = this.saveAnamorfImage.bind(this);

    this.pubSub.subscribe('download', this.download, this);
    this.pubSub.subscribe('resize', this.resize, this);
    this.pubSub.subscribe('setSize', this.setSize, this);
    this.pubSub.subscribe('getSize', this.getSize, this);
  }
  componentDidMount() {
    this.renderer = new Application(
      this.settingsModel.getIndent() * 2 + this.anamorphoseModel.getSize().width * this.settingsModel.getScale(),
      this.settingsModel.getIndent() * 2 + this.anamorphoseModel.getSize().height * this.settingsModel.getScale(),
      { antialias: true}
    );
    this.renderer.renderer.backgroundColor = 0xE3F2FD;
    this.refs.anamorphose.appendChild(this.renderer.view);

    this.anamorphoseProcess.setMatrix(this.anamorphoseModel.getMatrix());
    this.renderer.stage.addChild(this.anamorphoseProcess.getAnamorfScene());
    this.pubSub.publish('refreshInstrument');

    this.startLoop();
  }
  addAnamorf() {
    this.anamorphoseModel.addActive();
    this.anamorphoseModel.reset();
    this.anamorphoseProcess.addActive();
    this.anamorphoseProcess.addMatrix(this.anamorphoseModel.getMatrix());
    this.anamorphoseProcess.reset();
    this.pubSub.publish('refreshInstrument');
    this.setState({download: true});
    console.log('Add');
  }
  reset() {
    this.settingsModel.reset();
    this.anamorphoseModel.fullReset();
    this.anamorphoseProcess.setMatrix(this.anamorphoseModel.getMatrix());
    this.pubSub.publish('refreshInstrument');
    this.resize();
  }
  resize() {
    this.renderer.renderer.autoResize = true;
    this.renderer.renderer.resize(
      this.settingsModel.getIndent() * 2 + this.anamorphoseModel.getSize().width * this.settingsModel.getScale(),
      this.settingsModel.getIndent() * 2 + this.anamorphoseModel.getSize().height * this.settingsModel.getScale()
    );
    this.anamorphoseProcess.drawMatrix();
  }
  setSize(size) {
    this.renderer.renderer.autoResize = true;
    this.renderer.renderer.resize(size.width, size.height);
  }
  getSize() {
    return {
      width: this.renderer.renderer.width,
      height: this.renderer.renderer.height
    }
  }
  startLoop() {
    if( !this._frameId ) {
      this._frameId = window.requestAnimationFrame(this.loop);
    }
  }
  loop() {
    this._frameId = window.requestAnimationFrame(this.loop);
  }
  handleChangeState() {
    this.setState({anamorf: !this.state.anamorf})
  }
  saveAnamorf() {
    this.anamorphoseProcess.save();
  }
  download() {
    this.setState({download: !this.state.download})
  }
  saveAnamorfImage(e) {
    e.preventDefault();
    let imgURL = this.renderer.renderer.extract.base64(this.renderer.stage);
    let MIME_TYPE = 'image/png';
    let dlLink = document.createElement('a');
    dlLink.download = 'image.png';
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
  }
  componentDidUpdate() {
    if (this.state.anamorf === true && this.state.download === false) {
      this.refs.anamorphose.appendChild(this.renderer.view);
    }
  }
  render() {
    return (
      <div>
        <Paper elevation={4} style={{height: 'calc(100vh - 85px)', margin: 10}}>
          <div style={{height: 64, fontSize: 18, textAlign: 'center'}}>
            {
              this.state.download
                ? <Button variant='raised' size='medium' style={styles.button} onClick={this.download}>
                    <Icon style={{fontSize: 30}}>image</Icon>
                    &nbsp;&nbsp;Анаморфоза
                  </Button>
                : <Button variant='raised' size='medium' style={styles.button} onClick={this.download}>
                    <Icon style={{fontSize: 30}}>file_upload</Icon>
                    &nbsp;&nbsp;Загрузить
                  </Button>
            }
            {
              this.state.anamorf
              ? <Button variant='raised' size='medium' style={styles.button} onClick={this.handleChangeState}>
                  <Icon style={{fontSize: 30}}>grid_on</Icon>
                   &nbsp;&nbsp;Матрица
                </Button>
              : <Button variant='raised' size='medium' style={styles.button} onClick={this.handleChangeState}>
                  <Icon style={{fontSize: 30}}>grid_off</Icon>
                  &nbsp;&nbsp;Анаморфоза
                </Button>
            }
            <Button variant='raised' size='medium' style={styles.button} onClick={this.saveAnamorf}>
              <Icon style={{fontSize: 30}}>save</Icon>
              &nbsp;&nbsp;Сохранить
            </Button>
            <Button variant='raised' size='medium' style={styles.button} onClick={this.saveAnamorfImage}>
              <Icon style={{fontSize: 30}}>image</Icon>
              &nbsp;&nbsp;Изображение
            </Button>
            <Button variant='fab' aria-label='add' style={styles.buttonAdd} onClick={this.addAnamorf}>
              <Icon style={{fontSize: 32}}>add</Icon>
            </Button>
            <Button variant='fab' aria-label='clear' style={styles.buttonReset} onClick={this.reset}>
              <Icon style={{fontSize: 32}}>clear</Icon>
            </Button>
          </div>
          <Divider/>
          <Grid container justify={'center'} alignContent={'center'} alignItems={'center'} style={{height: 'calc(100% - 95px)'}}>
            <Grid item style={{width: 'inherit', textAlign: 'center'}}>
              {
                this.state.download
                ? <LoadFile/> :
                this.state.anamorf
                ? <div ref='anamorphose' style={styles.anamorphose}>
                  </div>
                : <Matrix/>
              }
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

const styles = {
  button: {
    fontSize: 14,
    fontWeight: 600,
    width: 160,
    margin: 7,
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: 'center',
    backgroundColor: 'darkseagreen'
  },
  buttonAdd: {
    backgroundColor: 'rgba(128, 203, 196, 1)',
    marginLeft: 60,
    height: 50,
    width: 50
  },
  buttonReset: {
    backgroundColor: 'rgba(244, 67, 54, 1)',
    marginLeft: 20,
    height: 50,
    width: 50
  },
  anamorphose: {
    textAlign: 'center',
    maxHeight: '75vh',
    marginTop: 24,
    marginLeft: 15,
    maxWidth: 'calc(100% - 30px)',
    overflow: 'auto'
  }
};
