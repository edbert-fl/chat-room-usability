const crypto = require('crypto-broswerify');

// Function to generate Diffie-Hellman keys and compute shared secret
function generateAndComputeDHSecret() {
    // Creating two Diffie-Hellman instances with the same group
    const diffiehellmangrp1 = crypto.getDiffieHellman('modp14');
    const diffiehellmangrp2 = crypto.getDiffieHellman('modp14');
    
    // Generating keys
    diffiehellmangrp1.generateKeys();
    diffiehellmangrp2.generateKeys();
    
    // Computing secret
    const secret1 = diffiehellmangrp1.computeSecret(diffiehellmangrp2.getPublicKey(), null, 'hex');
    const secret2 = diffiehellmangrp2.computeSecret(diffiehellmangrp1.getPublicKey(), null, 'hex');
    
    // Checking if both secrets are the same
    return secret1 === secret2 ? {sharedSecret: secret1.substring(0, 64), macSecret: secret1.substring(64, 128)} : null;
}

// Function to encrypt a message using AES
function encryptMessage(message, key, macSecret) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Compute HMAC
    const hmac = crypto.createHmac('sha256', macSecret);
    hmac.update(encrypted);
    const mac = hmac.digest('hex');

    return { iv: iv.toString('hex'), encryptedMessage: encrypted, mac: mac};
}

// Function to decrypt a message using AES
function decryptMessage(encryptedMessage, key, macSecret) {
    const iv = Buffer.from(encryptedMessage.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedMessage.encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const hmac = crypto.createHmac('sha256', macSecret);
    hmac.update(encryptedMessage.encryptedMessage);
    const calculatedMac = hmac.digest('hex');

    if (calculatedMac !== encryptedMessage.mac) {
        throw new Error('MAC verification failed');
    }

    return decrypted;
}

// Simulate user A and user B exchanging messages
const groupName = 'modp14'; // Use the same group name for both instances
const dhSecrets = generateAndComputeDHSecret();

if (dhSecrets) {
    console.log('Shared secret:', dhSecrets.sharedSecret);
    console.log('Mac secret:', dhSecrets.macSecret);

    // User A sends a message to User B
    const messageFromA = 'Hello from User A!';
    const encryptedMessageFromA = encryptMessage(messageFromA, dhSecrets.sharedSecret, dhSecrets.macSecret);
    console.log('Encrypted message from A:', encryptedMessageFromA);

    // User B decrypts the message from User A
    const decryptedMessageByB = decryptMessage(encryptedMessageFromA, dhSecrets.sharedSecret, dhSecrets.macSecret);
    console.log('Decrypted message by B:', decryptedMessageByB);

    // User B sends a message to User A
    const messageFromB = 'Hello from User B!';
    const encryptedMessageFromB = encryptMessage(messageFromB, dhSecrets.sharedSecret, dhSecrets.macSecret);
    console.log('Encrypted message from B:', encryptedMessageFromB);

    // encryptedMessageFromB.encryptedMessage = 'a' + encryptedMessageFromB.encryptedMessage.slice(1);

    console.log(encryptedMessageFromB.encryptedMessage)
    // User A decrypts the message from User B
    const decryptedMessageByA = decryptMessage(encryptedMessageFromB, dhSecrets.sharedSecret, dhSecrets.macSecret);
    console.log('Decrypted message by A:', decryptedMessageByA);
} else {
    console.log('Failed to generate shared secret. Ensure both users use the same group name.');
}
