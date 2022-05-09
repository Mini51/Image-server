const express = require('express'); 
const ejs = require('ejs'); 
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');
const { secret, embedConfig, port} = require('./config.json'); 
 
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('images'));

const security = ( req, res, next ) => { 
    const token = req.headers.authorization;
    if(!token) {
        res.status(401).json({ 
            message: 'Unauthorized'
        });
    } else {
        if(token === secret) {
            next();
        } else {
            res.status(401).json({
                message: 'Unauthorized'
            });
        }
    }
}




const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage }); 

//get image 
app.get('/:id', (req, res) => {
    const { id } = req.params; 
    const file = fs.readdirSync('./images').find(file => file.split('.')[0] === id); 
    if(!file) {
        res.status(404).json({
            message: 'Image not found'
        });
    } else {
        res.render('imgServe', {
            //send the id with extension 
            id: file,
            title: embedConfig.title,
            description: embedConfig.description,
            url: embedConfig.url,
            color: embedConfig.color
        });
    }

});

// add a image (admin only) 
app.post('/', security,  upload.single('image'), (req, res) => { 
   // respond with the files name 
    res.send(`image is at ${embedConfig.url}/${req.file.filename.split('.')[0]}`);
});


// delete a image (admin only)
app.delete('/:id', security, (req, res) => {
    const { id } = req.params;
    const file = fs.readdirSync('./images').find(file => file.split('.')[0] === id);
    if (!file) {
        res.send('image not found');
    } else {
        fs.unlinkSync(`./images/${file}`);
        res.send('image deleted');
    }
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});