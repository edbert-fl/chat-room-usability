const generateKeyPair = async () => {
  // Generate the RSA key pair
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
};

const generateHMACKey = async () => {
  const hmacKey = await crypto.subtle.generateKey(
    {
      name: "HMAC",
      hash: {name: "SHA-256"}
    },
    true,
    ["sign", "verify"]
  );

  return hmacKey;
}

const wsEncryptMessage = async (message, publicKey, hmacKey) => {
  const messageUint8 = new TextEncoder().encode(message);

  const hmac = await crypto.subtle.sign(
    {
      name: "HMAC"
    },
    hmacKey,
    messageUint8
  );

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    messageUint8
  );

  const HMACKeyArrayBuffer = await crypto.subtle.exportKey('raw', hmacKey);
  const encryptedHMACKey = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    HMACKeyArrayBuffer
  );

  return { ciphertext, encryptedHMACKey, hmac };
};

const wsDecryptMessage = async (
  encryptedMessage,
  recipientPrivateKey,
  encryptedHMACKey,
  receivedHmac
) => {
  // Decrypt message using RSA
  const decryptedMessage = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    recipientPrivateKey,
    encryptedMessage
  );


  const HMACKeyBuffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    recipientPrivateKey,
    encryptedHMACKey
  );

  const importedHMACKey = await crypto.subtle.importKey(
    'raw', 
    HMACKeyBuffer, 
    { name: 'HMAC', hash: { name: 'SHA-256' } }, 
    false, 
    ['sign', 'verify'] 
  );

  // Verify HMAC
  const isValid = await crypto.subtle.verify(
    {
      name: "HMAC"
    },
    importedHMACKey,
    receivedHmac,
    decryptedMessage
  );

  if (!isValid) {
    throw new Error("HMAC verification failed");
  }

  // Convert decrypted message to string
  return new TextDecoder().decode(decryptedMessage);
};

const exportPublicKeyToJWK = async (publicKey) => {
  const exportedKey = await crypto.subtle.exportKey("jwk", publicKey);
  return exportedKey;
};

const importPublicKeyFromJWK = async (exportedPublicKeyJWK) => {
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    exportedPublicKeyJWK,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
  return publicKey;
};

const arrayBufferToBase64 = (buffer) => {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64String) => {
  const binaryString = window.atob(base64String);
  const length = binaryString.length;
  const uint8Array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array.buffer;
};

const runDemo = async () => {
  const recipientKeyPair = await generateKeyPair();

  const recipientPublicKey = recipientKeyPair.publicKey;

  const recipientPrivateKey = recipientKeyPair.privateKey;

  const exportedPublicKey = await exportPublicKeyToJWK(recipientPublicKey);
  const importedPublicKey = await importPublicKeyFromJWK(exportedPublicKey);

  const messageToSend = "Hello, World!";

  const hmacKey = generateHMACKey();

  const encryptedMessage = await wsEncryptMessage(
    messageToSend,
    importedPublicKey,
    hmacKey
  );

  console.log("Encrypted message:", new Uint8Array(encryptedMessage.ciphertext));

  const decryptedMessage = await wsDecryptMessage(
    encryptedMessage.ciphertext,
    recipientPrivateKey,
    encryptedMessage.encryptedHMACKey,
    encryptedMessage.hmac
  );

  console.log("Decrypted message:", decryptedMessage);
};