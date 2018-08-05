/**
 * Created by sergey on 10.08.17.
 */

import { API_URL } from '../../constants/index';

export default class Transport {

  constructor() {
    if (Transport.instance) {
      return Transport.instance;
    }
    Transport.instance = this;
  }
  post(request, data, headers) {
    // console.log(data);
    return fetch(API_URL + request, {
      method: 'POST',
      body: data,
      headers: headers
    })
      .then(function (response) {
        console.log(response);
        if (response.status !== 200) {
          return false;
        }
        return response.json();
      })
      .catch(function (error) {
        console.log('Request failed', error);
        return false;
      })
  }
  get(request, headers) {
    return fetch(API_URL + request, {
      method: 'GET',
      headers: headers
    })
      .then(function (response) {
        return response.json();
      });
  }
}
