import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/App/index'
import Home from './components/Home/index'
import NotFound from './components/NotFound/index'
import Anamorf from './components/Anamorf/index'
import Anamorphose from './components/Anamorphose/index'
import CreateFromImage from './components/CreateFromImage/index'
import AnamorfCreate from './components/AnamorfCreate/index'
import AnamorfZone from './components/AnamorfZone/index'
import AnamorfTest from './components/AnamorfTest/index'
import AnamorfDynamic from './components/AnamorfDynamic/index'

export const routes = (
  <div>
    <Route path='/' component={App}>
      <IndexRoute component={Home} />
      <Route path='anamorf' component={Anamorf} />
      <Route path='anamorphose' component={Anamorphose} />
      <Route path='createfromimage' component={CreateFromImage} />
      <Route path='anamorf_create' component={AnamorfCreate} />
      <Route path='anamorf_zone' component={AnamorfZone} />
      <Route path='anamorf_test' component={AnamorfTest} />
      <Route path='anamorf_dynamic' component={AnamorfDynamic} />
    </Route>
    <Route path='*' component={NotFound} />
  </div>
);