const piexif = require('piexifjs');
const fs = require('fs');
const convertDegreeToDecimal = require('./convert.js').convertDegreeToDecimal;

function extractAssetData(path) {
    let gpsArray = [];
    const images = fs.readdirSync(path);

    for (let i = 0, len = images.length; i < len; i++) {
        const jpeg = fs.readFileSync(`${path}${images[i]}`);
        const data = jpeg.toString('binary');
        const GPS = piexif.load(data).GPS;

        let latitude = convertDegreeToDecimal(
            GPS[2][0][0] / GPS[2][0][1],
            GPS[2][1][0] / GPS[2][1][1],
            GPS[2][2][0] / GPS[2][2][1]
        );

        let longitude = convertDegreeToDecimal(
            GPS[4][0][0] / GPS[4][0][1],
            GPS[4][1][0] / GPS[4][1][1],
            GPS[4][2][0] / GPS[4][2][1]
        );

        const altitude = GPS[6][0] / GPS[6][1];

        gpsArray.push({
            name: images[i],
            fullPath: `${path}${images[i]}`,
            GPS: {
                lat: GPS[3] === 'S' ? 0 - latitude : latitude,
                long: GPS[3] === 'W' ? 0 - longitude : longitude,
                alt: altitude,
                // raw: GPS
            }
        });
    }

    return gpsArray;
}

module.exports = { extractAssetData };

// piexifjs GPS Key
//   "GPS": {
//     "0": [2, 3, 0, 0],   // GPSVersionID
//     "1": "N",            // GPSLatitudeRef
//     "2": [               // GPSLatitude
//       [32, 1],           // Degrees ([0] / [1])
//       [58, 1],           // Minutes ([0] / [1])
//       [559234, 10000]    // Seconds ([0] / [1])
//     ],
//     "3": "W",            // GPSLongitudeRef
//     "4": [               // GPSLongitude
//       [80, 1],           // Degrees ([0] / [1])
//       [0, 1],            // Minutes ([0] / [1])
//       [267054, 10000]    // Seconds ([0] / [1])
//     ],
//     "5": 1,              // GPSAltitudeRef
//     "6": [89861, 1000]   // GPSAltitude ([0] / [1])
//   }
