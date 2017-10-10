// Desired formats to parse:
// JPEG, JPEG2, TIFF, PNG, GIF, RAW

// The code below only handles general EXIF in JPG-files

//TODO: geocoder requires api key for googles geocode, otherwise quota is only a few requests per day
// local-reverse-geocoder is an alternative using local files (that needs to be pre-fetched)
// since googles geocoder provides details down to street level it's likely preferred as it makes it possible
// to search for all pictures from a certain adress, street, part of town etc.

const fs = require("fs"),
  path = require("path"),
  exifParser = require("exif-parser"),
  geocoder = require("geocoder");

const filePath = path.join(__dirname, "testImages", "20170830_094346.jpg");

const stream = fs.createReadStream(filePath, { start: 0, end: 65535 });
const imgHeader = [];

stream.on("error", (err) => {
  console.log(err);
});

stream.on("data", (data) => {
  imgHeader.push(data);
});

stream.on("close", () => {

  const buffer = Buffer.concat(imgHeader);
  const exif = exifParser.create(buffer);
  const parseResult = exif.parse();

  const tags = parseResult.tags;

  //TODO: GPS info + geocode needs validation, error handling etc.
  // TODO: restructure, separate functions/modules with async/await

  if (tags.GPSDateStamp) {
    tags.DateAndTime = {
      hour: +tags.GPSTimeStamp[0],
      minute: +tags.GPSTimeStamp[1],
      second: +tags.GPSTimeStamp[2],
      year: +tags.GPSDateStamp.split(":")[0],
      month: +tags.GPSDateStamp.split(":")[1],
      dayOfMonth: +tags.GPSDateStamp.split(":")[2]
    };
  }

  if (tags.GPSLatitude && tags.GPSLongitude) {
    geocoder.reverseGeocode(tags.GPSLatitude, tags.GPSLongitude, (err, data) => {
      if (err) throw (err);

      tags.location = data;
      const result = JSON.stringify(tags);
      console.log(result);
    });
  }
  else {
    const result = JSON.stringify(tags);
    console.log(result);
  }
});


