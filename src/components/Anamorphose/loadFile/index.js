import React, { Component } from 'react'
import AnamorphoseModel from '../../../models/anamorphoseModel'
import PubSub from '../../../modules/anamorphose/pubSub'
import AnamorfProcess from '../../../modules/anamorphose/anamorf'
import Dropzone from 'react-dropzone'
import Select from 'material-ui/Select'
import { MenuItem } from 'material-ui/Menu'

export default class LoadFile extends Component {
  constructor() {
    super();

    this.state = {
      type: 'anamorf'
    };

    this.anamorphoseModel = new AnamorphoseModel();
    this.pubSub = new PubSub();
    this.anamorphoseProcess = new AnamorfProcess();

    this.handleChangeType = this.handleChangeType.bind(this);
  }
  handleChangeType(e) {
    console.log(e.target.value);
    this.setState({type: e.target.value})
  }
  onDrop(files) {
    this.setState({
      files
    });
    const reader = new FileReader();
    let self = this;
    reader.onload = () => {
      const fileAsBinaryString = reader.result;

      if (self.state.type === 'anamorf') {
        let anamorphoseData = JSON.parse(fileAsBinaryString);
        self.anamorphoseProcess.createFrom(anamorphoseData);
        self.pubSub.publish('setSize', anamorphoseData.size);
        self.pubSub.publish('refreshInstrument');
      } else if (self.state.type === 'matrix') {
        let anamorf = fileAsBinaryString.split('\n');

        let matrix = [];
        for (let i = 0; i < anamorf.length; i += 1) {
          let arr = anamorf[i].split(';');
          matrix.push(arr);
        }

        let m = matrix.map( arr => {
          return arr.map( item => {
            return parseFloat(item);
          });
        });

        self.anamorphoseModel.reset();
        self.anamorphoseModel.update(m[0].length, m.length);
        self.anamorphoseModel.setMatrix(m);
        self.pubSub.publish('resize');
        if (self.anamorphoseModel.getNumMatrix() === 1) {
          self.anamorphoseProcess.setMatrix(self.anamorphoseModel.getMatrix());
        } else {
          self.anamorphoseProcess.addMatrix(self.anamorphoseModel.getMatrix());
        }
        self.pubSub.publish('refreshInstrument');
        self.anamorphoseProcess.reset();
      } else if (self.state.type.indexOf('matrixColor') !== -1) {
        let anamorf = fileAsBinaryString.split('\n');

        let matrix = [];
        for (let i = 0; i < anamorf.length; i += 1) {
          let arr = anamorf[i].split(';');
          matrix.push(arr);
        }
        for (let i = 0; i < matrix.length; i += 1) {
          for (let j = 0; j < matrix[0].length; j += 1) {
            let arr = matrix[i][j].split(',');
            matrix[i][j] = arr;
          }
        }

        let m = [];
        if (self.state.type === 'matrixColorR') {
          m = matrix.map(arr => {
            return arr.map(item => {
              return parseFloat(item[0]);
            });
          });
        } else if (self.state.type === 'matrixColorG') {
          m = matrix.map(arr => {
            return arr.map(item => {
              return parseFloat(item[1]);
            });
          });
        } else if (self.state.type === 'matrixColorB') {
          m = matrix.map(arr => {
            return arr.map(item => {
              return parseFloat(item[2]);
            });
          });
        }

        let min = m[0][0];
        let max = m[0][0];
        m.forEach( str => {
          str.forEach( item => {
            if (min > item) { min = item; }
            if (max < item) { max = item; }
          })
        });
        console.log(min, max);

        // console.log(m);

        self.anamorphoseModel.reset();
        self.anamorphoseModel.update(m[0].length, m.length);
        self.anamorphoseModel.setMatrix(m);
        self.pubSub.publish('resize');
        if (self.anamorphoseModel.getNumMatrix() === 1) {
          self.anamorphoseProcess.setMatrix(self.anamorphoseModel.getMatrix());
        } else {
          self.anamorphoseProcess.addMatrix(self.anamorphoseModel.getMatrix());
        }
        self.pubSub.publish('refreshInstrument');
        self.anamorphoseProcess.reset();
      }

      self.pubSub.publish('download');
    };
    reader.readAsBinaryString(files[0]);
  }
  render() {
    return (
      <div style={styles.drop}>
        <div>
          <Select
            value={this.state.type}
            onChange={this.handleChangeType}
            inputProps={{name: 'type'}}
            style={{width: 150, fontSize: 20, marginBottom: 45}}
          >
            <MenuItem value={'anamorf'} style={{ fontSize: 20 }}>Анаморф</MenuItem>
            <MenuItem value={'matrix'} style={{ fontSize: 20 }}>Матрица</MenuItem>
            <MenuItem value={'matrixColorR'} style={{ fontSize: 20 }}>Матрица с цветом(красный)</MenuItem>
            <MenuItem value={'matrixColorG'} style={{ fontSize: 20 }}>Матрица с цветом(зеленый)</MenuItem>
            <MenuItem value={'matrixColorB'} style={{ fontSize: 20 }}>Матрица с цветом(синий)</MenuItem>
            {/*<MenuItem value={'geo'} style={{ fontSize: 20 }}>Гео-анаморф</MenuItem>*/}
          </Select>
        </div>
        <div className='dropzone'>
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p>Загрузите файл...</p>
          </Dropzone>
        </div>
      </div>
    );
  }
}

const styles = {
  drop: {
    maxHeight: '74vh',
    overflowY: 'auto',
    maxWidth: 'calc(100% - 10px)',
    display: 'inline-block'
  }
};
