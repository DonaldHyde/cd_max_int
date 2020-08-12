const ExifImage = require('exif').ExifImage;
const fs = require('fs');
const convertDegreeToDecimal = require('./convert.js').convertDegreeToDecimal;
const colors = require('colors');

let assetExifData = [];

function asyncExtractAssetData(path) {
    fs.readdir(path, function(err, items) {
        let i = 0;
        const len = items.length;

        getAsset(path + items[i]);
        
        function getAsset(assetPath) {
            getExif(assetPath).then(
                response => {
                    assetExifData.push(response);
                    console.log(i+1, 'of', len);

                    if (++i < len) {
                        getAsset(path + items[i])
                    }

                    else {
                        for (let i=0,len=assetExifData.length;i<len;i++) {
                            let gpsData = assetExifData[i].gps;
                            console.log('exif gps:', assetExifData[i].gps);
                            
                            let latitude = convertDegreeToDecimal(
                                assetExifData[i].gps.GPSLatitude[0],
                                assetExifData[i].gps.GPSLatitude[1],
                                assetExifData[i].gps.GPSLatitude[2]
                            );

                            let longitude = convertDegreeToDecimal(
                                assetExifData[i].gps.GPSLongitude[0],
                                assetExifData[i].gps.GPSLongitude[1],
                                assetExifData[i].gps.GPSLongitude[2]
                            );
                            
                            console.log('Image:', colors.cyan(assetExifData[i].image.name));
                            // console.log(assetExifData[i].gps);
                            console.log('Lat:', latitude, ', Long:', longitude);
                        }
                        // Go to the next step
                    }
                },
                error => console.error('Error:', error)
            );
        }
    });
}

function getExif(path) {
    return new Promise((resolve, reject) => {
        new ExifImage({ image : path }, function (error, exifData) {
            if (error) {
                console.log('Error: '+error.message);
                reject(error);
            }

            else {
                const newData = {
                    image: {
                        name: exifData.image.ImageDescription,
                        GPSInfo: exifData.image.GPSInfo
                    },
                    gps: exifData.gps
                };

                resolve(newData);
            }
        });
    });
}

module.exports = { asyncExtractAssetData }