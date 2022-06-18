"use strict";

// Importamos el paquete webtorrent-hybrid
// Podriamos haber ocupado el paquete webtorrent, pero con webtorrent-hybrid,
// nos añade la comunicación en tiempo real
import WebTorrent from "webtorrent-hybrid";

// Importamos este modulo File System
// Nos ayuda a almacenar, acceder y administrar datos en nuestro sistema operativo
import fs from "fs";

// Es un modulo para usar una barra de progreso en la linea de comando
import cliProgress from "cli-progress";

// Pedimos y creamos una constante del argumento escrito en consola
// Esta constante sera un archivo .torrent o un magnet link
const torrentId = process.argv[2];

console.log("Torrent ID:~ \t" + torrentId);

// Creamos un torrent client
const client = new WebTorrent();

// Creamos nuestra barra de progreso
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

// Añadimos nuevos elementos a nuestro cliente y creamos una funcion de callback que nos regrese un torrent
client.add(torrentId, (torrent) => {
  const files = torrent.files;
  let length = files.length;

  // Imprimimos la longitud de nuestros archivos torrent
  console.log("Number of files: ~ \t" + length);
  // Iniciamos la barra de progreso
  bar.start(100, 0);

  // Definimos un intervalo para la barra de progreso
  let interval = setInterval(() => {
    bar.update(torrent.progress * 100);
  }, 5000);

  // Creamos un ciclo y una funcion de callback para obtener cada archivo de nuestros archivos
  files.forEach((file) => {
    // Obtenemos un stream del archivo que estamos leyendo
    const source = file.createReadStream();

    // Creamos una secuencia de escritura para poder escribir datos en un archivo posteriormente
    const destination = fs.createWriteStream(file.name);

    // Una vez que obtenemos el stream, se dispara esta funcion de callback
    // En la cual imprimimos el nombre del archivo y la barra de progreso de la descarga del archivo
    // A la vez, estamos haciendo uso de tuberias, esto para la comunicacion y sincronizacion de procesos
    source
      .on("end", () => {
        console.log("file: \t\t", file.name);
        length -= 1;
        if (length) {
          bar.stop();
          clearInterval(interval);
          process.exit();
        }
      })
      .pipe(destination);
  });
});
