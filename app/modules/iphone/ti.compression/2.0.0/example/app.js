/**
 * This example demonstrates how to zip and unzip files.
 *
 * We'll demonstrate this in two different ways:
 *  - Zipping files.
 *  - Unzipping an archive.
 */
var win = Ti.UI.createWindow({
    backgroundColor: 'white'
});
win.open();

var Compression = require('ti.compression');
var outputDirectory = Ti.Filesystem.applicationDataDirectory;
var inputDirectory = Ti.Filesystem.resourcesDirectory + 'data/';

/**
 * The following lines zip the a.txt and b.txt from the "data"
 * directory in your resources to the data directory of your app.
 */
var zipFiles = Ti.UI.createButton({
    title: 'Zip a.txt and b.txt',
    top: 20, left: 20, right: 20,
    height: 40
});
zipFiles.addEventListener('click', function () {
    var writeToZip = outputDirectory + '/zipFiles.zip';
    var result = Compression.zip(writeToZip, [
        inputDirectory + 'a.txt',
        inputDirectory + 'b.txt'
    ]);
    Ti.API.info(status.text = 'Zip Files: ' + result + ', to: ' + writeToZip);

    if (result == 'success') {
        if (!Ti.Filesystem.getFile(writeToZip).exists()) {
            alert('FAIL: The target zip does not exist!');
        }
        else {
            alert('PASS: The target zip exists!');
        }
    }
});
win.add(zipFiles);

/**
 * The following lines extract the contents of the "a+b.zip" file
 * from the "data" directory in your resources to the data directory
 * of your app.
 */
var unzipArchive = Ti.UI.createButton({
    title: 'Unzip ab.zip',
    top: 80, left: 20, right: 20,
    height: 40
});
unzipArchive.addEventListener('click', function () {
    var zipFileName = inputDirectory + 'ab.zip';
    var result = Compression.unzip(outputDirectory, zipFileName, true);
    Ti.API.info(status.text = 'Unzip: ' + result + ', to: ' + outputDirectory);

    if (result == 'success') {
        if (!Ti.Filesystem.getFile(outputDirectory, 'a.txt').exists()) {
            alert('FAIL: The unzipped a.txt does not exist!');
        }
        else {
            alert('PASS: ' + Ti.Filesystem.getFile(outputDirectory, 'a.txt').read());
        }
    }
});
win.add(unzipArchive);

var status = Ti.UI.createLabel({
    text: 'Hit one of the buttons above, and the result will display here.',
    color: '#333',
    top: 140, left: 20, right: 20, bottom: 20
});
win.add(status);