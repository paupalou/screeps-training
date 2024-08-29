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

export function table(data: Record<string, unknown>, columns: string[], title?: string) {
    let html = '<table style="border: 1px solid lightgrey">';
    html += '<thead>';
    if (title) {
        html += `<tr style="background: white; color: black"><th colspan="${columns.length}" style="text-align:center; padding: 5px 10px">${title}</th></tr>`;
    }
    html += '<tr style="background: lightgrey; color: black">';
    _.forEach(columns, column => {
      html += `<th style="padding: 3px">${column}</th>`
    })
    html += '</thead>';
    html += '<tbody>';
    _.forEach(Object.keys(data), dataKey => {
        html += `<tr style="border: 1px dotted white"><td style="padding: 3px; border: 1px dotted white">${dataKey}</td><td style="padding: 3px; border: 1px dotted white">${JSON.stringify(data[dataKey], null, 0)}</td></tr>`;
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
