import fileDownload from 'js-file-download'

export default class MatrixModel {

  constructor() {
    if (MatrixModel.instance) {
      return MatrixModel.instance;
    }
    this.matrix = {
      size: {
        width: 0,
        height: 0
      },
      pos: {
        x: 0,
        y: 0
      },
      matrix: [],
      text: '',
      norm: {
        top: 10,
        down: 1
      }
    };
    MatrixModel.instance = this;
  }
  reset(data) {
    this.matrix.size = {
      width: data.width,
      height: data.height
    };
    this.matrix.matrix = [];
    for (let i = 0; i < this.matrix.size.height; i += 1) {
      this.matrix.matrix[i] = [];
      for (let j = 0; j < this.matrix.size.width; j += 1) {
        this.matrix.matrix[i][j] = 0;
      }
    }
  }
  setMatrix(data) {
    this.matrix.matrix[data.y][data.x] = data.color;
  }
  norm(data) {
    console.log(data);
    this.matrix.norm.down = parseFloat(data.down);
    this.matrix.norm.top = parseFloat(data.top);
    let self = this;
    this.matrix.matrix.forEach((arr) => {
      arr.forEach((item) => {
        for (let e in item) {
          item[e] = self.funcNorm(item[e]);
        }
      });
    });
  }
  funcNorm(num) {
    // return (this.matrix.norm.top - this.matrix.norm.down) / 255.0 * num + this.matrix.norm.down;
    return this.matrix.norm.down * Math.exp(Math.log(this.matrix.norm.down / this.matrix.norm.top) / (-255.0) * num)
  }
  invert() {
    this.matrix.matrix.forEach((arr) => {
      arr.forEach((item) => {
        for (let e in item) {
          item[e] = 255 - item[e];
        }
      });
    });
  }
  noise() {
    this.matrix.matrix.forEach((arr) => {
      arr.forEach((item) => {
        for (let e in item) {
          item[e] *= Math.random();
        }
      });
    });
  }
  toText(param) {
    this.matrix.text = '';
    let self = this;
    this.matrix.matrix.forEach((arr, i) => {
      arr.forEach((item, j) => {
        self.matrix.text += item[param];
        if (j < self.matrix.size.width - 1) {
          self.matrix.text += ';';
        }
      });
      if (i < self.matrix.size.height - 1) {
        self.matrix.text += '\n';
      }
    });
  }
  toTextFull() {
    this.matrix.text = '';
    let self = this;
    this.matrix.matrix.forEach((arr, i) => {
      arr.forEach((item, j) => {
        self.matrix.text += item.r + ',';
        self.matrix.text += item.g + ',';
        self.matrix.text += item.b + ',';
        self.matrix.text += item.t;
        if (j < self.matrix.size.width - 1) {
          self.matrix.text += ';';
        }
      });
      if (i < self.matrix.size.height - 1) {
        self.matrix.text += '\n';
      }
    });
  }
  show() {
    console.log(this.matrix.matrix);
  }
  saveMatrix() {
    fileDownload(this.matrix.text, 'anamorf.csv');
  }
  drop() {
    this.matrix = {
      size: {
        width: 0,
        height: 0
      },
      pos: {
        x: 0,
        y: 0
      }
    };
  }
  getData() {
    return this.matrix;
  }
  setPos(pos) {
    this.matrix.pos = {
      x: pos.x,
      y: pos.y
    }
  }
}
