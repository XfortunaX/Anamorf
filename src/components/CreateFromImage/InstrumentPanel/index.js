import React, { Component } from 'react'
import Paper from 'material-ui/Paper'
import List, { ListItem } from 'material-ui/List'
import MatrixModel from '../../../models/matrixModel'
import SettingsModel from '../../../models/settingsModel'
import PubSub from '../../../modules/anamorphose/pubSub'
import Input from 'material-ui/Input'
import Button from 'material-ui/Button'
import Divider from 'material-ui/Divider'


export default class InstrumentPanel extends Component {
  constructor() {
    super();

    this.matrixModel = new MatrixModel();
    this.settingsModel = new SettingsModel();
    this.pubSub = new PubSub();

    this.state = {
      change: false,
      width: 10,
      height: 10,
      distWidth: 1,
      distHeight: 1,
      normDown: 1,
      normTop: 10,
      noise: 1,
      takeColor: false,
      setColorParam: false,
      colorParam: 1
    };

    this.handleChange = this.handleChange.bind(this);
    this.createMatrix = this.createMatrix.bind(this);
    this.invert = this.invert.bind(this);
    this.norm = this.norm.bind(this);
    this.noise = this.noise.bind(this);
    this.takeColor = this.takeColor.bind(this);
    this.setColorParam = this.setColorParam.bind(this);

    this.pubSub.subscribe('setColorParam', this.setColorParam, this);
  }
  handleChange(type, e) {
    e.preventDefault();
    this.setState({[type]: e.target.value});

    if (type === 'height') {
      this.settingsModel.setHeight(parseFloat(e.target.value));
    } else if (type === 'width') {
      this.settingsModel.setWidth(parseFloat(e.target.value));
    } else if (type === 'distHeight') {
      this.settingsModel.setDistanceHeight(parseFloat(e.target.value))
    } else if (type === 'distWidth') {
      this.settingsModel.setDistanceWidth(parseFloat(e.target.value))
    }

    this.pubSub.publish('drawMatrix');
  }
  createMatrix() {
    this.pubSub.publish('createMatrix');
    console.log('end_create');
  }
  invert() {
    this.matrixModel.invert();
    console.log('invert');
  }
  norm() {
    let data = {
      down: parseFloat(this.state.normDown),
      top: parseFloat(this.state.normTop)
    };
    this.matrixModel.norm(data);
    console.log('norm');
  }
  noise() {
    this.matrixModel.noise();
    console.log('noise');
  }
  takeColor() {
    this.setState({takeColor: !this.state.takeColor});
    this.settingsModel.setTakeColor(!this.state.takeColor);
    console.log(this.state.takeColor)
  }
  setColorParam() {
    this.setState({setColorParam: !this.state.takeColor});
  }
  render() {
    return (
      <div>
        <Paper elevation={4} style={{height: '91vh'}}>
          <div style={{height: '88vh', overflowY: 'auto'}}>
            <List component='nav' style={{padding: 0}}>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Параметры
                </div>
              </ListItem>
              <Divider />
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Высота
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.height}
                  onChange={(e) => this.handleChange('height', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Ширина
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.width}
                  onChange={(e) => this.handleChange('width', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Расстояние по высоте
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.distHeight}
                  onChange={(e) => this.handleChange('distHeight', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Расстояние по ширине
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.distWidth}
                  onChange={(e) => this.handleChange('distWidth', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Нормирование низ
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.normDown}
                  onChange={(e) => this.handleChange('normDown', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Нормирование верх
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.normTop}
                  onChange={(e) => this.handleChange('normTop', e)}
                >
                </Input>
              </ListItem>
              {/*<ListItem style={styles.paramItem}>*/}
                {/*<div style={styles.paramItemLabel}>*/}
                  {/*Коэффициент шума*/}
                {/*</div>*/}
                {/*<Input*/}
                  {/*style={styles.cell}*/}
                  {/*value={this.state.noise}*/}
                  {/*onChange={(e) => this.handleChange('noise', e)}*/}
                {/*>*/}
                {/*</Input>*/}
              {/*</ListItem>*/}
              <Divider style={{marginTop: 20}}/>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Параметр
                </div>
              </ListItem>
              <Divider />
              {
                this.state.setColorParam &&
                <ListItem style={styles.paramItem}>
                  <div style={styles.paramItemLabel}>
                    Значение
                  </div>
                  <Input
                    style={styles.cell}
                    value={this.state.normDown}
                    onChange={(e) => this.handleChange('normDown', e)}
                  >
                  </Input>
                </ListItem>
              }
              <Button variant='raised' size='medium' style={styles.button} onClick={this.takeColor}>
                &nbsp;&nbsp;Захват цвета
              </Button>
              <Divider style={{marginTop: 20}}/>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Операции
                </div>
              </ListItem>
              <Divider />
              <Button variant='raised' size='medium' style={styles.button} onClick={this.createMatrix}>
                &nbsp;&nbsp;Создать матрицу
              </Button>
              <Button variant='raised' size='medium' style={styles.button} onClick={this.invert}>
                &nbsp;&nbsp;Инвертировать
              </Button>
              <Button variant='raised' size='medium' style={styles.button} onClick={this.norm}>
                &nbsp;&nbsp;Нормировать
              </Button>
              <Button variant='raised' size='medium' style={styles.button} onClick={this.noise}>
                &nbsp;&nbsp;Шум
              </Button>
            </List>
          </div>
        </Paper>
      </div>
    );
  }
}

const styles = {
  param: {
    fontSize: 26,
    flex: 1,
    fontWeight: 600,
    height: 40
  },
  paramItem: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 0,
    marginTop: 3,
    height: 40
  },
  paramItemLabel: {
    fontSize: 16,
    flex: 1
  },
  cell: {
    fontSize: 18,
    width: 60
  },
  button: {
    fontSize: 16,
    fontWeight: 600,
    width: '80%',
    marginTop: 15,
    marginLeft: '10%',
    backgroundColor: 'darkseagreen'
  }
};
