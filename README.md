### How to implement the Electron With Node server and angular all together.

Look the folder structure of the project. It is crucial to good functionality of the project. 
Look that we use this structure inside the app.js file to setup the routes of the saving files
for the multer and for the electron.

Observe that here we are saving files using the node server and the angular.

### Running the project
0- npm run electron

### Building the project
0- npm run electon-build

### Packing the project
0- npm run electron-package

## Angular
0- Create a project with routing
1- In the routing module put the routes of the application


## Package JSON
0- put the main in the same level of the version, example below:
  "version": "0.0.0",
  "main": "./app.js", //app.js is the name of the electron server file.

1- create the electron calls:
    "electron": "ng build && electron .",
    "electron-build": "ng build --base-href ./ && electron .",
    "electron-package": ....
## Electron
0- Create the below scrip and install all the dependencies.

## Code Region 
const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const multer = require('multer')
var fs = require('fs');
const cors = require('cors')
const express = require('express')
const appEx = express()
//const File = require("./src/assets/voices/index.json"); 



//Electron window creation: Uncomment it to run the electron build!
//#region Electron


let win;
var databases = [];

function createWindow() {
  win = new BrowserWindow({
    width: 1240,
    height: 800,
    backgroundColor: "#ffffff",

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  win.maximize();
  win.loadURL(url.format({      
    pathname: path.join(
        __dirname,
        'dist/electron-node-uploader/index.html'),       
    protocol: 'file:',      
    slashes: true     
}))   
  win.on("closed", function () {
    win = null;
  });
}
if(app !== undefined)
{
    app.on("ready", createWindow);
    app.on("window-all-closed", function () {
      if (process.platform !== "darwin") {
        app.quit();
      }
    }); 
    
    app.on("activate", function () {
      if (win === null) {
        createWindow();
      }
    });
}

//We can use to save files from the PC to the project.
ipcMain.on('uploadCharacter', (event, paths) => {

    let writePath = path.join(__dirname,'dist/electron-node-uploader/')
    //let writePath = path.join(__dirname,'src/assets/')//To put in another directory we can change here

    for(let i=0; i < paths.length; i++)
    {
        let readPath = paths[i]
        let filaName = readPath.split('\\')
        filaName = filaName[filaName.length-1]

        fs.createReadStream(readPath).pipe(fs.createWriteStream(writePath + filaName)).on('close', () => {
        });
    }
})
 
//#endregion
//End of Electron window creation


//START CORS
var corsOptions =
{
    origin:'http://localhost:4200',
    optionsSuccessStatus:200
}

appEx.use(cors(corsOptions))
//END CORS


//START MULTER
const storage = multer.diskStorage({
  destination: function(req, file, cb)
  { 
        cb(null, './src/assets')//This is used in development.
        cb(null, './dist/electron-node-uploader')//This is used in production.
  },
  filename: function(req, file, cb)
  {
        cb(null, file.originalname)
  },

})

const upload = multer({storage})
//END MULTER

//START OTHER MIDDLEWARES
appEx.use(express.json({limit: '500mb'}));
//END OTHER MIDDLEWARES

//MAIN PATH FILE TO THE INDEX.HTML IN DIST FOLDER FOR PRODUCTION
appEx.use(express.static(path.join(__dirname, './dist/electron-node-uploader')))


//ALL ROUTES FROM THE ANGULAR WILL BE ACCEPT IN DIST FOLDER FOR PRODUCTION
appEx.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/electron-node-uploader/index.html'));
  });


//UPLOAD A SINGLE FILE PER TIME
appEx.post('/audioUploader', upload.array('file'),(req, res)=>
{
    const file = req.file;

    if(!file)
    {
        console.log(`Some error ocurred on audio uploader: ${res.error}`)
    }
  
})

//HOW TO WRITE INTO A JSON FILE FROM THE SERVER USING FILE SYSTEM (fs)
function saveJson(req)
{
    let json = JSON.stringify(File)
    json = json.replace("]", `,"${req.file.originalname}"]`)
    fs.writeFile("./src/assets/voices/index.json", json, function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
}

//HOW TO DELETE A FILE FROM A FOLDER USING THE SERVER
appEx.delete('/audios/:name/:extension',(req, res)=>
{ 
    let file = req.params.name + '.'+ req.params.extension
    let p = path.join(__dirname, `./src/assets/voices/${file}`)
    
    //removeFromJson(file)
    fs.unlink(p, function(err) {
    if (err) {
        console.log(`Some error ocurred: ${err}`)
    } else {
        res.status(200).send('Successfully deleted the file.');
        console.log("Successfully deleted the file.")
    }
    })  
  
})


//HOW TO REMOVE
function removeFromJson(file)
{
    let json = JSON.stringify(File)
    json = json.replace(`${file}`, '')
    json = json.replace('""', '')
    json = json.replace(',,', ',')
    json = json.replace('",]', '"]')
    json = json.replace('[,"', '["')
    fs.writeFile("./src/assets/voices/index.json", json, function(err) {
        if(err) {
            return console.log("Some error occured on the json to remove the audio reference, Error: ",err);
        }
    }); 
}

//RUN THE SERVER ON PORT 5000
appEx.listen(5000, ()=>
{
    console.log('Server is live on port 5000')
})
