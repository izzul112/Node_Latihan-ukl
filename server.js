const express = require('express')
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "perkemahan"
});
db.connect(err => {
  if (err) throw err;
  console.log("Database connected");
});

const isAutorized = (request, result, next) => {
    if (typeof request.headers["token"] == "undefined") {
        return result.status(403).json({
            success: false,
            message: "unauthorized token"
        });
    }

    let token = request.headers["token"];

    jwt.verify(token, "SuperSecRetKey", (err, docoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: "Token is Invalid"
            });
        }
    });

    next();
}

app.post('/login/admin', (requestAnimationFrame, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    const sql = "SELECT * FROM penjual WHERE username = ? AND password ?";
    if (username && password) {
        db.query(sql, [username, password], function(err, rows) {
            if (err) throw err;
            else if (rows.length > 0) {
                jwt.sign(
                    {usename, password},
                    "SuperSecRetKey",
                    {
                        expiresIn: 60 * 60 * 5
                    },
                    (err, token) => {
                        res.send(token);
                    }
                )
            }
        });
    }
})

app.post('/daftar', (req, res) => {
    var data = {
        nama: req.body.nama,
        email: req.body.email,
        password: req.body.password
    };
    db.query("INSERT INTO pembeli SET ?", data, function (err, result) {
        if (err) throw err;
        else {
            res.json({
                message: "Data has been added"
            })
        }
    });
})

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    const sql = "SELECT * FROM pembeli WHERE email = ? AND password = ?";
    if (email && password) {
        db.query(sql, [email, password], function (err, rows) {
            if (err) throw err;
            else if (rows.length > 0){
                jwt.sign(
                    {email, password},
                    "SuperSecRetKey",
                    {
                        expiresIn: 60 * 60 * 5
                    },
                    (err, token) => {
                        res.send(token);
                    }
                );
            }else {
                res.json({
                    message: "email atau password salah"
                })
            }
        });
    }
})

app.get("/", isAutorized, (request, result) => {
    result.json({
        success: true,
        message: "welcome"
    });
});

// CRUD BUAH

app.post('/tambah', isAutorized, function (request, result) {
    let data = request.body;

    var buah = {
        nama_buah: data.nama_buah,
        stok: data.stok,
        harga: data.harga
    }

    db.query("INSERT INTO buah SET ?", buah, (err, result) => {
        if (err) throw err;
    });

    result.json({
        success: true,
        message: "data ditambahkan"
    });
});

app.put('/edit/:id', isAutorized, function (req, res) {
    let data = 'UPDATE buah SET nama_buah="' +
    req.body.nama_buah +
    '", stok="' +
    req.body.stok +
    '", harga="' +
    req.body.harga +
    '" WHERE id=' +
    req.params.id;

    db.query(data, function (err, result) {
        if (err) throw err;
        else {
            result.json({
                success: true,
                message: "data sudah diupdate"
            });
        }
    });
});

app.delete('/delete/:id', isAutorized, function (req, res) {
    let id = "DELETE FROM buku WHERE id=" + req.params.id;

    db.query(id, function (err, result) {
        if (err) throw err;
        else {
            res.json({
                success: true,
                message: "data dihapus"
            });
        }
    });
});