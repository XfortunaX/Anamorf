import React, { Component } from 'react'
import './styles.scss'
import Navbar from '../Home/Navbar/index'
import InstrumentPanel from './InstrumentPanel/index'
import MenuPanel from '../Home/MenuPanel/index'
import Anamorf from './ImagePanel/index'
import Grid from 'material-ui/Grid'


export default class CreateFromImage extends Component {
  constructor() {
    super();
    this.state = {
      openInstrument: false,
      openMenu: false
    };

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
            <Anamorf ref={anamorf => {this.anamorf = anamorf}}/>
          </Grid>
          { this.state.openInstrument &&
            <Grid item xs={4} style={{ maxWidth: 300, marginLeft: 'auto' }}>
              <InstrumentPanel rebuild={this.anamorf.resize}/>
            </Grid>
          }
        </Grid>
      </div>
    )
  }
}
