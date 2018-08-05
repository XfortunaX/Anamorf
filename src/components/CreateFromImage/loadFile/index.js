import React, { Component } from 'react'
import PubSub from '../../../modules/anamorphose/pubSub'
import ImageModel from '../../../models/imageModel'
import Dropzone from 'react-dropzone'


export default class LoadFile extends Component {
  constructor() {
    super();

    this.imageModel = new ImageModel();
    this.pubSub = new PubSub();

  }
  onDrop(files) {
    this.setState({
      files
    });
    let reader = new FileReader();
    let self = this;
    let img = new Image();

    reader.readAsDataURL(files[0]);
    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => {
        self.imageModel.setData({
          url: event.target.result,
          srcImage: img,
          size: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        });
        self.pubSub.publish('loadedImage', true);
      };
    }
  }
  render() {
    return (
      <div style={styles.drop}>
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
