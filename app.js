'use strict';
const express = require('express');
const app = express();
const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const https = require('https');
//const uuid = require('uuid/v4');
const fs = require('fs');
//const tempDir = path.join(__dirname, 'downloads');
const uri = "https://www.slideshare.net/vtunotesbysree/vtu-5th-sem-cse-operating-systems-notes-10cs53";
const resolution = 638; //1024, 638, 320

request(uri, (err, response, html) => {
    if (err) {
        console.log(err);
    } else {
        var $ = cheerio.load(html);
        $("#svPlayerId").filter(function() {
            var data = $(this);
            //console.log(new Date().getTime());
            let end = data.find("#total-slides").text();
            let link = data.find(".slide_image").first().attr("data-full");
            //console.log(new Date().getTime());
            //console.log(link);

            download(link.split('1-1024')[0], end, resolution);
        });
    }
});



function download(link, end, resolution) {
    fs.mkdtemp(path.join(__dirname, 'public', 'downloads', 'sshare-'), (err, folder) => {
        if (err) {
            console.log(err);
        }
        if (folder) {
            //console.log(folder);        
            for (let i = 1; i <= end; i++) {
                let temp = link + i + '-' + resolution + '.jpg';
                https.get(temp, (response) => {
                    // console.log(response.statusCode);

                    if (response.statusCode === 200) {
                        let file = fs.createWriteStream(folder + '/' + i + '.jpg');
                        // console.log('statusCode:', response.statusCode);
                        // console.log('headers:', response.headers);
                        response.pipe(file);
                        file.on('finish', () => {
                            file.close(() => {
                                console.log("downloaded page: ", i, '/', end);
                            });
                        });
                    } else {
                        console.log('error response code: ', response.statusCode);
                    }
                }).on('error', (err) => {
                    console.log('\nError downloading:', i, ' / ', end, '\n');
                    console.error(err);
                });
            }
        }
    });
}
app.listen(3000, (err, done) => {
    if (err) {
        console.log(err);
    } else {
        console.log("server started at port " + 3000);
    }
});
