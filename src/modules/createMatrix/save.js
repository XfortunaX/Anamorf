document.getElementById('btn-save').addEventListener('click', () => {
  console.log('matr', text);

  let blob = new Blob([text], {type: 'text/plain;charset=ascii'});
  saveAs(blob, 'test' + '.csv');
});

let d = document.getElementsByTagName('canvas')[0];

d.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(d.offsetLeft, d.offsetTop);
  console.log(e.pageX - d.offsetLeft, e.pageY - d.offsetTop);
});
