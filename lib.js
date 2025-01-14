export default {
    // Payload is string, return hex string
    encrypt_payload: async function(Key, ChatUUID, UserUUID, Payload) {
        Payload = new TextEncoder().encode(Payload)
        var b = new Uint8Array(12 + Payload.length + 16)
        crypto.getRandomValues(b.subarray(0, 12));
        b.set(Payload, 12)
        var key = await crypto.subtle.deriveKey(
            { name: 'HKDF', hash: 'SHA-256', salt: b.subarray(0, 12), info: new TextEncoder().encode(ChatUUID + UserUUID) },
            await crypto.subtle.importKey('raw', new TextEncoder().encode(Key), 'HKDF', false, ['deriveKey']),
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        var ab = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: b.subarray(0, 12) },
            key,
            b.slice(12, b.length - 16)
        );
        b.set(new Uint8Array(ab), 12)
        return b.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    },

    // Payload is hex string, return string
    decrypt_payload: async function(Key, ChatUUID, UserUUID, Payload) {
        var b = Uint8Array.from(Payload.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        var k = await crypto.subtle.deriveKey(
            { name: 'HKDF', hash: 'SHA-256', salt: b.subarray(0, 12), info: new TextEncoder().encode(ChatUUID + UserUUID) },
            await crypto.subtle.importKey('raw', new TextEncoder().encode(Key), 'HKDF', false, ['deriveKey']),
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        var ab = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: b.subarray(0, 12) },
            k,
            b.subarray(12)
        );
        return new TextDecoder().decode(ab)
    },

    // Payload is the Uint8Array, return the decrypted Uint8Array
    decrypt_file: async function(Key, ChatUUID, UserUUID, Payload) {
        var decrypt = async function(Key, ChatUUID, UserUUID, b) {
            var k = await crypto.subtle.deriveKey(
                { name: 'HKDF', hash: 'SHA-256', salt: b.subarray(0, 12), info: new TextEncoder().encode(ChatUUID + UserUUID) },
                await crypto.subtle.importKey('raw', new TextEncoder().encode(Key), 'HKDF', false, ['deriveKey']),
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            var ab = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: b.subarray(0, 12) },
                k,
                b.subarray(12)
            );
            return new Uint8Array(ab)
        }
        var b = Payload
        var r = new Uint8Array()
        for (; true;) {
            if (b.length == 0) {
                break
            }
            var n = 524316
            if (b.length < 524316) {
                n = b.length
            }
            var b1 = await decrypt(Key, ChatUUID, UserUUID, b.slice(0, n))
            var r1 = new Uint8Array(r.length + b1.length);
            r1.set(r)
            r1.set(b1, r.length)
            r = r1
            b = b.subarray(n)
        }
        return r
    },

    // Payload is the Uint8Array, return the encrypted Uint8Array
    encrypt_file: async function(Key, ChatUUID, UserUUID, Payload) {
        var encrypt = async function(Key, ChatUUID, UserUUID, b0) {
            var b = new Uint8Array(12 + b0.length + 16)
            crypto.getRandomValues(b.subarray(0, 12));
            b.set(b0, 12)
            var key = await crypto.subtle.deriveKey(
                { name: 'HKDF', hash: 'SHA-256', salt: b.subarray(0, 12), info: new TextEncoder().encode(ChatUUID + UserUUID) },
                await crypto.subtle.importKey('raw', new TextEncoder().encode(Key), 'HKDF', false, ['deriveKey']),
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );
            var ab = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: b.subarray(0, 12) },
                key,
                b.slice(12, b.length - 16)
            );
            b.set(new Uint8Array(ab), 12)
            return b
        }
        var b = Payload
        var r = new Uint8Array()
        for (; true;) {
            if (b.length == 0) {
                break
            }
            var n = 524288
            if (b.length < 524288) {
                n = b.length
            }
            var b1 = await encrypt(Key, ChatUUID, UserUUID, b.slice(0, n))
            var r1 = new Uint8Array(r.length + b1.length);
            r1.set(r)
            r1.set(b1, r.length)
            r = r1
            b = b.subarray(n)
        }
        return r
    },

}
