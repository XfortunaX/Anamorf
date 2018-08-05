import React, { Component } from 'react'
import { Link } from 'react-router'
import Paper from 'material-ui/Paper';
import List, { ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'


export default class MenuPanel extends Component {
  constructor(props) {
    super();

    this.menu = [
      {
        label: 'Анаморфирование',
        path: 'anamorphose'
      },
      {
        label: 'Создать матрицу из изображения',
        path: 'CreateFromImage'
      }
      // {
      //   label: 'Создать гео-анаморфозу',
      //   path: 'createGeo'
      // }
    ];
    this.change = props.change
  }
  render() {
    return (
      <div>
        <Paper elevation={4} style={{height: '91vh'}}>
          <List component='nav'>
            {
              this.menu.map((item, i) => {
                return (
                  <Link to={'/' + item.path} key={i}>
                    <ListItem button>
                      <div style={{fontSize: 18}}>{item.label}</div>
                      <Divider />
                    </ListItem>
                  </Link>
                )
              })
            }
          </List>
        </Paper>
      </div>
    );
  }
}
