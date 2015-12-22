'use strict';

var request = require('request');
var bcrypt = require('bcrypt-nodejs');

var password = "letmein";

bcrypt.hash(password, null, null, function(error, hash) {
    if (error) throw err;

    request.post (
        {
            uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/createnewuser",
            json: {
                FullName : "Matthew Lyon",
                JobTitle : "Bioinformatician",
                UserId : "matt.lyon@wales.nhs.uk",
                Password : hash,
                ContactNumber : "02920742361",
                Admin : true
            }
        },
        function(error, result)
        {
            if (error) throw err;
            console.log(JSON.stringify(result));
        }
    );

});