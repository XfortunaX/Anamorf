import React, { Component } from 'react'
import Paper from 'material-ui/Paper'
import List, { ListItem } from 'material-ui/List'
import AnamorphoseModel from '../../../models/anamorphoseModel'
import AnamorfProcess from '../../../modules/anamorphose/anamorf'
import PubSub from '../../../modules/anamorphose/pubSub'
import SettingsModel from '../../../models/settingsModel'
import Input from 'material-ui/Input'
import Button from 'material-ui/Button'
import Icon from 'material-ui/Icon'
import Divider from 'material-ui/Divider'
import Checkbox from 'material-ui/Checkbox'
import Select from 'material-ui/Select'
import { MenuItem } from 'material-ui/Menu'


export default class InstrumentPanel extends Component {
  constructor() {
    super();

    this.anamorphoseModel = new AnamorphoseModel();
    this.settingsModel = new SettingsModel();
    this.anamorphoseProcess = new AnamorfProcess();
    this.pubSub = new PubSub();

    this.state = {
      change: false,
      width: this.anamorphoseModel.getSize().width,
      widthChange: false,
      height: this.anamorphoseModel.getSize().height,
      heightChange: false,
      koef: this.anamorphoseProcess.getAverage(),
      koefChange: false,
      accuracy: this.settingsModel.getAccuracy(),
      accuracyChange: false,
      countMiddleVertex: this.settingsModel.getCountMiddleVertex(),
      countMiddleVertexChange: false,
      scale: this.settingsModel.getScale(),
      scaleChange: false,
      step: 1,
      cellValue: false,
      value: 1,
      numCell: 1,
      cellValueChange: false,
      anamorf: false,
      currentKoef: this.anamorphoseModel.getActive() + 1,
      grid: true,
      color: 'white'
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeValue = this.handleChangeValue.bind(this);
    this.handleGrid = this.handleGrid.bind(this);
    this.handleColor = this.handleColor.bind(this);
    this.setCellValue = this.setCellValue.bind(this);
    this.changeMatrix = this.changeMatrix.bind(this);
    this.rebuild = this.rebuild.bind(this);
    this.sumParam = this.sumParam.bind(this);
    this.anamorfStep = this.anamorfStep.bind(this);
    this.anamorf = this.anamorf.bind(this);
    this.refresh = this.refresh.bind(this);

    this.pubSub.subscribe('changeMatrix', this.changeMatrix, this);
    this.pubSub.subscribe('setCellValue', this.setCellValue, this);
    this.pubSub.subscribe('refreshInstrument', this.refresh, this);
  }
  componentWillUnmount() {
    this.pubSub.remove('changeMatrix');
    this.pubSub.remove('setCellValue');
    this.pubSub.remove('refreshInstrument');
  }
  changeMatrix() {
    this.setState({change: true})
  }
  handleChange(type, e) {
    e.preventDefault();
    if (type !== 'step') {
      this.setState({
        change: true,
        [type]: e.target.value,
        [type + 'Change']: true
      })
    } else {
      this.setState({[type]: e.target.value})
    }
  }
  handleChangeValue(e) {
    console.log(this.state.numCell,this.anamorphoseModel.getSize().width);
    let y = Math.floor(this.state.numCell / this.anamorphoseModel.getSize().width);
    let x = this.state.numCell - y * this.anamorphoseModel.getSize().width;
    console.log(y, x);
    this.anamorphoseModel.setCell({y: y, x: x, value: parseFloat(e.target.value)});
    this.setState({change: true, value: e.target.value, cellValueChange: true})
  }
  handleGrid() {
    this.settingsModel.setGrid(!this.state.grid);
    this.setState({grid: !this.state.grid});
    this.anamorphoseProcess.drawMatrix();
  }
  handleColor(e) {
    this.settingsModel.setColor(e.target.value);
    this.setState({color: e.target.value});
    this.anamorphoseProcess.drawMatrix();
  }
  setCellValue(param) {
    this.setState({
      cellValue: param.state,
      numCell: param.name,
      value: param.value
    });
  }
  rebuild () {
    if (this.state.widthChange || this.state.heightChange) {
      this.anamorphoseModel.update(this.state.width, this.state.height);
      this.anamorphoseProcess.setMatrix(this.anamorphoseModel.getMatrix());
      this.setState({change: false, widthChange: false, heightChange: false, anamorf: false});
    }
    if (this.state.koefChange) {
      this.anamorphoseProcess.reset();
      this.anamorphoseProcess.setKoef(this.state.koef);
      this.setState({change: false, koefChange: false, anamorf: false});
    }
    if (this.state.accuracyChange) {
      this.anamorphoseProcess.reset();
      this.settingsModel.setAccuracy(this.state.accuracy);
      this.setState({change: false, accuracyChange: false, anamorf: false});
    }
    if (this.state.countMiddleVertexChange) {
      this.settingsModel.setCountMiddleVertex(this.state.countMiddleVertex);
      this.anamorphoseProcess.setMatrix(this.anamorphoseModel.getMatrix());
      this.setState({change: false, countMiddleVertexChange: false, anamorf: false});
    }
    if (this.state.scaleChange) {
      this.settingsModel.setScale(this.state.scale);
      this.anamorphoseProcess.matrixSet(this.anamorphoseModel.getMatrix());
      this.anamorphoseProcess.reset();
      this.setState({change: false, scaleChange: false, anamorf: false});
    }
    if (this.state.cellValueChange) {
      this.anamorphoseProcess.matrixSet(this.anamorphoseModel.getMatrix());
      this.setState({change: false, cellValueChange: false, cellValue: false, anamorf: false});
    }
    this.pubSub.publish('resize');
    this.refresh();

    // this.settingsModel.setScale(this.state.scale);
    // this.settingsModel.setAccuracy(this.state.accuracy);
    // this.settingsModel.setCountMiddleVertex(this.state.countMiddleVertex);
    // if (this.state.height !== this.anamorphoseModel.getSize().height ||
    //   this.state.width !== this.anamorphoseModel.getSize().width) {
    //   this.anamorphoseModel.update(this.state.width, this.state.height);
    // }
    // if (this.state.height !== this.anamorphoseModel.getSize().height ||
    //   this.state.width !== this.anamorphoseModel.getSize().width) {
    //   this.anamorphoseProcess.setMatrix(this.anamorphoseModel.getMatrix());
    // } else {
    //   this.anamorphoseProcess.matrixSet(this.anamorphoseModel.getMatrix());
    // }
    // if (this.state.koef !== this.anamorphoseProcess.getAverage()) {
    //   this.anamorphoseProcess.setKoef(this.state.koef);
    // }
    // this.setState({change: false, cellValue: false, anamorf: false});
  }
  refresh() {
    this.setState({
      currentKoef: this.anamorphoseModel.getActive() + 1,
      width: this.anamorphoseModel.getSize().width,
      height: this.anamorphoseModel.getSize().height,
      koef: this.anamorphoseProcess.getAverage(),
      accuracy: this.settingsModel.getAccuracy(),
      countMiddleVertex: this.settingsModel.getCountMiddleVertex(),
      scale: this.settingsModel.getScale(),
      anamorf: false
    })
  }
  sumParam() {
    this.anamorphoseProcess.sumMatrix();
    this.anamorphoseProcess.reset();
    this.refresh();
    console.log('sumParam');
  }
  anamorfStep() {
    let anamorfState = this.anamorphoseProcess.calcAnamorfStep(parseInt(this.state.step));
    this.setState({anamorf: anamorfState});
  }
  anamorf() {
    let anamorfState = this.anamorphoseProcess.calcAnamorf();
    this.setState({anamorf: anamorfState});
  }
  render() {
    return (
      <div>
        <Paper elevation={4} style={{height: '91vh'}}>
          <div style={{height: '88vh', overflowY: 'auto'}}>
            <List component='nav' style={{padding: 0}}>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Функции
                </div>
              </ListItem>
              {
                this.anamorphoseModel.getNumMatrix() > 1 &&
                <div>
                  <Divider style={{marginBottom: 15}}/>
                  <ListItem style={styles.paramItem}>
                    <div style={styles.paramItemLabel}>
                      Номер текущего показателя
                    </div>
                    <Input
                      style={styles.cell}
                      value={this.state.currentKoef}
                      onChange={(e) => this.handleChange('currentKoef', e)}
                    >
                    </Input>
                  </ListItem>
                  <ListItem style={styles.paramItem}>
                    <Button variant='raised' size='medium' style={styles.buttonSum} onClick={this.sumParam}>
                      <Icon style={{fontSize: 26}}>functions</Icon>
                      &nbsp;&nbsp;Объединить
                    </Button>
                  </ListItem>
                  <Divider style={{marginTop: 30}}/>
                </div>
              }
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Параметры
                </div>
              </ListItem>
              <Divider />
              {
                this.state.cellValue &&
                <ListItem style={styles.paramItem}>
                  <div style={styles.paramItemLabel}>
                    Значение ячейки
                  </div>
                  <Input
                    style={styles.cell}
                    value={this.state.value}
                    onChange={(e) => this.handleChangeValue(e)}
                  >
                  </Input>
                </ListItem>
              }
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
              <ListItem style={{marginTop: 20, paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 0}}>
                <div style={styles.paramItemLabel}>
                  Коэффициент
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.koef}
                  onChange={(e) => this.handleChange('koef', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Дополнительные точки
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.countMiddleVertex}
                  onChange={(e) => this.handleChange('countMiddleVertex', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Точность
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.accuracy}
                  onChange={(e) => this.handleChange('accuracy', e)}
                >
                </Input>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Масштаб
                </div>
                <Input
                  style={styles.cell}
                  value={this.state.scale}
                  onChange={(e) => this.handleChange('scale', e)}
                >
                </Input>
              </ListItem>
              {
                this.state.change &&
                <ListItem style={styles.paramItem}>
                  <Button variant='raised' size='medium' style={styles.button} onClick={this.rebuild}>
                    <Icon style={{fontSize: 22}}>cached</Icon>
                    &nbsp;&nbsp;Перестроить
                  </Button>
                </ListItem>
              }
              <Divider style={{marginTop: 20}}/>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Настройки
                </div>
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Сетка
                </div>
                <Checkbox
                  checked={this.state.grid}
                  onChange={this.handleGrid}
                  color='primary'
                />
              </ListItem>
              <ListItem style={styles.paramItem}>
                <div style={styles.paramItemLabel}>
                  Цвет ячеек
                </div>
                <Select
                  value={this.state.color}
                  onChange={this.handleColor}
                  inputProps={{name: 'color'}}
                  style={{fontSize: 14}}
                >
                  <MenuItem value={'white'} style={{ fontSize: 20 }}>Белый</MenuItem>
                  <MenuItem value={'blue-red'} style={{ fontSize: 20 }}>Синий-красный</MenuItem>
                  <MenuItem value={'white-black'} style={{ fontSize: 20 }}>Черно-белый</MenuItem>
                  <MenuItem value={'true'} style={{ fontSize: 20 }}>Исходный</MenuItem>
                </Select>
              </ListItem>
              <Divider style={{marginTop: 20}}/>
              <ListItem style={{backgroundColor: 'rgba(224, 242, 241, 1)', paddingTop: 10, paddingBottom: 10}}>
                <div style={styles.param}>
                  Вычисление
                </div>
              </ListItem>
              <Divider />
              {
                this.state.anamorf
                ?
                  <div style={{textAlign: 'center', fontSize: 16, marginTop: 15}}>
                    Анаморфирование достигнуто
                  </div>
                :
                  this.state.change
                ?
                  <div style={{textAlign: 'center', fontSize: 16, marginTop: 15}}>
                    Необходимо перестроение
                  </div>
                :
                  <div>
                    <ListItem style={styles.paramItem}>
                      <div style={styles.paramItemLabel}>
                        Количество шагов
                      </div>
                      <Input
                        style={styles.cell}
                        value={this.state.step}
                        onChange={(e) => this.handleChange('step', e)}
                      >
                      </Input>
                    </ListItem>
                    <Button variant='raised' size='medium' style={styles.buttonStep} onClick={this.anamorfStep}>
                      <Icon style={{fontSize: 26}}>navigate_next</Icon>
                      &nbsp;&nbsp;Вычислить шагов
                    </Button>
                    <Button variant='raised' size='medium' style={styles.buttonCalc} onClick={this.anamorf}>
                      <Icon style={{fontSize: 26}}>redo</Icon>
                      &nbsp;&nbsp;Анаморф
                    </Button>
                  </div>
              }
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
    paddingTop: 5,
    paddingBottom: 0,
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
    margin: 12,
    marginTop: 25,
    backgroundColor: 'darkseagreen'
  },
  buttonSum: {
    fontSize: 13,
    fontWeight: 600,
    width: '80%',
    marginTop: 25,
    marginLeft: '10%',
    backgroundColor: 'darkseagreen'
  },
  buttonStep: {
    fontSize: 13,
    fontWeight: 600,
    width: '80%',
    marginTop: 15,
    marginLeft: '10%',
    backgroundColor: 'darkseagreen'
  },
  buttonCalc: {
    fontSize: 16,
    fontWeight: 600,
    width: '80%',
    marginTop: 15,
    marginLeft: '10%',
    backgroundColor: 'darkseagreen'
  }
};
