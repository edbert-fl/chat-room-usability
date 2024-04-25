async function deriveKeysFromPassword(password, salt) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    password,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const keyBuffer = await window.crypto.subtle.exportKey("raw", derivedKey);
  const encryptionKey = keyBuffer.slice(0, 32); // 128-bit key for AES encryption
  const macSecret = keyBuffer.slice(32, 64); // 256-bit key for HMAC-SHA256 MAC

  return { encryptionKey, macSecret };
}

async function encryptMessage(message, encryptionKey, macSecret) {
  const iv = window.crypto.getRandomValues(new Uint8Array(16)); // Generate a random IV

  // Encrypt the message with AES-256-CBC
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    encryptionKey,
    new TextEncoder().encode(message)
  );

  // Generate MAC using HMAC-SHA256
  const mac = await window.crypto.subtle.sign(
    { name: "HMAC", hash: { name: "SHA-256" } },
    macSecret,
    encrypted
  );

  return {
    iv: Buffer.from(iv).toString("hex"),
    mac: Buffer.from(mac).toString("hex"),
    encryptedMessage: Buffer.from(encrypted).toString("hex"),
  };
}

async function decryptMessage(encryptedMessage, encryptionKey, macSecret) {
  try {
    const iv = Buffer.from(encryptedMessage.iv, "hex");

    // Decrypt the message with AES-256-CBC
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      encryptionKey,
      Buffer.from(encryptedMessage.encryptedMessage, "hex")
    );

    // Verify MAC using HMAC-SHA256
    const mac = await window.crypto.subtle.sign(
      { name: "HMAC", hash: { name: "SHA-256" } },
      macSecret,
      Buffer.from(encryptedMessage.encryptedMessage, "hex")
    );

    if (
      !crypto.timingSafeEqual(
        Buffer.from(mac),
        Buffer.from(encryptedMessage.mac, "hex")
      )
    ) {
      throw new Error("MAC verification failed");
    }

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

const pkdfDemo = () => {
  const userPassword = new TextEncoder().encode("password");
  const userSalt = window.crypto.getRandomValues(new Uint8Array(16));

  deriveKeysFromPassword(userPassword, userSalt).then(
    ({ encryptionKey, macSecret }) => {
      console.log(
        "Encryption Key:",
        Buffer.from(encryptionKey).toString("hex")
      );
      console.log("MAC Secret:", Buffer.from(macSecret).toString("hex"));

      const message = "Hello, world!";

      // Encrypt the message
      encryptMessage(message, encryptionKey, macSecret).then(
        (encryptedMessage) => {
          console.log("Encrypted Message:", encryptedMessage);

          // Decrypt the message
          decryptMessage(encryptedMessage, encryptionKey, macSecret).then(
            (decryptedMessage) => {
              console.log("Decrypted Message:", decryptedMessage);
            }
          );
        }
      );
    }
  );
};
