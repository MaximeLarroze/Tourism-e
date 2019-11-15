var express = require('express');
var router = express.Router();
var typesavaible = require('./typesavaible');

var fetch = require('node-fetch');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'web4',
    password: 'D2019',
    database: 'web4'
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Home'
    });
});

router.get('/test', function (req, res, next) {
  console.log("Query in progress...");
  connection.query('SELECT id, title, content FROM pages', function (error, results, fields) {
    console.log(results[0])

    if (results.length > 0) {
      res.render('test', {
        title: 'Tests',
        data: results[0]
      });
    }

    else {
      res.send("null");
    }
  });
});

router.get('/admin', function(req, res, next) {
    if (req.session.username) {
        res.render('admin', {
            title: 'Welcome ' + req.session.username
        });
    } else {
        res.render('login', {
            title: 'Login'
        });
    }
});

router.get('/map', function (req, res, next) {
  res.render('map', {
    title: "Map"
  });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
        console.log("Connecting to database...");
        connection.query('SELECT * FROM users WHERE username = ? AND password = PASSWORD(?)', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('../admin');
            } else {
                res.render('invalid-login', {
                    title: 'Invalid credentials'
                });
            }

            res.end();
        });
    } else {
        res.render('invalid-login', {
            title: 'Missing username/password'
        });
        res.end();
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.render('disconnected', {
                title: 'Failed: ' + err
            });
        } else {
            res.render('disconnected', {
                title: 'Disconnected successfully!'
            });
        }
    });
});

router.get('/offers', function(req, res, next) {
    var dataString = JSON.stringify({
        query: `
      {
        poi(size: 100)
        { 
        results {
          _uri,
          dc_identifier,
          rdfs_label {
            value
          },
          rdf_type,
          takesPlaceAt{
            startDate,
            endDate
          },
          isLocatedAt {
            schema_address {
              schema_streetAddress,
              schema_postalCode,
              schema_addressLocality
            },
            schema_geo{
              schema_latitude schema_longitude
            }
          },
          hasDescription {
            shortDescription {
              value,
              lang
            },
            dc_description {
              lang,
              value
            }
          }
        }
      }
    }`
    });
    fetch('http://vps.cours-diiage.com:8080', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: dataString
        })
        .then(r => r.json())
        .then(data =>
            res.render('offers', { title: 'Offers', data: data.data.poi.results, types: typesavaible.allTypes() }));
});

router.get('/detail/:poiId', function(req, res, next) {
    var dataString = JSON.stringify({
        query: `
      {
        poi( size:100, filters: [{dc_identifier: {_text: "` + req.params.poiId + `"}}]) {
          results {
            _uri
            dc_identifier
            rdfs_label {
              value
            }
            offers {
              schema_priceSpecification {
                schema_price
              }
            }
            rdf_type
            takesPlaceAt {
              startDate
              endDate
            }
            hasRepresentation {
              ebucore_hasRelatedResource {
                ebucore_locator
              }
            }
            lastUpdate
            hasBeenPublishedBy {
              schema_legalName
            }
            hasContact {
              schema_email
              schema_telephone
            }
            reducedMobilityAccess
            isLocatedAt {
              schema_address {
                schema_streetAddress
                schema_postalCode
                schema_addressLocality
              }
              schema_geo {
                schema_latitude
                schema_longitude
              }
            }
            hasDescription {
              shortDescription {
                value
                lang
              }
              dc_description {
                lang
                value
              }
            }
          }
        }
      }`
    });
    fetch('http://vps.cours-diiage.com:8080', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: dataString
        })
        .then(r => r.json())
        .then(data =>
            res.render('detail', { title: 'Offers detail', data: data.data.poi.results[0] }));
});

router.get('/offers/:category', function(req, res, next) {
    console.log(req.query);
    var dataString = JSON.stringify({
        query: `
      {
        poi(
          size:100,
          filters: [{rdf_type: {_in: ["https://www.datatourisme.gouv.fr/ontology/core#` + req.query.category + `"]}}]
        ) {
          results {
            _uri
            dc_identifier
            rdfs_label {
              value
            }
            offers {
              schema_priceSpecification {
                schema_price
              }
            }
            rdf_type
            takesPlaceAt {
              startDate
              endDate
            }
            hasRepresentation {
              ebucore_hasRelatedResource {
                ebucore_locator
              }
            }
            lastUpdate
            hasBeenPublishedBy {
              schema_legalName
            }
            hasContact {
              schema_email
              schema_telephone
            }
            reducedMobilityAccess
            isLocatedAt {
              schema_address {
                schema_streetAddress
                schema_postalCode
                schema_addressLocality
              }
              schema_geo {
                schema_latitude
                schema_longitude
              }
            }
            hasDescription {
              shortDescription {
                value
                lang
              }
              dc_description {
                lang
                value
              }
            }
          }
        }
      }`
    });
    fetch('http://vps.cours-diiage.com:8080', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: dataString
        })
        .then(r => r.json())
        .then(data =>
            res.render('offers', { title: 'Offers', data: data.data.poi.results, types: typesavaible.allTypes() }));
});
module.exports = router;