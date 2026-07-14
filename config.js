import fs from 'fs'
import chalk from 'chalk'

// 👑 CONFIGURACIÓN DE MARCA Y CREADOR (ALAN SHOP)
global.botname = '𝐁𝐔𝐋𝐌𝐀 𝐁𝐎𝐓 🧬'
global.ownername = '𝐀package𝐀package 𝐒package𝐎package𝐄'

// 📱 TU JID DE WHATSAPP (ID exacto sin el signo +)
// Aquí colocas tu JID completo con @s.whatsapp.net para que el handler te reconozca como el Owner supremo.
global.owners = [
  '52155XXXXXXXX@s.whatsapp.net', // Tu número principal (Cámbialo por el tuyo real)
  '5255XXXXXXXX@s.whatsapp.net'   // Tu número secundario u operador (opcional)
]

// ⚙️ VARIABLES GLOBALES INTERNAS PARA EL INDEX
global.sessions = 'SESSIONS'  // Nombre de la carpeta donde se guardará la sesión del Bot
global.jadi = 'Jadibot'        // Nombre de la carpeta para sub-bots (si llegas a meter esa función)
global.botNumber = ''          // Si dejas esto vacío, el index te pedirá el número en la consola al iniciar con código de texto.

// 🎨 DISEÑO Y ENCABEZADOS DEL MENÚ (Verificado oficial de Alan Store MX)
global.nameqr = '𝐁𝐔𝐋𝐌𝐀 𝐁𝐎𝐓'
global.packname = '𝐁𝐔𝐋𝐌𝐀 𝐁𝐎𝐓 🧬'
global.author = '𝐀package𝐀package 𝐒package𝐎package𝐄 package𝐗'

// 📂 AUTO-GUARDADO DE LA BASE DE DATOS (database.json)
global.saveDatabase = () => {
  if (global.db && global.db.data) {
    // Forzamos el guardado en caliente escribiendo en la ruta estructurada por tu LowDB en el index
    const dir = './lib/storage/databaseSV'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    
    fs.writeFileSync(`${dir}/database.json`, JSON.stringify(global.db.data, null, 2))
  }
}

// Mensaje visual en la terminal para confirmar que la configuración cargó al 100%
console.log(chalk.bold.cyanBright(`✓ Archivo config.js cargado con éxito para ${global.botname}\n`))
