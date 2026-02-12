"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLidFromMessage = exports.getJidFromMessage = exports.buildContactAddress = exports.getContactIdentifier = exports.map_msg = void 0;
const logger_1 = require("./logger");
exports.map_msg = new Map();
const getContactIdentifier = (contact) => {
    // verificar se o contact esta limpo ou veio direto do banco de dados
    // se veio do banco de dados, pode ser que esteja null ou undefined
    // então tratar isso
    //   if (!contact) {
    //     console.log('Contact é nulo ou indefinido:', contact);
    //     return '';
    //   }else if (contact?.dataValues) {
    //     contact = contact.dataValues;
    //   }
    //   // console.log('Contact recebido em getContactIdentifier:', contact);
    //   if (contact?.lid) {
    //     console.log('Usando LID para envio:', contact.lid);
    //     return contact.lid;
    //   } else {
    //     console.log('Usando JID para envio:', contact.number);
    //     return contact.number;
    //   }
    // };
    if (!contact) {
        console.log('Contact é nulo ou indefinido:', contact);
        return '';
    }
    else if (contact?.dataValues) {
        contact = contact.dataValues;
    }
    // console.log('Contact recebido em getContactIdentifier:', contact);
    console.log('Usando NUMBER para envio:', contact.number);
    return contact.number;
};
exports.getContactIdentifier = getContactIdentifier;
// Função helper para construir o endereço de envio
const buildContactAddress = (contact, isGroup) => {
    // console.log('Contact recebido em buildContactAddress:', contact, 'isGroup:', isGroup);
    const contactId = (0, exports.getContactIdentifier)(contact);
    const domain = isGroup ? "@g.us" : contactId.includes("@") ? "" : "@s.whatsapp.net";
    return `${contactId}${domain}`;
};
exports.buildContactAddress = buildContactAddress;
// Função para extrair número de telefone do JID
// Suporta números de qualquer país (até 15 dígitos conforme padrão internacional)
const extractPhoneNumber = (jid) => {
    if (!jid || typeof jid !== 'string')
        return '';
    // Remove caracteres não numéricos
    const cleanNumber = jid.replace(/[^0-9]/g, "");
    // Limita a 15 dígitos - padrão internacional máximo para números de telefone
    return cleanNumber.slice(0, 15);
};
const getJidFromMessage = async (message, wbot) => {
    // Garantir que a mensagem tem a propriedade key
    if (!message || !message.key) {
        throw new Error('Mensagem inválida: propriedade key não encontrada');
    }
    const { key } = message;
    const { remoteJid, participant } = key;
    // Verificar se key tem propriedades estendidas (remoteJidAlt, participantAlt)
    const keyExtended = key;
    const remoteJidAlt = keyExtended.remoteJidAlt;
    const participantAlt = keyExtended.participantAlt;
    let jid = '';
    // Prioridade: JID > LID > PN
    if (remoteJid && remoteJid.includes('@s.whatsapp.net')) {
        jid = remoteJid;
    }
    if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
        jid = remoteJidAlt;
    }
    if (participant && participant.includes('@s.whatsapp.net')) {
        jid = participant;
    }
    if (participantAlt && participantAlt.includes('@s.whatsapp.net')) {
        jid = participantAlt;
    }
    const lidMappingStore = getLIDMappingStore(wbot);
    if (lidMappingStore) {
        const jidForPN = await lidMappingStore.getPNForLID(remoteJid);
        if (jidForPN && jidForPN.includes('@s.whatsapp.net')) {
            jid = jidForPN;
            console.log('JID encontrado via LIDMappingStore:', jid);
        }
        else {
            console.log('JID não encontrado na LIDMappingStore para o PN:', remoteJid);
        }
    }
    else {
        logger_1.logger.error(`LIDMappingStore nao disponivel ou JID nao encontrado na mensagem, jid: ${!!jid}, lidMappingStore: ${!!lidMappingStore}`);
    }
    const jidSplitedPontos = jid.split(':')[0];
    const jidSplitedArroba = jid.split('@')[1];
    jid = jidSplitedPontos.includes('@') ? jid : `${jidSplitedPontos}@${jidSplitedArroba}`;
    console.log('JID final para envio:', jid);
    return jid;
};
exports.getJidFromMessage = getJidFromMessage;
// Função para acessar LIDMappingStore de forma segura
const getLIDMappingStore = (wbot) => {
    try {
        // Tentar acessar o LIDMappingStore de diferentes formas
        return wbot.lidMappingStore ||
            wbot.lidMappingStore ||
            null;
    }
    catch (error) {
        logger_1.logger.warn(`Erro ao acessar LIDMappingStore: ${error.message}`);
        return null;
    }
};
const getLidFromMessage = async (message, wbot) => {
    // Garantir que a mensagem tem a propriedade key
    if (!message || !message.key) {
        throw new Error('Mensagem inválida: propriedade key não encontrada');
    }
    const { key } = message;
    const { remoteJid, participant } = key;
    // Verificar se key tem propriedades estendidas (remoteJidAlt, participantAlt)
    const keyExtended = key;
    const remoteJidAlt = keyExtended.remoteJidAlt;
    const participantAlt = keyExtended.participantAlt;
    let lid = '';
    // Prioridade: LID > JID > PN
    if (remoteJid && remoteJid.includes('@lid')) {
        lid = remoteJid;
    }
    else {
        console.log('RemoteJid nao contem @lid:', remoteJid);
        return ''; // retorna vazio porque só é lid quando vem lid no remoteJid
    }
    if (remoteJidAlt && remoteJidAlt.includes('@lid')) {
        lid = remoteJidAlt;
    }
    if (participant && participant.includes('@lid')) {
        lid = participant;
    }
    if (participantAlt && participantAlt.includes('@lid')) {
        lid = participantAlt;
    }
    const lidMappingStore = getLIDMappingStore(wbot);
    if (lidMappingStore && lid) {
        const lidForPN = await lidMappingStore.getLIDForPN(remoteJid);
        if (lidForPN && lidForPN.includes('@lid')) {
            lid = lidForPN;
            console.log('LID encontrado via LIDMappingStore:', lid);
        }
        else {
            console.log('LID não encontrado na LIDMappingStore para o PN:', remoteJid);
        }
    }
    else {
        logger_1.logger.error(`LIDMappingStore nao disponivel ou LID nao encontrado na mensagem, lid: ${!!lid}, lidMappingStore: ${!!lidMappingStore}`);
    }
    return lid;
};
exports.getLidFromMessage = getLidFromMessage;
