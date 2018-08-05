import React, { Component } from 'react'
import './styles.scss'
import Navbar from '../Home/Navbar/index'
import InstrumentPanel from './InstrumentPanel/index'
import MenuPanel from '../Home/MenuPanel/index'
import Anamorf from './Anamorf/index'
import Grid from 'material-ui/Grid'
import AnamorphoseModel from '../../models/anamorphoseModel'


export default class Anamorphoses extends Component {
  constructor() {
    super();
    this.state = {
      openInstrument: true,
      openMenu: false,
      anamorf: 'anamorf'
    };

    this.anamorphoseModel = new AnamorphoseModel();

    this.handleMenu = this.handleMenu.bind(this);
    this.handleInstrumentMenu = this.handleInstrumentMenu.bind(this);
  }
  handleInstrumentMenu(state) {
    this.setState({openInstrument: state});
    if (this.state.openMenu === true) {
      this.setState({openMenu: false})
    }
  }
  handleMenu(state) {
    this.setState({openMenu: state});
    if (this.state.openInstrument === true) {
      this.setState({openInstrument: false})
    }
    if (state === false) {
      this.setState({openInstrument: true})
    }
  }
  handleChangeState(state) {
    this.setState({anamorf: state});
  }
  render() {
    return (
      <div className='home-page'>
        <Navbar
          openMenu={this.state.openMenu}
          handleMenu={this.handleMenu}
          openInstrument={this.state.openInstrument}
          handleInstrumentMenu={this.handleInstrumentMenu}
        />
        <Grid container spacing={0}>
          { this.state.openMenu &&
            <Grid item style={{width: 300}}>
              <MenuPanel change={this.handleChangeState}/>
            </Grid>
          }
          <Grid item style={{width: `calc(100% - ${this.state.openInstrument || this.state.openMenu ? 300 : 0}px)`}}>
            <Anamorf/>
          </Grid>
          { this.state.openInstrument &&
            <Grid item xs={4} style={{ maxWidth: 300, marginLeft: 'auto' }}>
              <InstrumentPanel/>
            </Grid>
          }
        </Grid>
      </div>
    )
  }
}
