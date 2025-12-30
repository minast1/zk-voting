use std::hash::poseidon::bn254::hash_1;
use std::hash::poseidon::bn254::hash_2;
 use binary_merkle_root::binary_merkle_root;
fn main(
    nullifier_hash: pub Field,
    nullifier: Field,
    secret: Field,
    root: pub Field,
    vote: pub bool,
    depth: pub u32, 
    index: Field, 
    siblings: [Field: 16]
) {
    let computed_nullifier_hash: Field = hash_1([nullifier]);
    assert(computed_nullifier_hash == nullifier_hash);
    let bits: [u1: 8] = index.to_le_bits(); 

    let commitment: Field = hash_2([nullifier, secret]);
}

// #[test]
// fn test_main() {
//     main(1, 1, 5);

//     //Uncomment to make test faild
//     // main(1, 1);
// }
