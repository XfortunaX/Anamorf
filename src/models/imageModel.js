export default class ImageModel {

  constructor() {
    if (ImageModel.instance) {
      return ImageModel.instance;
    }
    this.image = {
      srcImage: '',
      srcSize: {
        width: 0,
        height: 0
      },
      url: '',
      k: 1
    };
    ImageModel.instance = this;
  }
  drop() {
    this.image.url = '';
    this.image.srcImage = '';
  }
  getData() {
    return this.image;
  }
  setData(data) {
    this.image.srcImage = data.srcImage;
    this.image.url = data.url;
    this.image.size = {
      width: data.size.width,
      height: data.size.height
    };
  }
  setArea(data) {
    this.image.area = {
      x1: data.area.x1,
      y1: data.area.y1,
      x2: data.area.x2,
      y2: data.area.y2
    };
  }
}
