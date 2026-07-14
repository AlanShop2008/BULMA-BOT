import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { format } from 'util'
import { fileURLToPath } from 'url'

export async function handler(chatUpdate) {
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[0]
  if (!m) return
  if (!m.message) return
  if (m.key.fromMe) return // Ignorar los propios mensajes del bot

  try {
    // 1. Cargar base de datos local si no existe en caliente
    if (global.db.data == null) await global.loadDatabase()

    // 2. Extraer los datos limpios del remitente usando tu simple.js (serialize)
    const sender = m.sender || m.key.participant || m.key.remoteJid
    const chat = m.chat || m.key.remoteJid
    const isOwner = global.owners.includes(sender)

    // Extraer texto del mensaje
    let body = typeof m.text === 'string' ? m.text : ''
    let prefix = '.' // Prefijo fijo para Bulma Bot

    // 3. 🛡️ CANDADO 1: ANTIPRIVADO GLOBAL
    if (!m.isGroup && !isOwner) {
      await this.sendMessage(chat, { 
        text: `⚠️ *FUNCIÓN ANTIPRIVADO ACTIVA* ⚠️\n\nHola, las funciones de *${global.botname || '𝐁𝐔𝐋𝐌𝐀 𝐁𝐎𝐓'}* están restringidas únicamente para su uso dentro de grupos autorizados.\n\n❌ *Está prohibido hablarle al bot por privado.* Tu número será bloqueado automáticamente para evitar spam.` 
      }, { quoted: m })
      
      await this.updateBlockStatus(sender, 'block')
      return // Bloquea y congela el proceso aquí
    }

    // 4. ⏳ CANDADO 2: FILTRO DE RENTA GLOBAL (SEGURO ANTICOLADO)
    if (m.isGroup) {
      if (!global.db.data.chats) global.db.data.chats = {}
      
      // Si el grupo nunca se ha registrado, entra desactivado por defecto (expired: 1)
      if (!global.db.data.chats[chat]) {
        global.db.data.chats[chat] = { expired: 1, customCommands: {} }
        global.saveDatabase()
      }

      const chatSettings = global.db.data.chats[chat]

      // Si el bot expiró o está apagado, solo le hace caso al Owner (para usar .activar)
      if (chatSettings.expired && Date.now() > chatSettings.expired) {
        if (!isOwner) return // Se hace el sordo por completo con los civiles
      }
    }

    // 5. PROCESADOR DE COMANDOS
    if (!body.startsWith(prefix)) return // Si no inicia con el punto, no hace nada

    const args = body.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()
    const text = args.join(' ')

    // Buscar el comando físicamente en el objeto global de plugins cargados por el index
    let plugin = global.plugins[commandName] || Object.values(global.plugins).find(p => p.command && p.command.includes(commandName))

    if (plugin) {
      // Validar si el comando es exclusivo de Creador (rowner)
      if (plugin.rowner && !isOwner) {
        return this.sendMessage(chat, { text: '❌ *Este comando es exclusivo de mi Creador (ALAN SHOP).*' }, { quoted: m })
      }

      // Validar si requiere ser administrador del grupo
      if (plugin.admin && m.isGroup) {
        const groupMetadata = await this.groupMetadata(chat)
        const participants = groupMetadata.participants
        const userInGroup = participants.find(p => p.id === sender)
        const isAdmin = userInGroup && (userInGroup.admin === 'admin' || userInGroup.admin === 'superadmin')
        
        if (!isAdmin && !isOwner) {
          return this.sendMessage(chat, { text: '⚠️ *Este comando solo puede ser utilizado por Administradores del grupo.*' }, { quoted: m })
        }
      }

      // Ejecutar el comando del archivo .js
      try {
        await plugin(m, { conn: this, args, text, usedPrefix: prefix, command: commandName })
      } catch (err) {
        console.error(chalk.red(`Error en el comando .${commandName}:`), err)
      }
    } else {
      // 🛒 INTERCEPTOR DE COMANDOS PERSONALIZADOS POR GRUPO (.set)
      if (m.isGroup) {
        let chatData = global.db.data.chats[chat] || {}
        let customCommands = chatData.customCommands || {}

        if (customCommands[commandName]) {
          await this.sendMessage(chat, { text: customCommands[commandName] }, { quoted: m })
        }
      }
    }

  } catch (e) {
    console.error(chalk.bold.red('\n✖️ Error crítico en el Handler principal:\n'), format(e))
  }
}

// Métodos requeridos por el reloader del index.js para evitar crasheos
export async function groupsUpdate(ctx) { return }
export async function deleteUpdate(ctx) { return }
