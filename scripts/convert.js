
function convertDegreeToDecimal(deg, min, sec) {
    return deg + (min / 60) + (sec / 3600);
}

function convertDecimalToDegree(decimal) {
    let deg = 0, min = 0, sec = 0;

    if (deg > 0) {
        deg = Math.floor(decimal);
        min = Math.floor((decimal - deg) * 60);
        sec = (((decimal - deg) / 60) - min) * 60;
    }

    else if (deg < 0) {
        deg = Math.ceil(decimal);
        min = Math.floor((decimal - deg) * 60);
        sec = (((decimal - deg) / 60) - min) * 60;
    }
    
    return [deg, min, sec];
}

function approximateFeetToDegrees(ft) {
    return (((ft * 0.3048) / 1000) / (10000/90));
}

module.exports = { convertDecimalToDegree, convertDegreeToDecimal, approximateFeetToDegrees };