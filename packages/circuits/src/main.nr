use std::hash::poseidon::bn254::hash_1;
use std::hash::poseidon::bn254::hash_2;
use trees::merkle::MerkleTree;

fn main(
    null_hash: pub Field,
    nullifier: Field,
    secret: Field,
    root: pub Field,
    vote: pub bool,
    depth: pub u32,
    index: Field,
    leaves: [Field; 16],
) {
    let computed_nullifier_hash: Field = hash_1([nullifier]);
    assert(computed_nullifier_hash == null_hash);
    let bits: [u1; 8] = index.to_le_bits();
    let null_hash: Field = hash_1([nullifier]);
}
