import React, { Component } from 'react'
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid'
import Divider from 'material-ui/Divider'
import Button from 'material-ui/Button'
import Icon from 'material-ui/Icon'
import Image from '../Image/index'
import LoadFile from '../loadFile/index'
import SettingsModel from '../../../models/settingsModel'
import MatrixModel from '../../../models/matrixModel'
import PubSub from '../../../modules/anamorphose/pubSub'


export default class ImagePanel extends Component {
  constructor() {
    super();

    this.state = {
      imageLoaded: false,
      download: true
    };

    this.matrixModel = new MatrixModel();
    this.settingsModel = new SettingsModel();
    this.pubSub = new PubSub();

    this.download = this.download.bind(this);
    this.reset = this.reset.bind(this);
    this.saveImageMatrix = this.saveImageMatrix.bind(this);
    this.loadedImage = this.loadedImage.bind(this);

    this.pubSub.subscribe('loadedImage', this.loadedImage, this)
  }
  saveImageMatrix() {
    this.matrixModel.toTextFull();
    this.matrixModel.saveMatrix();
    console.log('save');
  }
  download() {
    this.setState({download: !this.state.download})
  }
  reset() {
    console.log('reset');
    this.setState({download: false, imageLoaded: false})
  }
  loadedImage(state) {
    this.setState({imageLoaded: state});
    this.download();
  }
  render() {
    return (
      <div>
        <Paper elevation={4} style={{height: 'calc(100vh - 85px)', margin: 10}}>
          <div style={{height: 64, fontSize: 18, textAlign: 'center'}}>
            { !this.state.imageLoaded
              ? <div></div>
              : this.state.download || !this.state.imageLoaded
              ?
                <Button variant='raised' size='medium' style={styles.button} onClick={this.download}>
                  <Icon style={{fontSize: 30}}>image</Icon>
                  &nbsp;&nbsp;Изображение
                </Button>
              :
                <Button variant='raised' size='medium' style={styles.button} onClick={this.download}>
                  <Icon style={{fontSize: 30}}>file_upload</Icon>
                  &nbsp;&nbsp;Загрузить
                </Button>
            }
            { this.state.imageLoaded
              ?
              <div style={{display: 'inline-block'}}>
                <Button variant='raised' size='medium' style={styles.button} onClick={this.saveImageMatrix}>
                  <Icon style={{fontSize: 30}}>save</Icon>
                  &nbsp;&nbsp;Сохранить
                </Button>
                <Button variant='fab' aria-label='clear' style={styles.buttonReset} onClick={this.reset}>
                  <Icon style={{fontSize: 32}}>clear</Icon>
                </Button>
              </div>
              :
              <div style={{height: '100%', lineHeight: '2.7em', fontSize: 25}}>
                Загрузите изображение
              </div>
            }
          </div>
          <Divider/>
          <Grid container justify={'center'} alignContent={'center'} alignItems={'center'} style={{height: 'calc(100% - 95px)'}}>
            <Grid item style={{width: 'inherit', textAlign: 'center'}}>
              {
                this.state.download || !this.state.imageLoaded
                ? <LoadFile/>
                : <Image/>
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
    width: 180,
    margin: 7,
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: 'center',
    backgroundColor: 'darkseagreen'
  },
  buttonReset: {
    backgroundColor: 'rgba(244, 67, 54, 1)',
    marginLeft: 20,
    height: 50,
    width: 50
  }
};
