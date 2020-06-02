import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow = null;
let workerWindow: Electron.BrowserWindow = undefined;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
    },
  });

  if (serve) {

    require('devtron').install();
    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  workerWindow = new BrowserWindow({
      webPreferences: {
          nodeIntegration: true
      }
  });
  workerWindow.loadURL("file://" + __dirname + "/worker.html");
  workerWindow.hide();
  workerWindow.webContents.openDevTools();
  workerWindow.on("closed", () => {
      workerWindow = undefined;
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {

  app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

//to print
ipcMain.on('print', (event, content) => {
  //workerWindow.show();
  workerWindow.webContents.send('print', content);
});

ipcMain.on('readyToPrint', (event) => {
  workerWindow.webContents.print({});
  //workerWindow.hide();
});


// db connection

var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./database.sqlite"
  }
});

// datos fijos

ipcMain.on('datosFijos:obtenerDatosFijos', (event) => {
  let result = knex.select('*').from('DatosFijos');
  result.then(function(row){
    win.webContents.send('datosFijos:RespuestaObtenerDatosFijos', row[0]);
  });
});

ipcMain.on('datosFijos:actualizarDatosFijos', (event, datosFijos) => {
  let result = knex('DatosFijos')
              .where('idDatosFijos', 1)
              .update({
                KgMunicipal: datosFijos.KgMunicipal,
                KgRenta: datosFijos.KgRenta,
              });
  result.then(function(){
    win.webContents.send('datosFijos:RespuestaActualizarDatosFijos');
  });
});

// transportista

ipcMain.on('transportista:obtenerTodosLosCUIT', (event) => {
  let result = knex.select('CUITPersona').from('Transportista');
  result.then(function(rows: []){
    let cuits = []
    rows.forEach(function (value) {
      cuits.push("" + value['CUITPersona']);
    }); 
    win.webContents.send('transportista:RespuestaObtenerTodosLosCUIT', cuits);
  });
});

ipcMain.on('transportista:obtenerDatosDelTransportista', (event, cuitTransportista) => {
  let result = knex('Transportista')
    .join('Persona', 'Persona.CUIT', '=', 'Transportista.CUITPersona')
    .select('*')
    .where('Transportista.CUITPersona', +cuitTransportista);
  result.then(function(row){
    win.webContents.send('transportista:RespuestaObtenerDatosDelTransportista', row[0]);
  });
});

ipcMain.on('transportista:upsertTransportista', (event, datosTransportista, camiones:[]) => {
  const persona = {
    CUIT: datosTransportista.cuit,
    RazonSocial: datosTransportista.RazonSocial,
    Telefono: datosTransportista.Telefono,
    Email: datosTransportista.Email,
  }
  upsertPersona(persona).then(async () => {
    const transportista = {
      idTransportista: datosTransportista.idTransportista,
      IngresosBrutos: datosTransportista.IngresosBrutos,
      CUITPersona: datosTransportista.cuit,
    }
    upsertTransportista(transportista).then(async (idTransportista) => {
      camiones.forEach((camion: any) => {
        const camionToUpsert = {
          idCamion: camion.idCamion,
          Chofer: camion.Chofer,
          ChapaChasis: camion.ChapaChasis,
          ChapaAcoplado: camion.ChapaAcoplado,
          idTransportista: idTransportista,
        }
        upsertCamion(camionToUpsert);
      });
      win.webContents.send('transportista:RespuestaUpsertTransportista', datosTransportista.cuit);
    });
  });
});

async function upsertTransportista(Transportista) {
  if(Transportista.idTransportista === undefined) {
    Transportista.idTransportista = -1;
  }
  let result = knex.select('*').from('Transportista').where('idTransportista', Transportista.idTransportista);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateTransportista(Transportista).then(async (id) => {
        return id;
      });  
    } else {
      // empty
      return await insertTransportista(Transportista).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertTransportista(Transportista) {
  let result = knex('Transportista')
            .returning('idTransportista')
            .insert({
              IngresosBrutos: Transportista.IngresosBrutos,
              CUITPersona: Transportista.CUITPersona,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateTransportista(Transportista) {
  let result = knex('Transportista')
              .where('idTransportista', Transportista.idTransportista)
              .update({
                IngresosBrutos: Transportista.IngresosBrutos,
                CUITPersona: Transportista.CUITPersona,
              });
  return await result.then(() => {
    return Transportista.idTransportista;
  });
}

// camion

ipcMain.on('camion:eliminarCamiones', (event, camiones) => {
  camiones.forEach((camion: any) => {
    if(camion.idCamion !== -1) {
      let result = knex('Camion')
        .where('idCamion', camion.idCamion)
        .del();
      result.then(function(){});
    }
  });
  win.webContents.send('camion:RespuestaEliminarCamiones');
});

ipcMain.on('camion:obtenerCamionesDelTransportista', (event, cuitTransportista) => {
  let result = knex('Camion')
    .join('Transportista', 'Transportista.idTransportista', '=', 'Camion.idTransportista')
    .select('*')
    .where('Transportista.CUITPersona', +cuitTransportista);
  result.then(function(rows: []){
    let camiones = []
    rows.forEach(function (value) {
      const camion = {
        idCamion: value['idCamion'],
        ChapaChasis: value['ChapaChasis'],
        ChapaAcoplado: value['ChapaAcoplado'],
        Chofer: value['Chofer'],
        idTransportista: value['idTransportista'],
      }
      camiones.push(camion);
    }); 
    win.webContents.send('camion:RespuestaObtenerCamionesDelTransportista', camiones);
  });
});

async function upsertCamion(Camion) {
  if(Camion.idCamion === undefined) {
    Camion.idCamion = -1;
  }
  let result = knex.select('*').from('Camion').where('idCamion', Camion.idCamion);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateCamion(Camion).then(async (id) => {
        return id;
      });  
    } else {
      // empty
      return await insertCamion(Camion).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertCamion(Camion) {
  let result = knex('Camion')
            .returning('idCamion')
            .insert({
              ChapaChasis: Camion.ChapaChasis,
              ChapaAcoplado: Camion.ChapaAcoplado,
              Chofer: Camion.Chofer,
              idTransportista: Camion.idTransportista,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateCamion(Camion) {
  let result = knex('Camion')
              .where('idCamion', Camion.idCamion)
              .update({
                ChapaChasis: Camion.ChapaChasis,
                ChapaAcoplado: Camion.ChapaAcoplado,
                Chofer: Camion.Chofer,
                idTransportista: Camion.idTransportista,
              });
  return await result.then(() => {
    return Camion.idCamion;
  });
}

// comprador

ipcMain.on('comprador:obtenerDatosComprador', (event, renspa) => {
  let result = knex('Comprador')
    .join('Persona', 'Comprador.CUITPersona', '=', 'Persona.CUIT')
    .join('Establecimiento', 'Comprador.idEstablecimiento', '=', 'Establecimiento.idEstablecimiento')
    .join('Localidad', 'Comprador.idLocalidad', '=', 'Localidad.idLocalidad')
    .join('Provincia', 'Localidad.idProvincia', '=', 'Provincia.idProvincia')
    .select(
      '*', 
      'Establecimiento.Nombre as NombreEstablecimiento', 
      'Localidad.Nombre as NombreLocalidad', 
      'Provincia.Nombre as NombreProvincia' 
      )
    .where('RENSPA', renspa);
  result.then(function(row){
    win.webContents.send('comprador:RespuestaObtenerDatosComprador', row[0]);
  });
});

ipcMain.on('comprador:obtenerTodosLosRenspa', (event) => {
  let result = knex.select('RENSPA').from('Comprador');
  result.then(function(rows: []){
    let renspas = []
    rows.forEach(function (value) {
      renspas.push(value['RENSPA']);
    }); 
    win.webContents.send('comprador:RespuestaObtenerTodosLosRenspa', renspas);
  });
});

ipcMain.on('comprador:upsertComprador', (event, datosComprador) => {
  const persona = {
    CUIT: datosComprador.CUIT,
    RazonSocial: datosComprador.RazonSocial,
    Telefono: datosComprador.Telefono,
    Email: datosComprador.Email,
  }
  upsertPersona(persona).then(async () => {
    if (datosComprador.idEstablecimiento == 0 && datosComprador.NombreEstablecimiento != '') {
      datosComprador.idEstablecimiento = -1;
      datosComprador.Partida = '';
      datosComprador.Repagro = '';
    }
    const establecimiento = {
      idEstablecimiento: datosComprador.idEstablecimiento,
      Nombre: datosComprador.NombreEstablecimiento,
      Partida: datosComprador.Partida,
      Repagro: datosComprador.Repagro,
    }
    upsertEstablecimiento(establecimiento).then(async (idEstablecimiento) => {
      const localidad = {
        idLocalidad: datosComprador.idLocalidad,
        Nombre: datosComprador.NombreLocalidad,
        idProvincia: datosComprador.idProvincia,
      }
      upsertLocalidad(localidad).then(async (idLocalidad) => {
        const comprador = {
          idComprador: datosComprador.idComprador,
          RENSPA: datosComprador.RENSPA,
          idEstablecimiento: idEstablecimiento,
          CUITPersona: datosComprador.CUIT,
          idLocalidad: idLocalidad,
        }
        upsertComprador(comprador).then(async () => {
          const renspa = datosComprador.RENSPA;
          win.webContents.send('comprador:RespuestaUpsertComprador', renspa);
        });
      });
    });
  });
});


async function upsertComprador(Comprador) {
  if(Comprador.idComprador === undefined) {
    Comprador.idComprador = -1;
  }
  let result = knex.select('*').from('Comprador').where('idComprador', Comprador.idComprador);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateComprador(Comprador).then(async (id) => {
        return id;
      });  
    } else {
      // empty
      return await insertComprador(Comprador).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertComprador(Comprador) {
  let result = knex('Comprador')
            .returning('idComprador')
            .insert({
              RENSPA: Comprador.RENSPA,
              idEstablecimiento: Comprador.idEstablecimiento,
              CUITPersona: Comprador.CUITPersona,
              idLocalidad: Comprador.idLocalidad,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateComprador(Comprador) {
  let result = knex('Comprador')
              .where('idComprador', Comprador.idComprador)
              .update({
                RENSPA: Comprador.RENSPA,
                idEstablecimiento: Comprador.idEstablecimiento,
                CUITPersona: Comprador.CUITPersona,
                idLocalidad: Comprador.idLocalidad,
              });
  return await result.then(() => {
    return Comprador.idComprador;
  });
}

// productor
ipcMain.on('productor:obtenerDatosProductor', (event, renspa) => {
  let result = knex('Productor')
    .join('Persona', 'Productor.CUITPersona', '=', 'Persona.CUIT')
    .join('Establecimiento', 'Productor.idEstablecimiento', '=', 'Establecimiento.idEstablecimiento')
    .select('*', 'Establecimiento.Nombre as NombreEstablecimiento')
    .where('RENSPA', renspa);
  result.then(function(row){
    win.webContents.send('productor:RespuestaObtenerDatosProductor', row[0]);
  });
});

ipcMain.on('productor:obtenerTodosLosRenspa', (event) => {
  let result = knex.select('RENSPA').from('Productor');
  result.then(function(rows: []){
    let renspas = []
    rows.forEach(function (value) {
      renspas.push(value['RENSPA']);
    }); 
    win.webContents.send('productor:RespuestaObtenerTodosLosRenspa', renspas);
  });
});

ipcMain.on('productor:upsertProductor', (event, datosProductor) => {
  const persona = {
    CUIT: datosProductor.CUIT,
    RazonSocial: datosProductor.RazonSocial,
    Telefono: datosProductor.Telefono,
    Email: datosProductor.Email,
  }
  upsertPersona(persona).then(async () => {
    const establecimiento = {
      idEstablecimiento: datosProductor.idEstablecimiento,
      Nombre: datosProductor.NombreEstablecimiento,
      Partida: datosProductor.Partida,
      Repagro: datosProductor.Repagro,
    }
    upsertEstablecimiento(establecimiento).then(async (idEstablecimiento) => {
        const productor = {
          idProductor: datosProductor.idProductor,
          RENSPA: datosProductor.RENSPA,
          BoletoMarca: datosProductor.BoletoMarca,
          BoletoSenial: datosProductor.BoletoSenial,
          IngresosBrutos: datosProductor.IngresosBrutos,
          idEstablecimiento: idEstablecimiento,
          CUITPersona: datosProductor.CUIT,
        }
        upsertProductor(productor).then(async () => {
          const renspa = datosProductor.RENSPA;
          win.webContents.send('productor:RespuestaUpsertProductor', renspa);
        });
    });
  });
});

async function upsertProductor(Productor) {
  if(Productor.idProductor === undefined) {
    Productor.idProductor = -1;
  }
  let result = knex.select('*').from('Productor').where('idProductor', Productor.idProductor);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateProductor(Productor).then(async (id) => {
        return id;
      });  
    } else {
      // empty
      return await insertProductor(Productor).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertProductor(Productor) {
  let result = knex('Productor')
            .returning('idProductor')
            .insert({
              RENSPA: Productor.RENSPA,
              BoletoMarca: Productor.BoletoMarca,
              BoletoSenial: Productor.BoletoSenial,
              IngresosBrutos: Productor.IngresosBrutos,
              idEstablecimiento: Productor.idEstablecimiento,
              CUITPersona: Productor.CUITPersona,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateProductor(Productor) {
  let result = knex('Productor')
              .where('idProductor', Productor.idProductor)
              .update({
                RENSPA: Productor.RENSPA,
                BoletoMarca: Productor.BoletoMarca,
                BoletoSenial: Productor.BoletoSenial,
                IngresosBrutos: Productor.IngresosBrutos,
                idEstablecimiento: Productor.idEstablecimiento,
                CUITPersona: Productor.CUITPersona,
              });
  return await result.then(() => {
    return Productor.idProductor;
  });
}

//establecimiento
async function upsertEstablecimiento(Establecimiento) {
  if(Establecimiento.idEstablecimiento === undefined) {
    Establecimiento.idEstablecimiento = -1;
  }
  let result = knex.select('*').from('Establecimiento').where('idEstablecimiento', Establecimiento.idEstablecimiento);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateEstablecimiento(Establecimiento).then(async (id) => {
        return id;
      });        
    } else {
      // empty
      return await insertEstablecimiento(Establecimiento).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertEstablecimiento(Establecimiento) {
  let result = knex('Establecimiento')
            .returning('idEstablecimiento')
            .insert({
              Nombre: Establecimiento.Nombre,
              Partida: Establecimiento.Partida,
              Repagro: Establecimiento.Repagro,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateEstablecimiento(Establecimiento) {
  let result = knex('Establecimiento')
              .where('idEstablecimiento', Establecimiento.idEstablecimiento)
              .update({
                Nombre: Establecimiento.Nombre,
                Partida: Establecimiento.Partida,
                Repagro: Establecimiento.Repagro,
              })
  return await result.then(() => {
    return Establecimiento.idEstablecimiento;
  });
}

//persona

async function upsertPersona(persona) {
  if(persona.CUIT === undefined) {
    persona.CUIT = -1;
  }
  let result = knex.select('CUIT').from('Persona').where('CUIT', persona.CUIT);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updatePersona(persona).then(async () => {
        return;
      });
        
    } else {
      // empty
      return await insertPersona(persona).then(async () => {
        return;
      });
    }
    return;
  });
}

async function insertPersona(persona) {
  let result = knex('Persona')
              .insert({
                RazonSocial: persona.RazonSocial,
                Telefono: persona.Telefono,
                Email: persona.Email,
              })
  return await result.then(() => {
    return;
  });
}

async function updatePersona(persona) {
  let result = knex('Persona')
          .where('CUIT', persona.CUIT)
          .update({
            RazonSocial: persona.RazonSocial,
            Telefono: persona.Telefono,
            Email: persona.Email,
          })

  return await result.then(() => {
    return;
  });
}

ipcMain.on('persona:obtenerTodosLosCUIT', (event) => {
  let result = knex.select('CUIT').from('Persona');
  result.then(function(rows: []){
    let cuits = []
    rows.forEach(function (value) {
      cuits.push(""+value['CUIT']);
    }); 
    win.webContents.send('persona:RespuestaObtenerTodosLosCUIT', cuits);
  });
});

ipcMain.on('persona:obtenerDatosPersona', (event, cuit) => {
  let result = knex('Persona')
    .select('*')
    .where('CUIT', cuit);
  result.then(function(row){
    win.webContents.send('persona:RespuestaObtenerDatosPersona', row[0]);
  });
});

// localidad

ipcMain.on('localidad:obtenerIdLocalidad', (event, nombreLocalidad) => {
  let result = knex.select('idLocalidad').from('Localidad').where('Nombre', nombreLocalidad);
  result.then(function(row){
    let idLocalidad = row[0];
    if (idLocalidad === undefined) {
      idLocalidad = -1;
    } else {
      idLocalidad = idLocalidad.idLocalidad;
    }
    win.webContents.send('localidad:RespuestaObtenerIdLocalidad', idLocalidad);
  });
});

ipcMain.on('localidad:obtenerTodasLasLocalidades', (event) => {
  let result = knex.select('*').from('Localidad').orderBy('Nombre');
  result.then(function(rows: []){
    let localidades = []
    rows.forEach(function (value) {
      localidades.push(value['Nombre']);
    }); 
    win.webContents.send('localidad:RespuestaObtenerTodasLasLocalidades', localidades);
  });
});

async function upsertLocalidad(Localidad) {
  if(Localidad.idLocalidad === undefined) {
    Localidad.idLocalidad = -1;
  }
  let result = knex.select('*').from('Localidad').where('idLocalidad', Localidad.idLocalidad);
  return await result.then(async function(rows: []){
    if (rows && rows.length) {   
      // not empty 
      return await updateLocalidad(Localidad).then(async (id) => {
        return id;
      });        
    } else {
      // empty
      return await insertLocalidad(Localidad).then(async (id) => {
        return id;
      });
    }
  });
}

async function insertLocalidad(Localidad) {
  let result = knex('Localidad')
            .returning('idLocalidad')
            .insert({
              Nombre: Localidad.Nombre,
              idProvincia: Localidad.idProvincia,
            })
  return await result.then((id) => {
    return id[0];
  });
}

async function updateLocalidad(Localidad) {
  let result = knex('Localidad')
              .where('idLocalidad', Localidad.idLocalidad)
              .update({
                Nombre: Localidad.Nombre,
                idProvincia: Localidad.idProvincia,
              })
  return await result.then(() => {
    return Localidad.idLocalidad;
  });
}

// provincias

ipcMain.on('provincias:obtenerTodasLasProvincias', (event) => {
  let result = knex.select('*').from('Provincia').orderBy('Nombre');
  result.then(function(rows: []){
    let provincias = []
    rows.forEach(function (value) {
      const provincia = {
        idProvincia: value['idProvincia'],
        NombreProvincia: value['Nombre'],
      }
      provincias.push(provincia);
    }); 
    win.webContents.send('provincias:RespuestaObtenerTodasLasProvincias', provincias);
  });
});

