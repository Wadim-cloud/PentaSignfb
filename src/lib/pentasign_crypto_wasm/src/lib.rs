use wasm_bindgen::prelude::*;
use ed25519_dalek::{Signer, SigningKey, Signature, VerifyingKey};
use rand_core::OsRng;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};

mod pattern;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize, Debug)]
pub struct KeyPair {
    pub private_key: Vec<u8>,
    pub public_key: Vec<u8>,
}

#[derive(Serialize, Deserialize)]
struct BuildPatternResult {
    pattern: pattern::Pattern,
    svg: String,
}

#[wasm_bindgen]
pub fn build_pattern(id_seed: u32, free_edges: JsValue, mask_nonce: u32) -> JsValue {
    // For now, we ignore free_edges as per the simplified design.
    // let free_edges_vec: Vec<pattern::EdgeInput> = free_edges.into_serde().unwrap_or_default();
    
    let pattern_data = pattern::generate_pattern(id_seed, &[], mask_nonce);
    let svg_data = pattern::pattern_to_svg(&pattern_data, 220.0);

    let result = BuildPatternResult {
        pattern: pattern_data,
        svg: svg_data,
    };
    
    serde_wasm_bindgen::to_value(&result).unwrap()
}


#[wasm_bindgen]
pub fn generate_keypair() -> JsValue {
    let mut csprng = OsRng;
    let signing_key: SigningKey = SigningKey::generate(&mut csprng);
    let keypair = KeyPair {
        private_key: signing_key.to_bytes().to_vec(),
        public_key: signing_key.verifying_key().to_bytes().to_vec(),
    };
    serde_wasm_bindgen::to_value(&keypair).unwrap()
}

#[wasm_bindgen]
pub fn public_from_private(private_key: &[u8]) -> Vec<u8> {
    let signing_key = SigningKey::from_bytes(private_key.try_into().unwrap());
    signing_key.verifying_key().to_bytes().to_vec()
}

/// Sign a 32-byte payload hash using a 32-byte Ed25519 private key.
#[wasm_bindgen]
pub fn sign_payload(payload_hash: &[u8], private_key: &[u8]) -> Vec<u8> {
    let signing_key = SigningKey::from_bytes(private_key.try_into().unwrap());
    let signature = signing_key.sign(payload_hash);
    signature.to_bytes().to_vec()
}
