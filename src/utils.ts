export function log(something: string | object) {
    if (typeof something === 'string') {
        console.log(something);
        return;
    }

    if (typeof something === 'object') {
        console.log(JSON.stringify(something, null, 2));
        return;
    }
}

export function table(data: Record<string, unknown>, title?: string) {
      let html = '<table style="border: 1px solid lightgrey">';
      html += '<thead>'
      if (title) {
        html += `<tr style="background: white; color: black"><th colspan="2" style="text-align:center; padding: 5px 10px">${title}</th></tr>`;
      }
      html += `<tr style="background: lightgrey; color: black"><th style="padding: 3px">Source ID</th><th style="padding: 3px">Number of harvesters</th></tr>`;
      html += '</thead>';
      html += '<tbody>';
      _.forEach(Object.keys(data), dataKey => {
          html += `<tr style="border: 1px dotted white"><td style="padding: 3px; border: 1px dotted white">${dataKey}</td><td style="padding: 3px; border: 1px dotted white">${data[dataKey]}</td></tr>`;
      });
      html += '</tbody></table>';
      log(html);
}



export function getAdjacentPositions(point: RoomPosition, roomName: string) {
    const possibleSpots = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1]
    ];

    return _.map(possibleSpots, ([x, y]) => new RoomPosition(point.x + x, point.y + y, roomName));
}
