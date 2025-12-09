use wasm_bindgen::prelude::*;
use ed25519_dalek::{self as ed25519, Signer, SigningKey, VerifyingKey};
use rand_core::OsRng;
use serde::Serialize;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize)]
pub struct WasmKeypair {
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>,
}

#[wasm_bindgen(js_name = generate_keypair)]
pub fn generate_keypair() -> Result<JsValue, JsValue> {
    let mut csprng = OsRng {};
    let signing_key: SigningKey = SigningKey::generate(&mut csprng);
    let wasm_keypair = WasmKeypair {
        public_key: signing_key.verifying_key().to_bytes().to_vec(),
        private_key: signing_key.to_bytes().to_vec(),
    };
    Ok(serde_wasm_bindgen::to_value(&wasm_keypair)?)
}

#[wasm_bindgen(js_name = public_from_private)]
pub fn public_from_private(private_key_bytes: &[u8]) -> Result<Vec<u8>, JsValue> {
    let signing_key = SigningKey::from_bytes(
        private_key_bytes
            .try_into()
            .map_err(|_| JsValue::from_str("Private key must be 32 bytes"))?,
    );
    let verifying_key: VerifyingKey = signing_key.verifying_key();
    Ok(verifying_key.to_bytes().to_vec())
}

/// Sign a 32-byte payload hash using a 32-byte Ed25519 private key.
#[wasm_bindgen(js_name = sign_payload)]
pub fn sign_payload(payload_hash: &[u8], private_key_bytes: &[u8]) -> Result<Vec<u8>, JsValue> {
    if payload_hash.len() != 32 {
        return Err(JsValue::from_str("Payload hash must be 32 bytes"));
    }

    let signing_key = SigningKey::from_bytes(
        private_key_bytes
            .try_into()
            .map_err(|_| JsValue::from_str("Private key must be 32 bytes"))?,
    );

    let signature = signing_key.sign(payload_hash);
    Ok(signature.to_bytes().to_vec())
}
