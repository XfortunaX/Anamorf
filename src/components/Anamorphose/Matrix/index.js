import React, { Component } from 'react'
import AnamorphoseModel from '../../../models/anamorphoseModel'
import Input from 'material-ui/Input'
import TextField from 'material-ui/TextField'
import PubSub from '../../../modules/anamorphose/pubSub'


export default class Matrix extends Component {
  constructor() {
    super();

    this.anamorphoseModel = new AnamorphoseModel();
    this.pubSub = new PubSub();

    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(k, i, e) {
    e.preventDefault();
    console.log(k, i, e.target.value);
    this.anamorphoseModel.setCell({y: k, x: i, value: parseFloat(e.target.value)});
    this.pubSub.publish('changeMatrix');
  }
  createMatrix() {
    let matrix = this.anamorphoseModel.getMatrix();
    let self = this;
    let drawMatrix = matrix.map( (item, i) => {
      return self.createRow(item, i)
    });
    return (
      <div style={{display: 'table-caption'}}>
        {drawMatrix}
      </div>
    )
  }
  createRow(row, key) {
    let cells = row.map( (item, i) => {
      return (
        <Input
          key={key + '_' + i}
          style={styles.cell}
          defaultValue={item}
          onBlur={(e) => {this.handleChange(key, i, e)}}
        >
        </Input>
      )
    });
    cells.unshift(
      <TextField
        InputProps={{style: styles.num}}
        defaultValue={key+1}
        key={'num'}
        disabled={true}
      >
      </TextField>
    );
    return (
      <div key={key} style={{display: 'inline-block'}}>
        <div style={{display: 'inline-flex'}}>
          {cells}
        </div>
      </div>
    )
  }
  createRowTop() {
    let rowTop = this.anamorphoseModel.getMatrix()[0].map((item, i) => {
      return (
        <TextField
          key={i}
          InputProps={{style: styles.num}}
          defaultValue={i + 1}
          disabled={true}
        >
        </TextField>
      )
    });
    rowTop.unshift(
      <TextField
        InputProps={{style: styles.num}}
        defaultValue={'#'}
        key={'num'}
        disabled={true}
      >
      </TextField>
    );
    return (
      <div style={{display: 'inline-block'}}>
        <div style={{display: 'inline-flex'}}>
          {rowTop}
        </div>
      </div>
    )
  }
  render() {
    return (
      <div style={styles.matrix}>
        {this.createRowTop()}
        {this.createMatrix()}
      </div>
    );
  }
}

const styles = {
  matrix: {
    maxHeight: '74vh',
    overflowY: 'auto',
    maxWidth: 'calc(100% - 10px)',
    display: 'inline-block'
  },
  num: {
    fontSize: 24,
    marginLeft: 10,
    marginTop: 5,
    width: 50,
    backgroundColor: 'rgba(178, 223, 219, 1)',
    color: 'black'
  },
  cell: {
    fontSize: 24,
    marginLeft: 10,
    marginTop: 5,
    width: 50
  }
};
