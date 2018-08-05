import React, { Component } from 'react'
import { Link } from 'react-router'
import './styles.scss'
import Navbar from './Navbar/index'

export default class Home extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className='home-page'>
        <Navbar/>
        {/*<SidePanel/>*/}
        <div className='main'>
          <div className='menu'>
            <div className='toAnamorf'>
              <div className='menu-item'>
                <Link className='link' to='/anamorphose'>АНАМОРФИРОВАНИЕ</Link>
              </div>
              {/*<div className='menu-item'>*/}
                {/*<Link className='link' to='/anamorf'>К анаморфозам</Link>*/}
              {/*</div>*/}
              {/*<div className='menu-item'>*/}
                {/*<Link className='link' to='/anamorf_create'>Cоздать матрицу</Link>*/}
              {/*</div>*/}
              {/*<div className='menu-item'>*/}
                {/*<Link className='link' to='/anamorf_zone'>Анаморфоза по зонам</Link>*/}
              {/*</div>*/}
              {/*<div className='menu-item'>*/}
                {/*<Link className='link' to='/anamorf_test'>Тестовое анаморфирование</Link>*/}
              {/*</div>*/}
              {/*<div className='menu-item'>*/}
                {/*<Link className='link' to='/anamorf_dynamic'>Динамическое анаморфирование</Link>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
