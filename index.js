// Libraries
const ExifImage = require('exif').ExifImage;
const piexif = require('piexifjs');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const colors = require('colors');
const prettyjson = require('prettyjson');

// Scripts
const extractAssetData = require('./scripts/extractAssetData.js').extractAssetData;
const asyncExtractAssetData = require('./scripts/asyncExtractAssetData.js').asyncExtractAssetData;
const convertDegreeToDecimal = require('./scripts/convert.js').convertDegreeToDecimal;

// General Inclusions
// const convertDegreeToDecimal = require('./scripts/convert.js').convertDegreeToDecimal;

// TEMP HELPERS
// const approximateFeetToDegrees = require('./scripts/convert.js').approximateFeetToDegrees;

try {

    // 328ft

    // console.log('30ft in deg:', approximateFeetToDegrees(30));

    // get paths - folder and definition -- config?
    const configPath = './input/config.json';
    const imagePath = './input/images/';

    console.log(colors.yellow('Reading Assets . . .'));
    const assetData = extractAssetData(imagePath);
    console.log(colors.cyan('Exif Extraction Complete.'));

    console.log(colors.yellow('Reading Configuration File . . .'));
    const configData = JSON.parse(fs.readFileSync(configPath));

    console.log(colors.yellow('Mapping Assets . . .'));
    const mappedAssets = mapAssetsToConfig(assetData, configData);
    console.log(colors.cyan('Assets Mapped Successfully!'));

    console.log(colors.yellow('Writing to Disk . . .'));
    writeToDisk({
        mappedAssets,
        assetData,
        configData
    });
    console.log(colors.green('Task Complete. Map saved in /output/output.json'));

} catch (error) {
    console.log('Error: ' + error.message);
}

function mapAssetsToConfig(inputAssetArray, config) {
    const mappedAssetArray = [];
    const configArray = config.data.points;
    const configTolerance = config.data.meta.tolerance || 0.0000275;

    // Diff the mapped origin point with the measured origin point
    // Set to 0 for stationary objects (specific houses)
    const referenceLatOffset = 0; //config.data.referencePoint.lat - inputAssetArray.data.referencePoint.lat;
    const referenceLongOffset = 0; //config.data.referencePoint.long - inputAssetArray.data.referencePoint.long;
    const referenceAltOffset = 0; //config.data.referencePoint.alt - inputAssetArray.data.referencePoint.alt;

    configArray.forEach((sourcePoint) => {
        const pointLatLowerLimit =  sourcePoint.position.lat  + referenceLatOffset  - configTolerance;
        const pointLatUpperLimit =  sourcePoint.position.lat  + referenceLatOffset  + configTolerance;
        const pointLongLowerLimit = sourcePoint.position.long + referenceLongOffset - configTolerance;
        const pointLongUpperLimit = sourcePoint.position.long + referenceLongOffset + configTolerance;
        const pointAltLowerLimit =  sourcePoint.position.alt  + referenceAltOffset  - 3;
        const pointAltUpperLimit =  sourcePoint.position.alt  + referenceAltOffset  + 3;

        inputAssetArray.forEach((inputPoint) => {
            const inputLat =  inputPoint.GPS.lat;
            const inputLong = inputPoint.GPS.long;
            const inputAlt =  inputPoint.GPS.alt;

            if (inputLat >= pointLatLowerLimit && inputLat <= pointLatUpperLimit
                && inputLong >= pointLongLowerLimit && inputLong <= pointLongUpperLimit
                && inputAlt >= pointAltLowerLimit && inputAlt <= pointAltUpperLimit
            ) {
                mappedAssetArray.push({
                    name: sourcePoint.data.name,
                    imagePath: inputPoint.fullPath,
                    asset: inputPoint,
                    source: sourcePoint
                })
            }
        })
    });

    return mappedAssetArray;
}

function writeToDisk(newData) {
    if (!newData) newData = {};
    
    // Remove and replace old data from output folder
    rimraf.sync('./output');
    mkdirp.sync('./output');

    // Write new file
    fs.writeFile('./output/output.json', JSON.stringify(newData), (err) => {
        if (err) {
            throw err;
        }
    });
}
