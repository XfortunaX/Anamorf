let app = new PIXI.Application({
    width: 337,
    height: 1280,
    antialiasing: true,
    transparent: false,
    resolution: 1
  }
);
document.body.appendChild(app.view);

let pathImage = 'image.jpg';
let im = {
  pos: {
    x: 100,
    y: 900
  },
  size: {
    width: 200,
    height: 200
  }
};
let matrix = {
  m: [],
  size: {
    width: 200,
    height: 200
  },
  matrix: [],
  m2: []
};
let text = '';

PIXI.loader
  .add(pathImage)
  .load(setup);

function setup() {
  let sprite = new PIXI.Sprite(PIXI.loader.resources[pathImage].texture);
  app.stage.addChild(sprite);

  app.renderer.render(app.stage);

  let sourceCanvas = app.renderer.extract.canvas();
  let sourceContext = sourceCanvas.getContext('2d');

  let step = {
    x: Math.floor(im.size.width / matrix.size.width),
    y: Math.floor(im.size.height / matrix.size.height)
  };

  for (let i = 0; i < matrix.size.height; i += 1) {
    matrix.m[i] = [];
    matrix.matrix[i] = [];
    matrix.m2[i] = [];
    for (let j = 0; j < matrix.size.width; j += 1) {
      let imageData = sourceContext.getImageData(im.pos.x + j * step.x, im.pos.y + i * step.y, im.size.width, im.size.height);
      matrix.m[i].push({
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2]
      });
      matrix.matrix[i].push(matrix.m[i][j].r);
      matrix.m2[i].push(matrix.m[i][j].r);
    }
  }

  console.log(matrix.matrix);
  // matrix.m2 = matrix.matrix;

  matrix.matrix.forEach((arr, i, matr) => {
    arr.forEach((item, j, arr) => {
      text += item;
      if (j < matrix.size.width - 1) {
        text += ';';
      }
    });
    if (i < matrix.size.height - 1) {
      text += '\n';
    }
  });

  console.log(text);

}