import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';


export default class Navbar extends Component {
  constructor(props) {
    super();
    this.state = {
      openInstrument: props.openInstrument,
      handleInstrumentMenu: props.handleInstrumentMenu,
      openMenu: props.openMenu,
      handleMenu: props.handleMenu
    };

    this.handleInstrument = this.handleInstrument.bind(this);
    this.handleMenu = this.handleMenu.bind(this);
  }
  handleInstrument() {
    this.setState({ openInstrument: !this.state.openInstrument });
    this.state.handleInstrumentMenu(!this.state.openInstrument);
  }
  handleMenu() {
    this.setState({ openMenu: !this.state.openMenu });
    this.state.handleMenu(!this.state.openMenu);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ openMenu: nextProps.openMenu, openInstrument: nextProps.openInstrument})
  }
  render() {
    return (
      <div>
        <AppBar position='static' color='default' style={styles.navbar}>
          <Toolbar>
            <IconButton color='inherit' aria-label='open drawer' onClick={this.handleMenu}>
              { this.state.openMenu
                ? <Icon style={{fontSize: 30}}>clear</Icon>
                : <Icon style={{fontSize: 30}}>menu</Icon>
              }
            </IconButton>
            <Grid container alignItems={'center'}>
              <Typography variant='title' color='inherit' style={styles.title}>
                Анаморфозные &nbsp;&nbsp; преобразования
              </Typography>
            </Grid>
            <IconButton color='inherit' aria-label='open drawer' onClick={this.handleInstrument}>
              { this.state.openInstrument
                ? <Icon style={{fontSize: 30}}>clear</Icon>
                : <Icon style={{fontSize: 30}}>settings</Icon>
              }
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

const styles = {
  navbar: {
    height: 60,
    justifyContent: 'center'
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: '2.5em',
    fontStyle: 'italic',
    fontFamily: 'Lobster'
  }
};
