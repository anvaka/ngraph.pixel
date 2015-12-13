module.exports = {
  getHexColor: getHexColor
};

function getHexColor(buffer, idx) {
  var r = buffer[idx    ];
  var g = buffer[idx + 1];
  var b = buffer[idx + 2];
  return (r << 16) | (g << 8) | b;
}
